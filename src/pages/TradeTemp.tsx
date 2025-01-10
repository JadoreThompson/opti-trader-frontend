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
import TickerPriceContext from "../hooks/TickerPriceContext";
import RequestBuilder from "../utils/RequestBuilder";

type Message = Record<string, null | string | Record<any, any>>;
enum MessageCategory {
  PRICE = "price",
  DOM = "dom",
}

const TradeTemp: FC = () => {
  const { ticker } = useParams();
  const { lastPrice, setLastPrice, currentPrice, setCurrentPrice } =
    useContext(TickerPriceContext);

  const websocketRef = useRef<WebSocket>();
  const [websocket, setWebSocket] = useState<null | WebSocket>(null);
  // const [currentPrice, setCurrentPrice] = useState<null | Number>(170);
  // const [lastPrice, setLastPrice] = useState<null | Number>(150);
  const [currentInterval, setCurrentInterval] = useState<ChartIntervals>(
    ChartIntervals.H4
  );
  const [asks, setAsks] = useState<null | Record<number, number>>(null);
  const [bids, setBids] = useState<null | Record<number, number>>(null);
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

      const newCandle = {
        time: existingCandle.time,
        open: existingCandle.open,
        high: Math.max(existingCandle.high, details.price),
        low: Math.min(existingCandle.low, details.price),
        close: details.price,
      };

      seriesDataRef.current.push(newCandle);
      seriesRef.current.update(newCandle);
    }
    return false;
  }

  function updateDOM(message: Message): boolean {
    setAsks(
      (message.details as Record<string, Record<number, number>>)
        .asks as Record<number, number>
    );
    setBids(
      (message.details as Record<string, Record<number, number>>)
        .bids as Record<number, number>
    );
    return false;
  }

  useEffect(() => {
    const ws = new WebSocket(
      RequestBuilder.getBaseUrl().replace("http", "ws") + "/stream/trade"
    );

    ws.onopen = () => {
      ws.send(JSON.stringify({ token: getCookie("jwt") }));
    };

    ws.onmessage = (e) => {
      const message: Message = JSON.parse(e.data);
      console.log("Message received:", JSON.parse(e.data));

      const options: Record<MessageCategory, (arg: Message) => boolean> = {
        [MessageCategory.PRICE]: updateChartPrice,
        [MessageCategory.DOM]: updateDOM,
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
            <div className="w-100 h-auto p-1 border-box">
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
                    <DOM
                      asks={asks}
                      bids={bids}
                      ticker={ticker!}
                    />
                  </div>
                  <OrderFolder ticker={ticker!} />
                </div>
                <div className="">
                  <OrderCreationForm ticker={ticker!} websocket={websocket!} />
                </div>
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default TradeTemp;
