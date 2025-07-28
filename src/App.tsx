import { BrowserRouter, Route, Routes } from "react-router";
import TradingPage from "./pages/TradingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
