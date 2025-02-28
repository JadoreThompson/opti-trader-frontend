import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TradingPage from "./pages/TradingPage";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/*" element={<AccountPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
