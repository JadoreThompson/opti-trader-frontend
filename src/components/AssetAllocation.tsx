import axios from "axios";
import * as echarts from "echarts";
import { FC, useEffect, useState } from "react";
import { MarketType } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const AssetAllocation: FC<{
  marketType: MarketType;
  username: string | null;
}> = ({ marketType, username }) => {
  const [chartData, setChartData] = useState<
    null | Record<string, string | number>[]
  >(null);

  const loadChart: (data: Record<string, string | number>[]) => void = (
    data
  ): void => {
    if (!data) {
      return;
    }

    const container = document.getElementById("assetAllocationChart")!;
    var chartDom = container;
    var chart = echarts.init(chartDom);
    var option: echarts.EChartOption;

    option = {
      title: {
        textStyle: {
          color: "white",
        },
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        top: "5%",
        left: "center",
        textStyle: {
          color: "white",
        },
      },
      series: [
        {
          name: "Portfolio Distribution",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: "bold",
              color: "white",
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };

    option && chart.setOption(option);
    window.addEventListener("resize", () => chart.resize());
  };

  useEffect(() => {
    (async () => {
      setChartData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/allocation?market_type=${marketType}${
                username ? `&username=${username}` : ""
              }`,
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
  }, [username]);

  useEffect(() => {
    loadChart(chartData);
  }, [chartData]);

  return (
    <>
      <div className="card chart-container asset-allocation">
        <h2>Asset Allocation</h2>
        {chartData === null ? (
          <>
            <div className="h-100 w-100 everything-center">
              <span className="large secondary">No data</span>
            </div>
          </>
        ) : (
          <div className="chart" id="assetAllocationChart"></div>
          // <></>
        )}
      </div>
    </>
  );
};
export default AssetAllocation;
