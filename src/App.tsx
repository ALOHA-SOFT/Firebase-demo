import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './page/LoginPage';
import SignupPage from './page/SignupPage';
import Profile from './page/Profile';
import Header from './page/Header';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
