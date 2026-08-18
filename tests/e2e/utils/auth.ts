import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import path from 'node:path'
import Database from 'better-sqlite3'
import type { Page } from '@playwright/test'

const BETTER_AUTH_SECRET =
  process.env.NUXT_BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || ''

export interface TestSession {
  userId: string
  cookie: { name: string; value: string; url: string; httpOnly: boolean; sameSite: 'Lax' }
}

// Mirrors better-call's cookie signing: value.signature where the signature is an
// HMAC-SHA256 of the value with the better-auth secret, base64-encoded.
export function signSessionCookie(token: string, secret: string) {
  const signature = createHmac('sha256', secret).update(token).digest('base64')
  return encodeURIComponent(`${token}.${signature}`)
}

function openE2eDatabase() {
  const db = new Database(path.join(process.cwd(), '.data', 'db', 'sqlite.db'))
  db.pragma('busy_timeout = 5000')
  return db
}

export function createTestSession(): TestSession {
  const secret = BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('NUXT_BETTER_AUTH_SECRET is required to seed an e2e auth session')
  }

  const userId = randomUUID()
  const sessionId = randomUUID()
  const token = randomBytes(32).toString('hex')
  const now = Date.now()
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000
  const email = `e2e-${userId.slice(0, 8)}@example.com`

  const db = openE2eDatabase()
  try {
    const insertUser = db.prepare(
      `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    const insertSession = db.prepare(
      `INSERT INTO session (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, ?)`,
    )
    db.transaction(() => {
      insertUser.run(userId, 'E2E User', email, 1, now, now)
      insertSession.run(sessionId, expiresAt, token, now, now, userId)
    })()
  } finally {
    db.close()
  }

  return {
    userId,
    cookie: {
      name: 'better-auth.session_token',
      value: signSessionCookie(token, secret),
      url: 'http://127.0.0.1:4173',
      httpOnly: true,
      sameSite: 'Lax' as const,
    },
  }
}

export async function signInAsTestUser(page: Page) {
  const session = createTestSession()
  await page.context().addCookies([session.cookie])
  return session
}
