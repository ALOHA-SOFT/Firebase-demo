import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

    const navigate = useNavigate()      // ← useNavigate 불러오기


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1) 계정 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      setError('');

      console.log('회원가입 성공:', userCredential.user);
      
      // 2) Firestore에 'users/{uid}' 문서 생성
      const uid = userCredential.user.uid;
      await setDoc(
        doc(firestore, 'users', uid),
        { email: userCredential.user.email },
        { merge: true }      // 이미 문서가 있으면 필드만 병합
      );

      // 3) (선택) 곧바로 로그인 처리
      await signInWithEmailAndPassword(auth, email, password);
      console.log('자동 로그인 완료');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">회원가입</button>
    </form>
  );
}