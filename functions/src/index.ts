import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import express, { Request, Response, NextFunction } from 'express'

admin.initializeApp()
const db = admin.firestore()

// req.uid 를 안전하게 쓰기 위한 인터페이스
interface AuthRequest extends Request {
  uid?: string
}

const app = express()
app.use(express.json())

// ────────────────────────────────────────────────────────────────────
// 1) 인증 미들웨어
// ────────────────────────────────────────────────────────────────────
app.use(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const token = header.split('Bearer ')[1]
      try {
        const decoded = await admin.auth().verifyIdToken(token)
        req.uid = decoded.uid
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : 'Invalid auth token'
        return void res.status(401).send({ error: msg })
      }
    }
    next()
  }
)

// ────────────────────────────────────────────────────────────────────
// 2) POST /api/items
// ────────────────────────────────────────────────────────────────────
app.post(
  '/api/items',
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, desc } = req.body
    if (!name) {
      return void res.status(400).send({ error: 'name required' })
    }

    try {
      const docRef = await db.collection('items').add({
        name,
        desc: desc || '',
        createdBy: req.uid ?? null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      return void res.status(201).send({ id: docRef.id })
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Unknown server error'
      return void res.status(500).send({ error: msg })
    }
  }
)

// ────────────────────────────────────────────────────────────────────
// 3) PUT /api/items/:id
// ────────────────────────────────────────────────────────────────────
app.put(
  '/api/items/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const data = req.body

    try {
      await db
        .collection('items')
        .doc(id)
        .update({
          ...data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      return void res.send({ success: true })
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Unknown server error'
      return void res.status(500).send({ error: msg })
    }
  }
)

// ────────────────────────────────────────────────────────────────────
// 4) 기타 엔드포인트 (타입만 명시)
// ────────────────────────────────────────────────────────────────────
app.get('/hello', (_req: Request, res: Response): void => {
  res.send({ message: 'Hello from Firebase Functions!' })
})

app.post('/echo', (req: Request, res: Response): void => {
  res.send({ youSent: req.body })
})

// Firebase Functions 엔트리
export const api = functions.https.onRequest(app)
