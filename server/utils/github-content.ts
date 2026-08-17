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

    await $fetch(`${api}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH',
      headers,
      body: { sha: nextCommit.sha },
    })

    return nextCommit.sha
  } catch (error) {
    const status = getFetchStatus(error)
    throw createError({
      statusCode: status === 401 || status === 403 ? 502 : status || 502,
      statusMessage:
        status === 404 ? 'GitHub repository or branch not found' : 'GitHub commit failed',
    })
  }
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
