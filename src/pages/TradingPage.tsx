import { IChartApi, ISeriesApi } from "lightweight-charts";
import { FC, useEffect, useRef, useState } from "react";
import UtilsManager from "../classses/UtilsManager";
import InstrumentCard from "../componenets/InstrumentChart";
import TradingHeader from "../componenets/TradingHeader";

const TradingPage: FC = () => {
  const [price, setPrice] = useState<number>(100);
  const chartRef = useRef<any>(undefined);
  const seriesRef = useRef<any>(undefined);

  useEffect(() => {
    (async () => {
      while (true) {
        await UtilsManager.sleep(2000);
        setPrice((price) => Math.round(Math.random() * 2 * price));
      }
    })();
    // setPrice((price) => Math.round(Math.random() * 2 * price));
  }, []);

  return (
    <>
      <TradingHeader
        avatar="https://imgs.search.brave.com/xu9bKhtZbi0F4vLYrz2NJ6cyTSaNZK3EXviEZLVNIwY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYW5n/cnktdGFpLWx1bmct/Y2xvc2UtdXAtZWhr/ZHNoODRiZmwyMXVl/di5qcGc"
        balance={1000}
        username="zenz"
      />
      <div className="w-full p-md">
        <div className="w-full" style={{ height: "20rem", marginTop: "6rem" }}>
          <InstrumentCard
            instrument={"bitcoin"}
            price={price}
            chartRef={chartRef}
            seriesRef={seriesRef}
          />
        </div>
      </div>
    </>
  );
};

export default TradingPage;
