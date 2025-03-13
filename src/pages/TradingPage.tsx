import { FC, useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
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
import { useIsLoggedIn } from "../contexts/useIsLoggedIn";
import { Profile, useProfile } from "../contexts/useProfile";
import { useUserOrders } from "../contexts/useUserOrders";
import UtilsManager from "../utils/classses/UtilsManager";
import { MarketType, OrderStatus } from "../utils/types";

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

export interface PaginatedOrders {
  orders: Record<string, any>[];
  has_next_page: boolean;
}

type AuthToken = Record<"token", string>;

const TradingPage: FC = () => {
  const navigate = useNavigate();
  const { marketType, instrument } = useParams();
  const { isLoggedIn } = useIsLoggedIn();
  const { profile, setProfile } = useProfile();
  const { orders, setOrders } = useUserOrders();

  const [price, setPrice] = useState<number | undefined>(undefined);
  const [tab, setTab] = useState<number>(0);
  const [showOrderCard, setShowOrderCard] = useState<boolean>(false);
  const [tablePage, setTablePage] = useState<number>(1);
  const [ordersTableRenderProp, setOrdersTableRenderProp] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [ordersFilter, setOrdersFilter] = useState<OrderStatus[]>([
    OrderStatus.FILLED,
    OrderStatus.PARTIALLY_FILLED,
    OrderStatus.PENDING,
  ]);
  const [headerRenderProp, setHeaderRenderProp] = useState<number>(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(
    Timeframe.M5
  );

  const tablePageRef = useRef<number[]>([]);
  const chartRef = useRef<any>(undefined);
  const seriesRef = useRef<any>(undefined);
  const seriesDataRef = useRef<OHLC[] | undefined>(undefined);
  const ordersWsRef = useRef<WebSocket | undefined>(undefined);
  const priceWsRef = useRef<WebSocket | undefined>(undefined);

  useEffect(() => {
    if (!Object.values(MarketType).includes(marketType as MarketType)) {
      navigate("/login");
    }
  }, [marketType]);

  useEffect(() => {
    if (tablePageRef.current.includes(tablePage)) return;

    (async () => {
      try {
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL +
            `/account/orders?instrument=${instrument}&market_type=${marketType}${ordersFilter
              .map((status) => `&status=${status}`)
              .join("")}&page=${Math.max(0, tablePage - 1)}`,
          { method: "GET", credentials: "include" }
        );

        const data = await rsp.json();
        if (!rsp.ok) throw new Error(data["error"]);

        setOrders(
          UtilsManager.removeDuplicateOrders(
            (data as PaginatedOrders).orders,
            orders
          )
        );
        setHasNextPage((data as PaginatedOrders).has_next_page);
        setOrdersTableRenderProp(ordersTableRenderProp + 1);
        tablePageRef.current.push(tablePage);
      } catch (err) {
        UtilsManager.toastError((err as Error).message);
      }
    })();
  }, [tablePage]);

  useEffect(() => {
    if (Object.keys(profile ?? {}).length == 0 || !isLoggedIn) return;
    (async () => {
      const authToken: AuthToken | null = await getOrderWsToken();
      if (!authToken) return;

      const handlers: Partial<
        Record<SocketPayloadCategory, (arg: any) => void>
      > = {
        [SocketPayloadCategory.BALANCE]: handleBalanceUpdate,
        [SocketPayloadCategory.ORDER]: handleOrderUpdate,
      };

      ordersWsRef.current = new WebSocket(
        import.meta.env.VITE_BASE_URL.replace("http", "ws") + "/order/ws"
      );

      ordersWsRef.current.onopen = (e) => {
        ordersWsRef.current?.send(JSON.stringify(authToken));
      };

      ordersWsRef.current.onmessage = (e) => {
        const message = JSON.parse(e.data) as SocketPayload;
        const func = handlers[message.category];
        if (func) {
          func(message.content);
        }
      };

      ordersWsRef.current.onclose = (e) => {};
    })();

    return () => {
      if (ordersWsRef.current != undefined) {
        ordersWsRef.current.close();
        ordersWsRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    priceWsRef.current = new WebSocket(
      import.meta.env.VITE_BASE_URL.replace("http", "ws") +
        `/instrument/ws/?instrument=BTCUSD`
    );

    priceWsRef.current.onopen = (e) => {};

    priceWsRef.current.onmessage = (e) => {
      const message = JSON.parse(e.data) as SocketPayload;
      handlePriceUpdate(message.content as PriceUpdate);
    };

    priceWsRef.current.onclose = (e) => {};

    priceWsRef.current.onerror = (e) => {};

    return () => {
      if (priceWsRef.current != undefined) {
        priceWsRef.current.close();
        priceWsRef.current = undefined;
      }
    };
  }, []);

  function handlePriceUpdate(payload: PriceUpdate): void {
    if (!seriesRef.current) return;
    const convertedPrice = Number(payload.price);
    setPrice(payload.price);
    updateChart(convertedPrice, payload.time);
  }

  function updateChart(price: number, time: number): void {
    const tfSeconds: number = getSeconds(selectedTimeframe);
    const newCandle: OHLC = {
      time: time,
      open: price,
      high: price,
      low: price,
      close: price,
    };

    if (seriesDataRef.current === undefined) {
      seriesDataRef.current = [newCandle];
    } else if (seriesDataRef.current.length === 0) {
      seriesDataRef.current = [newCandle];
    } else {
      const lastCandle =
        seriesDataRef.current[seriesDataRef.current.length - 1];

      if (time - lastCandle.time < tfSeconds) {
        lastCandle.high = Math.max(lastCandle.high, price);
        lastCandle.low = Math.min(lastCandle.low, price);
        lastCandle.close = price;
      } else {
        seriesDataRef.current.push(newCandle);
      }
    }

    seriesRef.current.update(
      seriesDataRef.current[seriesDataRef.current.length - 1]
    );
  }

  function handleOrderUpdate(payload: Record<string, string | number>): void {
    setOrders((prev?: Record<string, any>[]) => {
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
    setProfile((state) => ({ ...state, balance: payload.balance } as Profile));
    setHeaderRenderProp(headerRenderProp + 1);
  }

  async function getOrderWsToken(): Promise<AuthToken | null> {
    try {
      const rsp = await fetch(
        import.meta.env.VITE_BASE_URL + "/order/ws/get-token",
        { method: "GET", credentials: "include" }
      );

      const data = await rsp.json();
      if (!rsp.ok) throw new Error(data["detail"]);

      return data as AuthToken;
    } catch (err) {
      return null;
    }
  }

  return (
    <>
      <CustomHeader renderProp={headerRenderProp} />

      <DefaultLayout
        element={
          <>
            <div
              id="tradePage"
              className="w-full"
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
                    <OrderCard
                      marketType={marketType as MarketType}
                      instrument={instrument!}
                    />
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
                        instrument={instrument!}
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
                  overflowY: "hidden",
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
                  <InstrumentCard
                    showBorder
                    price={price}
                    instrument={instrument!}
                    chartRef={chartRef}
                    seriesRef={seriesRef}
                    seriesDataRef={seriesDataRef}
                    selectedTimeframe={selectedTimeframe}
                    setSelectedTimeframe={setSelectedTimeframe}
                  />
                </div>
                <div
                  className="h-full"
                  style={{ width: "300px", minWidth: "300px" }}
                >
                  <OrderCard
                    marketType={marketType as MarketType}
                    instrument={instrument!}
                  />
                </div>
              </div>
              <OrdersTable
                renderProp={ordersTableRenderProp}
                orders={orders}
                setOrders={setOrders}
                filter={ordersFilter}
                setFilter={setOrdersFilter}
                page={tablePage}
                setPage={setTablePage}
                allowClose={marketType === MarketType.FUTURES}
                hasNextPage={hasNextPage}
              />
            </div>
          </>
        }
      />
    </>
  );
};

export default TradingPage;
