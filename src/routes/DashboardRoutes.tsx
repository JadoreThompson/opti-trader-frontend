import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';

// Local
import Profile from '../pages/Profile';
import Trade from '../pages/Trade';
import Leaderboard from '../pages/Leaderboard';
import Follow from '../pages/Follow';


const DashboardRoutes: FC = () => {
    return (
        <Routes>
            <Route path="profile/:user" element={<Profile />}/>
            <Route path="follow" element={<Follow />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="trade" element={<Trade />} />
        </Routes>
    )
};


export default DashboardRoutes;