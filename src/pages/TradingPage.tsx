import { FC, useEffect, useRef, useState } from "react";
import DOM from "../componenets/DOM";
import InstrumentChart from "../componenets/InstrumentCard";
import OrderCard from "../componenets/OrderCard";
import OrdersTable from "../componenets/OrdersTable";
import TradingHeader from "../componenets/TradingHeader";
import UtilsManager from "../utils/classses/UtilsManager";

const TradingPage: FC = () => {
  const [price, setPrice] = useState<number>(100);

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
      <div className="w-full p-md">
        <div
          className="w-full flex"
          style={{ height: "30rem", marginTop: "6rem" }}
        >
          <OrderCard balance={10000} />
          <InstrumentChart
            price={price}
            chartRef={chartRef}
            seriesRef={seriesRef}
          />
          <DOM price={price} orderbook={UtilsManager.generateOrderbook()} />
        </div>
        <OrdersTable orders={ordersRef.current} />
      </div>
    </>
  );
};

export default TradingPage;
