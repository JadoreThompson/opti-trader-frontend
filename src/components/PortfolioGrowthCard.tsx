import axios from "axios";
import { ColorType, TimeChartOptions, createChart } from "lightweight-charts";
import { FC, useEffect, useState } from "react";
import { MarketType } from "../types/CommonTypes";
import { useBodyStyles } from "../utils/BodyStyles";
import RequestBuilder from "../utils/RequestBuilder";

enum GrowthInterval {
  DAY = "1d",
  WEEK = "1w",
  MONTH = "1m",
  YEAR = "1y",
  ALL = "all",
}

const PortfolioGrowthCard: FC<{
  username: string | null;
  marketType: MarketType;
}> = ({ username, marketType }) => {
  const bodyStyles = useBodyStyles();
  const [currentInterval, setCurrentInterval] = useState<GrowthInterval>(
    GrowthInterval.MONTH
  );
  const [chartData, setChartData] = useState<null | Array<
    Record<string, number>
  >>(null);

  const loadChart: () => void = (): void => {
    if (chartData) {
      const options: TimeChartOptions = {
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
      const container = document.getElementById(
        "portfolioGrowthChartContainer"
      )!;
      container.innerHTML = "";
      const chart = createChart(container, options);
      const areaSeries = chart.addAreaSeries({
        lineColor: "rgba(124, 72, 235, 1)",
        topColor: "rgba(124, 72, 235, 1.0)",
        bottomColor: "rgba(43, 1, 137, 0.01)",
      });
      areaSeries.setData(chartData);
    }
  };

  useEffect(() => {
    (async () => {
      setChartData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/growth?market_type=${marketType}&interval=${currentInterval}${
                username ? `&username=${username}` : ""
              }`,
            RequestBuilder.constructHeader()
          )
          .then((response) => response.data)
          .catch((err) => {
            if (err instanceof axios.AxiosError) {
              console.log(err);
            }
            return null;
          })
      );
    })();
  }, [currentInterval, username, marketType]);

  useEffect(() => {
    loadChart();
  }, [chartData, bodyStyles]);

  // useEffect(() => {
  //   console.log(chartData);
  // }, [chartData]);

  return (
    <>
      <div className="card chart-container portfolio-growth">
        <h2>PortfolioGrowth</h2>
        {chartData === null ? (
          <>
            <div className="h-100 w-100 everything-center">
              <span className="large secondary">No data</span>
            </div>
          </>
        ) : (
          <>
            <div className="d-row flex-end mb-1">
              <div className="btn-radio-group">
                {Object.values(GrowthInterval).map((value, index) => (
                  <button
                    key={index}
                    value={value}
                    className={`btn ${
                      currentInterval === value ? "active" : ""
                    }`}
                    onClick={(e) => {
                      setCurrentInterval(
                        (e.target as HTMLButtonElement).value as GrowthInterval
                      );
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart" id="portfolioGrowthChartContainer"></div>
          </>
        )}
      </div>
    </>
  );
};

export default PortfolioGrowthCard;
