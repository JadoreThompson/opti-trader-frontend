import { FC, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import UtilsManager from "../utils/classses/UtilsManager";

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

  return (
    <>
      <ToastContainer />
      <div className="w-full h-full">
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
        <table className="w-full h-full" style={{ overflowX: "scroll" }}>
          <thead>
            <tr>
              {Object.values(
                tab === 0 ? openOrdersTableHeaders : closedOrdersTableHeaders
              ).map((header, ind) => (
                <th key={ind} className="text-grey">
                  {header}
                </th>
              ))}
              {/* <th>AMOUNT</th>
              <th>ENTRY PRICE</th>
              <th>P/L</th>
              <th>STATUS</th> */}
            </tr>
          </thead>
          <tbody>
            {orders!
              .filter((order) => order.status === filter)
              ?.map((order, orderInd) => (
                <tr key={orderInd}>
                  {Object.keys(
                    tab === 0
                      ? openOrdersTableHeaders
                      : closedOrdersTableHeaders
                  ).map((key, keyInd) => (
                    // <td key={keyInd}>{order[key]}</td>
                    <td
                      key={keyInd}
                      className={`${
                        ["pl", "upl"].includes(key)
                          ? Number(order[key]) < 0
                            ? "text-red decrease"
                            : "text-green increase"
                          : undefined
                      }`}
                      style={{}}
                    >
                      {formatValues(order[key])}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrdersTable;
