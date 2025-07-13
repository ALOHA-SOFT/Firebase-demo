import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './page/LoginPage'
import SignupPage from './page/SignupPage'

function App() {
  return (
     <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* 404 처리 */}
      <Route path="*" element={<p>페이지를 찾을 수 없습니다.</p>} />
    </Routes>
  )
}

export default App
