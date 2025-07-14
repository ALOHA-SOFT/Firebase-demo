import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Link } from 'react-router-dom';

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);
  return user;
}

export default function Profile() {
  const user = useCurrentUser();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p>로그인이 필요합니다.</p>
        <Link to="/login">로그인으로 이동</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <Link to="/login">로그인으로 이동</Link>
      <h1>안녕하세요, {user.email}님</h1>
      <p>UID: {user.uid}</p>
      <p>
        프로필 이미지:
        <br />
        <img
          src={user.photoURL ?? '/default.png'}
          alt="profile"
          style={{ width: 120, height: 120, borderRadius: '50%' }}
        />
      </p>
    </div>
  );
}
