import { BrowserRouter, Route, Routes } from 'react-router'
import TradingPage from './pages/TradingPage'
import UserOverviewPage from './pages/UserOverviewPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/user" element={<UserOverviewPage />} />
                {/* <Route path="/" element={<TradingPage />} /> */}
                {/* <Route
                    path="/futures/:instrument"
                    element={<TradingPage marketType={MarketType.FUTURES} />}
                /> */}
                <Route
                    path="/spot/:instrument"
                    element={<TradingPage />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App
