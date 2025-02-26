import { FC, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import UtilsManager from "../utils/classses/UtilsManager";
import ChevronLeft from "./icons/ChevronLeft";
import ChevronRight from "./icons/ChevronRight";

const openOrdersTableHeaders: Record<string, string> = {
  amount: "AMOUNT",
  side: "SIDE",
  entry_price: "ENTRY_PRICE",
  upl: "P/L",
  status: "STATUS",
  take_profit: "TAKE PROFIT",
  stop_loss: "STOP LOSS",
};

const closedOrdersTableHeaders: Record<string, string> = {
  amount: "AMOUNT",
  side: "SIDE",
  entry_price: "ENTRY PRICE",
  pl: "P/L",
};

const OrdersTable: FC<{
  orders?: Record<string, any>[];
  filter?: "open" | "closed";
}> = ({ orders, filter = "open" }) => {
  const [tab, setTab] = useState<number>(filter === "open" ? 0 : 1);
  const [page, setPage] = useState<number>(1);
  const maxPageSize = 10;
  const maxPages = Math.ceil(
    orders!.filter((order) => order.status === filter)!.length / maxPageSize
  );

  useEffect(() => {
    if (page > maxPages) {
      setPage(maxPages);
    }
  }, [page]);

  useEffect(() => {
    // (async () => {
    //   try {
    //     const rsp = await fetch(
    //       import.meta.env.VITE_BASE_URL + "/api/account/orders",
    //       { method: "GET", credentials: "include" }
    //     );
    //     const data = await rsp.json();
    //     if (!rsp.ok) throw new Error(data["error"]);
    //   } catch (err) {
    //     UtilsManager.toastError((err as Error).message);
    //   }
    // })();
  }, []);

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
      <div
        className="w-full h-full"
      >
        <div className="w-full snackbar flex justify-start">
          <button
            type="button"
            className={`btn hover-pointer ${tab === 0 ? "active" : ""}`}
            onClick={() => setTab(0)}
          >
            OPEN ORDERS
          </button>
          <button
            type="button"
            className={`btn hover-pointer ${tab === 1 ? "active" : ""}`}
            onClick={() => setTab(1)}
          >
            CLOSED ORDERS
          </button>
        </div>
        <div className="w-full mt-3" style={{ overflowX: "scroll" }}>
          <table id="ordersTable" className="w-full h-full">
            <thead style={{ height: '30px'}}>
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
                          ["pl", "upl"].includes(key)
                            ? Number(order[key]) < 0
                              ? "text-red decrease"
                              : "text-green increase"
                            : undefined
                        }`}
                        style={{ whiteSpace: 'nowrap'}}
                      >
                        {formatValues(order[key])}
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
                if (page === 1) return;
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
