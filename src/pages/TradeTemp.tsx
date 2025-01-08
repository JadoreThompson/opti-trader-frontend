import { FC, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "typescript-cookie";
import Header from "../components/Header";
import OrdersTableTemp from "../components/OrdersTableTemp";
import TickerChart from "../components/TickerChart";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const TradeTemp: FC = () => {
  const { ticker } = useParams();
  const websocketRef = useRef<WebSocket>();
  const [websocket, setWebSocket] = useState<null | WebSocket>(null);

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

  return (
    <>
      <Header
        content={
          <>
            <TickerChart ticker={ticker!} />
            <OrdersTableTemp
              marketType={"futures" as MarketType}
              orderStatus={[OrderStatus.FILLED]}
              websocket={websocket}
            />
          </>
        }
      />
    </>
  );
};

export default TradeTemp;
