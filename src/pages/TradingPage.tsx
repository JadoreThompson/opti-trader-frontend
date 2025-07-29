import BasicOrderCard from '@/components/BasicOrderCard'
import OrderHistoryTable from '@/components/tables/OrderHistoryTable'
import PositionsTable from '@/components/tables/PositionsTable'
import OrderBook from '@/components/OrderBook'
import RecentTrades from '@/components/RecentTrades'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bell, ChevronUp, User, Wifi } from 'lucide-react'
import { useEffect, useRef, useState, type FC } from 'react'
import { Link } from 'react-router'

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
type TickerSummary = { ticker: string; pct: number; price: number }
const tableTabs = ['positions', 'history']
type Tab = (typeof tableTabs)[number]

const TradingPage: FC = () => {
    const stylesRef = useRef<CSSStyleDeclaration>(
        getComputedStyle(document.documentElement)
    )
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('connected')

    const [simpleTickers, setSimpleTickers] = useState<TickerSummary[]>(
        Array(10).fill({ ticker: 'SOL/USDT', pct: 24.7, price: 1234.11 })
    )
    const [tableTab, setTableTab] = useState<Tab>('positions')
    const [showScrollToTop, setShowScollToTop] = useState<boolean>(false)

    const getConnectionColor = (): string =>
        connectionStatus === 'connected'
            ? stylesRef.current.getPropertyValue('--green')
            : connectionStatus === 'connecting'
              ? 'orange'
              : stylesRef.current.getPropertyValue('--red')

    useEffect(() => {
        document.addEventListener('scroll', () =>
            setShowScollToTop(window.scrollY > window.innerHeight)
        )
    }, [])

    return (
        <>
            <div id="dave" className="w-full h-auto flex bg-zinc-900 pb-7">
                <header className="w-full h-10 z-[999] fixed top-0 left-0 flex justify-between items-center border-b border-b-gray bg-background px-7">
                    <div></div>
                    <div className="w-fit h-full flex flex-row items-center gap-2 px-2">
                        <Link to="#" className="relative ">
                            <Bell
                                className={cn(
                                    'size-5 hover:text-blue-300 shake-notification'
                                )}
                            />
                            <div className="w-2 h-2 absolute top-0 right-0 rounded-full bg-red-500"></div>
                        </Link>

                        <Link to="#">
                            <User
                                className={cn('size-5 hover:text-blue-300')}
                            />
                        </Link>
                    </div>
                </header>

                <main className="w-full min-h-screen mt-10 flex flex-col gap-1 p-1">
                    <div className="w-full flex flex-row gap-1">
                        <div className="h-[550px] grow-1 rounded-sm bg-background"></div>
                        <div className="w-[20%] flex flex-col gap-1 rounded-sm">
                            <div className="w-full h-fit pb-1 rounded-sm bg-background">
                                <OrderBook />
                            </div>
                            <div className="w-full flex-1 rounded-sm bg-background">
                                <RecentTrades />
                            </div>
                        </div>
                        <div className="w-[20%] rounded-sm bg-background">
                            <BasicOrderCard />
                        </div>
                    </div>
                    <div className="w-full bg-background rounded-sm p-1">
                        {/* Snackbar */}
                        <div className="w-full mb-2 flex items-center justify-start p-3">
                            {tableTabs.map((tab) => (
                                <Button
                                    type="button"
                                    className={`bg-transparent hover:bg-transparent rounded-none border-b-2 hover:text-white cursor-pointer ${tableTab == tab ? 'border-b-white text-white' : 'border-b-transparent text-neutral-900'}`}
                                    onClick={() => setTableTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Button>
                            ))}
                        </div>
                        <div className="w-full p-3">
                            {tableTab === 'positions' && <PositionsTable />}
                            {tableTab === 'history' && <OrderHistoryTable />}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <div className="w-full h-7 min-h-0 max-h-10 z-[999] fixed bottom-0 flex items-center border-t-1 border-t-gray bg-background text-xs">
                    <div className="w-full h-full relative">
                        <div className="w-fit h-full absolute top-0 left-0 z-2 flex items-center gap-2 px-2 border-r-1 border-r-gray bg-[var(--background)]">
                            <Wifi
                                className="rotate-50 size-3"
                                color={getConnectionColor()}
                            />
                            <span style={{ color: getConnectionColor() }}>
                                Stable Connection
                            </span>
                        </div>
                        <div className="w-full h-full flex flex-row">
                            <div className="w-fit flex">
                                {simpleTickers.map((st) => (
                                    <div className="w-[150px] h-full flex items-center gap-1 marquee-item">
                                        <span>{st.ticker}</span>
                                        <span
                                            className={`${st.pct < 0 ? 'text-#c93639' : 'text-green-500'}`}
                                        >
                                            {st.pct}%
                                        </span>
                                        <span className="text-gray-300">
                                            {st.price}
                                        </span>
                                    </div>
                                ))}

                                {simpleTickers.map((st) => (
                                    <div className="w-[150px] h-full flex items-center gap-1 marquee-item">
                                        <span>{st.ticker}</span>
                                        <span
                                            className={`${st.pct < 0 ? 'text-#c93639' : 'text-green-500'}`}
                                        >
                                            {st.pct}%
                                        </span>
                                        <span className="text-gray-300">
                                            {st.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* {showScrollToTop && (
                <div
                    className="fixed w-10 h-10 bottom-12 right-10 flex items-center justify-center rounded-full bg-gray-900 cursor-pointer"
                    onClick={() => window.scrollTo({ top: 0 })}
                >
                    <ChevronUp className="size-5" />
                </div>
            )} */}

            <div
                className={`fixed w-10 h-10 bottom-12 right-10 flex items-center justify-center rounded-full bg-gray-900 cursor-pointer transition-all duration-300 ${showScrollToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-100'}`}
                onClick={() => window.scrollTo({ top: 0 })}
            >
                <ChevronUp className="size-5" />
            </div>
        </>
    )
}

export default TradingPage
