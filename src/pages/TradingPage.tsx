import { FC, useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import DOM from "../componenets/DOM";
import InstrumentChart, { OHLC } from "../componenets/InstrumentCard";
import OrderCard from "../componenets/OrderCard";
import OrdersTable from "../componenets/OrdersTable";
import TradingHeader from "../componenets/TradingHeader";
import UtilsManager from "../utils/classses/UtilsManager";
import { Profile } from "./AccountPage";

enum SocketPayloadCategory {
  CONNECT = "connect",
  PRICE = "price",
  ORDER = "order",
}

interface SocketPayload {
  category: SocketPayloadCategory;
  content: Record<string, any>;
}

interface PriceUpdate {
  price: number;
  time: number;
}

const TradingPage: FC = () => {
  const [price, setPrice] = useState<number>(100);
  const [tab, setTab] = useState<number>(0);
  const [showOrderCard, setShowOrderCard] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<Profile | undefined>(
    undefined
  );
  // const [orders, setOrders] = useState<Record<string, any>[]>([]);
  const [num, setNum] = useState<number>(0);
  const chartRef = useRef<any>(undefined);
  const seriesRef = useRef<any>(undefined);
  const seriesDataRef = useRef<OHLC[]>([]);
  const ordersRef = useRef<Record<string, any>[]>(
    UtilsManager.generateOrders(90)
  );
  const wsRef = useRef<WebSocket | undefined>(undefined);

  useEffect(() => {
    // (async () => {
    //   while (true) {
    //     await UtilsManager.sleep(1000);
    //     setPrice(Math.floor(Math.random() * 100));
    //   }
    // })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setProfileData(await UtilsManager.fetchProfile());
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL + "/account/orders",
          { method: "GET", credentials: "include" }
        );
        const data = await rsp.json();
        if (!rsp.ok) throw new Error(data["error"]);

        ordersRef.current = data as Record<string, any>[];
        setNum(num + 1);
      } catch (err) {
        UtilsManager.toastError((err as Error).message);
      }
    })();
  }, []);

  useEffect(() => {
    if (wsRef.current) return;
    if (Object.keys(profileData ?? {}).length == 0) return;

    wsRef.current = new WebSocket(
      import.meta.env.VITE_BASE_URL.replace("http", "ws") + "/order/ws"
    );

    wsRef.current.onopen = (e) => {
      console.log("WebSocket connection opened:", e);
      wsRef.current?.send(
        JSON.stringify({
          category: SocketPayloadCategory.CONNECT,
          content: { instrument: "BTCUSD" },
        } as SocketPayload)
      );
    };

    wsRef.current.onmessage = (e) => {
      const message = JSON.parse(e.data) as SocketPayload;
      if (message.category === SocketPayloadCategory.PRICE) {
        setPrice(message.content.price);
        updateChartPrice(message.content as PriceUpdate);
      } else if (message.category === SocketPayloadCategory.ORDER) {
        handleOrderUpdate(message.content);
      }
      console.log("Incoming Message: ", message);
    };

    wsRef.current.onclose = (e) => {
      console.log("WebSocket connection closed:", e);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [profileData]);

  function updateChartPrice(payload: PriceUpdate): void {
    if (!seriesRef.current) return;
    seriesDataRef.current!.push({
      time: payload.time,
      open: payload.price,
      high: payload.price,
      low: payload.price,
      close: payload.price,
    });
    seriesDataRef.current!.sort((a, b) => a.time - b.time);
    seriesRef.current.setData(seriesDataRef.current);
  }

  function handleOrderUpdate(payload: Record<string, string | number>) {
    
    let found: boolean = false;
    ordersRef.current.forEach((order) => {
      if (order["order_id"] != payload["order_id"]) return;
      found = true;
      order = {...order, payload};
    })

    if (!found!) {
      ordersRef.current.push(payload);
    }

    setNum(num + 1);
  }

  return (
    <>
      <TradingHeader profile={profileData} />
      <div
        id="tradePage"
        className="w-full p-md"
        style={{ marginBottom: "5rem" }}
      >
        {/* Mobile */}
        {showOrderCard && (
          <div
            className="fixed w-full grid"
            style={{
              top: 0,
              left: 0,
              height: "100vh",
              zIndex: "999",
            }}
          >
            <div
              className="grid-col-1 grid-row-1 w-full h-full bg-background-primary"
              style={{
                opacity: 0.6,
              }}
            ></div>
            <div
              className="grid-col-1 grid-row-1 w-full p-md bg-background-primary border-default hide-scrollbar"
              style={{
                borderRadius: "1.5rem 1.5rem 0 0",
                height: "20rem",
                bottom: 0,
                left: 0,
                alignSelf: "flex-end",
                overflowY: "scroll",
                zIndex: "999",
              }}
            >
              <div
                className="w-full flex justify-end"
                style={{ height: "2rem" }}
              >
                <FaXmark
                  className="hover-pointer"
                  size={20}
                  onClick={() => setShowOrderCard(false)}
                />
              </div>
              <OrderCard balance={10000} />
            </div>
          </div>
        )}

        {/* Mobile */}
        <div
          id="tradeButton"
          className="w-full p-xs mt-2 mb-2 d-none"
          style={{ height: "2.5rem" }}
        >
          <button
            className="btn btn-primary w-full h-full flex align-center justify-center hover-pointer border-none"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "var(--border-radius-secondary)",
              color: "black",
            }}
            onClick={() => setShowOrderCard(true)}
          >
            Trade
          </button>
        </div>

        {/* Mobile */}
        <div className="mobile w-full snackbar d-none justify-start mb-3">
          <button
            type="button"
            className={`btn hover-pointer ${tab === 0 ? "active" : ""}`}
            onClick={() => setTab(0)}
          >
            Chart
          </button>
          <button
            type="button"
            className={`btn hover-pointer ${tab === 1 ? "active" : ""}`}
            onClick={() => setTab(1)}
          >
            Order book
          </button>
        </div>

        {/* Mobile */}
        <div
          id="mobile"
          className="w-full d-none mb-3"
          style={{ height: "20rem" }}
        >
          {tab === 0 && (
            <InstrumentChart
              price={price}
              chartRef={chartRef}
              seriesRef={seriesRef}
              seriesDataRef={seriesDataRef}
            />
          )}
          {tab === 1 && (
            <DOM price={price} orderbook={UtilsManager.generateOrderbook()} />
          )}
        </div>

        {/* Desktop */}
        <div
          id="desktop"
          className="w-full flex g-3"
          style={{
            overflowX: "auto",
          }}
        >
          <div
            className="h-full"
            style={{
              minWidth: "900px",
              width: "900px",
              minHeight: "75%",
            }}
          >
            <InstrumentChart
              showBorder
              price={price}
              chartRef={chartRef}
              seriesRef={seriesRef}
              seriesDataRef={seriesDataRef}
            />
          </div>

          <div className="h-full" style={{ width: "300px", minWidth: "300px" }}>
            <DOM
              showBorder
              price={price}
              orderbook={UtilsManager.generateOrderbook()}
            />
          </div>

          <div className="h-full" style={{ width: "300px", minWidth: "300px" }}>
            <OrderCard balance={10000} />
          </div>
        </div>

        <OrdersTable renderProp={num} orders={ordersRef.current} />
      </div>
    </>
  );
};

export default TradingPage;
