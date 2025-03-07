import {
  ColorType,
  GridOptions,
  LayoutOptions,
  LineStyle,
  PriceScaleMode,
  PriceScaleOptions,
  TimeScaleOptions,
  createChart,
} from "lightweight-charts";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import UtilsManager from "../utils/classses/UtilsManager";
import ArrowDown from "./icons/ArrowDown";
import ArrowUp from "./icons/ArrowUp";

export interface OHLC {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export enum Timeframe {
  M5 = "5m",
  M15 = "15m",
  H1 = "1h",
}

export function getSeconds(timeframe: Timeframe): number {
  const unit = timeframe.slice(-1);
  const amount = parseInt(timeframe.slice(0, -1), 10);

  if (unit === "m") {
    return amount * 60;
  } else if (unit === "h") {
    return amount * 3600;
  } else {
    throw new Error(`Unsupported timeframe unit: ${unit}`);
  }
}

const InstrumentCard: FC<{
  price: number;
  chartRef: MutableRefObject<any>;
  seriesRef: MutableRefObject<any>;
  seriesDataRef: MutableRefObject<OHLC[]>;
  selectedTimeframe: Timeframe;
  setSelectedTimeframe: (arg: Timeframe) => void;
  showBorder?: boolean;
}> = ({
  price,
  chartRef,
  seriesRef,
  seriesDataRef,
  selectedTimeframe,
  setSelectedTimeframe,
  showBorder = false,
}) => {
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [chartData, setChartData] = useState<OHLC[]>([]);
  const lastPriceRef = useRef<number[]>([0, price]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartPlacedRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL +
            `/instrument/?instrument=BTCUSD&timeframe=${selectedTimeframe}&ago=10800`,
          { method: "GET" }
        );
        if (rsp.ok) {
          const data = await rsp.json();
          setChartData(data);
        }
      } catch (err) {}
    };

    fetchData();
  }, [selectedTimeframe]);

  useEffect(() => {
    if (lastPriceRef.current[0]) {
      lastPriceRef.current[0] = lastPriceRef.current[1];
      setLastPrice(lastPriceRef.current[1]);
    } else {
      lastPriceRef.current[0] = price;
      setLastPrice(price);
    }

    lastPriceRef.current[1] = price;
  }, [price]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const docObj: CSSStyleDeclaration = getComputedStyle(
      document.documentElement
    );

    const chartOptions: {
      autoSize: boolean;
      rightPriceScale: PriceScaleOptions;
      layout: LayoutOptions;
      grid: GridOptions;
      timeScale: TimeScaleOptions;
    } = {
      autoSize: true,
      rightPriceScale: {
        ticksVisible: true,
        autoScale: true,
        mode: PriceScaleMode.Normal,
        invertScale: false,
        alignLabels: true,
        scaleMargins: { bottom: 0.1, top: 0.2 },
        borderVisible: true,
        borderColor: "#2B2B43",

        entireTextOnly: false,
        visible: true,
        minimumWidth: 0,
      },
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: docObj.getPropertyValue("--color"),
        fontSize: 12,
        fontFamily: docObj.getPropertyValue("--font-family"),
        attributionLogo: true,
      },
      grid: {
        vertLines: {
          visible: false,
          color: "transparent",
          style: LineStyle.Solid,
        },
        horzLines: {
          visible: false,
          color: "transparent",
          style: LineStyle.Solid,
        },
      },
      timeScale: {
        timeVisible: true,
        ticksVisible: true,
        rightOffset: 0,
        barSpacing: 6,
        minBarSpacing: 0.5,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: false,
        borderVisible: true,
        borderColor: "#2B2B43",
        visible: true,
        secondsVisible: true,
        shiftVisibleRangeOnNewBar: true,
        allowShiftVisibleRangeOnWhitespaceReplacement: false,
        uniformDistribution: false,
        minimumHeight: 0,
        allowBoldLabels: true,
      },
    };

    const loadChart = (): void => {
      chartContainerRef.current!.innerHTML = "";
      chartRef.current = createChart(chartContainerRef.current!, chartOptions);
      chartRef.current.applyOptions(chartOptions);

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      seriesDataRef.current = chartData!;
      seriesRef.current.setData(seriesDataRef.current);

      window.addEventListener("resize", () =>
        chartRef.current!.resize(window.innerWidth, window.innerHeight)
      );
    };

    loadChart();
    chartPlacedRef.current = true;
  }, [chartData]);

  return (
    <div
      className={`w-full h-full ${
        showBorder ? "border-bg-secondary" : ""
      } border-radius-primary flex-col p-sm`}
    >
      <div className="w-full" style={{ height: "2rem" }}>
        <div className="h-full flex justify-start align-center g-1">
          <img
            src="https://imgs.search.brave.com/Yprg3uQ9Q7XhUZv9-ahiQYGEQZNY64ATCx-0mwkCc6M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y29pbnRyaWJ1bmUu/Y29tL2FwcC91cGxv/YWRzLzIwMjMvMDQv/TG9nby1CaXRjb2lu/LTEwMjR4MTAyNC5w/bmc"
            alt=""
            className="h-full"
          />

          <span
            className={`span-lg bold ${
              price > lastPrice ? "text-green increase" : "text-red decrease"
            }`}
          >
            {price ?UtilsManager.formatPrice(price) : ""}
          </span>
          <div className="w-auto h-full flex justify-center align-center" style={{ width: '2rem'}}>
            {price > lastPrice ? (
              <ArrowUp className="fill-green" size="100%" />
            ) : (
              <ArrowDown className="fill-red" size="100%" />
            )}
          </div>
        </div>
      </div>

      <div
        className="w-full flex justify-end align-center g-1 mb-3"
        style={{ height: "2rem" }}
      >
        {Object.values(Timeframe)
          .reverse()
          .map((tf, ind) => (
            <button
              key={ind}
              className="btn bg-transparent hover-pointer hover-bg-background-secondary border-none h-full"
              style={{
                color:
                  selectedTimeframe == tf ? "rgb(109, 200, 250)" : undefined,
              }}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
      </div>

      <div
        ref={chartContainerRef}
        id="chartContainer"
        className="w-full flex"
        style={{
          height: "calc(100% - 5rem)",
        }}
      ></div>
    </div>
  );
};

export default InstrumentCard;
