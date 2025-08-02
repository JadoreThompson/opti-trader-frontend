import BasicOrderCard from '@/components/BasicOrderForm'
import ChartPanel from '@/components/ChartPanel'
import EventLog, { type Log } from '@/components/EventLog'
import Header from '@/components/Header'
import OrderBook, { type PriceLevel } from '@/components/OrderBook'
import RecentTrades from '@/components/RecentTrades'
import StatusBar from '@/components/StatusBar'
import OrderHistoryTable from '@/components/tables/OrderHistoryTable'
import PositionsTable from '@/components/tables/PositionsTable'
import { Button } from '@/components/ui/button'
import { HTTP_BASE_URL, WS_BASE_URL } from '@/config'
import type { Event } from '@/lib/types/apiTypes/event'
import { WsEventType } from '@/lib/types/apiTypes/eventType'
import type { InstrumentSummaryFull } from '@/lib/types/apiTypes/instrumentSummary'
import type { Order } from '@/lib/types/apiTypes/order'
import type { PaginatedResponse } from '@/lib/types/apiTypes/paginatedResponse'
import { MarketType } from '@/lib/types/marketType'
import { OrderStatus } from '@/lib/types/orderStatus'
import type { RecentTrade } from '@/lib/types/recentTrade'
import { TimeFrame } from '@/lib/types/timeframe'
import {
    type CandlestickData,
    type ISeriesApi,
    type Time,
} from 'lightweight-charts'
import { ChevronUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FC } from 'react'

// Types
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
type Tab = 'positions' | 'history'
type PriceData = { price: number | null; prevPrice: number | null }
type OrderBookData = { bids: PriceLevel[]; asks: PriceLevel[] }

// Constants
const INSTRUMENT = 'BTCUSD-FUTURES'
const TABLE_TABS: Tab[] = ['positions', 'history']
const TIMEFRAME_SECONDS: Record<TimeFrame, number> = {
    [TimeFrame.S5]: 5,
    [TimeFrame.M1]: 60,
    [TimeFrame.M5]: 5 * 60,
    [TimeFrame.H1]: 60 * 60,
    [TimeFrame.H4]: 4 * 60 * 60,
    [TimeFrame.D1]: 24 * 60 * 60,
}

// Hooks
const useScrollToTop = () => {
    const [showScrollToTop, setShowScrollToTop] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > window.innerHeight)
        }

        document.addEventListener('scroll', handleScroll)
        return () => document.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0 })
    }, [])

    return { showScrollToTop, scrollToTop }
}

const useApiData = () => {
    const [instrumentSummary, setInstrumentSummary] =
        useState<InstrumentSummaryFull | null>(null)
    const [balance, setBalance] = useState<number | null>(null)
    const [events, setEvents] = useState<Log[]>([])

    const fetchInstrumentSummary = useCallback(async () => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/instrument/${INSTRUMENT}/summary`
            )
            if (response.ok) {
                const data: InstrumentSummaryFull = await response.json()
                setInstrumentSummary(data)
            }
        } catch (error) {
            console.error('Failed to fetch instrument summary:', error)
        }
    }, [])

    const fetchUserSummary = useCallback(async () => {
        try {
            const response = await fetch(`${HTTP_BASE_URL}/user/summary`, {
                credentials: 'include',
            })
            if (response.ok) {
                const data: { balance: number; pnl: number } =
                    await response.json()
                setBalance(data.balance)
            }
        } catch (error) {
            console.error('Failed to fetch user summary:', error)
        }
    }, [])

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch(`${HTTP_BASE_URL}/user/events`, {
                credentials: 'include',
            })
            if (response.ok) {
                const data: PaginatedResponse<{
                    order_event_id: string
                    event_type: WsEventType
                    order_id: string
                }> = await response.json()
                setEvents(
                    data.data.map((val) => ({
                        event_type: val.event_type,
                        message: `Order ID: ${val.order_id}`,
                    }))
                )
            }
        } catch (error) {
            console.error('Failed to fetch events:', error)
        }
    }, [])

    return {
        instrumentSummary,
        balance,
        events,
        setBalance,
        setEvents,
        fetchInstrumentSummary,
        fetchUserSummary,
        fetchEvents,
    }
}

const useCandles = (currentTimeFrame: TimeFrame) => {
    const [candles, setCandles] = useState<CandlestickData<Time>[]>([])
    const candlesRef = useRef<CandlestickData<Time>[]>([])
    const candleStickSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null)

    const fetchCandles = useCallback(async () => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/instrument/${INSTRUMENT}/candles?time_frame=${currentTimeFrame}`
            )
            if (response.ok) {
                const data = await response.json()
                setCandles(data)
                candlesRef.current = data
            }
        } catch (error) {
            console.error('Failed to fetch candles:', error)
        }
    }, [currentTimeFrame])

    const handleIncomingPrice = useCallback(
        (value: number) => {
            if (!candleStickSeriesRef.current || !candlesRef.current.length)
                return

            const seconds = TIMEFRAME_SECONDS[currentTimeFrame]
            const curTime = Date.now() / 1000
            const prevCandle = candlesRef.current[candlesRef.current.length - 1]
            const prevTime = prevCandle.time as number
            const nextTime = prevTime + seconds

            if (nextTime > curTime) {
                const updatedCandle = {
                    open: prevCandle.open,
                    high: Math.max(prevCandle.high, value),
                    low: Math.min(prevCandle.low, value),
                    close: value,
                    time: prevCandle.time,
                }
                candleStickSeriesRef.current.update(updatedCandle)
            } else {
                candleStickSeriesRef.current.update({
                    open: value,
                    high: value,
                    low: value,
                    close: value,
                    time: nextTime as Time,
                })
            }
        },
        [currentTimeFrame]
    )

    useEffect(() => {
        fetchCandles()
    }, [fetchCandles])

    return {
        candles,
        candleStickSeriesRef,
        handleIncomingPrice,
    }
}

const useMarketData = () => {
    const [prices, setPrices] = useState<PriceData>({} as PriceData)
    const [orderBook, setOrderBook] = useState<OrderBookData>(
        {} as OrderBookData
    )
    const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])

    const fetchRecentTrades = useCallback(async () => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/instrument/${INSTRUMENT}/recent-trades`
            )
            if (response.ok) {
                const data = await response.json()
                setRecentTrades(data)
            }
        } catch (error) {
            console.error('Failed to fetch recent trades:', error)
        }
    }, [])

    const handleOrderBookUpdate = useCallback((data: any) => {
        setOrderBook({
            bids: Object.entries(data.bids)
                .map(([k, v]) => ({
                    price: Number.parseFloat(k),
                    quantity: Number.parseInt(v as string),
                }))
                .reverse(),
            asks: Object.entries(data.asks).map(([k, v]) => ({
                price: Number.parseFloat(k),
                quantity: Number.parseInt(v as string),
            })),
        })
    }, [])

    const handleRecentTradeUpdate = useCallback((newTrade: RecentTrade) => {
        setRecentTrades((prev) => {
            const newTrades = [...prev]
            if (newTrades.length === 10) {
                newTrades.pop()
            }
            newTrades.unshift(newTrade)
            return newTrades
        })
    }, [])

    useEffect(() => {
        fetchRecentTrades()
    }, [fetchRecentTrades])

    return {
        prices,
        orderBook,
        recentTrades,
        setPrices,
        handleOrderBookUpdate,
        handleRecentTradeUpdate,
    }
}

const useWebSocket = (
    handleIncomingPrice: (price: number) => void,
    handleOrderBookUpdate: (data: any) => void,
    handleRecentTradeUpdate: (trade: RecentTrade) => void
) => {
    useEffect(() => {
        const ws = new WebSocket(`${WS_BASE_URL}/instrument/${INSTRUMENT}/ws`)

        const handleWsHeartbeat = async (socket: WebSocket) => {
            while (socket.readyState === WebSocket.OPEN) {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send('ping')
                }
            }
        }

        ws.onopen = () => {
            ws.send(JSON.stringify({ subscribe: 'orderbook_update' }))
            ws.send(JSON.stringify({ subscribe: 'recent_trade' }))
            handleWsHeartbeat(ws)
        }

        ws.onmessage = (e) => {
            if (e.data === 'connected') return

            try {
                const message = JSON.parse(e.data)

                switch (message.event_type) {
                    case 'price_update':
                        handleIncomingPrice(Number.parseFloat(message.data))
                        break
                    case 'orderbook_update':
                        handleOrderBookUpdate(message.data)
                        break
                    case 'recent_trade':
                        handleRecentTradeUpdate(message.data)
                        break
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error)
            }
        }

        return () => ws.close()
    }, [handleIncomingPrice, handleOrderBookUpdate, handleRecentTradeUpdate])
}

const useOrderManagement = (
    setEvents: (events: Log[]) => void,
    setBalance: (balance: number) => void
) => {
    const [wsToken, setWsToken] = useState<string | undefined>(undefined)
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('disconnected')
    const [openPositions, setOpenPositions] = useState<Order[]>([])
    const [orderHistory, setOrderHistory] = useState<Order[]>([])
    const hasNextRef = useRef<boolean>(true)
    const pageNumRef = useRef<number>(0)

    const handleTableUpdate = useCallback(
        (
            incomingOrder: Order,
            setter: React.Dispatch<React.SetStateAction<Order[]>>
        ) => {
            setter((prev) => {
                const existingIndex =
                    prev?.findIndex(
                        (order) => order.order_id === incomingOrder.order_id
                    ) ?? -1

                if (existingIndex >= 0) {
                    return prev.map((order, index) =>
                        index === existingIndex
                            ? { ...order, ...incomingOrder }
                            : order
                    )
                } else {
                    return [incomingOrder, ...prev]
                }
            })
        },
        []
    )

    const handleOrderRemoval = useCallback((orderId: string) => {
        setOpenPositions((prev) =>
            prev.filter((order) => order.order_id !== orderId)
        )
    }, [])

    const fetchPositions = useCallback(async () => {
        const params = new URLSearchParams()
        params.append('page', pageNumRef.current.toString())
        params.append('market_type', MarketType.FUTURES)

        for (const status of [
            OrderStatus.PENDING,
            OrderStatus.PARTIALLY_FILLED,
            OrderStatus.FILLED,
        ]) {
            params.append('status', status)
        }

        try {
            const rsp = await fetch(
                `${HTTP_BASE_URL}/user/orders?${params}`,
                {
                    credentials: 'include',
                }
            )
            if (rsp.ok) {
                const data: PaginatedResponse<Order> = await rsp.json()
                setOpenPositions((prev) => [...prev, ...data.data])
                hasNextRef.current = data.has_next
            }
        } catch (error) {
            console.error('Failed to fetch positions:', error)
        }
    }, [])

    const fetchOrderHistory = useCallback(async () => {
        const params = new URLSearchParams()
        params.append('page', pageNumRef.current.toString())
        params.append('market_type', MarketType.FUTURES)

        for (const status of Object.values(OrderStatus)) {
            params.append('status', status)
        }

        try {
            const rsp = await fetch(
                `${HTTP_BASE_URL}/user/orders?${params}`,
                {
                    credentials: 'include',
                }
            )
            
            if (rsp.ok) {
                const data: PaginatedResponse<Order> = await rsp.json()
                setOrderHistory((prev) => [...prev, ...data.data])
                hasNextRef.current = data.has_next
            }
        } catch (error) {
            console.error('Failed to fetch order history:', error)
        }
    }, [])

    const handleCloseAll = useCallback(async (action: 'close' | 'cancel') => {
        try {
            await fetch(`${HTTP_BASE_URL}/order/${action}/all`, {
                method: 'DELETE',
                credentials: 'include',
            })
        } catch (error) {
            console.error(`Failed to ${action} all orders:`, error)
        }
    }, [])

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(
                    `${HTTP_BASE_URL}/order/access-token`,
                    {
                        credentials: 'include',
                    }
                )
                if (response.ok) {
                    const data = await response.json()
                    setWsToken(data.token)
                }
            } catch (error) {
                console.error('Failed to fetch WebSocket token:', error)
            }
        }

        fetchToken()
    }, [])

    // Orders WebSocket
    useEffect(() => {
        if (!wsToken) return

        const ws = new WebSocket(`${WS_BASE_URL}/order/ws`)

        const handleWsHeartbeat = async (socket: WebSocket) => {
            while (socket.readyState === WebSocket.OPEN) {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send('ping')
                }
            }
        }

        ws.onopen = () => {
            setConnectionStatus('connecting')
            ws.send(wsToken)
            handleWsHeartbeat(ws)
        }

        ws.onmessage = (e) => {
            if (e.data === 'connected') {
                setConnectionStatus('connected')
                return
            }

            try {
                const msg: Event = JSON.parse(e.data)
                const payload = msg.data

                if (typeof msg.balance === 'number') {
                    setBalance(msg.balance)
                }

                if (msg.event_type === WsEventType.PAYLOAD_UPDATE) {
                    const typedPayload = payload as Order
                    handleTableUpdate(typedPayload, setOrderHistory)

                    if (
                        ![OrderStatus.CANCELLED, OrderStatus.CLOSED].includes(
                            payload.status
                        )
                    ) {
                        handleTableUpdate(typedPayload, setOpenPositions)
                    }
                    return
                }

                setEvents((prev) => [
                    {
                        event_type: msg.event_type,
                        message: `Order ID: ${msg.order_id}`,
                    },
                    ...prev,
                ])

                const orderUpdateEvents = [
                    WsEventType.ORDER_MODIFIED,
                    WsEventType.ORDER_PARTIALLY_FILLED,
                    WsEventType.ORDER_FILLED,
                    WsEventType.ORDER_PARTIALLY_CLOSED,
                ]

                const orderRemoveEvents = [
                    WsEventType.ORDER_CANCELLED,
                    WsEventType.ORDER_CLOSED,
                ]

                if (orderUpdateEvents.includes(msg.event_type)) {
                    let obj = { order_id: msg.order_id } as Order

                    if (msg.event_type === WsEventType.ORDER_MODIFIED) {
                        obj.take_profit = payload.take_profit
                        obj.stop_loss = payload.stop_loss
                    } else {
                        obj.status = msg.event_type.replace(
                            'order_',
                            ''
                        ) as OrderStatus
                    }

                    handleTableUpdate(obj, setOpenPositions)
                } else if (orderRemoveEvents.includes(msg.event_type)) {
                    handleOrderRemoval(msg.order_id)
                }
            } catch (error) {
                console.error('Failed to parse order WebSocket message:', error)
            }
        }

        ws.onclose = (e) => {
            console.log('Order WebSocket closed:', e)
            setConnectionStatus('disconnected')
        }

        return () => ws.close()
    }, [wsToken, handleTableUpdate, handleOrderRemoval, setEvents, setBalance])

    return {
        connectionStatus,
        openPositions,
        orderHistory,
        pageNumRef,
        hasNextRef,
        fetchPositions,
        fetchOrderHistory,
        handleCloseAll,
    }
}

// Main Component
const TradingPage: FC = () => {
    const [currentTimeFrame, setCurrentTimeFrame] = useState<TimeFrame>(
        TimeFrame.M5
    )
    const [tableTab, setTableTab] = useState<Tab>('positions')

    // Custom hooks
    const { showScrollToTop, scrollToTop } = useScrollToTop()
    const {
        instrumentSummary,
        balance,
        events,
        setBalance,
        setEvents,
        fetchInstrumentSummary,
        fetchUserSummary,
        fetchEvents,
    } = useApiData()

    const { candles, candleStickSeriesRef, handleIncomingPrice } =
        useCandles(currentTimeFrame)
    const {
        prices,
        orderBook,
        recentTrades,
        handleOrderBookUpdate,
        handleRecentTradeUpdate,
    } = useMarketData()
    const {
        connectionStatus,
        openPositions,
        orderHistory,
        pageNumRef,
        fetchPositions,
        fetchOrderHistory,
        handleCloseAll,
        hasNextRef,
    } = useOrderManagement(setEvents, setBalance)

    // WebSocket connections
    useWebSocket(
        handleIncomingPrice,
        handleOrderBookUpdate,
        handleRecentTradeUpdate
    )

    useEffect(() => {
        document.body.classList.add('bg-zinc-900')

        fetchInstrumentSummary()
        fetchUserSummary()
        fetchEvents()

        return () => {
            document.body.classList.remove('bg-zinc-900')
        }
    }, [fetchInstrumentSummary, fetchUserSummary, fetchEvents])

    const handleTabChange = useCallback(
        (tab: Tab) => {
            pageNumRef.current = 1
            hasNextRef.current = true
            setTableTab(tab)
        },
        [pageNumRef]
    )

    const handlePositionsScrollEnd = useCallback(() => {
        if (hasNextRef.current) {
            pageNumRef.current += 1
            fetchPositions()
        }
    }, [fetchPositions, pageNumRef])

    const handleHistoryScrollEnd = useCallback(() => {
        if (hasNextRef.current) {
            pageNumRef.current += 1
            fetchOrderHistory()
        }
    }, [fetchOrderHistory, pageNumRef])

    return (
        <>
            <div className="w-full h-auto flex pb-7">
                <Header />

                <main className="w-full min-h-screen mt-10 flex flex-row gap-1 p-1">
                    {/* Main Trading Area */}
                    <div className="w-[80%] flex flex-col gap-1">
                        {/* Chart and Market Data */}
                        <div className="h-150 max-h-150 flex flex-row gap-1">
                            <div className="h-150 grow-1 rounded-sm bg-background">
                                <ChartPanel
                                    {...(instrumentSummary ?? {})}
                                    {...prices}
                                    instrument={INSTRUMENT}
                                    candles={candles}
                                    seriesRef={candleStickSeriesRef}
                                    defaultTimeFrame={TimeFrame.M5}
                                    onTimeFrameChange={setCurrentTimeFrame}
                                />
                            </div>
                            <div className="w-[20%] h-full flex flex-col gap-1 rounded-sm">
                                <div className="w-full h-1/2 pb-1 rounded-sm bg-background">
                                    <OrderBook {...orderBook} />
                                </div>
                                <div className="w-full h-1/2 rounded-sm bg-background overflow-y-scroll">
                                    <RecentTrades trades={recentTrades} />
                                </div>
                            </div>
                        </div>

                        {/* Tables Section */}
                        <div className="w-full flex flex-row gap-1">
                            <div className="w-full bg-background rounded-sm p-1">
                                <div className="w-full flex justify-between px-3">
                                    <div className="w-full mb-2 flex items-center justify-start p-3">
                                        {TABLE_TABS.map((tab) => (
                                            <Button
                                                key={tab}
                                                type="button"
                                                className={`bg-transparent hover:bg-transparent rounded-none border-b-2 hover:text-white cursor-pointer ${
                                                    tableTab === tab
                                                        ? 'border-b-white text-white'
                                                        : 'border-b-transparent text-neutral-900'
                                                }`}
                                                onClick={() =>
                                                    handleTabChange(tab)
                                                }
                                            >
                                                {tab.charAt(0).toUpperCase() +
                                                    tab.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleCloseAll('cancel')
                                            }
                                            className="w-20 rounded-3xl !bg-neutral-900 text-white text-xs cursor-pointer"
                                        >
                                            Cancel All
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleCloseAll('close')
                                            }
                                            className="w-20 rounded-3xl !bg-neutral-900 text-white text-xs cursor-pointer"
                                        >
                                            Close All
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-full p-3">
                                    {tableTab === 'positions' && (
                                        <PositionsTable
                                            orders={openPositions}
                                            onScrollEnd={
                                                handlePositionsScrollEnd
                                            }
                                            showActions={true}
                                        />
                                    )}
                                    {tableTab === 'history' && (
                                        <OrderHistoryTable
                                            orders={orderHistory}
                                            onScrollEnd={handleHistoryScrollEnd}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="h-150 rounded-sm bg-background">
                            <BasicOrderCard
                                balance={balance}
                                setEventLogs={setEvents}
                                setBalance={
                                    setBalance as React.Dispatch<
                                        React.SetStateAction<number>
                                    >
                                }
                            />
                        </div>
                        <div className="flex-1 h-auto max-h-fit min-h-0 sticky top-11 rounded-sm bg-background">
                            <EventLog data={events} />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <div className="w-full h-7 min-h-0 max-h-10 z-[999] fixed bottom-0">
                    <StatusBar connectionStatus={connectionStatus} />
                </div>
            </div>

            {/* Scroll to Top Button */}
            <div
                className={`fixed w-10 h-10 bottom-12 right-10 flex items-center justify-center rounded-full bg-gray-900 cursor-pointer transition-all duration-300 ${
                    showScrollToTop
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-100'
                }`}
                onClick={scrollToTop}
            >
                <ChevronUp className="size-5" />
            </div>
        </>
    )
}

export default TradingPage
