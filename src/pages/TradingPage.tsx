import { cn } from "@/lib/utils";
import { Bell, User, Wifi } from "lucide-react";
import { useRef, useState, type FC } from "react";
import { Link } from "react-router";

type ConnectionStatus = "connected" | "connecting" | "disconnected";
type TickerSummary = { ticker: string; pct: number; price: number };

const TradingPage: FC = () => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connected");

  const [simpleTickers, setSimpleTickers] = useState<TickerSummary[]>(
    Array(10).fill({ ticker: "SOL/USDT", pct: 24.7, price: 1234.11 }),
  );
  const stylesRef = useRef<CSSStyleDeclaration>(
    getComputedStyle(document.documentElement),
  );

  const getConnectionColor = (): string =>
    connectionStatus === "connected"
      ? stylesRef.current.getPropertyValue("--green")
      : connectionStatus === "connecting"
        ? "orange"
        : stylesRef.current.getPropertyValue("--red");

  return (
    <>
      <div className="w-full h-auto flex bg-zinc-900">
        <header className="w-full h-10 fixed top-0 left-0 flex justify-between items-center border-b border-b-gray bg-primary px-7">
          <div></div>
          <div className="w-fit h-full flex flex-row items-center gap-2 px-2">
            <Link to="#" className="relative shake-notification">
              <Bell className={cn("size-5 hover:text-blue-300")} />
              <div className="w-2 h-2 absolute top-0 right-0 rounded-full bg-red-500"></div>
            </Link>

            <Link to="#">
              <User className={cn("size-5 hover:text-blue-300")} />
            </Link>
          </div>
        </header>

        <main className="w-full mt-10 flex p-1">
          <div className="w-[500px] min-h-[500px] rounded-sm p-1 bg-primary">
            {/* <OrderBook /> */}
            {/* <RecentTrades /> */}
          </div>
        </main>

        {/* Footer */}
        <div className="w-full h-7 min-h-0 max-h-10 fixed bottom-0 z-2 flex items-center border-t-1 border-t-gray text-xs">
          <div className="w-full h-full relative">
            <div className="w-fit h-full absolute top-0 left-0 z-2 flex items-center gap-2 px-2 border-r-1 border-r-gray bg-[var(--background)]">
              <Wifi className="rotate-50 size-3" color={getConnectionColor()} />
              <span style={{ color: getConnectionColor() }}>
                Stable Connection
              </span>
            </div>
            <div className="w-full h-full flex flex-row">
              <div className="w-fit flex">
                {simpleTickers.map((st) => (
                  <div className="w-[200px] h-full flex items-center gap-1 marquee-item">
                    <span>{st.ticker}</span>
                    <span
                      className={`${st.pct < 0 ? "text-#c93639" : "text-green-500"}`}
                    >
                      {st.pct}%
                    </span>
                    <span className="text-gray-300">{st.price}</span>
                  </div>
                ))}

                {simpleTickers.map((st) => (
                  <div className="w-[200px] h-full flex items-center gap-1 marquee-item">
                    <span>{st.ticker}</span>
                    <span
                      className={`${st.pct < 0 ? "text-#c93639" : "text-green-500"}`}
                    >
                      {st.pct}%
                    </span>
                    <span className="text-gray-300">{st.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TradingPage;
