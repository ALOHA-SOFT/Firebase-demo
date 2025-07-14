import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import cors from 'cors';

admin.initializeApp();
const db = admin.firestore();

// 인증 후에만 uid가 붙도록 커스텀 Request 타입 정의
interface AuthRequest extends Request {
  uid?: string;
}

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// ────────────────────────────────────────────────────────────────────
// 1) 인증 미들웨어 (모든 경로에 적용)
// ────────────────────────────────────────────────────────────────────
app.use(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('Auth middleware 실행:', req.path);

  // 1) 헤더 유무 및 형식 체크
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return void res.status(401).send({ error: 'Authentication token required' });
  }

  // 2) 토큰 꺼내기
  const token = header.split('Bearer ')[1];

  // 3) 검증
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next(); // 통과
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Invalid auth token';
    return void res.status(401).send({ error: msg });
  }
});

// ────────────────────────────────────────────────────────────────────
// 2) GET /users           — 전체 사용자 목록 조회
// ────────────────────────────────────────────────────────────────────
app.get('/demo/users', async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('users').get();
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.send(list);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).send({ error: msg });
  }
});

// ────────────────────────────────────────────────────────────────────
// 3) GET /users/:id       — 단일 사용자 조회
// ────────────────────────────────────────────────────────────────────
app.get('/demo/users/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const docSnap = await db.collection('users').doc(id).get();
    if (!docSnap.exists) {
      return void res.status(404).send({ error: 'User not found' });
    }
    res.send({ id: docSnap.id, ...docSnap.data() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).send({ error: msg });
  }
});

// ────────────────────────────────────────────────────────────────────
// 4) POST /users          — 새 사용자 생성
// ────────────────────────────────────────────────────────────────────
app.post('/demo/users', async (req: AuthRequest, res: Response) => {
  const data = req.body;
  if (!data.email) {
    return void res.status(400).send({ error: 'email is required' });
  }
  try {
    // req.uid: 토큰 검증된 사용자 UID (옵션)
    const docRef = await db.collection('users').add({
      ...data,
      createdBy: req.uid || null,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.status(201).send({ id: docRef.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).send({ error: msg });
  }
});

// ────────────────────────────────────────────────────────────────────
// 5) PUT /users/:id       — 기존 사용자 문서 업데이트
// ────────────────────────────────────────────────────────────────────
app.put('/demo/users/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    await db
      .collection('users')
      .doc(id)
      .update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      });
    res.send({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).send({ error: msg });
  }
});

// ────────────────────────────────────────────────────────────────────
// 6) DELETE /users/:id    — 사용자 문서 삭제
// ────────────────────────────────────────────────────────────────────
app.delete('/demo/users/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // id는 유저의 UID라고 가정

  try {
    // 1) Firestore users 문서 삭제
    await db.collection('users').doc(id).delete();

    // 2) Firebase Auth 사용자 삭제
    try {
      await admin.auth().deleteUser(id);
      console.log('사용자 삭제 성공');
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
    }

    res.send({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).send({ error: msg });
  }
});

// Firebase Functions 자동으로 엔드포인트 생성
export const api = functions.https.onRequest(app);
