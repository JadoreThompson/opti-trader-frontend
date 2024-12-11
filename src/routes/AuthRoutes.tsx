import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Local
import Auth from "../pages/Auth";
import Dashboard from '../pages/Dashboard';

const AuthRoutes: FC = () => {
    return (
        <Routes>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<Auth />} />
            <Route path="register" element={<Auth />}/>
        </Routes>
    )
};

export default AuthRoutes;