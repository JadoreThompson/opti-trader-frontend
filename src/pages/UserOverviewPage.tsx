import { ChartAreaInteractive } from '@/components/ex'
import Header from '@/components/Header'
import OrderHistoryTable from '@/components/tables/OrderHistoryTable'
import PositionsTable from '@/components/tables/PositionsTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HTTP_BASE_URL } from '@/config'
import type { Order } from '@/lib/types/apiTypes/order'
import type { PaginatedResponse } from '@/lib/types/apiTypes/paginatedResponse'
import { MarketType } from '@/lib/types/marketType'
import { OrderStatus } from '@/lib/types/orderStatus'
import { ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState, type FC } from 'react'

type UserSummary = { balance: number; pnl: number }
const tableTabs = ['positions', 'history']
type Tab = (typeof tableTabs)[number]

const UserOverviewPage: FC = () => {
    const pageNumRef = useRef<number>(0)

    const [userSummary, setUserSummary] = useState<UserSummary | undefined>(
        undefined
    )

    const [tableTab, setTableTab] = useState<Tab>('positions')
    const [openPositions, setOpenPositions] = useState<Order[]>([])
    const [orderHistory, setOrderHistory] = useState<Order[]>([])
    const [showScrollToTop, setShowScollToTop] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => console.log(isLoading), [isLoading])

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
        const fetchUserSummary = async () => {
            const rsp = await fetch(HTTP_BASE_URL + '/user/summary', {
                credentials: 'include',
            })
            if (rsp.ok) {
                const data: UserSummary = await rsp.json()
                setUserSummary(data)
            }
        }

        fetchUserSummary()
    }, [])

    async function fetchPositions(): Promise<void> {
        if (pageNumRef.current == 1) {
            setIsLoading(true)
        }

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

        if (pageNumRef.current == 1) {
            setIsLoading(false)
        }
    }

    async function fetchOrderHistory(): Promise<void> {
        if (pageNumRef.current == 1) {
            setIsLoading(true)
        }

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

        if (pageNumRef.current == 1) {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Header />
            <main className="mt-11 pb-5">
                <div className="max-w-5xl h-fit mx-auto">
                    <section className="w-full mb-1">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-col justify-between min-w-[300px] max-w-full h-fit max-h-fit bg-background border border-zinc-800 rounded-xl px-6 py-5">
                                {/* Balance */}
                                <div className="flex flex-col mb-3">
                                    <span className="text-xs text-zinc-400 uppercase tracking-wide">
                                        Portfolio Balance
                                    </span>
                                    {userSummary ? (
                                        <span className="text-2xl font-bold text-white">
                                            $
                                            {userSummary.balance.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </span>
                                    ) : (
                                        <Skeleton className="w-32 h-10 mt-2" />
                                    )}
                                </div>

                                {/* PnL */}
                                <div className="flex flex-col text-right">
                                    <span className="text-xs text-zinc-400 uppercase tracking-wide">
                                        Net PnL
                                    </span>
                                    {userSummary ? (
                                        <span
                                            className={`w-fit self-end rounded-sm text-md font-semibold p-1 ${
                                                userSummary.pnl >= 0
                                                    ? 'text-green-400 bg-green-300/10'
                                                    : 'text-red-400 bg-red-400'
                                            }`}
                                        >
                                            {userSummary.pnl >= 0 ? '+' : '-'}$
                                            {Math.abs(
                                                userSummary.pnl
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    ) : (
                                        <Skeleton className="w-24 h-8 mt-2 self-end" />
                                    )}
                                </div>
                            </div>

                            {/* Balance Chart Container */}
                            <div className="flex-1 flex flex-col h-100 bg-background border border-zinc-800 rounded-xl px-4 py-4 min-h-[130px]">
                                <div className="text-sm text-zinc-500 mb-2">
                                    Balance History
                                </div>
                                {/* Chart will go here later */}
                                <div className="w-full max-h-full min-h-0 h-full">
                                    <ChartAreaInteractive />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tables */}
                    <section className="min-h-150 border border-zinc-800 rounded-xl bg-background overflow-hidden p-1">
                        {isLoading ? (
                            <Skeleton className="w-full h-ull" />
                        ) : (
                            <>
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
                            </>
                        )}
                    </section>
                </div>
            </main>

            <div
                className={`fixed w-10 h-10 bottom-12 right-10 flex items-center justify-center rounded-full bg-gray-900 cursor-pointer transition-all duration-300 ${showScrollToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-100'}`}
                onClick={() => window.scrollTo({ top: 0 })}
            >
                <ChevronUp className="size-5" />
            </div>
        </>
    )
}

export default UserOverviewPage
