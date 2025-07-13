import * as functions from 'firebase-functions';
import * as admin     from 'firebase-admin';
import express from 'express';

admin.initializeApp();
const db  = admin.firestore();
const app = express();
app.use(express.json());

// 간단한 인증 미들웨어: 클라이언트가 Bearer 토큰으로 ID 토큰을 보내면 검증
app.use(async (req, _, next) => {
  const authHeader = req.headers.authorization?.split(' ');
  if (authHeader?.[0] === 'Bearer' && authHeader[1]) {
    try {
      const decoded = await admin.auth().verifyIdToken(authHeader[1]);
      (req as any).uid = decoded.uid;
    } catch {
      return res.status(401).send({ error: 'Invalid auth token' });
    }
  }
  next();
});

/** POST /api/items
 *  새 항목 생성
 *  { name: string, desc?: string }
 */
app.post('/api/items', async (req, res) => {
  const { name, desc } = req.body;
  if (!name) return res.status(400).send({ error: 'name required' });

  const docRef = await db.collection('items').add({
    name,
    desc: desc || '',
    createdBy: (req as any).uid || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.send({ id: docRef.id });
});

/** PUT /api/items/:id
 *  기존 항목 업데이트
 *  { name?: string, desc?: string }
 */
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const data   = req.body;
  try {
    await db.collection('items').doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 기존의 /hello, /echo도 그대로 남겨 둡니다.
app.get('/hello', (_, res) => res.send({ message: 'Hello from Firebase Functions!' }));
app.post('/echo', (req, res) => res.send({ youSent: req.body }));

export const api = functions.https.onRequest(app);
