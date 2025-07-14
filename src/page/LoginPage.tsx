import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import api from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  // 사용자 목록 불러오기 함수
  const fetchUsers = async () => {
    try {
      const colRef = collection(firestore, 'users');
      const snapshot = await getDocs(colRef);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      navigate('/profile');
    } catch (err: any) {
      setError(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setError(null);
      setEmail('');
      setPassword('');
      navigate('/login');
    } catch (err: any) {
      setError(err);
    }
  };

  // 수정 모드 시작
  const startEdit = (id: string, currentEmail: string) => {
    setEditId(id);
    setEditEmail(currentEmail);
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditId(null);
    setEditEmail('');
  };
  const saveEdit = async (id: string) => {
    try {
      await api.put(`/users/${id}`, { email: editEmail });
      setEditId(null);
      setEditEmail('');
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 삭제
  const deleteUser = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/users/${id}`);
      alert('삭제 완료');
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <h1>로그인</h1>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      {user ? (
        <>
          <div>
            <p>안녕하세요, {user.email}님</p>
            <button onClick={handleLogout}>로그아웃</button>
          </div>

          <h2 style={{ marginTop: 40 }}>전체 사용자 목록</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Email</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>{u.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>
                    {editId === u.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>
                    {editId === u.id ? (
                      <>
                        <button onClick={() => saveEdit(u.id)}>저장</button>{' '}
                        <button onClick={cancelEdit}>취소</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u.id, u.email)}>수정</button>{' '}
                        <button onClick={() => deleteUser(u.id)}>삭제</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>이메일</label>
              <br />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>비밀번호</label>
              <br />
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
            <p>
              아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
