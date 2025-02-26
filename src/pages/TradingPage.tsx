import { FC, useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import DOM from "../componenets/DOM";
import InstrumentChart from "../componenets/InstrumentCard";
import OrderCard from "../componenets/OrderCard";
import OrdersTable from "../componenets/OrdersTable";
import TradingHeader from "../componenets/TradingHeader";
import UtilsManager from "../utils/classses/UtilsManager";

const TradingPage: FC = () => {
  const [price, setPrice] = useState<number>(100);
  const [tab, setTab] = useState<number>(0);
  const [showOrderCard, setShowOrderCard] = useState<boolean>(false);
  const chartRef = useRef<any>(undefined);
  const seriesRef = useRef<any>(undefined);
  const ordersRef = useRef<Record<string, any>[]>(
    UtilsManager.generateOrders(90)
  );

  useEffect(() => {
    // (async () => {
    //   while (true) {
    //     await UtilsManager.sleep(1000);
    //     setPrice(Math.floor(Math.random() * 100));
    //   }
    // })();
  }, []);

  return (
    <>
      <TradingHeader
        avatar="https://imgs.search.brave.com/xu9bKhtZbi0F4vLYrz2NJ6cyTSaNZK3EXviEZLVNIwY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYW5n/cnktdGFpLWx1bmct/Y2xvc2UtdXAtZWhr/ZHNoODRiZmwyMXVl/di5qcGc"
        balance={1000}
        username="zenz"
      />
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
        <div className="w-full snackbar flex justify-start">
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
        <div id="mobile" className="w-full d-none" style={{ height: "20rem" }}>
          {tab === 0 && (
            <InstrumentChart
              price={price}
              chartRef={chartRef}
              seriesRef={seriesRef}
            />
          )}
          {tab === 1 && (
            <DOM price={price} orderbook={UtilsManager.generateOrderbook()} />
          )}
        </div>

        {/* Desktop */}
        <div id="desktop" className="w-full grid-3 g-3">
          <div className="w-full" style={{ height: "30rem" }}>
            <InstrumentChart
              showBorder
              price={price}
              chartRef={chartRef}
              seriesRef={seriesRef}
            />
          </div>
          <div className="w-full h-full">
            <DOM
              showBorder
              price={price}
              orderbook={UtilsManager.generateOrderbook()}
            />
          </div>
          <div className="w-full">
            <OrderCard balance={10000} />
          </div>
        </div>

        <OrdersTable orders={ordersRef.current} />
      </div>
    </>
  );
};

export default TradingPage;
