import { BrowserRouter, Route, Routes } from 'react-router'
import InstrumentCreatePage from './pages/InstrumentCreatePage'
import TradingPage from './pages/TradingPage'
import UserOverviewPage from './pages/UserOverviewPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/user" element={<UserOverviewPage />} />
                <Route path="/spot/:instrument" element={<TradingPage />} />
                <Route path="/instrument" element={<InstrumentCreatePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
