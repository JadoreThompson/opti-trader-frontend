import { API_BASE_URL } from '@/config'
import { MarketType } from '@/lib/types/marketType'
import { OrderType } from '@/lib/types/orderType'
import { Side } from '@/lib/types/side'
import { cn } from '@/lib/utils'
import { useState, type FC } from 'react'
import { toast } from 'sonner'
import Toaster from './Toaster'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

/**
 * Supports Limit and Market Orders.
 */

const BasicOrderCard: FC<{ balance: number; marketType: MarketType }> = ({
    balance = 89237.0,
    marketType,
}) => {
    const [side, setSide] = useState<Side>(Side.BID)
    const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT)
    const [showTPSL, setShowTPSL] = useState(false)

    const sideColor =
        side === Side.BID
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'

    const buttonLabel =
        side === Side.BID
            ? orderType === 'market'
                ? 'Buy Market'
                : 'Buy Limit'
            : orderType === 'market'
              ? 'Sell Market'
              : 'Sell Limit'

    const handleFormSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault()

        const formData = Object.fromEntries(
            new FormData(e.currentTarget).entries()
        )
        const endpoint =
            API_BASE_URL +
            (marketType === MarketType.FUTURES ? '/futures' : '/spot')

        // const rsp = await fetch(endpoint, {
        //   method: "POST",
        //   credentials: "include",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(formData),
        // });

        // if (!rsp.ok) {
        // } else {
        // }

        toast('Hi')
    }

    return (
        <>
            <Toaster />
            <form onSubmit={handleFormSubmit} className='w-full'>
                <div className="w-full rounded-xl border-none p-4">
                    {/* Side Switch Tabs */}
                    <Tabs
                        defaultValue={side}
                        onValueChange={(val) => setSide(val as Side)}
                    >
                        <TabsList className="flex items-center w-full mb-4">
                            <TabsTrigger
                                type="button"
                                value={Side.BID}
                                className="rounded-l-md data-[state=active]:bg-green-600 data-[state=active]:text-white bg-transparent cursor-pointer"
                            >
                                Buy
                            </TabsTrigger>
                            <TabsTrigger
                                type="button"
                                value={Side.ASK}
                                className="rounded-r-md data-[state=active]:bg-red-600 data-[state=active]:text-white cursor-pointer"
                            >
                                Sell
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Order Type Tabs */}
                    <div className="flex mb-4 space-x-2">
                        <Button
                            type="button"
                            className={`flex-1 rounded-b-none rounded-t-sm bg-transparent hover:bg-neutral-900/20 cursor-pointer ${orderType === OrderType.MARKET ? 'border-b-1 border-b-white text-white' : ''}`}
                            onClick={() => setOrderType(OrderType.MARKET)}
                        >
                            Market
                        </Button>
                        <Button
                            type="button"
                            className={`flex-1 rounded-b-none rounded-t-sm bg-transparent hover:bg-neutral-900/20 cursor-pointer ${orderType === OrderType.LIMIT ? 'border-b-1 border-b-white text-white' : ''}`}
                            onClick={() => setOrderType(OrderType.LIMIT)}
                        >
                            Limit
                        </Button>
                    </div>

                    {/* Order Form */}
                    <div className="space-y-4">
                        {orderType === 'limit' && (
                            <div>
                                <label className="text-xs text-muted-foreground">
                                    Limit Price
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-9"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Quantity</span>
                                <span>
                                    Available: {balance.toFixed(2)} USDT
                                </span>
                            </div>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="h-9"
                                required
                            />
                        </div>

                        {/* TP/SL Toggle */}
                        <div>
                            <div
                                className="text-xs text-primary cursor-pointer underline"
                                onClick={() => setShowTPSL((prev) => !prev)}
                            >
                                {showTPSL ? 'Hide TP/SL' : 'Add TP/SL'}
                            </div>

                            {showTPSL && (
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="text-xs text-muted-foreground">
                                            Take Profit
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="TP Price"
                                            className="h-9"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">
                                            Stop Loss
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="SL Price"
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className={cn(
                            'mt-6 w-full text-white cursor-pointer',
                            sideColor
                        )}
                    >
                        {buttonLabel}
                    </Button>
                </div>
            </form>
        </>
    )
}

export default BasicOrderCard
