import type { Order } from '@/lib/types/apiTypes/order'
import { Checkbox } from '@radix-ui/react-checkbox'
import type { FC } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

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
                    Cancel <strong>{order.instrument_id}</strong> order with{' '}
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

export default CancelModal
