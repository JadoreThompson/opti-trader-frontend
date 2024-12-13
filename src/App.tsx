import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Local
import ProtectedRoute from "./components/ProtectedRoute";
import PageNotFound from "./pages/PageNotFound";
import AuthRoutes from "./routes/AuthRoutes";
import DashboardRoutes from "./routes/DashboardRoutes";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/404" element={<PageNotFound />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route
          path="/dashboard/*"
          element={<ProtectedRoute element={<DashboardRoutes />} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
