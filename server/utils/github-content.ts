import type { PublishConfig } from './publish-auth'

export interface GitFile {
  path: string
  content: string | Uint8Array
}

interface GitRefResponse {
  object: { sha: string }
}

interface GitCommitResponse {
  sha: string
  tree: { sha: string }
}

interface GitShaResponse {
  sha: string
}

interface GitPullResponse {
  number: number
}

interface GitMergeResponse {
  merged: boolean
  sha: string | null
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'personal-website-publish',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function commitGithubFiles(config: PublishConfig, files: GitFile[], message: string) {
  if (!config.githubToken) {
    throw createError({ statusCode: 503, statusMessage: 'GitHub token is not configured' })
  }
  if (files.length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'No files to commit' })
  }

  const { githubOwner: owner, githubRepo: repo, githubBranch: branch, githubToken: token } = config
  const api = `https://api.github.com/repos/${owner}/${repo}`
  const headers = githubHeaders(token)

  try {
    const ref = await $fetch<GitRefResponse>(`${api}/git/ref/heads/${encodeURIComponent(branch)}`, {
      headers,
    })
    const parentSha = ref.object.sha
    const commit = await $fetch<GitCommitResponse>(`${api}/git/commits/${parentSha}`, { headers })

    const treeItems = await Promise.all(
      files.map(async (file) => {
        const isBinary = typeof file.content !== 'string'
        const blob = await $fetch<GitShaResponse>(`${api}/git/blobs`, {
          method: 'POST',
          headers,
          body: isBinary
            ? {
                content: Buffer.from(file.content).toString('base64'),
                encoding: 'base64',
              }
            : { content: file.content, encoding: 'utf-8' },
        })

        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        }
      }),
    )

    const tree = await $fetch<GitShaResponse>(`${api}/git/trees`, {
      method: 'POST',
      headers,
      body: {
        base_tree: commit.tree.sha,
        tree: treeItems,
      },
    })

    const nextCommit = await $fetch<GitShaResponse>(`${api}/git/commits`, {
      method: 'POST',
      headers,
      body: {
        message,
        tree: tree.sha,
        parents: [parentSha],
      },
    })

    const publishBranch = `publish/${Date.now()}-${nextCommit.sha.slice(0, 7)}`
    await $fetch(`${api}/git/refs`, {
      method: 'POST',
      headers,
      body: {
        ref: `refs/heads/${publishBranch}`,
        sha: nextCommit.sha,
      },
    })

    const pull = await $fetch<GitPullResponse>(`${api}/pulls`, {
      method: 'POST',
      headers,
      body: {
        title: message,
        head: publishBranch,
        base: branch,
        body: 'Published automatically from Notion.',
      },
    })

    const merge = await $fetch<GitMergeResponse>(`${api}/pulls/${pull.number}/merge`, {
      method: 'PUT',
      headers,
      body: { merge_method: 'squash' },
    })
    if (!merge.merged || !merge.sha) {
      throw createError({
        statusCode: 502,
        statusMessage: 'GitHub pull request could not be merged',
      })
    }

    await $fetch(`${api}/git/refs/heads/${encodeURIComponent(publishBranch)}`, {
      method: 'DELETE',
      headers,
    }).catch(() => undefined)

    return merge.sha
  } catch (error) {
    const status = getFetchStatus(error)
    throw createError({
      statusCode: 502,
      statusMessage: githubErrorMessage(status),
    })
  }
}

function githubErrorMessage(status: number) {
  if (status === 401 || status === 403) return 'GitHub token lacks required repository permissions'
  if (status === 404) return 'GitHub repository or branch not found'
  if (status === 409) return 'GitHub could not merge the publish request'
  if (status === 422) return 'GitHub rejected the publish request'
  return 'GitHub commit failed'
}

function getFetchStatus(error: unknown) {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode
    if (typeof statusCode === 'number') return statusCode
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status
    if (typeof status === 'number') return status
  }
  return 0
}
