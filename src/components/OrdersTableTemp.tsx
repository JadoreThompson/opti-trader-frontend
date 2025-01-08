import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import "../index.css";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const tableHeaders: Record<string, string> = {
  ticker: "Ticker",
  quantity: "Quantity",
  standing_quantity: "Remaning",
  filled_price: "Entry Price",
  close_price: "Exit Price",
  order_status: "Status",
  realised_pnl: "Realised PnL",
};

const futuresTableHeaders: Record<string, string> = {
  ...tableHeaders,
  ...{
    side: "Type",
  },
};

const OrdersTableTemp: FC<{
  ticker: undefined | string;
  marketType: null | MarketType[];
  orderStatus: null | OrderStatus[];
  websocket: undefined | WebSocket;
}> = ({ ticker, marketType, orderStatus, websocket }) => {
  // () => {
  const pageSize = 10;

  const [revealTable, setRevealTable] = useState<boolean>(false);
  const [data, setData] = useState<
    null | Record<string, null | string | Number>[]
  >(null);
  const [sortedData, setSortedData] = useState<
    null | Record<string, null | string | Number>[]
  >(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(0);

  const currentModifyIndex = useRef<number>();

  useEffect(() => {
    (async () => {
      if (!orderStatus || !marketType) {
        return;
      }

      const params: string[] = [
        orderStatus.map((item) => `order_status=${item}`).join("&"),
        marketType.map((item) => `market_type=${item}`).join("&"),
      ];

      setData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/orders?${
                ticker ? `ticker=${ticker}&` : ""
              }${params.join("&")}`,
            RequestBuilder.constructHeader()
          )
          .then((response) => response.data)
          .catch((err) => {
            if (err instanceof axios.AxiosError) {
              console.error(err);
            }
            return null;
          })
      );
    })();
  }, [orderStatus, marketType]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  useEffect(() => {
    setCurrentIndex(0);

    if (sortedData) {
      if (sortedData.length > 0) {
        setMaxPages(Math.floor(sortedData.length / pageSize) + 1);
        setRevealTable(true);
        return;
      }
    }

    setRevealTable(false);
    return;
  }, [sortedData]);

  const getCellClass: (key: string, value: string | Number) => string = (
    key: string,
    value: string | Number
  ): string => {
    if (key === "realised_pnl") {
      return Number(value) < 0 ? "negative" : "positive";
    }
    return "";
  };

  const changeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (Number((e.target as HTMLButtonElement).value) === -1) {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    } else {
      if (currentIndex < maxPages - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const getDisplayValue = (key: string, value: any) => {
    if (value === null || value == undefined) {
      return "-";
    }

    if (key === "realised_pnl" || key === "unrealised_pnl") {
      return Number(value) < 0 ? `$${value}` : `+${value}`;
    }

    if (key === "order_status") {
      return OrderStatus.getDisplayValue(value);
    }

    if (key === "side") {
      value = String(value);
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value;
  };

  const showModifyOverlay: (
    e: React.PointerEvent<HTMLTableRowElement>
  ) => void = (e: React.PointerEvent<HTMLTableRowElement>): void => {
    currentModifyIndex.current = Number(
      (e.target as HTMLElement).getAttribute("data-key")
    )!;
    (
      document.getElementById("modifyOrderCard") as HTMLDivElement
    ).style.display = "flex";
  };

  const hideModifyOverlay = (): void => {
    const card = (document.getElementById(
      "modifyOrderCard"
    ) as HTMLDivElement)!;
    card.querySelector("form")?.reset();
    card.style.display = "none";
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (websocket) {
      let payload: Record<string, null | number | string> = {
        order_id: String(sortedData![currentModifyIndex.current!]["order_id"])!,
        type: String(sortedData![currentModifyIndex.current!]["order_type"])!,
        market_type: String(
          sortedData![currentModifyIndex.current!]["market_type"]
        )!,
      };
      const modifyData = Object.fromEntries(
        Array.from(new FormData(e.target as HTMLFormElement).entries()).map(
          ([k, v]) => [k, Number(v)]
        )
      );

      websocket.send(JSON.stringify({ ...payload, ...modifyData }));
    }

    hideModifyOverlay();
  };

  return (
    <>
      <div
        className={`card container user-orders profile ${
          revealTable ? "d-col" : ""
        }`}
        style={{ overflowX: "auto" }}
      >
        {!revealTable ? (
          <>
            <div
              // className="h-100 w-100 d-col justify-center"
              style={{
                height: "100%",
                maxHeight: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <svg
                className="icon large"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M17 2h-2v2H9V2H7v2H3v18h18V4h-4V2zM7 6h12v2H5V6h2zM5 20V10h14v10H5zm6-4H9v2h2v-2zm0-2v-2H9v2h2zm2 0h-2v2h2v2h2v-2h-2v-2zm0 0v-2h2v2h-2z"
                  fill="currentColor"
                />{" "}
              </svg>
              <div className="justify-center">
                <span className="large secondary">No data</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="overlay-container d-flex justify-center align-center"
              id="modifyOrderCard"
              style={{ display: "none" }}
            >
              <div className="card overlay">
                <div className="card-title justify-end">
                  <svg
                    className="icon"
                    onPointerUp={() => {
                      hideModifyOverlay();
                    }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                </div>
                <div className="card-body">
                  <form
                    className="d-col justify-center"
                    onSubmit={handleFormSubmit}
                  >
                    <label htmlFor="takeProfit">Take Profit</label>
                    <input
                      type="number"
                      id="takeProfit"
                      name="take_profit"
                      min={0}
                    />
                    <label htmlFor="stopLoss">Stop Loss</label>
                    <input
                      type="number"
                      id="stopLoss"
                      name="stop_loss"
                      min={0}
                    />
                    <button className="btn" type="submit">
                      Modify
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <table className="w-100 h-100" cellSpacing={0}>
              <thead>
                <tr>
                  {Object.values(
                    marketType?.includes(MarketType.SPOT)
                      ? tableHeaders
                      : futuresTableHeaders
                  ).map((value, index) => (
                    <th key={index} className="secondary">
                      {value}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData!
                  .slice(currentIndex, currentIndex + pageSize)!
                  .map((order, index) => (
                    <tr
                      key={index}
                      className="pointer"
                      data-key={index}
                      onPointerUp={(e) => {
                        orderStatus!.includes(OrderStatus.CLOSED)
                          ? null
                          : showModifyOverlay(e);
                      }}
                    >
                      {Object.keys(
                        marketType?.includes(MarketType.SPOT)
                          ? tableHeaders
                          : futuresTableHeaders
                      ).map((key) => (
                        <td
                          key={key}
                          className={`underline ${getCellClass(
                            key,
                            order[key]!
                          )}`}
                        >
                          {getDisplayValue(key, order[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="justify-center mt-1 g-1">
              <button
                value={-1}
                className="btn rounded"
                onClick={changeIndex}
                disabled={currentIndex == 0}
              >
                Previous
              </button>
              <button
                value={1}
                className="btn rounded"
                onClick={changeIndex}
                disabled={currentIndex >= maxPages - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrdersTableTemp;
