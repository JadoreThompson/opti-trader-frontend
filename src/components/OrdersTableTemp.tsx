import axios from "axios";
import { FC, useContext, useEffect, useRef, useState } from "react";
import CurrentOrders from "../hooks/CurrentOrders";
import "../index.css";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const openTableHeaders: Record<string, string> = {
  ticker: "Ticker",
  quantity: "Quantity",
  standing_quantity: "Remaning",
  filled_price: "Entry Price",
  unrealised_pnl: "Unrealised PnL",
  realised_pnl: "Realised PnL",
};

const openFuturesHeaders: Record<string, string> = {
  ...openTableHeaders,
  ...{
    side: "Side",
  },
};

const closedTableHeaders: Record<string, string> = {
  ticker: "Ticker",
  quantity: "Quantity",
  realised_pnl: "Realised PnL",
  market_type: "Market Type",
  side: "Side",
};

const OrdersTableTemp: FC<{
  ticker: undefined | string;
  marketType: null | MarketType;
  orderStatus: null | OrderStatus[];
  websocket: undefined | WebSocket;
  currentTab: number;
}> = ({ ticker, marketType, orderStatus, websocket, currentTab }) => {
  const pageSize = 10;
  const { currentOrders, setCurrentOrders } = useContext(CurrentOrders);

  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [revealTable, setRevealTable] = useState<boolean>(false);
  const [sortedData, setSortedData] = useState<
    null | Record<string, null | string | Number>[]
  >(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(0);

  const ordersRef = useRef<Record<string, string | Number>[] | null>();
  const [sortCategory, setSortCategory] = useState<string | null>(null);
  const [sortNum, setSortNum] = useState<number>(0);
  // 0: No sort, 1: Asc, 2: Desc

  const currentModifyIndexRef = useRef<number>();

  const [modifyCardTab, setModifyCardTab] = useState<number>(0);
  // 0: Modify, 1: Close

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const element = document.getElementById("modifyOrderCard") as HTMLElement;

    function hide(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        setShowOverlay(false);
      }
    }

    if (showOverlay) {
      if (element) {
        element.setAttribute("tabIndex", "0");
        element.focus();
        element.addEventListener("keydown", hide);
      }
    }

    return () => {
      if (element) {
        element.removeEventListener("keydown", hide);
      }
    };
  }, [showOverlay]);

  useEffect(() => {
    (async () => {
      if (!orderStatus || !marketType) {
        return;
      }

      setCurrentOrders(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/orders?market_type=${marketType}&${orderStatus
                .map((item) => `order_status=${item}`)
                .join("&")}${ticker ? `&ticker=${ticker}` : ""}`,
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
  }, [orderStatus, marketType, ticker]);

  useEffect(() => {
    ordersRef.current = currentOrders;
    setSortedData(currentOrders);
  }, [currentOrders]);

  useEffect(() => {
    setCurrentIndex(0);
    setSortCategory(null);
    setSortNum(0);
    setRevealTable(false);
  }, [currentTab]);

  useEffect(() => {
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

  useEffect(() => {
    if (!sortCategory) {
      return;
    }
    setSortedData((prev) => {
      if (sortNum === 1) {
        return [...currentOrders]!.sort(
          (a, b) => a[sortCategory!] - b[sortCategory!]
        );
      }

      if (sortNum === 2) {
        return [...currentOrders]!.sort(
          (a, b) => b[sortCategory!] - a[sortCategory!]
        );
      }

      return currentOrders;
    });
  }, [sortNum]);

  function getCellClass(key: string, value: string | Number): string {
    if (key === "realised_pnl" || key === "unrealised_pnl") {
      return Number(value) < 0 ? "negative" : "positive";
    }
    return "";
  }

  const changeIndex = (e: React.MouseEvent<HTMLButtonElement>): void =>
    setCurrentIndex(
      (prev) => prev + Number((e.target as HTMLButtonElement).value)
    );

  function getDisplayValue(key: string, value: any): any {
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

    if (["closed_at", "created_at"].includes(key)) {
      value = new Date(value);
    }

    return value;
  }

  function constructOverlay(e: React.PointerEvent<HTMLTableRowElement>): void {
    currentModifyIndexRef.current = Number(
      (e.target as HTMLElement)!.closest("tr")!.getAttribute("data-key")
    )!;
    setShowOverlay(true);
  }

  function hideModifyOverlay(): void {
    const card = (document.getElementById(
      "modifyOrderCard"
    ) as HTMLDivElement)!;
    card.querySelector("form")?.reset();
    setShowOverlay(false);
  }

  function handleModifyFormSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (websocket) {
      let payload: Record<string, null | number | string> = {
        order_id: String(
          sortedData![currentModifyIndexRef.current!]["order_id"]
        )!,
        type: String(
          sortedData![currentModifyIndexRef.current!]["order_type"]
        )!,
        market_type: String(
          sortedData![currentModifyIndexRef.current!]["market_type"]
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
  }

  function handleCloseFormSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const requestedQuantity = Number(
      new FormData(e.target as HTMLFormElement).get("quantity")
    );
    const currentQuantity = Number(
      sortedData![currentModifyIndexRef.current!].standing_quantity
    );

    if (requestedQuantity > currentQuantity) {
      setErrorMessage(
        `Quantity must be less than current quantity: ${currentQuantity}`
      );
    }

    const payload = {
      order_id: sortedData![currentModifyIndexRef.current!].order_id,
      quantity: Number(
        new FormData(e.target as HTMLFormElement).get("quantity")
      ),
    };

    websocket?.send(JSON.stringify(payload));
  }

  function sortData(
    e: React.MouseEvent<HTMLTableCellElement, MouseEvent>
  ): void {
    const selectedSortCategory = (e.target as HTMLElement)
      .closest("th")
      ?.getAttribute("data-key");
    if (selectedSortCategory !== sortCategory) {
      setSortCategory(selectedSortCategory as string);
      setSortNum(1);
    } else {
      setSortNum((prev) => {
        if (prev === 2) {
          return 0;
        }

        return prev + 1;
      });
    }
  }

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
              style={{ display: showOverlay ? "flex" : "none" }}
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
                <div className="tab-bar mb-1 w-100">
                  <button
                    className={`btn w-100 text-secondary ${
                      modifyCardTab === 0 ? "active" : ""
                    }`}
                    value={0}
                    onClick={(e) =>
                      setModifyCardTab(
                        Number((e.target as HTMLButtonElement).value)
                      )
                    }
                  >
                    Modify
                  </button>
                  {marketType === MarketType.FUTURES ? (
                    <button
                      className={`btn w-100 text-secondary ${
                        modifyCardTab === 1 ? "active" : ""
                      }`}
                      value={1}
                      onClick={(e) =>
                        setModifyCardTab(
                          Number((e.target as HTMLButtonElement).value)
                        )
                      }
                    >
                      Close
                    </button>
                  ) : null}
                </div>
                <div className="card-body h-100">
                  {modifyCardTab === 0 ? (
                    <form
                      className="d-col justify-center"
                      onSubmit={handleModifyFormSubmit}
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
                  ) : (
                    <>
                      <form
                        className="d-col justify-center mb-1"
                        onSubmit={handleCloseFormSubmit}
                      >
                        <label htmlFor="closeQuantity">Quantity</label>
                        <input
                          type="number"
                          min={0}
                          id="closeQuantity"
                          name="quantity"
                          required
                        />
                        <button className="btn" type="submit">
                          Close
                        </button>
                      </form>
                      <div className="w-100 align-center justify-center">
                        <span className="error">{errorMessage}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <table className="w-100 h-100" cellSpacing={0}>
              <thead>
                <tr>
                  {Object.entries(
                    currentTab === 0
                      ? openFuturesHeaders
                      : currentTab === 1
                      ? openTableHeaders
                      : closedTableHeaders
                  ).map(([key, value], index) => (
                    <th
                      key={index}
                      data-key={key}
                      className="secondary nowrap"
                      onClick={sortData}
                    >
                      <div className="align-center">
                        {value}
                        {sortCategory === key ? (
                          sortNum === 2 ? (
                            <svg
                              className="icon"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              {" "}
                              <path
                                d="M11 4h2v12h2v2h-2v2h-2v-2H9v-2h2V4zM7 14v2h2v-2H7zm0 0v-2H5v2h2zm10 0v2h-2v-2h2zm0 0v-2h2v2h-2z"
                                fill="currentColor"
                              />{" "}
                            </svg>
                          ) : sortNum === 1 ? (
                            <svg
                              className="icon"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              {" "}
                              <path
                                d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2v12zM7 10V8h2v2H7zm0 0v2H5v-2h2zm10 0V8h-2v2h2zm0 0v2h2v-2h-2z"
                                fill="currentColor"
                              />{" "}
                            </svg>
                          ) : (
                            ""
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData!
                  .slice(
                    currentIndex * pageSize,
                    (currentIndex + 1) * pageSize
                  )!
                  .map((order, index) => (
                    <tr
                      key={index}
                      className="pointer"
                      data-key={index}
                      onPointerUp={(e) => {
                        orderStatus!.includes(OrderStatus.CLOSED)
                          ? null
                          : constructOverlay(e);
                      }}
                    >
                      {Object.keys(
                        currentTab === 0
                          ? openFuturesHeaders
                          : currentTab === 1
                          ? openTableHeaders
                          : closedTableHeaders
                      ).map((key) => (
                        <td
                          key={key}
                          data-key={key}
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
