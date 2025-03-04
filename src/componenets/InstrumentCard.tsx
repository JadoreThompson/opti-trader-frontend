import {
  ColorType,
  GridOptions,
  LayoutOptions,
  LineStyle,
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

const InstrumentCard: FC<{
  price: number;
  chartRef: MutableRefObject<any>;
  seriesRef: MutableRefObject<any>;
  seriesDataRef: MutableRefObject<OHLC[]>;
  showBorder?: boolean;
}> = ({ price, chartRef, seriesRef, seriesDataRef, showBorder = false }) => {
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [chartData, setChartData] = useState<OHLC[]>([]);
  const lastPriceRef = useRef<number[]>([0, price]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartPlacedRef = useRef<boolean>(false);

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

    const chartOptions: Partial<{
      autoSize: boolean;
      layout: LayoutOptions;
      grid: GridOptions;
      timeScale: TimeScaleOptions;
    }> = {
      autoSize: true,
      rightPriceScale: {
        ticksVisible: true,
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

      seriesDataRef.current = chartData;
      seriesRef.current.setData(seriesDataRef.current);
      chartRef.current.timeScale().fitContent();

      window.addEventListener("resize", () =>
        chartRef.current!.resize(window.innerWidth, window.innerHeight)
      );
    };

    if (!chartPlacedRef.current && chartContainerRef.current) {
      loadChart();
      chartPlacedRef.current = true;
    }
  }, [chartData]);

  return (
    <div
      className={`w-full h-full ${
        showBorder ? "border-bg-secondary" : ""
      } border-radius-primary flex-col p-sm`}
    >
      <div className="w-full" style={{ height: "2rem" }}>
        <div className="h-full flex align-center g-1">
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
            {UtilsManager.formatPrice(price)}
          </span>
          <div className="w-auto h-full">
            {price > lastPrice ? (
              <ArrowUp className="fill-green" size="100%" />
            ) : (
              <ArrowDown className="fill-red" size="100%" />
            )}
          </div>
        </div>
      </div>

      <div
        ref={chartContainerRef}
        id="chartContainer"
        className="w-full flex"
        style={{
          height: "calc(100% - 2rem)",
        }}
      ></div>
    </div>
  );
};

export default InstrumentCard;
