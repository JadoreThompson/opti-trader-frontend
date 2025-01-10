import { FC, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Local
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import TickerPriceContext from "./hooks/TickerPriceContext";
import PageNotFound from "./pages/PageNotFound";
import AuthRoutes from "./routes/AuthRoutes";
import DashboardRoutes from "./routes/DashboardRoutes";

const App: FC = () => {
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  return (
    <TickerPriceContext.Provider
      value={{ lastPrice, setLastPrice, currentPrice, setCurrentPrice }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<Sidebar />} />
          <Route path="/404" element={<PageNotFound />} />
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route
            path="/*"
            element={<ProtectedRoute element={<DashboardRoutes />} />}
          />
        </Routes>
      </BrowserRouter>
    </TickerPriceContext.Provider>
  );
};

export default App;
