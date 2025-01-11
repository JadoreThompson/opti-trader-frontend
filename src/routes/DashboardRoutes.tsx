import { FC, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Local
import CurrentOrders from "../hooks/CurrentOrders";
import TickerPriceContext from "../hooks/TickerPriceContext";
import FollowTemp from "../pages/FollowTemp";
import Leaderboard from "../pages/Leaderboard";
import Pairs from "../pages/Pairs";
import Profile from "../pages/Profile";
import TradeTemp from "../pages/TradeTemp";

const DashboardRoutes: FC = () => {
  // TickerPriceContext
  const [lastPrice, setLastPrice] = useState<null | number>(null);
  const [currentPrice, setCurrentPrice] = useState<null | number>(null);

  // CurrentOrders
  const [currentOrders, setCurrentOrders] = useState<
    Record<string, string | Number>[] | null
  >(null);

  return (
    <TickerPriceContext.Provider
      value={{ lastPrice, setLastPrice, currentPrice, setCurrentPrice }}
    >
      <CurrentOrders.Provider value={{ currentOrders, setCurrentOrders }}>
        <Routes>
          <Route path="profile/:user" element={<Profile />} />
          <Route path="follow" element={<FollowTemp />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route
            path="trade"
            element={<Navigate to="/trade/spot/APPL" replace />}
          />
          <Route
            path="trade/spot"
            element={<Navigate to="/trade/spot/APPL" replace />}
          />
          <Route
            path="trade/futures"
            element={<Navigate to="/trade/futures/APPL" replace />}
          />
          <Route path="trade/:marketType/:ticker" element={<TradeTemp />} />
          <Route path="pairs" element={<Pairs />} />
        </Routes>
      </CurrentOrders.Provider>
    </TickerPriceContext.Provider>
  );
};

export default DashboardRoutes;
