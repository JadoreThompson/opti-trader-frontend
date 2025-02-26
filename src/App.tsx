import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TradingPage from "./pages/TradingPage";
import AccountPage from "./pages/AccountPage";

// Local

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradingPage />} />
        <Route path="/user/*" element={<AccountPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
