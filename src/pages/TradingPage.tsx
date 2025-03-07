import { FC, useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import CustomHeader from "../componenets/CustomHeader";
import DOM from "../componenets/DOM";
import DefaultLayout from "../componenets/DefaultLayout";
import InstrumentCard, {
  OHLC,
  Timeframe,
  getSeconds,
} from "../componenets/InstrumentCard";
import OrderCard from "../componenets/OrderCard";
import OrdersTable from "../componenets/OrdersTable";
import UtilsManager from "../utils/classses/UtilsManager";
import { Profile } from "./UserPage";

enum SocketPayloadCategory {
  BALANCE = "balance",
  CONNECT = "connect",
  ORDER = "order",
  PRICE = "price",
}

interface SocketPayload {
  category: SocketPayloadCategory;
  content: Record<string, any>;
}

interface PriceUpdate {
  price: number;
  time: number;
}

interface BalanceUpdate {
  balance: string;
}

const TradingPage: FC = () => {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [tab, setTab] = useState<number>(0);
  const [showOrderCard, setShowOrderCard] = useState<boolean>(false);
  const [orders, setOrders] = useState<Record<string, any>[]>([]);
  const [ordersTableRenderProp, setOrdersTableRenderProp] = useState<number>(0);
  const [headerRenderProp, setHeaderRenderProp] = useState<number>(0);
  const [orderWsRenderProp, setOrderWsRenderProp] = useState<number>(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(
    Timeframe.M5
  );

  const chartRef = useRef<any>(undefined);
  const profileRef = useRef<Profile | undefined>(undefined);
  const seriesRef = useRef<any>(undefined);
  const seriesDataRef = useRef<OHLC[]>([]);
  const ordersWsRef = useRef<WebSocket | undefined>(undefined);
  const priceWsRef = useRef<WebSocket | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        profileRef.current = await UtilsManager.fetchProfile();
        console.log(profileRef.current);
        setHeaderRenderProp(headerRenderProp + 1);
        setOrderWsRenderProp(orderWsRenderProp + 1);
      } catch (err) {}
    })();

    return () => {
      if (profileRef.current) {
        profileRef.current = undefined;
      }
    };
  }, []);

  useEffect(
    () => console.log("Order WS render - ", orderWsRenderProp),
    [orderWsRenderProp]
  );

  useEffect(() => {
    (async () => {
      try {
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL + "/account/orders",
          { method: "GET", credentials: "include" }
        );
        const data = await rsp.json();
        if (!rsp.ok) throw new Error(data["error"]);
        setOrders(data);
        setOrdersTableRenderProp(ordersTableRenderProp + 1);
      } catch (err) {
        UtilsManager.toastError((err as Error).message);
      }
    })();
  }, []);

  useEffect(() => {
    if (Object.keys(profileRef.current ?? {}).length == 0) return;

    const handlers: Partial<Record<SocketPayloadCategory, (arg: any) => void>> =
      {
        [SocketPayloadCategory.BALANCE]: handleBalanceUpdate,
        [SocketPayloadCategory.ORDER]: handleOrderUpdate,
      };
    ordersWsRef.current = new WebSocket(
      import.meta.env.VITE_BASE_URL.replace("http", "ws") + "/order/ws"
    );
    ordersWsRef.current.onopen = (e) => {
      console.log("orders websocket connection opened:", e);
    };
    ordersWsRef.current.onmessage = (e) => {
      const message = JSON.parse(e.data) as SocketPayload;
      const func = handlers[message.category];
      if (func) {
        func(message.content);
      }
    };
    ordersWsRef.current.onclose = (e) => {
      console.log("Orders websocket connection closed:", e);
    };
    return () => {
      if (ordersWsRef.current != undefined) {
        ordersWsRef.current.close();
      }
    };
  }, [orderWsRenderProp]);

  useEffect(() => console.log("*** re-render ***"), []);

  useEffect(() => {
    if (seriesDataRef.current === undefined) return;

    priceWsRef.current = new WebSocket(
      import.meta.env.VITE_BASE_URL.replace("http", "ws") +
        `/instrument/ws/?instrument=BTCUSD`
    );

    priceWsRef.current.onopen = (e) => {
      console.log("Price websocket connection opened:", e);
    };

    priceWsRef.current.onmessage = (e) => {
      const message = JSON.parse(e.data) as SocketPayload;
      console.log("Price received message - ", message);
      handlePriceUpdate(message.content as PriceUpdate);
    };

    priceWsRef.current.onclose = (e) => {
      console.log("Price websocket connection closed:", e);
    };

    priceWsRef.current.onerror = (e) => {
      console.log("Price websocket error - ", e);
    };

    return () => {
      if (priceWsRef.current != undefined) {
        priceWsRef.current.close();
        priceWsRef.current = undefined;
      }
    };
  }, []);

  function handlePriceUpdate(payload: PriceUpdate): void {
    if (!seriesRef.current) return;
    const price = Number(payload.price);
    setPrice(payload.price);
    updateChart(price, payload.time);
  }

  function updateChart(price: number, time: number): void {
    const tfSeconds: number = getSeconds(selectedTimeframe);

    if (seriesDataRef.current.length > 0) {
      const remainder: number =
        time - seriesDataRef.current[seriesDataRef.current.length - 1].time;

      if (remainder < tfSeconds) {
        seriesDataRef.current[seriesDataRef.current.length - 1].high = Math.max(
          seriesDataRef.current[seriesDataRef.current.length - 1].high,
          price
        );
        seriesDataRef.current[seriesDataRef.current.length - 1].low = Math.min(
          seriesDataRef.current[seriesDataRef.current.length - 1].low,
          price
        );
        seriesDataRef.current[seriesDataRef.current.length - 1].close = price;
      } else {
        seriesDataRef.current.push({
          time: time,
          open: price,
          high: price,
          low: price,
          close: price,
        });
      }
    } else {
      seriesDataRef.current.push({
        time: time,
        open: price,
        high: price,
        low: price,
        close: price,
      });
    }

    seriesRef.current.setData(seriesDataRef.current);
  }

  function handleOrderUpdate(payload: Record<string, string | number>): void {
    setOrders((prev) => {
      let Prev = [...(prev ?? [])];

      let updated = Prev.map((order) =>
        order["order_id"] === payload["order_id"]
          ? { ...order, ...payload }
          : order
      );

      if (!updated.some((order) => order["order_id"] === payload["order_id"])) {
        updated.push(payload);
      }

      return updated;
    });
    setOrdersTableRenderProp(ordersTableRenderProp + 1);
  }

  function handleBalanceUpdate(payload: BalanceUpdate): void {
    profileRef.current = {
      ...profileRef.current,
      balance: payload.balance,
    } as Profile;
    setHeaderRenderProp(headerRenderProp + 1);
  }

  return (
    <>
      <CustomHeader
        renderProp={headerRenderProp}
        avatar={(profileRef.current ?? {})["avatar"]}
        balance={(profileRef.current ?? {})["balance"]}
        username={(profileRef.current ?? {})["username"]}
      />

      <DefaultLayout
        element={
          <>
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
                  <>
                    {price !== undefined && (
                      <InstrumentCard
                        price={price}
                        chartRef={chartRef}
                        seriesRef={seriesRef}
                        seriesDataRef={seriesDataRef}
                        selectedTimeframe={selectedTimeframe}
                        setSelectedTimeframe={setSelectedTimeframe}
                      />
                    )}
                  </>
                )}
                {tab === 1 && (
                  <>
                    {price !== undefined && (
                      <DOM
                        price={price}
                        orderbook={UtilsManager.generateOrderbook()}
                      />
                    )}
                  </>
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
                    minWidth: "1150px",
                    width: "1150px",
                    minHeight: "75%",
                  }}
                >
                  {price !== undefined && (
                    <InstrumentCard
                      showBorder
                      price={price}
                      chartRef={chartRef}
                      seriesRef={seriesRef}
                      seriesDataRef={seriesDataRef}
                      selectedTimeframe={selectedTimeframe}
                      setSelectedTimeframe={setSelectedTimeframe}
                    />
                  )}
                </div>
                <div
                  className="h-full"
                  style={{ width: "300px", minWidth: "300px" }}
                >
                  <OrderCard balance={10000} />
                </div>
              </div>
              <OrdersTable renderProp={ordersTableRenderProp} orders={orders} />
            </div>
          </>
        }
      />
    </>
  );
};

export default TradingPage;
