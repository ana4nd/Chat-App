import { Navigate, Route, Routes, useNavigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import {Toaster} from "react-hot-toast"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"


function App() {
  
  const {authUser} = useContext(AuthContext);
  const navigate = useNavigate();

  return (
   <div className="bg-[url('/src/assets/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to={"/login"}/> } />
        <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to={"/"}/>} />
        <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to={"/login"}/>} />
      </Routes>
   </div>
  )
}

export default App
