import { BrowserRouter, Route, Routes } from 'react-router'
import TradingPage from './pages/TradingPage'
import UserOverviewPage from './pages/UserOverviewPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TradingPage />} />
                <Route path="/user" element={<UserOverviewPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
