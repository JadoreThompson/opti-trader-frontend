import { FC, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./componenets/ProtectedRoute";
import { IsLoggedInContext } from "./contexts/IsLoggedInContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TradingPage from "./pages/TradingPage";
import UserPage from "./pages/UserPage";

const App: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <BrowserRouter>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <Routes>
          <Route
            path="/"
            element={<ProtectedRoute element={<TradingPage />} />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user/*" element={<UserPage />} />
        </Routes>
      </IsLoggedInContext.Provider>
    </BrowserRouter>
  );
};

export default App;
