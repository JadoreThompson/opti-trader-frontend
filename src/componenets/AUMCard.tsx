import * as echarts from "echarts";
import { FC, useEffect, useRef, useState } from "react";
import { FaBinoculars } from "react-icons/fa6";

interface AUM {
  value: number;
  name: string;
}

const AUMCard: FC<{ username: string }> = ({ username }) => {
  const [chartData, setChartData] = useState<AUM[] | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | undefined>(undefined);

  //   useEffect(() => {
  //     (async () => {
  //       try {
  //         const rsp = await fetch(
  //           import.meta.env.VITE_BASE_URL + `/account/assets?username=${username}`,
  //           { method: "GET", credentials: "include" }
  //         );

  //         const data = await rsp.json();
  //         if (!rsp.ok) throw new Error(data["detail"]);
  //         setChartData(data);
  //       } catch (err) {}
  //     })();
  //   }, []);

  useEffect(() => {
    const buildChart = () => {
      chartRef.current = echarts.init(containerRef.current!);
      chartRef.current.setOption({
        title: {
          text: "Total AUM",
          left: "center",
          textStyle: {
            color: "white",
          },
        },
        tooltip: {
          trigger: "axis",
        },
        series: [
          {
            name: "AUM",
            type: "pie",
            radius: "50%",
            data: chartData,
            label: {
              color: "white",
              textShadowBlur: 0,
              textBorderColor: "transparent",
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowOffsetX: -5,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      });
    };

    if ((chartData ?? []).length > 0) {
      buildChart();
    }
  }, [chartData]);

  return (
    <>
      {(chartData ?? []).length > 0 ? (
        <div ref={containerRef} className="w-full h-full"></div>
      ) : (
        <div className="w-full h-full flex align-center justify-center border-default border-radius-primary">
          <div className="flex-column g-2 align-center justify-center">
            <FaBinoculars size="4rem" />
            <span>No Assets Under Management</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AUMCard;
