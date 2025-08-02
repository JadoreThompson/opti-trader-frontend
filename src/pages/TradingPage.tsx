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
import { useEffect, useRef, useState, type FC } from 'react'
import { Toaster } from 'sonner'

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
const tableTabs = ['positions', 'history']
type Tab = (typeof tableTabs)[number]

const TradingPage: FC = () => {
    const instrument = 'BTCUSD-FUTURES'
    const pageNumRef = useRef<number>(0)
    const candleStickSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null)
    const candlesRef = useRef<CandlestickData<Time>[]>([])

    const [candles, setCandles] = useState<CandlestickData<Time>[]>([])
    const [currentTimeFrame, setCurrentTimeFrame] = useState<TimeFrame>(
        TimeFrame.H1
    )
    const [instrumentSummary, setInstrumentSummary] =
        useState<InstrumentSummaryFull | null>(null)
    const [prices, setPrices] = useState<{
        price: number | null
        prevPrice: number | null
    }>({} as { price: number | null; prevPrice: number | null })

    const [wsToken, setWsToken] = useState<string | undefined>(undefined)
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('disconnected')

    const [tableTab, setTableTab] = useState<Tab>('positions')
    const [showScrollToTop, setShowScollToTop] = useState<boolean>(false)

    const [openPositions, setOpenPositions] = useState<Order[]>([])
    const [orderHistory, setOrderHistory] = useState<Order[]>([])
    const [balance, setBalance] = useState<number | null>(null)

    const [events, setEventLogs] = useState<Log[]>([])
    const [orderBook, setOrderBook] = useState<{
        bids: PriceLevel[]
        asks: PriceLevel[]
    }>({} as { bids: PriceLevel[]; asks: PriceLevel[] })
    const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])

    useEffect(() => {
        const scrollEvent = () =>
            setShowScollToTop(window.scrollY > window.innerHeight)

        document.body.classList.toggle('bg-zinc-900')
        document.addEventListener('scroll', scrollEvent)

        return () => {
            document.body.classList.toggle('bg-zinc-900')
            document.removeEventListener('scroll', () => scrollEvent)
        }
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
    }, [currentTimeFrame])

    useEffect(() => {
        const fetchInstSummary = async () => {
            const rsp = await fetch(
                HTTP_BASE_URL + `/instrument/${instrument}/summary`
            )
            if (rsp.ok) {
                const data: InstrumentSummaryFull = await rsp.json()
                setInstrumentSummary(data)
            }
        }

        fetchInstSummary()
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
                } else if (message.event_type === 'orderbook_update') {
                    setOrderBook({
                        bids: Object.entries(message.data.bids)
                            .map(([k, v]) => ({
                                price: Number.parseFloat(k),
                                quantity: Number.parseInt(v as string),
                            }))
                            .reverse(),
                        asks: Object.entries(message.data.asks).map(
                            ([k, v]) => ({
                                price: Number.parseFloat(k),
                                quantity: Number.parseInt(v as string),
                            })
                        ),
                    })
                } else if (message.event_type === 'recent_trade') {
                    setRecentTrades((prev) => {
                        const newRTrades = [...prev]
                        if (newRTrades.length == 10) {
                            newRTrades.pop()
                        }
                        newRTrades.unshift(message.data)
                        return newRTrades
                    })
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
            console.log(msg)
            const payload = msg.data

            if (typeof msg.balance === 'number') {
                console.log('Balance:', msg.balance)
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

            setEventLogs((prev) => [
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

                if (msg.event_type == WsEventType.ORDER_MODIFIED) {
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
            console.log('Order ws closed ', e)
            setConnectionStatus('disconnected')
        }

        return () => {
            ws.close()
        }
    }, [wsToken])

    useEffect(() => {
        const fetchEvents = async () => {
            const rsp = await fetch(HTTP_BASE_URL + '/user/events', {
                credentials: 'include',
            })
            if (rsp.ok) {
                const data: PaginatedResponse<{
                    order_event_id: string
                    event_type: WsEventType
                    order_id: string
                }> = await rsp.json()
                setEventLogs(
                    data.data.map((val) => ({
                        event_type: val.event_type,
                        message: `Order ID: ${val.order_id}`,
                    }))
                )
            }
        }

        fetchEvents()
    }, [])

    useEffect(() => {
        const fetchEvents = async () => {
            const rsp = await fetch(HTTP_BASE_URL + '/user/summary', {
                credentials: 'include',
            })
            if (rsp.ok) {
                const data: { balance: number; pnl: number } = await rsp.json()
                console.log(data)
                setBalance(data.balance)
            }
        }

        fetchEvents()
    }, [])

    async function handleWsHeartbeat(ws: WebSocket): Promise<void> {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 1000))

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
                return [incomingOrder, ...prev]
            }
        })
    }

    function handleOrderRemoval(order_id: string) {
        setOpenPositions((prev) =>
            prev.filter((order) => order.order_id !== order_id)
        )
    }

    function handleIncomingPrice(value: number): void {
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
                    high: Math.max(prevCandle.high, value),
                    low: Math.max(prevCandle.low, value),
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
        }
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

    const handleCloseAll = async (action: 'close' | 'cancel') => {
        await fetch(HTTP_BASE_URL + `/order/${action}/all`, {
            method: 'DELETE',
            credentials: 'include',
        })
    }

    return (
        <>
            <Toaster />

            <div className="w-full h-auto flex pb-7">
                <Header />

                <main className="w-full min-h-screen mt-10 flex flex-row gap-1 p-1">
                    <div className="w-[80%] flex flex-col gap-1">
                        <div className="h-150 max-h-150 flex flex-row gap-1">
                            <div className="h-150 grow-1 rounded-sm bg-background">
                                <ChartPanel
                                    {...(instrumentSummary ?? {})}
                                    {...prices}
                                    instrument={instrument}
                                    candles={candles}
                                    seriesRef={candleStickSeriesRef}
                                    onTimeFrameChange={setCurrentTimeFrame}
                                />
                            </div>
                            <div className="w-[20%] h-full flex flex-col gap-1 rounded-sm">
                                <div className="w-full h-1/2 pb-1 rounded-sm bg-background">
                                    <OrderBook {...orderBook} />
                                </div>
                                <div className="w-full h-1/2 rounded-sm bg-background">
                                    <RecentTrades trades={recentTrades} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-row gap-1">
                            <div className="w-full bg-background rounded-sm p-1">
                                <div className="w-full flex justify-between px-3">
                                    <div className="w-full mb-2 flex items-center justify-start p-3">
                                        {tableTabs.map((tab) => (
                                            <Button
                                                type="button"
                                                className={`bg-transparent hover:bg-transparent rounded-none border-b-2 hover:text-white cursor-pointer ${tableTab == tab ? 'border-b-white text-white' : 'border-b-transparent text-neutral-900'}`}
                                                onClick={() => {
                                                    pageNumRef.current = 1
                                                    setTableTab(tab)
                                                }}
                                            >
                                                {tab.charAt(0).toUpperCase() +
                                                    tab.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => handleCloseAll('cancel')}
                                            className="w-20 rounded-3xl !bg-neutral-900 text-white text-xs cursor-pointer"
                                        >
                                            Cancel All
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleCloseAll('close')}
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
                                            onScrollEnd={() => {
                                                pageNumRef.current += 1
                                                fetchPositions()
                                            }}
                                            setEventLogs={setEventLogs}
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
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                        <div className="h-150 rounded-sm bg-background">
                            <BasicOrderCard
                                balance={balance}
                                setEventLogs={setEventLogs}
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
