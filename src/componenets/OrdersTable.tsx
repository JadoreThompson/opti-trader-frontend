import { FC, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import UtilsManager from "../utils/classses/UtilsManager";
import ChevronLeft from "./icons/ChevronLeft";
import ChevronRight from "./icons/ChevronRight";

const openOrdersTableHeaders: Record<string, string> = {
  amount: "AMOUNT",
  side: "SIDE",
  filled_price: "ENTRY_PRICE",
  unrealised_pnl: "P/L",
  status: "STATUS",
  take_profit: "TAKE PROFIT",
  stop_loss: "STOP LOSS",
};

const closedOrdersTableHeaders: Record<string, string> = {
  amount: "AMOUNT",
  side: "SIDE",
  filled_price: "ENTRY PRICE",
  realised_pnl: "P/L",
  status: "STATUS",
};

export type OrderFilter = "filled" | "closed";

const OrdersTable: FC<{
  renderProp?: any;
  orders: Record<string, any>[];
  filterChoice?: OrderFilter;
}> = ({ renderProp, orders, filterChoice = "filled" }) => {
  const [filter, setFilter] = useState<OrderFilter>(filterChoice);
  const [tab, setTab] = useState<number>(filterChoice === "filled" ? 0 : 1);
  const [page, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(0);
  const maxPageSize = 10;

  useEffect(() => {
    if (page == 0 && maxPages > 0) {
      setPage(1);
      return;
    }
    if (page > maxPages) {
      setPage(maxPages);
    }
  }, [page]);

  useEffect(() => {
    console.log("render prop value changed");
    const maxPages = Math.ceil(
      orders!.filter((order) => order.status === filter)!.length /
        maxPageSize
    );
    setMaxPages(maxPages);
    maxPages > 0 ? setPage(1) : null;
  }, [renderProp]);

  const formatValues = (value?: string | number): string => {
    if (value === undefined) {
      return "";
    }

    if (isNaN(value)) {
      return String(value);
    } else {
      return UtilsManager.formatPrice(value);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={`w-full h-full ${renderProp}`}>
        <div className="w-full snackbar flex justify-start">
          <button
            type="button"
            className={`btn hover-pointer ${tab === 0 ? "active" : ""}`}
            onClick={() => {
              setTab(0);
              setPage(1);
              setFilter("filled");
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
              setFilter("closed");
            }}
          >
            CLOSED ORDERS
          </button>
        </div>
        <div className="w-full mt-3" style={{ overflowX: "scroll" }}>
          <table id="ordersTable" className="w-full h-full">
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
              {orders!
                .filter((order) => order.status === filter)
                .slice((page - 1) * maxPageSize, page * maxPageSize)
                ?.map((order, orderInd) => (
                  <tr key={orderInd}>
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
                        {order[key] != null && order[key] !== undefined ? formatValues(order[key]): ""}
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
              <ChevronLeft fill="white" size="1.5rem" />
            </button>
            <span className="span-lg">{page}</span>
            <button
              type="button"
              className="btn bg-transparent border-none h-full flex justify-center align-center hover-pointer"
              onClick={() => {
                if (page === maxPages) return;
                setPage(page + 1);
              }}
            >
              <ChevronRight fill="white" size="1.5rem" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
