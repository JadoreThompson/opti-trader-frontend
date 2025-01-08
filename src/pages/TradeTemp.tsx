import { FC, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "typescript-cookie";
import DOM from "../components/DOM";
import Header from "../components/Header";
import OrderFolder from "../components/OrderFolder";
import TickerChart from "../components/TickerChart";
import RequestBuilder from "../utils/RequestBuilder";

const TradeTemp: FC = () => {
  const { ticker } = useParams();
  const websocketRef = useRef<WebSocket>();
  const [websocket, setWebSocket] = useState<null | WebSocket>(null);
  const [currentPrice, setCurrentPrice] = useState<null | Number>(170);
  const [lastPrice, setLastPrice] = useState<null | Number>(150);

  useEffect(() => {
    const ws = new WebSocket(
      RequestBuilder.getBaseUrl().replace("http", "ws") + "/stream/trade"
    );

    ws.onopen = () => {
      ws.send(JSON.stringify({ token: getCookie("jwt") }));
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("Message received:", JSON.parse(e.data));
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const asks = {
    170: 30,
    180: 20,
    190: 10,
  };

  const bids = {
    140: 10,
    150: 20,
    160: 30,
  };

  return (
    <>
      <Header
        content={
          <>
            {/* <TickerChart ticker={ticker!} />
            <OrderFolder ticker={ticker!} /> */}
            <DOM
              asks={asks}
              bids={bids}
              ticker={ticker!}
              currentPrice={currentPrice!}
              lastPrice={lastPrice}
            />
          </>
        }
      />
    </>
  );
};

export default TradeTemp;
