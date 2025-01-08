import { FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Local
import Follow from "../pages/Follow";
import Leaderboard from "../pages/Leaderboard";
import Pairs from "../pages/Pairs";
import Profile from "../pages/Profile";
import TradeTemp from "../pages/TradeTemp";

const DashboardRoutes: FC = () => {
  return (
    <Routes>
      <Route path="profile/:user" element={<Profile />} />
      <Route path="follow" element={<Follow />} />
      <Route path="leaderboard" element={<Leaderboard />} />
      <Route path='trade' element={<Navigate to='APPL' replace/>}/>
      <Route path="trade/:ticker" element={<TradeTemp />} />
      <Route path="pairs" element={<Pairs />} />
    </Routes>
  );
};

export default DashboardRoutes;
