import { Suspense, useEffect } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import './App.css'
import CheckTokenFlow from "./flow/login/CheckTokenFlow"
import { HomePage } from "./pages/home"
import { LoginPage } from "./pages/login"

export const App = () => {

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const validRoutes = ['/', '/login'];
    const isNotRouteProtected = validRoutes.includes(location.pathname);
    const tokenIsValid = CheckTokenFlow.isValid()

    if (isNotRouteProtected && tokenIsValid) {
      console.log("redirect to home")
      return navigate("/home")
    }

    if (!isNotRouteProtected && !tokenIsValid) {
      console.log("redirect to login")
      return navigate("/")
    }
  })

  return (
    <>
      <Suspense fallback={<div className="container">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  )
}
