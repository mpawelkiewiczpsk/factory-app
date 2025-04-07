import React, { JSX } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layout.tsx'
import Login from './pages/Login'
import {
  Home,
  Orders,
  Components,
  Contractors,
  Products,
} from './pages/index.tsx'
import NotFound from './pages/NotFound'
import './App.css'

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken')
  return accessToken ? children : <Navigate to="/login" replace />
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/contractors" element={<Contractors />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
