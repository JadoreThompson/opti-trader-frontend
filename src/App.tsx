import { FC, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./componenets/ProtectedRoute";
import { UserOrdersContext } from "./contexts/OrdersContext";
import InstrumentsPage from "./pages/InstrumentsPage";
import LoginPage from "./pages/LoginPage";
import Page404 from "./pages/Page404";
import RegisterPage from "./pages/RegisterPage";
import TradingPage from "./pages/TradingPage";
import UserPage from "./pages/UserPage";

const App: FC = () => {
  const [orders, setOrders] = useState<Record<string, any>[]>([]);

  return (
    <BrowserRouter>
      <UserOrdersContext.Provider
        value={{ orders, setOrders }}
      ></UserOrdersContext.Provider>
      <Routes>
        <Route
          path="/:marketType/:instrument"
          element={<ProtectedRoute element={<TradingPage />} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/instruments" element={<InstrumentsPage />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
