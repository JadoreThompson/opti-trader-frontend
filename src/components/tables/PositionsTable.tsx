import { Checkbox } from '@/components/ui/checkbox'
import { HTTP_BASE_URL } from '@/config'
import type { OrderTableProps } from '@/lib/props/tableProps.'
import type { Order } from '@/lib/types/apiTypes/order'
import { EventType } from '@/lib/types/eventType'
import {
    CancelOrder,
    CloseOrder,
    ModifyOrder,
} from '@/lib/types/form-types/order'
import { OrderStatus } from '@/lib/types/orderStatus'
import { OrderType } from '@/lib/types/orderType'
import { Side } from '@/lib/types/side'
import { cn, formatUnderscore } from '@/lib/utils'
import { AssertError, Value } from '@sinclair/typebox/value'
import { Pencil, X } from 'lucide-react'
import React, { useEffect, useRef, useState, type FC } from 'react'
import type { Log } from '../EventLog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type ModifyData = {
    limit_price: number | null
    take_profit: number | null
    stop_loss: number | null
    use_tp: boolean
    use_sl: boolean
}

const PositionsTable: FC<
    OrderTableProps & {
        setEventLogs: React.Dispatch<React.SetStateAction<Log[]>>
    }
> = ({ orders, onScrollEnd, setEventLogs }) => {
    const tableBottomRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLFormElement>(null)

    const [focusedOrder, setFocusedOrder] = useState<Order>()
    const [showModify, setShowModify] = useState(false)
    const [showClose, setShowClose] = useState(false)
    const [showCancel, setShowCancel] = useState(false)
    const [showDetails, setShowDetails] = useState<boolean>(false)

    const [modifyData, setModifyData] = useState<ModifyData>({} as ModifyData)

    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    onScrollEnd()
                }
            })
        })

        if (tableBottomRef.current) {
            observer.observe(tableBottomRef.current)
        }

        return () => {
            if (tableBottomRef.current) {
                observer.disconnect()
            }
        }
    }, [])

    const handleActionClick = (
        e: React.MouseEvent<SVGSVGElement>,
        actionType: 'modify' | 'close',
        order: Order
    ): void => {
        e.stopPropagation()
        setFocusedOrder(order)
        setModifyData({} as ModifyData)

        if (actionType === 'modify') {
            setModifyData({
                limit_price: order.limit_price,
                take_profit: order.take_profit,
                stop_loss: order.stop_loss,
                use_tp: typeof order.take_profit === 'number',
                use_sl: typeof order.stop_loss === 'number',
            })
            setShowModify(true)
        } else if (actionType === 'close') {
            setShowClose(true)
        }
    }

    const handleContainerClick = (
        e: React.MouseEvent<HTMLDivElement>
    ): void => {
        if (!cardRef.current?.contains(e.target as Node)) {
            setShowModify(false)
            setShowClose(false)
            setShowCancel(false)
            setFocusedOrder(undefined)
            setShowDetails(false)
        }
    }

    const handleCloseSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        action: 'close' | 'cancel'
    ): Promise<void> => {
        e.preventDefault()
        setErrorMsg(null)
        if (!focusedOrder) return

        const formData = Object.fromEntries(
            new FormData(e.currentTarget).entries()
        )
        if (formData.quantity === 'on') {
            formData.quantity = 'ALL'
        }

        const endpoint =
            HTTP_BASE_URL +
            `/order/${focusedOrder.order_id}` +
            (action === 'close' ? `/close` : '/cancel')

        try {
            const body = Value.Parse(
                action === 'close' ? CloseOrder : CancelOrder,
                formData
            )

            const rsp = await fetch(endpoint, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (rsp.ok || rsp.status === 400) {
                const data = await rsp.json()

                if (rsp.ok) {
                    setEventLogs((prev) => [
                        {
                            event_type:
                                action === 'cancel'
                                    ? EventType.CANCEL_SUBMITTED
                                    : EventType.CLOSE_SUBMITTED,
                            message: `Order ID: ${focusedOrder.order_id}`,
                        },
                        ...prev,
                    ])
                    setShowClose(false)
                    setFocusedOrder(undefined)
                    return
                }

                throw new Error(data['error'])
            }

            throw new Error('An unexpected error occurred.')
        } catch (error) {
            if (error instanceof AssertError) {
                setErrorMsg('Invalid request')
            } else {
                setErrorMsg((error as Error).message)
            }
        }
    }

    const handleModifySubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault()
        if (!focusedOrder) return

        const formData: { [key: string]: any } = Object.fromEntries(
            new FormData(e.currentTarget).entries()
        )

        if (!modifyData.use_tp) {
            formData['take_profit'] = null
        }

        if (!modifyData.use_sl) {
            formData['stop_loss'] = null
        }

        try {
            const body = Value.Parse(ModifyOrder, formData)

            const rsp = await fetch(
                HTTP_BASE_URL + `/order/${focusedOrder.order_id}/modify`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                }
            )

            const data = await rsp.json()

            if (rsp.ok) {
                setErrorMsg(null)
                setShowModify(false)
            } else {
                throw new Error(data['error'])
            }
        } catch (error) {
            if (error instanceof AssertError) {
                setErrorMsg('Invalid request')
            } else {
                setErrorMsg((error as Error).message)
            }
        }
    }

    const renderModify = () => {
        if (!focusedOrder) return null

        const canEditLimit =
            focusedOrder.order_type === OrderType.LIMIT &&
            [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED].includes(
                focusedOrder.status
            )

        return (
            <div className="z-10 fixed flex justify-center items-center inset-0">
                <form
                    ref={cardRef}
                    onSubmit={handleModifySubmit}
                    className="w-[400px] p-6 border border-gray-900 rounded-xl space-y-4 shadow-lg bg-background"
                >
                    <h2 className="text-lg font-semibold">Modify Order</h2>
                    <div className="space-y-4">
                        {/* Limit Price */}
                        <div>
                            <label className="block text-sm">Limit Price</label>
                            <Input
                                type="number"
                                name="limit_price"
                                value={modifyData.limit_price ?? ''}
                                onChange={(e) => {
                                    const value = e.currentTarget.value
                                    if (!value.trim()) {
                                        setErrorMsg('Invalid limit price')
                                    }
                                }}
                                disabled={!canEditLimit}
                            />
                        </div>

                        {/* Take Profit Toggle */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm">Take Profit</label>
                                <Checkbox
                                    checked={modifyData.use_tp}
                                    onCheckedChange={(checked) =>
                                        setModifyData({
                                            ...modifyData,
                                            use_tp: checked as boolean,
                                        })
                                    }
                                />
                            </div>
                            <Input
                                type="number"
                                name="take_profit"
                                defaultValue={modifyData.take_profit ?? ''}
                                disabled={!modifyData.use_tp}
                            />
                        </div>

                        {/* Stop Loss Toggle */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm">Stop Loss</label>
                                <Checkbox
                                    checked={modifyData.use_sl}
                                    onCheckedChange={(checked) =>
                                        setModifyData({
                                            ...modifyData,
                                            use_sl: checked as boolean,
                                        })
                                    }
                                />
                            </div>
                            <Input
                                type="number"
                                name="stop_loss"
                                defaultValue={modifyData.stop_loss ?? ''}
                                disabled={!modifyData.use_sl}
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="flex items-center justify-center">
                            <span className="text-red-500">{errorMsg}</span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={() => {
                                setShowModify(false)
                            }}
                            variant="ghost"
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="cursor-pointer">
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        )
    }

    const renderClose = () => {
        if (!focusedOrder || focusedOrder.open_quantity === 0) return null

        return (
            <div
                className="z-10 fixed flex justify-center items-center inset-0"
                onClick={handleContainerClick}
            >
                <form
                    ref={cardRef}
                    onSubmit={(e) => handleCloseSubmit(e, 'close')}
                    className="p-6 rounded-xl w-[400px] space-y-4 border border-gray-900 shadow-lg bg-background"
                >
                    <h2 className="text-lg font-semibold">Close Order</h2>
                    <p className="text-sm text-gray-600">
                        Close <strong>{focusedOrder.instrument}</strong> order
                        with <strong>{focusedOrder.open_quantity}</strong> open
                        quantity?
                    </p>
                    <div>
                        <label className="block text-sm">Quantity</label>
                        <Input
                            type="number"
                            name="quantity"
                            min={0}
                            max={focusedOrder.open_quantity}
                        />
                    </div>
                    <div className="w-full flex items-center gap-2 p-0 h-6">
                        <Checkbox name="quantity" className="m-0 h-6 w-6" />
                        <label>All?</label>
                    </div>
                    {errorMsg && (
                        <div className="w-full text-center mb-2">
                            <span className="text-red-500 text-sm">
                                {errorMsg}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="submit"
                            onClick={() => {
                                setShowClose(false)
                            }}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Close</Button>
                    </div>
                </form>
            </div>
        )
    }

    const renderCancel = () => {
        if (!focusedOrder || focusedOrder.open_quantity !== 0) return null

        return (
            <div
                className="z-10 fixed flex justify-center items-center inset-0"
                onClick={handleContainerClick}
            >
                <form
                    ref={cardRef}
                    onSubmit={(e) => handleCloseSubmit(e, 'cancel')}
                    className="p-6 rounded-xl w-[400px] space-y-4 border border-gray-900 shadow-lg bg-background"
                >
                    <h2 className="text-lg font-semibold">Cancel Order</h2>
                    <p className="text-sm text-gray-600">
                        Cancel <strong>{focusedOrder.instrument}</strong> order
                        with <strong>{focusedOrder.standing_quantity}</strong>{' '}
                        standing quantity?
                    </p>
                    <div>
                        <label className="block text-sm">Quantity</label>
                        <Input
                            type="number"
                            name="quantity"
                            value={focusedOrder.standing_quantity}
                            min={0}
                            max={focusedOrder.standing_quantity}
                        />
                    </div>
                    <div className="w-full flex items-center gap-2 p-0 h-6">
                        <Checkbox name="quantity" className="m-0 h-6 w-6" />
                        <label>All?</label>
                    </div>
                    {errorMsg && (
                        <div className="w-full text-center mb-2">
                            <span className="text-red-500 text-sm">
                                {errorMsg}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="submit"
                            onClick={() => {
                                setShowCancel(false)
                            }}
                            variant="ghost"
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="cursor-pointer">
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <>
            {showModify && renderModify()}
            {showClose && renderClose()}
            {showCancel && renderCancel()}

            <div className="w-full h-full overflow-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                    <thead className="text-sm font-semibold">
                        <tr className="text-neutral-500">
                            <th>Symbol</th>
                            <th>Quantity</th>
                            <th>Side</th>
                            <th>Type</th>
                            <th>Limit Price</th>
                            <th>Take Profit</th>
                            <th>Stop Loss</th>
                            <th>Filled Price</th>
                            <th>PnL</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="h-20 text-center ">
                                    <span className="text-neutral-500">
                                        No open Positions
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            <>
                                {orders.map((order, idx) => (
                                    <>
                                        {showDetails &&
                                        focusedOrder?.order_id ===
                                            order.order_id ? (
                                            <tr className="border-t h-0">
                                                <td
                                                    colSpan={11}
                                                    className="py-5"
                                                >
                                                    <div className="open-position-container">
                                                        <div className="w-full flex justify-between mb-3">
                                                            <div className="flex flex-col">
                                                                <span className="w-fit text-md font-bold mb-1">
                                                                    {
                                                                        order.instrument
                                                                    }
                                                                </span>
                                                                <div className="flex flex-row gap-2">
                                                                    <span
                                                                        className={`w-fit py-1 px-2 rounded-sm text-xs ${order.side === Side.BID ? 'bg-green-500/20 text-[var(--green)]' : 'bg-red-500/20 text-[var(--red)]'}`}
                                                                    >
                                                                        {order.side ===
                                                                        Side.BID
                                                                            ? 'Buy'
                                                                            : 'Sell'}
                                                                    </span>
                                                                    <span className="w-fit py-1 px-2 rounded-sm text-xs bg-neutral-500/10 text-neutral-500">
                                                                        {formatUnderscore(
                                                                            order.order_type
                                                                        )}{' '}
                                                                        Order
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-neutral-500">
                                                                    {
                                                                        order.created_at
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full flex justify-between">
                                                            <div className="flex flex-row justify-start gap-10">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold">
                                                                        Price
                                                                    </span>
                                                                    <span className="text-md text-neutral-400">
                                                                        {typeof order.filled_price ===
                                                                        'number'
                                                                            ? order.filled_price
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold whitespace-nowrap">
                                                                        Limit
                                                                        Price
                                                                    </span>
                                                                    <span className="text-md text-neutral-400">
                                                                        {typeof order.limit_price ===
                                                                        'number'
                                                                            ? order.limit_price
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold">
                                                                        Quantity
                                                                    </span>
                                                                    <span className="text-md text-neutral-400">
                                                                        {
                                                                            order.quantity
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold whitespace-nowrap">
                                                                        Filled
                                                                        Quantity
                                                                    </span>
                                                                    <span className="text-md text-neutral-400">
                                                                        {
                                                                            order.open_quantity
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold whitespace-nowrap">
                                                                        Take
                                                                        Profit
                                                                    </span>
                                                                    <span className="text-md text-neutral-400">
                                                                        {typeof order.take_profit ===
                                                                        'number'
                                                                            ? order.take_profit
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold whitespace-nowrap">
                                                                        Stop
                                                                        Loss
                                                                    </span>
                                                                    <span className="text-md text-neutral-400">
                                                                        {typeof order.stop_loss ===
                                                                        'number'
                                                                            ? order.stop_loss
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full flex flex-row items-center justify-end gap-3">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setModifyData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                use_tp: Boolean(
                                                                                    focusedOrder.take_profit
                                                                                ),
                                                                                use_sl: Boolean(
                                                                                    focusedOrder.take_profit
                                                                                ),
                                                                            })
                                                                        )
                                                                        setShowModify(
                                                                            true
                                                                        )
                                                                    }}
                                                                    className="h-8 w-15 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                                                                >
                                                                    Modify
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    disabled={
                                                                        focusedOrder.standing_quantity ===
                                                                        0
                                                                    }
                                                                    onClick={() =>
                                                                        setShowCancel(
                                                                            true
                                                                        )
                                                                    }
                                                                    className="h-8 w-18 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setShowClose(
                                                                            true
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        focusedOrder.open_quantity ===
                                                                        0
                                                                    }
                                                                    className="h-8 w-17 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                                                                >
                                                                    Close
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr
                                                key={order.order_id}
                                                className={`h-10 cursor-pointer ${idx > 0 ? 'border-t' : ''}`}
                                                onClick={() => {
                                                    setFocusedOrder(order)
                                                    setShowDetails(true)
                                                }}
                                            >
                                                <td>{order.instrument}</td>
                                                <td>{order.quantity}</td>
                                                <td>
                                                    {order.side === Side.BID
                                                        ? 'Buy'
                                                        : 'Sell'}
                                                </td>
                                                <td>
                                                    {order.order_type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        order.order_type.slice(
                                                            1
                                                        )}
                                                </td>
                                                <td
                                                    className={
                                                        order.limit_price ==
                                                        null
                                                            ? 'text-gray-500'
                                                            : ''
                                                    }
                                                >
                                                    {order.limit_price ?? '--'}
                                                </td>
                                                <td
                                                    className={
                                                        order.take_profit ==
                                                        null
                                                            ? 'text-gray-500'
                                                            : ''
                                                    }
                                                >
                                                    {order.take_profit ?? '--'}
                                                </td>
                                                <td
                                                    className={
                                                        order.stop_loss == null
                                                            ? 'text-gray-500'
                                                            : ''
                                                    }
                                                >
                                                    {order.stop_loss ?? '--'}
                                                </td>
                                                <td
                                                    className={
                                                        order.filled_price ==
                                                        null
                                                            ? 'text-gray-500'
                                                            : ''
                                                    }
                                                >
                                                    {order.filled_price ?? '--'}
                                                </td>
                                                <td
                                                    className={
                                                        order.unrealised_pnl ==
                                                        null
                                                            ? 'text-gray-500'
                                                            : order.unrealised_pnl <
                                                                0
                                                              ? 'text-[var(--red)]'
                                                              : 'text-[var(--green)]'
                                                    }
                                                >
                                                    {order.unrealised_pnl !=
                                                    null
                                                        ? order.unrealised_pnl.toFixed(
                                                              2
                                                          )
                                                        : '--'}
                                                </td>
                                                <td>
                                                    {formatUnderscore(
                                                        order.status
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Pencil
                                                            className={cn(
                                                                'size-4 cursor-pointer',
                                                                'text-gray-500'
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setShowDetails(
                                                                    false
                                                                )
                                                                handleActionClick(
                                                                    e,
                                                                    'modify',
                                                                    order
                                                                )
                                                            }}
                                                        />
                                                        <X
                                                            className={cn(
                                                                'size-4 cursor-pointer',
                                                                'text-gray-500'
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setShowDetails(
                                                                    false
                                                                )
                                                                handleActionClick(
                                                                    e,
                                                                    'close',
                                                                    order
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
                <div ref={tableBottomRef} />
            </div>
        </>
    )
}

export default PositionsTable
