import axios from "axios";
import * as echarts from "echarts";
import { FC, useEffect, useState } from "react";
import { MarketType } from "../types/Trade";
import RequestBuilder from "../utils/RequestBuilder";

const WeekdayGains: FC<{ username: string | null; marketType: MarketType }> = ({
  username,
  marketType,
}) => {
  const [chartData, setChartData] = useState<null | Record<string, number[]>>(
    null
  );

  const loadChart: (data: Record<string, number[]>) => void = (data): void => {
    if (!data) {
      return;
    }

    const container = document.getElementById("weekdayGainsChart")!;
    container.innerHTML = '';
    var chartDom = container;
    var chart = echarts.init(chartDom);
    var option: echarts.EChartsOption;

    var series = [
      {
        data: data.wins,
        type: "bar",
        stack: "a",
        name: "Wins",
        itemStyle: {
          color: "#11ae1f",
        },
      },
      {
        data: data.losses,
        type: "bar",
        stack: "a",
        name: "Losses",
        itemStyle: {
          color: "red",
        },
      },
    ];

    const stackInfo: {
      [key: string]: { stackStart: number[]; stackEnd: number[] };
    } = {};
    for (let i = 0; i < series[0].data.length; ++i) {
      for (let j = 0; j < series.length; ++j) {
        const stackName = series[j].stack;
        if (!stackName) {
          continue;
        }
        if (!stackInfo[stackName]) {
          stackInfo[stackName] = {
            stackStart: [],
            stackEnd: [],
          };
        }
        const info = stackInfo[stackName];
        const data = series[j].data[i];
        if (data && data !== 0) {
          if (info.stackStart[i] == null) {
            info.stackStart[i] = j;
          }
          info.stackEnd[i] = j;
        }
      }
    }
    for (let i = 0; i < series.length; ++i) {
      const data = series[i].data as
        | number[]
        | { value: number; itemStyle: object }[];
      const info = stackInfo[series[i].stack];
      for (let j = 0; j < series[i].data.length; ++j) {
        const isEnd = info.stackEnd[j] === i;
        const topBorder = isEnd ? 5 : 0;
        const bottomBorder = 0;
        data[j] = {
          value: data[j] as number,
          itemStyle: {
            borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder],
          },
        };
      }
    }

    option = {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `${params.seriesName}: ${params.value}`;
        },
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        splitLine: { show: false },
      },
      series: series as any,
    };

    option && chart.setOption(option);
    window.addEventListener("resize", () => {
      chart.resize();
    });

    return chart.dispose();
  };

  useEffect(() => {
    (async () => {
      setChartData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/weekday-results?${
                username ? `username=${username}` : ""
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
    console.log(chartData);
    loadChart(chartData);
  }, [chartData]);

  return (
    <>
      <div className="card chart-container weekday-gains w-100">
        <h2>Weekday Gains</h2>
        <div className="chart" id="weekdayGainsChart"></div>
      </div>
    </>
  );
};

export default WeekdayGains;
