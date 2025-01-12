import axios from "axios";
import {
  ColorType,
  GridOptions,
  LayoutOptions,
  TimeScaleOptions,
  createChart,
} from "lightweight-charts";
import {
  FC,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useBodyStyles } from "../hooks/BodyStyles";
import TickerContext from "../hooks/TickerPriceContext";
import RequestBuilder from "../utils/RequestBuilder";

export enum ChartIntervals {
  M1 = "1m",
  M15 = "15m",
  H4 = "4h",
}

export function toSeconds(interval: string): number {
  switch (interval) {
    case "1m":
      return 60;
    case "15m":
      return 900;
    case "4h":
      return 14400;
    default:
      throw new Error("Invalid interval");
  }
}

const TickerChart: FC<{
  ticker: string;
  seriesRef: MutableRefObject<any>;
  seriesDataRef: MutableRefObject<undefined | Record<string, number>[]>;
  currentInterval: ChartIntervals;
  setCurrentInterval: (arg: ChartIntervals) => void;
}> = ({
  ticker,
  seriesRef,
  seriesDataRef,
  currentInterval,
  setCurrentInterval,
}) => {
  /*
    seriesRef: Holds the reference to the areaSeries used for the chart.
  */
  const { setCurrentPrice } = useContext(TickerContext);
  const bodyStyles = useBodyStyles();
  const [data, setData] = useState<null | Record<string, number | null>[]>(
    null
  );
  const dataRef = useRef<Record<string, number | null>[] | null>();
  const chartRef = useRef<any>();

  useEffect(() => {
    (async () => {
      setData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/instruments?ticker=${ticker}&interval=${currentInterval}`,
            RequestBuilder.constructHeader()
          )
          .then((response) => {
            seriesDataRef.current = response.data;

            if (response.data.length > 0) {
              setCurrentPrice(response.data[response.data.length - 1].close);
            }

            return response.data;
          })
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
    const options: {
      autoSize: boolean;
      layout: LayoutOptions;
      grid: GridOptions;
      timeScale: TimeScaleOptions;
    } = {
      autoSize: true,
      rightPriceScale: {
        ticksVisible: true
      },
      layout: {
        background: {
          type: ColorType.Solid,
          color: bodyStyles.getPropertyValue("--background-color-primary"),
        },
        textColor: bodyStyles.getPropertyValue("--text-color-primary"),
        fontSize: 12,
        fontFamily: bodyStyles.getPropertyValue("font-family"),
        attributionLogo: true,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        // timeVisible: true,
        ticksVisible: true,
      },
    };

    if (data === dataRef.current) {
      chartRef.current ? chartRef.current.applyOptions(options) : null;
      return;
    } else {
      dataRef.current = data;
    }

    function loadChart(): void {
      if (data) {
        const chartContainer = document.getElementById(
          "tickerChart"
        ) as HTMLElement;
        chartContainer.innerHTML = "";
        chartRef.current = createChart(chartContainer!, options);
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: "#26a69a",
          downColor: "#ef5350",
          borderVisible: false,
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
        });
        try {
          seriesRef.current.setData(data);
        } catch (err) {
          console.error(err);
        }

        chartRef.current.timeScale().fitContent();

        window.addEventListener("resize", () =>
          chartRef.current.resize(window.innerWidth, window.innerHeight)
        );
      }
    }

    loadChart();
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
