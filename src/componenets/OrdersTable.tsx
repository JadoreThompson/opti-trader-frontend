import { FC, useState } from "react";
import ReactDOM from "react-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { ToastContainer } from "react-toastify";
import UtilsManager from "../utils/classses/UtilsManager";
import { OrderStatus } from "../utils/types";
import ModifyOrderCard from "./ModifyOrderCard";

const openOrdersTableHeaders: Record<string, string> = {
  amount: "AMOUNT",
  order_type: "ORDER_TYPE",
  side: "SIDE",
  filled_price: "ENTRY_PRICE",
  unrealised_pnl: "P/L",
  status: "STATUS",
  take_profit: "TAKE PROFIT",
  stop_loss: "STOP LOSS",
};

const closedOrdersTableHeaders: Record<string, string> = {
  instrument: "INSTRUMENT",
  amount: "AMOUNT",
  order_type: "ORDER TYPE",
  market_type: "MARKET TYPE",
  side: "SIDE",
  filled_price: "ENTRY PRICE",
  realised_pnl: "P/L",
  status: "STATUS",
};

const OrdersTable: FC<{
  renderProp?: any;
  orders: Record<string, any>[];
  setOrders?: (
    arg:
      | Record<string, any>[]
      | ((arg: Record<string, any>[]) => Record<string, any>[])
  ) => void;
  filter: OrderStatus[];
  setFilter?: (arg: OrderStatus[]) => void;
  page: number;
  setPage: (arg: number) => void;
  setRequestOrders?: (arg: number | ((arg: number) => number)) => void;
  allowModify?: boolean;
  allowClose?: boolean;
  hasNextPage: boolean;
  showSnackbar?: boolean;
}> = ({
  renderProp,
  orders,
  setOrders,
  filter,
  setFilter,
  page,
  setPage,
  setRequestOrders,
  allowModify = true,
  allowClose = true,
  hasNextPage,
  showSnackbar = true,
}) => {
  const [tab, setTab] = useState<number>(
    filter.includes(OrderStatus.FILLED) ? 0 : 1
  );
  const [showModifyOrder, setShowModifyOrder] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<
    Record<string, any> | undefined
  >(undefined);

  const maxPageSize = 10;

  function formatValues(value?: string | number): string {
    if (value === undefined) {
      return "";
    }

    if (isNaN(value as number)) {
      return String(value);
    } else {
      return UtilsManager.formatPrice(value);
    }
  }

  return (
    <>
      <ToastContainer />
      {showModifyOrder && selectedOrder && (
        <>
          {ReactDOM.createPortal(
            <div
              className="overlay-container flex align-center justify-center"
              style={{ backdropFilter: "blur(1px)" }}
            >
              <div
                className="modify-order-card-container"
                style={{ width: "20%" }}
              >
                <ModifyOrderCard
                  data={{
                    order_id: selectedOrder.order_id,
                    limit_price: selectedOrder.limit_price
                      ? selectedOrder.limit_price.replace("$", "")
                      : undefined,
                    take_profit: selectedOrder.take_profit
                      ? selectedOrder.take_profit.replace("$", "")
                      : undefined,
                    stop_loss: selectedOrder.stop_loss
                      ? selectedOrder.stop_loss.replace("$", "")
                      : undefined,
                    status: selectedOrder.status,
                  }}
                  order_type={selectedOrder.order_type}
                  marketType={selectedOrder.market_type}
                  setShow={setShowModifyOrder}
                  allowClose={allowClose}
                  setOrders={setOrders!}
                />
              </div>
            </div>,
            document.body
          )}
        </>
      )}
      <div className={`w-full h-full ${renderProp}`}>
        {showSnackbar && (
          <div className="w-full snackbar flex justify-start">
            <button
              type="button"
              className={`btn hover-pointer ${tab === 0 ? "active" : ""}`}
              onClick={() => {
                setTab(0);
                setPage(1);
                
                if (setFilter) {
                  setFilter([
                    OrderStatus.FILLED,
                    OrderStatus.PARTIALLY_FILLED,
                    OrderStatus.PENDING,
                  ]);
                }

                if (setRequestOrders) {
                  setRequestOrders((prev) => prev + 1);
                }
              }}
            >
              OPEN ORDERS
            </button>
            <button
              type="button"
              className={`btn hover-pointer ${tab === 1 ? "active" : ""}`}
              onClick={() => {
                setTab(1);
                setPage(1);
                
                if (setFilter) {
                  setFilter([OrderStatus.CLOSED]);
                }

                if (setRequestOrders) {
                  setRequestOrders((prev) => prev + 1);
                }
              }}
            >
              CLOSED ORDERS
            </button>
          </div>
        )}
        <div className="w-full mt-3" style={{ overflowX: "scroll" }}>
          <table
            id="ordersTable"
            className="w-full h-full grid-col-1 grid-row-1"
          >
            <thead style={{ height: "30px" }}>
              <tr>
                {Object.values(
                  tab === 0 ? openOrdersTableHeaders : closedOrdersTableHeaders
                ).map((header, ind) => (
                  <th key={ind} className="text-grey">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((order) => filter.includes(order.status))
                .slice((page - 1) * maxPageSize, page * maxPageSize + 1)
                .map((order, orderInd) => (
                  <tr
                    key={orderInd}
                    className="hover-bg-background-secondary"
                    onClick={() => {
                      if (allowModify) {
                        setSelectedOrder(order);
                        setShowModifyOrder(true);
                      }
                    }}
                  >
                    {Object.keys(
                      tab === 0
                        ? openOrdersTableHeaders
                        : closedOrdersTableHeaders
                    ).map((key, keyInd) => (
                      <td
                        key={keyInd}
                        className={`${
                          ["realised_pnl", "unrealised_pnl"].includes(key)
                            ? Number(order[key]) < 0
                              ? "text-red decrease"
                              : "text-green increase"
                            : undefined
                        }`}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {order[key] != null && order[key] !== undefined
                          ? formatValues(order[key])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="w-full flex justify-end" style={{ height: "2rem" }}>
          <div className="w-auto h-full flex justify-between align-center">
            <button
              type="button"
              className="btn bg-transparent border-none h-full flex justify-center align-center hover-pointer"
              onClick={() => {
                if (page <= 1) return;
                setPage(page - 1);
              }}
            >
              <FaChevronLeft fill="white" size="1.5rem" />
            </button>
            <span className="span-lg">{page}</span>
            <button
              type="button"
              className="btn bg-transparent border-none h-full flex justify-center align-center hover-pointer"
              onClick={() => {
                if (hasNextPage || orders.length > page * maxPageSize) {
                  setPage(page + 1);
                }
              }}
            >
              <FaChevronRight fill="white" size="1.5rem" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
