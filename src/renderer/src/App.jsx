import { Routes, Route } from 'react-router-dom'
import CameraManagement from './pages/CameraManagement'
import UserInfo from './pages/UserInfo'
import Navbar from './components/Navbar'
import Home from './pages/Home'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/cameras" element={<CameraManagement />} />
        <Route path="/user" element={<UserInfo />} />
        <Route
          path="/"
          element={
            <Home />
          }
        />
      </Routes>
    </div>
  )
}

export default App
