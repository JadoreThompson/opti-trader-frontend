import type { Order } from "@/lib/types/api-types/order";
import { OrderStatus } from "@/lib/types/orderStatus";
import { OrderType } from "@/lib/types/orderType";
import { Side } from "@/lib/types/side";
import { cn, formatUnderscore } from "@/lib/utils";
import { Pencil, X } from "lucide-react";
import { useRef, useState, type FC } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Mock data for preview
const mockOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
  const isClosed = i % 4 === 0;
  const price = 100 + i;
  const quantity = 1 + (i % 5);
  const realised_pnl = isClosed ? +(Math.random() * 50 - 25).toFixed(2) : null;
  const unrealised_pnl = !isClosed
    ? +(Math.random() * 50 - 25).toFixed(2)
    : null;

  return {
    order_id: `order_${i + 1}`,
    instrument: `SYM${(i % 5) + 1}`,
    side: i % 2 === 0 ? Side.BID : Side.ASK,
    market_type: "futures",
    order_type: i % 3 === 0 ? OrderType.MARKET : OrderType.LIMIT,
    price,
    limit_price: i % 3 === 0 ? null : +(price + Math.random() * 10).toFixed(2),
    filled_price: +(price + Math.random() * 2 - 1).toFixed(2),
    closed_price: isClosed
      ? +(price + Math.random() * 5 - 2.5).toFixed(2)
      : null,
    realised_pnl,
    unrealised_pnl,
    status: isClosed
      ? OrderStatus.CLOSED
      : i % 3 === 0
        ? OrderStatus.FILLED
        : OrderStatus.PARTIALLY_FILLED,
    quantity,
    standing_quantity: 0,
    open_quantity: isClosed ? 0 : quantity - 1,
    stop_loss: Math.random() > 0.5 ? +(price - 5).toFixed(2) : null,
    take_profit: Math.random() > 0.5 ? +(price + 5).toFixed(2) : null,
    created_at: new Date(Date.now() - i * 3600_000).toISOString(),
    closed_at: isClosed
      ? new Date(Date.now() - (i - 1) * 3600_000).toISOString()
      : null,
  };
});

const PositionsTable: FC<{ orders?: Order[] }> = ({ orders = mockOrders }) => {
  const tableBottomRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [focusedOrder, setFocusedOrder] = useState<Order>();
  const [showModify, setShowModify] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const [editData, setEditData] = useState<{
    limit_price?: number;
    take_profit?: number;
    stop_loss?: number;
    quantity?: number;
  }>({});

  const handleActionClick = (
    e: React.MouseEvent<SVGSVGElement>,
    actionType: "modify" | "close",
    order: Order,
  ): void => {
    e.stopPropagation();
    setFocusedOrder(order);
    setEditData({}); // Reset

    if (actionType === "modify") {
      setEditData({
        limit_price: order.limit_price ?? undefined,
        take_profit: order.take_profit ?? undefined,
        stop_loss: order.stop_loss ?? undefined,
      });
      setShowModify(true);
    } else if (actionType === "close") {
      setEditData({
        quantity: order.open_quantity,
      });
      setShowClose(true);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!cardRef.current?.contains(e.target as Node)) {
      setShowModify(false);
      setFocusedOrder(undefined);
    }
  };

  const renderModify = () => {
    if (!focusedOrder) return null;

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-10 bg-opacity-30 flex justify-center items-center"
        onClick={handleContainerClick}
      >
        <div
          ref={cardRef}
          className="w-[400px] p-6 border border-gray-900 rounded-xl space-y-4 shadow-lg bg-primary"
        >
          <h2 className="text-lg font-semibold">Modify Order</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm">Limit Price</label>
              <Input
                type="number"
                value={editData.limit_price ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    limit_price: parseFloat(e.target.value),
                  })
                }
                disabled={focusedOrder.order_type != OrderType.LIMIT}
              />
            </div>
            <div>
              <label className="block text-sm">Take Profit</label>
              <Input
                type="number"
                value={editData.take_profit ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    take_profit: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm">Stop Loss</label>
              <Input
                type="number"
                value={editData.stop_loss ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    stop_loss: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowModify(false);
                setFocusedOrder(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Modify", focusedOrder.order_id, editData);
                setShowModify(false);
                setFocusedOrder(undefined);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderClose = () => {
    if (!focusedOrder) return null;

    return (
      <div
        className="fixed inset-0 z-10 bg-opacity-30 flex justify-center items-center"
        onClick={handleContainerClick}
      >
        <div className="p-6 rounded-xl w-[400px] space-y-4 border border-gray-900 shadow-lg bg-primary">
          <h2 className="text-lg font-semibold">
            {focusedOrder.open_quantity === 0 ? "Cancel Order" : "Close Order"}
          </h2>
          <p className="text-sm text-gray-600">
            {focusedOrder.open_quantity === 0 ? "Cancel" : "Close"}{" "}
            <strong>{focusedOrder.instrument}</strong> order with{" "}
            {focusedOrder.open_quantity === 0 ? (
              <>
                <strong>{focusedOrder.standing_quantity}</strong> standing
                quantity?
              </>
            ) : (
              <>
                <strong>{focusedOrder.open_quantity}</strong> open quantity?
              </>
            )}
          </p>
          <div>
            <label className="block text-sm">Quantity</label>
            <Input
              type="number"
              value={editData.quantity ?? ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  quantity: parseFloat(e.target.value),
                })
              }
              min={1}
              max={focusedOrder.open_quantity}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowClose(false);
                setFocusedOrder(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Close", focusedOrder.order_id, editData.quantity);
                setShowClose(false);
                setFocusedOrder(undefined);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showModify && renderModify()}
      {showClose && renderClose()}

      <div className="w-full h-full overflow-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="text-sm font-semibold">
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Side</th>
              <th>Order Type</th>
              <th>Limit Price</th>
              <th>Take Profit</th>
              <th>Stop Loss</th>
              <th>Filled Price</th>
              <th>PnL</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border-t p-3">
                <td>{order.instrument}</td>
                <td>{order.quantity}</td>
                <td>{order.side === Side.BID ? "Buy" : "Sell"}</td>
                <td>
                  {order.order_type.charAt(0).toUpperCase() +
                    order.order_type.slice(1)}
                </td>
                <td
                  className={order.limit_price == null ? "text-gray-500" : ""}
                >
                  {order.limit_price ?? "--"}
                </td>
                <td
                  className={order.take_profit == null ? "text-gray-500" : ""}
                >
                  {order.take_profit ?? "--"}
                </td>
                <td className={order.stop_loss == null ? "text-gray-500" : ""}>
                  {order.stop_loss ?? "--"}
                </td>
                <td
                  className={order.filled_price == null ? "text-gray-500" : ""}
                >
                  {order.filled_price ?? "--"}
                </td>
                <td
                  className={
                    order.unrealised_pnl == null
                      ? "text-gray-500"
                      : order.unrealised_pnl < 0
                        ? "text-[var(--red)]"
                        : "text-[var(--green)]"
                  }
                >
                  {order.unrealised_pnl != null
                    ? order.unrealised_pnl.toFixed(2)
                    : "--"}
                </td>
                <td>{formatUnderscore(order.status)}</td>
                <td>
                  <div className="flex items-center justify-center gap-2">
                    <Pencil
                      className={cn("size-4 cursor-pointer", "text-gray-500")}
                      onClick={(e) => handleActionClick(e, "modify", order)}
                    />
                    <X
                      className={cn("size-4 cursor-pointer", "text-gray-500")}
                      onClick={(e) => handleActionClick(e, "close", order)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={tableBottomRef} />
      </div>
    </>
  );
};

export default PositionsTable;
