import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import { Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const [users, setUsers] = useState<any[]>([]);


 useEffect(() => {
    // 로그인된 유저 여부는 컬렉션 전체 조회와 무관하므로 생략해도 됩니다.
    const colRef = collection(firestore, 'users');
    getDocs(colRef)
      .then(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id:   doc.id,
          ...doc.data()
        }));
        console.log('유저 목록:', list);
        
        setUsers(list);
      })
      .catch(console.error);
  }, []);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {       
      await signInWithEmailAndPassword(auth, email, password);
      console.log('로그인 성공', email, password, auth);
      // 로그인 후 리다이렉트 처리…
    } catch (err) {
      setError(err as Error);
    }
    // 나중에 Firebase Auth 연결 예정
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <h1>로그인</h1>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}  
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>이메일</label><br/>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>비밀번호</label><br/>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      <div style={{ marginTop: 20 }}>
        <p>아직 계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </div>
    </div>
  );
}
