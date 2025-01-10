import { FC, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Local
import FollowTemp from "../pages/FollowTemp";
import Leaderboard from "../pages/Leaderboard";
import Pairs from "../pages/Pairs";
import Profile from "../pages/Profile";
import TradeTemp from "../pages/TradeTemp";
import TickerPriceContext from "../hooks/TickerPriceContext";

const DashboardRoutes: FC = () => {
  // const [lastPrice, setLastPrice] = useState<null | number>(null);
  // const [currentPrice, setCurrentPrice] = useState<null | number>(null);

  return (
    // <TickerPriceContext.Provider value={{ lastPrice, setLastPrice, currentPrice, setCurrentPrice }}>
      <Routes>
        <Route path="profile/:user" element={<Profile />} />
        <Route path="follow" element={<FollowTemp />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="trade" element={<Navigate to="APPL" replace />} />
        <Route path="trade/:ticker" element={<TradeTemp />} />
        <Route path="pairs" element={<Pairs />} />
      </Routes>
    // </TickerPriceContext.Provider>
  );
};

export default DashboardRoutes;
