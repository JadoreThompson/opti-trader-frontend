import axios from "axios";
import {
  ColorType,
  GridOptions,
  LayoutOptions,
  TimeScaleOptions,
  createChart,
} from "lightweight-charts";
import { FC, useEffect, useRef, useState } from "react";
import { useBodyStyles } from "../utils/BodyStyles";
import RequestBuilder from "../utils/RequestBuilder";
enum ChartIntervals {
  M1 = "1m",
  M15 = "15m",
  H4 = "4h",
}

const TickerChart: FC<{ ticker: string }> = ({ ticker }) => {
  const bodyStyles = useBodyStyles();

  const [currentInterval, setCurrentInterval] = useState<ChartIntervals>(
    ChartIntervals.H4
  );
  const [data, setData] = useState<null | Record<string, Number | null>[]>(
    null
  );
  const seriesRef = useRef<any>();

  useEffect(() => {
    (async () => {
      setData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/instruments?ticker=${ticker}&interval=${currentInterval}`,
            RequestBuilder.constructHeader()
          )
          .then((response) => response.data)
          .catch((err) => {
            if (err instanceof axios.AxiosError) {
              console.error(err);
            }
            return null;
          })
      );
    })();
  }, [ticker, currentInterval]);

  useEffect(() => {
    (() => {
      if (data) {
        const chartOptions: {
          autoSize: boolean;
          layout: LayoutOptions;
          grid: GridOptions;
          timeScale: TimeScaleOptions;
        } = {
          autoSize: true,
          layout: {
            background: {
              type: ColorType.Solid,
              color: bodyStyles.getPropertyValue("--background-color-primary"),
            },
            textColor: bodyStyles.getPropertyValue("--text-color-primary"),
            fontSize: 12,
            fontFamily: bodyStyles.getPropertyValue("font-family"),
            attributionLogo: false,
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
          timeScale: {
            timeVisible: true,
          },
        };

        const chartContainer = document.getElementById(
          "tickerChart"
        ) as HTMLElement;
        chartContainer.innerHTML = "";
        const chart = createChart(chartContainer!, chartOptions);
        seriesRef.current = chart.addCandlestickSeries({
          upColor: "#26a69a",
          downColor: "#ef5350",
          borderVisible: false,
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
        });
        seriesRef.current.setData(data);

        chart.timeScale().fitContent();

        window.addEventListener('resize', () => chart.resize(window.innerWidth, window.innerHeight))
      }
    })();
  }, [data, bodyStyles]);

  return (
    <>
      <>
        <div className="card chart-container ticker-chart border-box w-100">
          <div className="d-row align-center justify-sb">
            <div className="btn-radio-group transparent">
              {Object.values(ChartIntervals).map((value, index) => (
                <button
                  key={index}
                  className={`btn ${currentInterval === value ? "active" : ""}`}
                  value={value as ChartIntervals}
                  onClick={() => {
                    setCurrentInterval(value as ChartIntervals);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div>
              <svg
                className="icon"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M21 3h-8v2h4v2h2v4h2V3zm-4 4h-2v2h-2v2h2V9h2V7zm-8 8h2v-2H9v2H7v2h2v-2zm-4-2v4h2v2H5h6v2H3v-8h2z"
                  fill="currentColor"
                />{" "}
              </svg>
            </div>
          </div>
          <div className="chart" id="tickerChart"></div>
        </div>
      </>
    </>
  );
};

export default TickerChart;
