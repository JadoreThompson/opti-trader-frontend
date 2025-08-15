import { HTTP_BASE_URL } from '@/config'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import useOrderActions from '@/hooks/useOrderAction'
import type { OrderTableProps } from '@/lib/props/tableProps.'
import type { Order } from '@/lib/types/apiTypes/order'
import type { ModifyData } from '@/lib/types/modifyData'
import { OrderType } from '@/lib/types/orderType'
import { Side } from '@/lib/types/side'
import { cn, formatUnderscore } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import React, { useCallback, useState, type FC } from 'react'
import CancelModal from '../CancelModal'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type ModalType = 'modify' | 'cancel' | null

const ModifyModal: FC<{
    order: Order
    modifyData: {}
    setModifyData: (data: ModifyData) => void
    onSubmit: (formData: FormData) => Promise<boolean>
    onClose: () => void
    error: string | null
}> = ({ order, modifyData, setModifyData, onSubmit, onClose, error }) => {
    const isLimit = order.order_type === OrderType.LIMIT

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
                            disabled={!isLimit}
                        />
                    </div>
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

const OrderDetailRow: FC<{
    order: Order
    showActions: boolean
    onModify: () => void
    onCancel: () => void
}> = ({ order, showActions, onModify, onCancel }) => (
    <tr className="border-t h-0">
        <td colSpan={showActions ? 11 : 10} className="py-5">
            <div className="open-position-container">
                <div className="w-full flex justify-between mb-3">
                    <div className="flex flex-col">
                        <span className="w-fit text-md font-bold mb-1">
                            {order.instrument_id}
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
                            {
                                label: 'Avg Filled Price',
                                value: order.avg_fill_price,
                            },
                            { label: 'Limit Price', value: order.limit_price },
                            { label: 'Stop Price', value: order.stop_price },
                            { label: 'Quantity', value: order.quantity },
                            {
                                label: 'Executed Quantity',
                                value: order.executed_quantity,
                            },
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
                                onClick={onCancel}
                                className="h-8 w-18 rounded-3xl !bg-neutral-900 text-sm text-white font-medium cursor-pointer"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </td>
    </tr>
)

// Main Component
const OpenOrdersTable: FC<OrderTableProps & { showActions: boolean }> = ({
    orders,
    onScrollEnd,
    showActions = true,
}) => {
    const [focusedOrder, setFocusedOrder] = useState<Order>()
    const [activeModal, setActiveModal] = useState<ModalType>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [modifyData, setModifyData] = useState({})

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

            // body = Value.Parse(ModifyOrder, body)
            return await submitAction(
                `${HTTP_BASE_URL}/order/${focusedOrder.order_id}`,
                body,
                'PATCH'
            )
        },
        [focusedOrder, submitAction]
    )

    const handleCancelSubmit = useCallback(
        async (formData: FormData): Promise<boolean> => {
            if (!focusedOrder) return false

            // const body = Value.Parse(
            //     CancelOrder,
            //     Object.fromEntries(formData.entries())
            // )

            // return await submitAction(
            //     `${HTTP_BASE_URL}/order/${focusedOrder.order_id}/cancel`,
            //     body
            // )
            return true
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
                            <th>Filled Price</th>
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
                                        No open orders
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
                                        />
                                    ) : (
                                        <tr
                                            className={`h-10 cursor-pointer ${idx > 0 ? 'border-t' : ''}`}
                                            onClick={() =>
                                                handleRowClick(order)
                                            }
                                        >
                                            <td>{order.instrument_id}</td>
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
                                                    order.avg_fill_price == null
                                                        ? 'text-gray-500'
                                                        : ''
                                                }
                                            >
                                                {order.avg_fill_price ?? '--'}
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
                                                        {/* <X
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
                                                        /> */}
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

export default OpenOrdersTable
