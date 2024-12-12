import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';

// Local
import Profile from '../pages/Profile';
import Trade from '../pages/Trade';
import Leaderboard from '../pages/Leaderboard';
import Follow from '../pages/Follow';
import Dashboard from '../pages/Dashboard';


const DashboardRoutes: FC = () => {
    return (
        <Routes>
            <Route path="profile/*" element={<Profile isUsersProfile={false} user='zenz'/>}/>
            <Route path="trade" element={<Trade />} />
            <Route path="follow" element={<Follow />} />
        </Routes>
    )
};


export default DashboardRoutes;