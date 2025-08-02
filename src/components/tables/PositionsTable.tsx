import { Checkbox } from '@/components/ui/checkbox'
import { HTTP_BASE_URL } from '@/config'
import type { OrderTableProps } from '@/lib/props/tableProps.'
import type { Order } from '@/lib/types/apiTypes/order'
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
import React, { useCallback, useEffect, useRef, useState, type FC } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type ModifyData = {
    limit_price: number | null
    take_profit: number | null
    stop_loss: number | null
    use_tp: boolean
    use_sl: boolean
}

type ModalType = 'modify' | 'close' | 'cancel' | null

const useIntersectionObserver = (callback: () => void) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback()
                }
            })
        })

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [callback])

    return ref
}

const useOrderActions = () => {
    const [error, setError] = useState<string | null>(null)

    const submitAction = useCallback(
        async (
            endpoint: string,
            body: any,
            method: 'DELETE' | 'PATCH' = 'DELETE'
        ) => {
            setError(null)
            try {
                const response = await fetch(endpoint, {
                    method,
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                if (response.ok || response.status === 400) {
                    const data = await response.json()
                    if (!response.ok) {
                        throw new Error(data['error'])
                    }
                    return true
                }
                throw new Error('An unexpected error occurred.')
            } catch (err) {
                const message =
                    err instanceof AssertError
                        ? 'Invalid request'
                        : (err as Error).message
                setError(message)
                return false
            }
        },
        []
    )

    return { error, setError, submitAction }
}

// Modal Components
const ModifyModal: FC<{
    order: Order
    modifyData: ModifyData
    setModifyData: (data: ModifyData) => void
    onSubmit: (formData: FormData) => Promise<boolean>
    onClose: () => void
    error: string | null
}> = ({ order, modifyData, setModifyData, onSubmit, onClose, error }) => {
    const canEditLimit =
        order.order_type === OrderType.LIMIT &&
        [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED].includes(
            order.status
        )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        if (!modifyData.use_tp) formData.set('take_profit', '')
        if (!modifyData.use_sl) formData.set('stop_loss', '')

        const success = await onSubmit(formData)
        if (success) onClose()
    }

    return (
        <div className="z-10 fixed flex justify-center items-center inset-0">
            <form
                onSubmit={handleSubmit}
                className="w-[400px] p-6 border border-gray-900 rounded-xl space-y-4 shadow-lg bg-background"
            >
                <h2 className="text-lg font-semibold">Modify Order</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm">Limit Price</label>
                        <Input
                            type="number"
                            name="limit_price"
                            defaultValue={modifyData.limit_price ?? ''}
                            disabled={!canEditLimit}
                        />
                    </div>

                    <FormFieldWithToggle
                        label="Take Profit"
                        name="take_profit"
                        value={modifyData.take_profit}
                        checked={modifyData.use_tp}
                        onToggle={(checked) =>
                            setModifyData({
                                ...modifyData,
                                use_tp: checked,
                            })
                        }
                    />

                    <FormFieldWithToggle
                        label="Stop Loss"
                        name="stop_loss"
                        value={modifyData.stop_loss}
                        checked={modifyData.use_sl}
                        onToggle={(checked) =>
                            setModifyData({
                                ...modifyData,
                                use_sl: checked,
                            })
                        }
                    />
                </div>

                {error && (
                    <div className="text-center text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="ghost">
                        Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </div>
    )
}

const CloseModal: FC<{
    order: Order
    onSubmit: (formData: FormData) => Promise<boolean>
    onClose: () => void
    error: string | null
}> = ({ order, onSubmit, onClose, error }) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        if (formData.get('all-quantity') === 'on') {
            formData.set('quantity', 'ALL')
        }

        const success = await onSubmit(formData)
        if (success) onClose()
    }

    return (
        <div className="z-10 fixed flex justify-center items-center inset-0">
            <form
                onSubmit={handleSubmit}
                className="p-6 rounded-xl w-[400px] space-y-4 border border-gray-900 shadow-lg bg-background"
            >
                <h2 className="text-lg font-semibold">Close Order</h2>
                <p className="text-sm text-gray-600">
                    Close <strong>{order.instrument}</strong> order with{' '}
                    <strong>{order.open_quantity}</strong> open quantity?
                </p>

                <div>
                    <label className="block text-sm">Quantity</label>
                    <Input
                        type="number"
                        name="quantity"
                        min={0}
                        max={order.open_quantity}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox name="all-quantity" />
                    <label>All?</label>
                </div>

                {error && (
                    <div className="text-center text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="ghost">
                        Cancel
                    </Button>
                    <Button type="submit">Close</Button>
                </div>
            </form>
        </div>
    )
}

const CancelModal: FC<{
    order: Order
    onSubmit: (formData: FormData) => Promise<boolean>
    onClose: () => void
    error: string | null
}> = ({ order, onSubmit, onClose, error }) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        if (formData.get('all-quantity') === 'on') {
            formData.set('quantity', 'ALL')
        }

        const success = await onSubmit(formData)
        if (success) onClose()
    }

    return (
        <div className="z-10 fixed flex justify-center items-center inset-0">
            <form
                onSubmit={handleSubmit}
                className="p-6 rounded-xl w-[400px] space-y-4 border border-gray-900 shadow-lg bg-background"
            >
                <h2 className="text-lg font-semibold">Cancel Order</h2>
                <p className="text-sm text-gray-600">
                    Cancel <strong>{order.instrument}</strong> order with{' '}
                    <strong>{order.standing_quantity}</strong> standing
                    quantity?
                </p>

                <div>
                    <label className="block text-sm">Quantity</label>
                    <Input
                        type="number"
                        name="quantity"
                        defaultValue={order.standing_quantity}
                        min={0}
                        max={order.standing_quantity}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox name="all-quantity" />
                    <label>All?</label>
                </div>

                {error && (
                    <div className="text-center text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="ghost">
                        Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </div>
    )
}

// Helper Components
const FormFieldWithToggle: FC<{
    label: string
    name: string
    value: number | null
    checked: boolean
    onToggle: (checked: boolean) => void
}> = ({ label, name, value, checked, onToggle }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between">
            <label className="text-sm">{label}</label>
            <Checkbox checked={checked} onCheckedChange={onToggle} />
        </div>
        <Input
            type="number"
            name={name}
            defaultValue={value ?? ''}
            step={0.01}
            disabled={!checked}
        />
    </div>
)

const OrderDetailRow: FC<{
    order: Order
    showActions: boolean
    onModify: () => void
    onCancel: () => void
    onClose: () => void
}> = ({ order, showActions, onModify, onCancel, onClose }) => (
    <tr className="border-t h-0">
        <td colSpan={showActions ? 11 : 10} className="py-5">
            <div className="open-position-container">
                <div className="w-full flex justify-between mb-3">
                    <div className="flex flex-col">
                        <span className="w-fit text-md font-bold mb-1">
                            {order.instrument}
                        </span>
                        <div className="flex flex-row gap-2">
                            <span
                                className={`w-fit py-1 px-2 rounded-sm text-xs ${
                                    order.side === Side.BID
                                        ? 'bg-green-500/20 text-[var(--green)]'
                                        : 'bg-red-500/20 text-[var(--red)]'
                                }`}
                            >
                                {order.side === Side.BID ? 'Buy' : 'Sell'}
                            </span>
                            <span className="w-fit py-1 px-2 rounded-sm text-xs bg-neutral-500/10 text-neutral-500">
                                {formatUnderscore(order.order_type)} Order
                            </span>
                        </div>
                    </div>
                    <span className="text-neutral-500">{order.created_at}</span>
                </div>

                <div className="w-full flex justify-between">
                    <div className="flex flex-row justify-start gap-10">
                        {[
                            { label: 'Price', value: order.price },
                            { label: 'Filled Price', value: order.filled_price },
                            { label: 'Limit Price', value: order.limit_price },
                            { label: 'Quantity', value: order.quantity },
                            {
                                label: 'Filled Quantity',
                                value: order.open_quantity,
                            },
                            { label: 'Take Profit', value: order.take_profit },
                            { label: 'Stop Loss', value: order.stop_loss },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex flex-col">
                                <span className="text-xs font-semibold whitespace-nowrap">
                                    {label}
                                </span>
                                <span className="text-md text-neutral-400">
                                    {typeof value === 'number' ? value : '-'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {showActions && (
                        <div className="w-full flex flex-row items-center justify-end gap-3">
                            <Button
                                type="button"
                                onClick={onModify}
                                className="h-8 w-20 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                            >
                                Modify
                            </Button>
                            <Button
                                type="button"
                                disabled={order.standing_quantity === 0}
                                onClick={onCancel}
                                className="h-8 w-18 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={order.open_quantity === 0}
                                className="h-8 w-17 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </td>
    </tr>
)

// Main Component
const PositionsTable: FC<OrderTableProps & { showActions: boolean }> = ({
    orders,
    onScrollEnd,
    showActions = true,
}) => {
    const [focusedOrder, setFocusedOrder] = useState<Order>()
    const [activeModal, setActiveModal] = useState<ModalType>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [modifyData, setModifyData] = useState<ModifyData>({} as ModifyData)

    const { error, setError, submitAction } = useOrderActions()
    const tableBottomRef = useIntersectionObserver(onScrollEnd)

    const closeModal = useCallback(() => {
        setActiveModal(null)
        setFocusedOrder(undefined)
        setError(null)
    }, [setError])

    const openModal = useCallback((type: ModalType, order: Order) => {
        setFocusedOrder(order)
        setActiveModal(type)
        setShowDetails(false)

        if (type === 'modify') {
            setModifyData({
                limit_price: order.limit_price,
                take_profit: order.take_profit,
                stop_loss: order.stop_loss,
                use_tp: typeof order.take_profit === 'number',
                use_sl: typeof order.stop_loss === 'number',
            })
        }
    }, [])

    const handleModifySubmit = useCallback(
        async (formData: FormData) => {
            if (!focusedOrder) return false

            let body: { [key: string]: any } = Object.fromEntries(
                formData.entries()
            )

            if (body.take_profit === '') {
                body.take_profit = null
            }
            if (body.stop_loss === '') {
                body.stop_loss = null
            }

            body = Value.Parse(ModifyOrder, body)
            return await submitAction(
                `${HTTP_BASE_URL}/order/${focusedOrder.order_id}/modify`,
                body,
                'PATCH'
            )
        },
        [focusedOrder, submitAction]
    )

    const handleCloseSubmit = useCallback(
        async (formData: FormData) => {
            if (!focusedOrder) return false

            const body = Value.Parse(
                CloseOrder,
                Object.fromEntries(formData.entries())
            )
            return await submitAction(
                `${HTTP_BASE_URL}/order/${focusedOrder.order_id}/close`,
                body
            )
        },
        [focusedOrder, submitAction]
    )

    const handleCancelSubmit = useCallback(
        async (formData: FormData): Promise<boolean> => {
            if (!focusedOrder) return false

            const body = Value.Parse(
                CancelOrder,
                Object.fromEntries(formData.entries())
            )

            return await submitAction(
                `${HTTP_BASE_URL}/order/${focusedOrder.order_id}/cancel`,
                body
            )
        },
        [focusedOrder, submitAction]
    )

    const handleRowClick = useCallback((order: Order) => {
        setFocusedOrder(order)
        setShowDetails(true)
    }, [])

    return (
        <>
            {/* Modals */}
            {activeModal === 'modify' && focusedOrder && (
                <ModifyModal
                    order={focusedOrder}
                    modifyData={modifyData}
                    setModifyData={setModifyData}
                    onSubmit={handleModifySubmit}
                    onClose={closeModal}
                    error={error}
                />
            )}

            {activeModal === 'close' && focusedOrder && (
                <CloseModal
                    order={focusedOrder}
                    onSubmit={handleCloseSubmit}
                    onClose={closeModal}
                    error={error}
                />
            )}

            {activeModal === 'cancel' && focusedOrder && (
                <CancelModal
                    order={focusedOrder}
                    onSubmit={handleCancelSubmit}
                    onClose={closeModal}
                    error={error}
                />
            )}

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
                            {showActions && (
                                <th className="text-right">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="h-20 text-center">
                                    <span className="text-neutral-500">
                                        No open Positions
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order, idx) => (
                                <React.Fragment key={order.order_id}>
                                    {showDetails &&
                                    focusedOrder?.order_id ===
                                        order.order_id ? (
                                        <OrderDetailRow
                                            order={order}
                                            showActions={showActions}
                                            onModify={() =>
                                                openModal('modify', order)
                                            }
                                            onCancel={() =>
                                                openModal('cancel', order)
                                            }
                                            onClose={() =>
                                                openModal('close', order)
                                            }
                                        />
                                    ) : (
                                        <tr
                                            className={`h-10 cursor-pointer ${idx > 0 ? 'border-t' : ''}`}
                                            onClick={() =>
                                                handleRowClick(order)
                                            }
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
                                                    order.order_type.slice(1)}
                                            </td>
                                            <td
                                                className={
                                                    order.limit_price == null
                                                        ? 'text-gray-500'
                                                        : ''
                                                }
                                            >
                                                {order.limit_price ?? '--'}
                                            </td>
                                            <td
                                                className={
                                                    order.take_profit == null
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
                                                    order.filled_price == null
                                                        ? 'text-gray-500'
                                                        : ''
                                                }
                                            >
                                                {order.filled_price ?? '--'}
                                            </td>
                                            <td
                                                className={
                                                    order.unrealised_pnl == null
                                                        ? 'text-gray-500'
                                                        : order.unrealised_pnl <
                                                            0
                                                          ? 'text-[var(--red)]'
                                                          : 'text-[var(--green)]'
                                                }
                                            >
                                                {order.unrealised_pnl != null
                                                    ? order.unrealised_pnl.toFixed(
                                                          2
                                                      )
                                                    : '--'}
                                            </td>
                                            <td>
                                                {formatUnderscore(order.status)}
                                            </td>
                                            {showActions && (
                                                <td>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Pencil
                                                            className={cn(
                                                                'size-4 cursor-pointer text-gray-500'
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openModal(
                                                                    'modify',
                                                                    order
                                                                )
                                                            }}
                                                        />
                                                        <X
                                                            className={cn(
                                                                'size-4 cursor-pointer text-gray-500'
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openModal(
                                                                    'close',
                                                                    order
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
                <div ref={tableBottomRef} />
            </div>
        </>
    )
}

export default PositionsTable
