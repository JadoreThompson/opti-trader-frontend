import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Local
import Home from './pages/Home';
import AuthRoutes from './routes/AuthRoutes';
import ProtectedRoute from './components/ProtectedRoute';
import PageNotFound from './pages/PageNotFound';
import DashboardRoutes from './routes/DashboardRoutes';


const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/404' element={<PageNotFound />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/dashboard/*" element={<ProtectedRoute element={<DashboardRoutes />} />} />
      </Routes>
    </BrowserRouter>
  )
};

export default App;