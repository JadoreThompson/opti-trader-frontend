import { FC, useEffect, useState } from 'react';
import { getCookie } from 'typescript-cookie';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Local
import Login from './pages/Login';
import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import AuthRoutes from './routes/AuthRoutes';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRoutes from './routes/DashboardRoutes';


const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/dashboard/*" element={<ProtectedRoute element={<DashboardRoutes />} />} />
      </Routes>
    </BrowserRouter>
  )
};

export default App;