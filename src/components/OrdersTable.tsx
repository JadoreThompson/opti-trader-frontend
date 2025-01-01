import { FC, useEffect, useState } from "react";
import TableBody from "./TableBody";

interface orderTableOptions {
  showClosed: boolean;
  closedOrders: undefined | Array<Record<string, null | number | string>>;
  openOrders: undefined | Array<Record<string, null | number | string>>;
  formSubmissionHandler:
    | undefined
    | ((e: React.FormEvent<HTMLFormElement>) => void);
  orderIdRef: undefined | any;
}

const closedOrderTableHeaders: Record<string, string> = {
  ticker: "Ticker",
  order_type: "Order Type",
  quantity: "Quantity",
  price: "Price",
  filled_price: "Filled Price",
  stop_loss: "Stop Loss",
  take_profit: "Take Profit",
  limit_price: "Limit Price",
  created_at: "Open Time",
  closed_at: "Closed Time",
  close_price: "Close Price",
  order_status: "Order Status",
  realised_pnl: "Realised PnL",
};

const openOrderTableHeaders: Record<string, string> = {
  ticker: "Ticker",
  order_type: "Order Type",
  quantity: "Quantity",
  price: "Price",
  filled_price: "Filled Price",
  unrealised_pnl: "Unrealised PnL",
  stop_loss: "Stop Loss",
  take_profit: "Take Profit",
  limit_price: "Limit Price",
  created_at: "Open Time",
  order_status: "Order Status",
};

const BASE_URL = "http://127.0.0.1:8000";

const OrderTable: FC<orderTableOptions> = ({
  showClosed,
  closedOrders,
  openOrders,
  formSubmissionHandler,
  orderIdRef,
}) => {
  const [maxClosedOrderPages, setMaxCloseTablePages] = useState<number>(0);
  const [maxOpenOrderPages, setMaxOpenTablePages] = useState<number>(0);
  const [tableIndex, setTableIndex] = useState<number | null>(null);
  const [filterOption, setFilterOption] = useState<number>(0);
  const [filterTarget, setFilterTarget] = useState<string | null>(null);
  const [orders, setOrders] = useState<Array<Record<string, any>>>([]);

  const maxTableRows: number = 10;

  const nextPageHandler = () => {
    setTableIndex((prev) => (prev! += 1));
  };

  const prevPageHandler = () => {
    setTableIndex((prev) => (prev! -= 1));
  };

  const displayOrderModifier = (
    evenv:
      | React.MouseEvent<HTMLButtonElement, HTMLElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    evenv.preventDefault();
    const card = document.querySelector(".modify-order-card") as HTMLElement;
    const styles = window.getComputedStyle(card);

    if (styles.display === "none") {
      let existingTakeProfit: null | string;
      let existingStopLoss: null | string;
      const tr = (evenv.target as HTMLElement).closest("tr");
      orderIdRef.current = tr?.getAttribute("data-key");

      tr?.querySelectorAll("td").forEach((item) => {
        const key = item.getAttribute("data-key");
        if (key === "stop_loss") {
          existingStopLoss = item.textContent;
        } else if (key === "take_profit") {
          existingTakeProfit = item.textContent;
        }
      });

      (document.getElementById("stopLoss") as HTMLInputElement)!.placeholder =
        existingStopLoss!;
      (document.getElementById("takeProfit") as HTMLInputElement)!.placeholder =
        existingTakeProfit!;

      card.style.display = "flex";
    } else if (styles.display === "flex") {
      card.style.display = "none";
    }
  };

  useEffect(() => {
    setTableIndex(0);
  }, []);

  useEffect(() => {
    const maxPageConfig = () => {
      if (showClosed) {
        setOrders(closedOrders!);
        setMaxCloseTablePages(Math.ceil(closedOrders!.length / maxTableRows));
      } else {
        setOrders(openOrders!);
        setMaxOpenTablePages(Math.ceil(openOrders!.length / maxTableRows));
      }
    };
    maxPageConfig();
  }, [closedOrders, openOrders]);

  const sortData = (key: string) => {
    let sortedOrders;
    filterTarget === key
      ? filterOption === 0
        ? setFilterOption(1)
        : setFilterOption(0)
      : setFilterOption(0);

    setFilterTarget(key);

    if (["closed_at", "created_at"].includes(key!)) {
      setOrders(
        (sortedOrders = [...orders].sort(
          (a, b) => new Date(a[key!]).getTime() - new Date(b[key!]).getTime()
        ))
      );
    } else {
      setOrders((sortedOrders = [...orders].sort((a, b) => a[key!] - b[key!])));
    }

    filterOption === 1
      ? setOrders(sortedOrders.reverse())
      : setOrders(sortedOrders);
  };

  const enableFilter = (e: React.PointerEvent<HTMLTableCellElement>): void => {
    sortData((e.target as HTMLElement).getAttribute("data-key") as string);
  };

  return (
    <>
      <div className="modify-order-card overlay-card">
        <div className="container">
          <div className="card">
            <div className="card-title">
              <button
                onClick={displayOrderModifier}
                style={{
                  width: "auto",
                  backgroundColor: "transparent",
                  border: "none",
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="card-body">
              <form id="modifyForm" onSubmit={formSubmissionHandler}>
                <label htmlFor="takeProfit">Take Profit</label>
                <input type="number" name="take_profit" id="takeProfit" />
                <label htmlFor="stopLoss">Stop Loss</label>
                <input type="number" name="stop_loss" id="stopLoss" />
                <button className="btn" type="submit">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="card table-card">
        <div className="table-container">
          {showClosed ? (
            <table>
              <thead>
                <tr>
                  {Object.entries(closedOrderTableHeaders).map(
                    ([key, value]) => (
                      <th onPointerDown={enableFilter} key={key} data-key={key}>
                        {value}
                        {filterTarget === key ? (
                          filterOption === 0 ? (
                            <i className="fa-solid fa-arrow-down toggle-icon"></i>
                          ) : (
                            <i className="fa-solid fa-arrow-up toggle-icon"></i>
                          )
                        ) : null}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <TableBody
                orders={orders}
                tableIndex={tableIndex!}
                maxRows={maxTableRows}
                tableHeaders={closedOrderTableHeaders}
                displayOrderModifier={displayOrderModifier}
                showOptions={false}
              />
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  {Object.entries(openOrderTableHeaders).map(([key, value]) => (
                    <th onPointerDown={enableFilter} key={key} data-key={key}>
                      {value}
                      {filterTarget === key ? (
                        filterOption === 0 ? (
                          <i className="fa-solid fa-arrow-down toggle-icon"></i>
                        ) : (
                          <i className="fa-solid fa-arrow-up toggle-icon"></i>
                        )
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <TableBody
                orders={orders}
                tableIndex={tableIndex!}
                maxRows={maxTableRows}
                tableHeaders={openOrderTableHeaders}
                displayOrderModifier={displayOrderModifier}
                showOptions={true}
              />
            </table>
          )}
        </div>
        <div className="pagination-controls">
          <button className="btn" disabled={tableIndex === 0 ? true : false}>
            <i
              onClick={prevPageHandler}
              className="fa-solid fa-chevron-left"
            ></i>
          </button>
          <span>{tableIndex! + 1}</span>
          <button
            className="btn"
            disabled={
              showClosed
                ? tableIndex! + 1 >= maxClosedOrderPages
                  ? true
                  : false
                : tableIndex! + 1 >= maxOpenOrderPages
                ? true
                : false
            }
          >
            <i
              onClick={nextPageHandler}
              className="fa-solid fa-chevron-right"
            ></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderTable;
