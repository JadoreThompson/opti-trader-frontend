import { FC, useEffect, useState } from "react";
import { createChart, LayoutOptions, GridOptions, ColorType } from "lightweight-charts";
import axios from "axios";
import { getCookie } from "typescript-cookie";

// Local
import DashboardLayout from "./DashboardLayout";


const Portfolio: FC = () => {
    useEffect(() => {
        /* --------------------
            Render chart
        -------------------- */
        const renderChart = () => {
            const chartOptions: { autoSize: boolean, layout: LayoutOptions, grid: GridOptions } = {
                autoSize: true,
                layout: {
                    background: {
                        type: ColorType.Solid,
                        color: getComputedStyle(document.documentElement).getPropertyValue('--dark-secondary-bg-color'),
                    },
                    textColor: getComputedStyle(document.documentElement).getPropertyValue('--dark-text-color'),
                    fontSize: 12,
                    fontFamily: getComputedStyle(document.documentElement).getPropertyValue("font-family"),
                    attributionLogo: false
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { visible: false }
                }
            };
            const chart = createChart(document.getElementById('chart-container')!, chartOptions);
            
            // const areaSeries = chart.addAreaSeries({ lineColor: "#56398f", topColor: "#63469c", bottomColor: "#826bb0" });

            const areaSeries = chart.addAreaSeries({ 
                lineColor: 'rgba(124, 72, 235, 1)',
                topColor: 'rgba(124, 72, 235, 1.0)',
                bottomColor: 'rgba(43, 1, 137, 0.01)'
            });
            
            

            areaSeries.setData([
                { time: '2018-12-22', value: 32.51 },
                { time: '2018-12-23', value: 31.11 },
                { time: '2018-12-24', value: 27.02 },
                { time: '2018-12-25', value: 27.32 },
                { time: '2018-12-26', value: 25.17 },
                { time: '2018-12-27', value: 28.89 },
                { time: '2018-12-28', value: 25.46 },
                { time: '2018-12-29', value: 23.92 },
                { time: '2018-12-30', value: 22.68 },
                { time: '2018-12-31', value: 22.67 },
            ]);
        };

        renderChart();
    }, []);


    /* ---------------------
        Stat Card Config
    --------------------- */
    const statTitles: Record<string, string> = {
        balance: 'Balance',
        daily: 'Daily',
        winrate: 'Winrate',
        std: 'Std',
        beta: 'Beta',
        treynor: 'Treynor',
        ahpr: 'AHPR',
        ghpr: 'GHPR',
        risk_of_ruin: 'Risk of Ruin'
    };
    const [stats, setStats] = useState<Record<string, string | Number>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get("http://127.0.0.1:8000/portfolio/performance", {
                    headers: {
                        'Authorization': `Bearer ${getCookie('jwt')}`
                    }
                });
                
                setStats(data);
            } catch(e) {
                console.error(e);
            }
        };

        fetchData();
    }, []);

    
    return (
        <DashboardLayout leftContent={
            <div className="chart-card card">
                <div className="chart-container">
                    <div id="chart-container"></div>
                </div>
                <div className="card-footer"></div>
            </div>

        } rightContent={
            <div className="card stat-card">
                <div className="card-title">
                    <h1>Stats</h1>
                </div>
                <div className="card-body">
                    {Object.keys(statTitles).map((key) => (
                        <div className="container">
                            <div className="title">{statTitles[key]}</div>
                            <div className="value">{stats[key]}</div>
                        </div>
                    ))}
                </div>
            </div>
        }/>
    )
};


export default Portfolio;