import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';

// Local
import Profile from '../pages/Profile';
import Trade from '../pages/Trade';
import Leaderboard from '../components/Leaderboard';
import Follow from '../pages/Follow';
import Dashboard from '../pages/Dashboard';


const DashboardRoutes: FC = () => {
    return (
        <Routes>
            {/* <Route path="profile" element={<Profile />}/> */}
            {/* <Route path="trade" element={<Trade />}/>
            <Route path="leaderboard" element={<Leaderboard />}/>
            <Route path="follow" element={<Follow />}/>
             */}
            <Route index element={<Dashboard />} />
        </Routes>
    )
};


export default DashboardRoutes;