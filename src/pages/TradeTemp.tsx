import { FC, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "typescript-cookie";
import DOM from "../components/DOM";
import Header from "../components/Header";
import OrderCreationForm from "../components/OrderCreationForm";
import OrderFolder from "../components/OrderFolder";
import TickerChart, {
  ChartIntervals,
  toSeconds,
} from "../components/TickerChart";
import CurrentOrders from "../hooks/CurrentOrders";
import TickerPriceContext from "../hooks/TickerPriceContext";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

// type Message = Record<string, null | string | Record<any, any>>;
enum MessageCategory {
  PRICE = "price",
  DOM = "dom",
  SUCCESS = "success",
}

enum UpdateScope {
  NEW = "new",
  EXISTING = "existing",
}

interface Message {
  category: MessageCategory;
  message: string;
  on: UpdateScope;
  details: null | Record<string, string | Number | Record<number, number>>;
}

const TradeTemp: FC = () => {
  const { ticker } = useParams();
  const { setLastPrice, setCurrentPrice } = useContext(TickerPriceContext);
  const { currentOrders, setCurrentOrders } = useContext(CurrentOrders);

  const [websocket, setWebSocket] = useState<null | WebSocket>(null);
  const [websocketConnectionStatus, setWebsocketConnectionStatus] = useState<
    Record<string, string>
  >({
    msg: "System Disconnected",
    color: "var(--red)",
  });
  const [currentInterval, setCurrentInterval] = useState<ChartIntervals>(
    ChartIntervals.H4
  );

  const [asks, setAsks] = useState<null | Record<number, number>>(null);
  const [bids, setBids] = useState<null | Record<number, number>>(null);

  const [folderTab, setFolderTab] = useState<number>(0);

  const seriesDataRef = useRef<Record<string, number>[]>();
  const seriesRef = useRef<any>();
  const currentIntervalSecondsRef = useRef<number>();

  useEffect(() => {
    currentIntervalSecondsRef.current = toSeconds(currentInterval.toString());
  }, [currentInterval]);

  function updateChartPrice(message: Message): boolean {
    const details: Record<string, number> = message.details as Record<
      string,
      number
    >;

    setCurrentPrice(details.price);

    if (seriesDataRef.current && currentIntervalSecondsRef.current) {
      let lastCandle = seriesDataRef.current[seriesDataRef.current.length - 1];
      let existingCandle = lastCandle;
      setLastPrice(existingCandle.close);

      const timeSpanned = Math.floor(
        (details.time - lastCandle.time) / currentIntervalSecondsRef.current
      );

      if (timeSpanned >= 1 && lastCandle) {
        for (let i = 0; i < timeSpanned; i++) {
          try {
            const newCandle = {
              time:
                lastCandle.time + currentIntervalSecondsRef.current * (i + 1),
              open: lastCandle.close,
              high: lastCandle.close,
              low: lastCandle.close,
              close: lastCandle.close,
            };

            seriesDataRef.current.push(newCandle);
            seriesRef.current.update(newCandle);
            existingCandle = newCandle;
          } catch (err) {
            console.error(err);
          }
        }
      }

      try {
        const newCandle = {
          time: existingCandle.time,
          open: existingCandle.open,
          high: Math.max(existingCandle.high, details.price),
          low: Math.min(existingCandle.low, details.price),
          close: details.price,
        };

        seriesDataRef.current.push(newCandle);
        seriesRef.current.update(newCandle);
      } catch (err) {
        console.error(err);
      }
    }
    return false;
  }

  function updateDOM(message: Message): boolean {
    setAsks((message.details as Record<string, Record<number, number>>).asks);
    setBids((message.details as Record<string, Record<number, number>>).bids);
    return false;
  }

  function handleExistingOrderUpdate(
    data: Record<string, string | Number>
  ): void {
    setCurrentOrders((prev) => {
      let Prev = [...prev];

      if (data.order_status === OrderStatus.CLOSED) {
        return Prev.filter((item) => item.order_id !== data.order_id);
      }

      return Prev.map((item) => {
        return item.order_id === data.order_id ? data : item;
      });
    });
  }

  function updateTable(message: Message): boolean {
    if (!message.details) {
      return true;
    }

    if (folderTab === 0) {
      if (message.details!.market_type === MarketType.FUTURES) {
        if (message.on === UpdateScope.NEW) {
          setCurrentOrders((prev) => {
            let Prev = [...prev];
            Prev.push(message.details as Record<string, string | Number>);
            return Prev;
          });
        } else {
          handleExistingOrderUpdate(
            message.details as Record<string, string | Number>
          );
        }
      }
    } else if (folderTab === 1) {
      if (message.details.market_type === MarketType.SPOT) {
        if (message.on === UpdateScope.NEW) {
          setCurrentOrders((prev) => {
            let Prev = [...prev];
            Prev.push(message.details as Record<string, string | Number>);
            return Prev;
          });
        } else {
          handleExistingOrderUpdate(
            message.details as Record<string, string | Number>
          );
        }
      }
    } else if (folderTab === 2) {
      if (message.details.order_status === OrderStatus.CLOSED) {
        setCurrentOrders((prev) => {
          let Prev = [...prev];
          Prev.push(message.details as Record<string, string | Number>);
          return Prev;
        });
      }
    }

    return true;
  }

  useEffect(() => {
    const ws = new WebSocket(
      RequestBuilder.getBaseUrl().replace("http", "ws") + "/stream/trade"
    );

    ws.onopen = () => {
      setWebsocketConnectionStatus({
        msg: "System Reconnecting",
        color: "var(--orange)",
      });
      ws.send(JSON.stringify({ token: getCookie("jwt") }));
    };

    ws.onmessage = (e) => {
      const message: Message = JSON.parse(e.data);

      if (message.category === "success") {
        console.log("Message received:", JSON.parse(e.data));
        setWebsocketConnectionStatus({
          msg: "System Connected",
          color: "var(--green)",
        });
      }

      const options: Record<MessageCategory, (arg: Message) => boolean> = {
        [MessageCategory.PRICE]: updateChartPrice,
        [MessageCategory.DOM]: updateDOM,
        [MessageCategory.SUCCESS]: updateTable,
      };

      const func = options[message.category as MessageCategory];
      if (func) {
        if (func(message)) {
          console.log("display message");
        }
      }
    };

    ws.onclose = (e) => {
      console.log("WebSocket disconnected: ", e.reason);
      setWebsocketConnectionStatus({
        msg: "System Disconnected",
        color: "var(--red)",
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      <Header
        content={
          <>
            <div
              className="w-100 h-auto p-1 border-box"
              style={{ overflowX: "auto" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr",
                  gridGap: "1rem",
                }}
              >
                <div className="d-col">
                  <div
                    className="grid mb-1"
                    style={{
                      gridTemplateColumns: "3fr 1fr",
                      gridGap: "1rem",
                      maxHeight: "20rem",
                    }}
                  >
                    <TickerChart
                      ticker={ticker!}
                      seriesRef={seriesRef}
                      seriesDataRef={seriesDataRef}
                      currentInterval={currentInterval}
                      setCurrentInterval={setCurrentInterval}
                    />
                    <DOM asks={asks} bids={bids} ticker={ticker!} />
                  </div>
                  <OrderFolder
                    ticker={ticker!}
                    currentTab={folderTab}
                    setCurrentTab={setFolderTab}
                  />
                </div>
                <div className="">
                  <OrderCreationForm ticker={ticker!} websocket={websocket!} />
                </div>
              </div>
              <div
                className="fixed bottom-0 p-1 w-100 align-center bg-primary"
                style={{
                  // backgroundColor: "red",
                  // height: "1rem",
                  left: 0,
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <span
                  className="mr-1"
                  style={{ color: websocketConnectionStatus.color }}
                >
                  {websocketConnectionStatus.msg}
                </span>
                <svg
                  className="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    style={{ color: websocketConnectionStatus.color }}
                    d="M19 2h2v2h-2V2Zm2 14V4h2v12h-2Zm0 0v2h-2v-2h2ZM1 4h2v12H1V4Zm2 12h2v2H3v-2ZM3 4h2V2H3v2Zm2 2h2v8H5V6Zm2 8h2v2H7v-2Zm0-8h2V4H7v2Zm10 0h2v8h-2V6Zm0 0h-2V4h2v2Zm0 8v2h-2v-2h2Zm-6-7h4v6h-2v9h-2v-9H9V7h2Zm0 4h2V9h-2v2Z"
                  />{" "}
                </svg>
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default TradeTemp;
