import BasicOrderCard from '@/components/BasicOrderForm'
import ChartPanel from '@/components/ChartPanel'
import OrderBook from '@/components/OrderBook'
import RecentTrades from '@/components/RecentTrades'
import OrderHistoryTable from '@/components/tables/OrderHistoryTable'
import PositionsTable from '@/components/tables/PositionsTable'
import { Button } from '@/components/ui/button'
import { HTTP_BASE_URL, WS_BASE_URL } from '@/config'
import type { Event } from '@/lib/types/apiTypes/event'
import { EventType } from '@/lib/types/apiTypes/eventType'
import type { InstrumentSummary } from '@/lib/types/apiTypes/instrumentSummary'
import type { Order } from '@/lib/types/apiTypes/order'
import type { PaginatedResponse } from '@/lib/types/apiTypes/paginatedResponse'
import { MarketType } from '@/lib/types/marketType'
import { OrderStatus } from '@/lib/types/orderStatus'
import { TimeFrame } from '@/lib/types/timeframe'
import { cn } from '@/lib/utils'
import {
    type CandlestickData,
    type ISeriesApi,
    type Time,
} from 'lightweight-charts'
import { Bell, ChevronUp, User, Wifi } from 'lucide-react'
import { useEffect, useRef, useState, type FC } from 'react'
import { Link } from 'react-router'
import { toast, Toaster } from 'sonner'

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
type TickerSummary = { ticker: string; pct: number; price: number }
const tableTabs = ['positions', 'history']
type Tab = (typeof tableTabs)[number]

// Constatnts
const eventTitles: Partial<Record<EventType, string>> = {
    [EventType.ORDER_NEW]: 'Order Placed',
    [EventType.ORDER_PARTIALLY_CANCELLED]: 'Order Partially Cancelled',
    [EventType.ORDER_CANCELLED]: 'Order Cancelled',
    [EventType.ORDER_MODIFIED]: 'Order Modified',
    [EventType.ORDER_PARTIALLY_FILLED]: 'Order Partially Filled',
    [EventType.ORDER_FILLED]: 'Order Filled',
    [EventType.ORDER_PARTIALLY_CLOSED]: 'Order Partially Closed',
    [EventType.ORDER_CLOSED]: 'Order Closed',
    [EventType.ORDER_REJECTED]: 'Order Rejected',
    [EventType.ORDER_NEW_REJECTED]: 'Order Rejected',
    [EventType.ORDER_CANCEL_REJECTED]: 'Cancel rejected',
    [EventType.ORDER_MODIFY_REJECTED]: 'Modify rejected',
}

const TradingPage: FC = () => {
    const stylesRef = useRef<CSSStyleDeclaration>(
        getComputedStyle(document.documentElement)
    )
    const pageNumRef = useRef<number>(0)
    const candleStickSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null)
    const candlesRef = useRef<CandlestickData<Time>[]>([])

    const [candles, setCandles] = useState<CandlestickData<Time>[]>([])
    const [currentTimeFrame, setCurrentTimeFrame] = useState<TimeFrame>(
        TimeFrame.H1
    )
    const instrument = 'BTCUSD-FUTURES'
    const [instrumentSummary, setInstrumentSummary] =
        useState<InstrumentSummary | null>(null)
    const [prevPrice, setPrevPrice] = useState<number | null>(null)
    const [price, setPrice] = useState<number | null>(null)
    // const prevPrice = useMemo(() => {
    //     console.log("Price:", price, "Prev", this)
    // }, [price]);

    const [wsToken, setWsToken] = useState<string | undefined>(undefined)
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('disconnected')

    const [simpleTickers, setSimpleTickers] = useState<TickerSummary[]>(
        Array(10).fill({ ticker: 'SOL/USDT', pct: 24.7, price: 1234.11 })
    )

    const [tableTab, setTableTab] = useState<Tab>('positions')
    const [showScrollToTop, setShowScollToTop] = useState<boolean>(false)

    const [openPositions, setOpenPositions] = useState<Order[]>([])
    const [orderHistory, setOrderHistory] = useState<Order[]>([])

    const connectionColor =
        connectionStatus === 'connected'
            ? stylesRef.current.getPropertyValue('--green')
            : connectionStatus === 'connecting'
              ? 'orange'
              : stylesRef.current.getPropertyValue('--red')

    const connectionMsg =
        connectionStatus === 'connected'
            ? 'Connected'
            : connectionStatus === 'connecting'
              ? 'Connecting...'
              : 'Disconnected'

    useEffect(
        () => console.log('Open Positions: ', openPositions),
        [openPositions]
    )

    useEffect(
        () => console.log('Order History: ', orderHistory),
        [orderHistory]
    )

    useEffect(() => {
        document.addEventListener('scroll', () =>
            setShowScollToTop(window.scrollY > window.innerHeight)
        )
    }, [])

    useEffect(() => {
        const fetchCandles = async () => {
            const rsp = await fetch(
                HTTP_BASE_URL +
                    `/instrument/${instrument}/candles?time_frame=${currentTimeFrame}`
            )
            if (rsp.ok) {
                const data = await rsp.json()
                setCandles(data)
                candlesRef.current = data
            }
        }

        fetchCandles()
    }, [])

    useEffect(() => {
        const fetchCandles = async () => {
            const rsp = await fetch(
                HTTP_BASE_URL + `/instrument/${instrument}/summary`
            )
            if (rsp.ok) {
                const data: InstrumentSummary = await rsp.json()
                setInstrumentSummary(data)
            }
        }

        fetchCandles()
    }, [])

    useEffect(() => {
        const ws = new WebSocket(WS_BASE_URL + `/instrument/${instrument}/ws`)

        ws.onopen = () => {
            ws.send(JSON.stringify({ subscribe: 'orderbook_update' }))
            ws.send(JSON.stringify({ subscribe: 'recent_trade' }))
            handleWsHeartbeat(ws)
        }

        ws.onmessage = (e) => {
            if (e.data !== 'connected') {
                const message = JSON.parse(e.data)

                if (message.event_type === 'price_update') {
                    if (candleStickSeriesRef.current) {
                        handleIncomingPrice(Number.parseFloat(message.data))
                    }
                }
            }
        }

        return () => {
            ws.close()
        }
    }, [candleStickSeriesRef])

    // Orders WS
    useEffect(() => {
        const fetchToken = async () => {
            const rsp = await fetch(HTTP_BASE_URL + '/order/access-token', {
                credentials: 'include',
            })
            if (rsp.ok) {
                setWsToken((await rsp.json())['token'])
            }
        }

        fetchToken()
    }, [])

    useEffect(() => {
        if (!wsToken) return

        const ws = new WebSocket(WS_BASE_URL + '/order/ws')

        ws.onopen = () => {
            setConnectionStatus('connecting')
            ws.send(wsToken)
            handleWsHeartbeat(ws)
        }

        ws.onmessage = async (e) => {
            if (e.data === 'connected') {
                return setConnectionStatus('connected')
            }

            const msg: Event = JSON.parse(e.data)
            const payload = msg.data

            console.log('Incoming Message: ', msg)

            if (msg.event_type === 'payload_update') {
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

            const title =
                eventTitles[msg.event_type as EventType] ?? 'Unknown event'

            toast(title, {
                description: `Order ID: ${msg.order_id}`,
            })

            const orderUpdateEvents = [
                EventType.ORDER_MODIFIED,
                EventType.ORDER_PARTIALLY_FILLED,
                EventType.ORDER_FILLED,
                EventType.ORDER_PARTIALLY_CLOSED,
            ]

            const orderRemoveEvents = [
                EventType.ORDER_CANCELLED,
                EventType.ORDER_CLOSED,
            ]

            if (orderUpdateEvents.includes(msg.event_type)) {
                let obj = { order_id: msg.order_id } as Order

                if (msg.event_type == EventType.ORDER_MODIFIED) {
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
        }

        ws.onclose = (e) => {
            console.log("ORder ws closed ", e);
            setConnectionStatus('disconnected')
        }

        return () => {
            ws.close()
        }
    }, [wsToken])

    useEffect(() => {
        pageNumRef.current = 1
    }, [tableTab])

    async function handleWsHeartbeat(ws: WebSocket): Promise<void> {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 4000))

            if (!ws.OPEN) break

            ws.send('ping')
        }
    }

    function handleTableUpdate(
        incomingOrder: Order,
        setter: (value: React.SetStateAction<Order[]>) => void
    ) {
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
                return [...prev, incomingOrder]
            }
        })
    }

    function handleOrderRemoval(order_id: string) {
        setOpenPositions((prev) =>
            prev.filter((order) => order.order_id !== order_id)
        )
    }

    function handleIncomingPrice(price: number): void {
        if (!candleStickSeriesRef.current) return

        const timeframeToSeconds: Record<TimeFrame, number> = {
            [TimeFrame.S5]: 5,
            [TimeFrame.M1]: 60,
            [TimeFrame.M5]: 5 * 60,
            [TimeFrame.H1]: 60 * 60,
            [TimeFrame.H4]: 4 * 60 * 60,
            [TimeFrame.D1]: 24 * 60 * 60,
        }

        const seconds = timeframeToSeconds[currentTimeFrame]

        if (candlesRef.current.length) {
            const curTime = Date.now() / 1000
            const prevCandle = candlesRef.current[candlesRef.current.length - 1]
            const prevTime = prevCandle.time as number
            const nextTime = prevTime + seconds

            if (nextTime > curTime) {
                const updatedCandle = {
                    open: prevCandle.open,
                    high: Math.max(prevCandle.high, price),
                    low: Math.max(prevCandle.low, price),
                    close: price,
                    time: prevCandle.time,
                }
                candleStickSeriesRef.current.update(updatedCandle)
            } else {
                candleStickSeriesRef.current.update({
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    time: nextTime as Time,
                })
            }
        }

        setPrevPrice(price)
        setPrice(price)
    }

    async function fetchPositions(): Promise<void> {
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

        const rsp = await fetch(HTTP_BASE_URL + `/user/orders?${params}`, {
            credentials: 'include',
        })
        if (rsp.ok) {
            const data: PaginatedResponse<Order> = await rsp.json()
            setOpenPositions((prev) => [...prev, ...data.data])
        }
    }

    async function fetchOrderHistory(): Promise<void> {
        const params = new URLSearchParams()

        params.append('page', pageNumRef.current.toString())
        params.append('market_type', MarketType.FUTURES)

        for (const status of Object.values(OrderStatus)) {
            params.append('status', status)
        }

        const rsp = await fetch(HTTP_BASE_URL + `/user/orders?${params}`, {
            credentials: 'include',
        })
        if (rsp.ok) {
            const data: PaginatedResponse<Order> = await rsp.json()
            setOrderHistory((prev) => [...prev, ...data.data])
        }
    }

    return (
        <>
            <Toaster />
            <div className="w-full h-auto flex bg-zinc-900 pb-7">
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
                        <div className="h-[550px] grow-1 rounded-sm bg-background">
                            <ChartPanel
                                {...(instrumentSummary ?? {})}
                                instrument={instrument}
                                price={price}
                                prevPrice={prevPrice}
                                candles={candles}
                                seriesRef={candleStickSeriesRef}
                            />
                        </div>
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
                            {tableTab === 'positions' && (
                                <PositionsTable
                                    orders={openPositions}
                                    onScrollEnd={() => {
                                        pageNumRef.current += 1
                                        fetchPositions()
                                    }}
                                />
                            )}
                            {tableTab === 'history' && (
                                <OrderHistoryTable
                                    orders={orderHistory}
                                    onScrollEnd={() => {
                                        pageNumRef.current += 1
                                        fetchOrderHistory()
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <div className="w-full h-7 min-h-0 max-h-10 z-[999] fixed bottom-0 flex items-center border-t-1 border-t-gray bg-background text-xs">
                    <div className="w-full h-full relative">
                        <div className="w-fit h-full absolute top-0 left-0 z-2 flex items-center gap-2 px-2 border-r-1 border-r-gray bg-[var(--background)]">
                            <Wifi className="size-3" color={connectionColor} />
                            <span style={{ color: connectionColor }}>
                                {connectionMsg}
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
