import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Local
import Auth from "../pages/Auth";


const AuthRoutes: FC = () => {
    return (
        <Routes>
            <Route path="login" element={<Auth />} />
            <Route path="register" element={<Auth />}/>
        </Routes>
    )
};

export default AuthRoutes;