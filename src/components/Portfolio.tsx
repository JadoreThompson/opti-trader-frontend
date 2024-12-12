import { FC, useEffect, useRef, useState } from "react";
import { createChart, LayoutOptions, GridOptions, ColorType, TimeScaleOptions } from "lightweight-charts";
import axios from "axios";
import { getCookie } from "typescript-cookie";


import * as echarts from 'echarts';

// Local
import DashboardLayout from "./DashboardLayout";
import OrderTable from "./OrdersTable";
import { Navigate, useNavigate } from "react-router-dom";


interface PortfolioPageProps
{
    isUsersProfile: boolean,
    username: null | string,
}


const BASE_URL = "http://127.0.0.1:8000";
type EChartsOption = echarts.EChartOption;


const Portfolio: FC<PortfolioPageProps> = ({ isUsersProfile, username }) => {
    /* --------------------
        Render charts
    -------------------- */
    const navigate = useNavigate();
    const [chartData, setChartData] = useState<Array<Record<string, number>>>([]);
    const [distributionData, setDistributionData] = useState<Array<Record<string, string | number>>>([]);
    const [winnerLoserData, setWinnerLoserData] = useState<Record<string, Array<number>>>({});
    const [bodyBuilder, setBodyBuilder] = useState<null | Record<string, null | Record<string, null | string | Array<string>>>>(null);
    
    useEffect(() => {
        setBodyBuilder({
            orders: { 
                order_status: ['closed'], 
                username: isUsersProfile ? null : username
            },
            username: isUsersProfile ? null : {username: username},
            growth: {
                username: isUsersProfile ? null : username,
                interval: "1m"
            }
        });
    }, []);

    // Winners Loses Per Day Data
    useEffect(() => {
        const fetchData = async () => {
            if (bodyBuilder)
            {
                try
                {
                    const { data } = await axios.get(
                        `http://127.0.0.1:8000/portfolio/weekday-results${bodyBuilder?.username ? `?username=${bodyBuilder?.username.username}` : ''}`, 
                        { headers: { "Authorization": `Bearer ${getCookie('jwt')}` }},
                    );
                    setWinnerLoserData(data);
                } catch(e)
                {
                    console.error(e);
                }
            }

        };

        fetchData();
    }, [bodyBuilder]);

    // Winners Losers Per Day
    useEffect(() => {
        const loadChart = () => {
            if (Object.keys(winnerLoserData).length > 0) {
                
                const container = document.getElementById('barChart')!;
                var chartDom = container;
                var myChart = echarts.init(chartDom);
                var option: EChartsOption;
                
                var series = [
                    {
                        data: winnerLoserData.wins,
                        type: 'bar',
                        stack: 'a',
                        name: 'Wins',
                        itemStyle: {
                            color: '#11ae1f'
                        }
                    },
                    {
                        data: winnerLoserData.losses,
                        type: 'bar',
                        stack: 'a',
                        name: 'Losses',
                        itemStyle: {
                            color: 'red'
                        }
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
                                stackEnd: []
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
                                borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder]
                            }
                        }
                    }
                }
                
                option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: (params: any) => {
                            return `${params.seriesName}: ${params.value}`;
                        }
                    },
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        splitLine: { show: false }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { show: false }
                    },
                    series: series as any
                };
                
                option && myChart.setOption(option); 
                window.addEventListener('resize', () => { myChart.resize(); });
            }
        };
        loadChart();

    }, [winnerLoserData]);

    // Distribution Growth Pie Chart Data
    useEffect(() => {
        const fetchData = async () => {
            if (bodyBuilder)
            {

                const { data } = await axios.get(
                    `http://127.0.0.1:8000/portfolio/distribution${bodyBuilder?.username ? `?username=${bodyBuilder?.username.username}` : ''}`,
                    { headers: { "Authorization": `Bearer ${getCookie('jwt')}` }},
                );
                setDistributionData(data);
            }
        };

        fetchData();
    }, [bodyBuilder]);

    // Distribution Growth Pie Chart
    useEffect(() => {
        const loadChart = () => {
            const container = document.getElementById('distributionChart') as HTMLElement;
            var chartDom = container;
            var myChart = echarts.init(chartDom);
            var option: EChartsOption;

            option = {
                title: {
                    textStyle: {
                        color: "white"
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '5%',
                    left: 'center',
                    textStyle: {
                    color: "white"
                    }
                },
                series: [
                    {
                    name: 'Portfolio Distribution',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold',
                        color: "white"
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: distributionData
                    }
                ]
                };

            option && myChart.setOption(option);
            window.addEventListener('resize', () => { myChart.resize(); });
        };
        loadChart();
    }, [distributionData]);


    // Portfolio Growth Chart Data
    useEffect(() => {
        const fetchData = async () => {
            if (bodyBuilder)
            {
                try
                {
                    let url = `http://127.0.0.1:8000/portfolio/growth?interval=${bodyBuilder?.growth?.interval}`;
                    url += bodyBuilder?.growth?.username ? `&username=${bodyBuilder?.growth?.username}` : '';

                    const { data } = await axios.get(
                        url, 
                        {headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }},
                    );
                    setChartData(data);
    
                } catch(e)
                {
                    console.error(e);
                }

            }
        };
        fetchData();
    }, [bodyBuilder]);


    // Portfolio Growth Chart
    useEffect(() => {
        const renderChart = () => {
            if (chartData.length >= 1) {
                const chartOptions: { autoSize: boolean, layout: LayoutOptions, grid: GridOptions, timeScale: TimeScaleOptions } = {
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
                    },
                    timeScale: {
                        timeVisible: true
                    }
                };
                
                const chartContainer = document.getElementById('growth-chart-container') as HTMLElement;
                chartContainer.innerHTML = '';
                const chart = createChart(chartContainer, chartOptions);
    
                const areaSeries = chart.addAreaSeries({ 
                    lineColor: 'rgba(124, 72, 235, 1)',
                    topColor: 'rgba(124, 72, 235, 1.0)',
                    bottomColor: 'rgba(43, 1, 137, 0.01)'
                });

                areaSeries.setData(chartData);
            }
        };

        renderChart();
    }, [chartData]);


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
        const fetchStatData = async () => {
            if (bodyBuilder)
            {
                try {
                    const { data } = await axios.get(
                        BASE_URL + `/portfolio/performance${bodyBuilder?.username?.username ? `?username=${bodyBuilder?.username.username}` : ''}`, 
                        { headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }},
                    );
                    
                    console.log('Performance Data: ', data);
    
                    setStats(data);
                } catch(e) {
                    console.error('Performance Error: ', e);
                    console.log('Performance error, current stats: ', stats);
                }
            }
        };
        
        fetchStatData();

    }, [bodyBuilder]);

        
    const [closedOrders, setClosedOrders] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            if (bodyBuilder)
            {
                try
                {
                    let url = `http://127.0.0.1:8000/portfolio/orders?${bodyBuilder?.orders!.order_status!.map(item => `order_status=${item!}`)}`;
                    url += bodyBuilder?.orders?.username ? `&username=${bodyBuilder?.orders?.username}` : '';

                    const { data } = await axios.get(
                        url,
                        { headers: { Authorization: `Bearer ${getCookie('jwt')}` }},
                    );
                    
                    setClosedOrders(data);
                } catch(e)
                {
                    if (e instanceof axios.AxiosError)
                    {
                        e.status == 403 ? navigate("/404", {replace: true}) : null;
                    }
                }
            }
        };

        fetchData();
    }, [bodyBuilder]);
    
    

    return (
        <DashboardLayout leftContent={    
            <>
                <div className="cr card">
                    <div className="chart-header">
                        <span>Balance</span>
                        <span style={{ fontSize: "2rem"}}>{String(stats?.balance)}</span>
                    </div>
                    <div className="chart-container">
                        <div id="growth-chart-container"></div>
                    </div>
                </div>
                <div className="container metric-container">
                    <div className="card distribution-card">
                        <div id="distributionChart" className="chart"></div>
                    </div>
                    <div className="card bar-card">
                        <div id="barChart" className="chart"></div>
                    </div>
                </div>
                <OrderTable 
                    showClosed={true}
                    closedOrders={closedOrders}
                />
            </>
        } rightContent={
            <div className="card stat-card">
                <div className="card-title">
                    <h1>Stats</h1>
                </div>
                <div className="card-body">
                    {
                        stats
                        ? (
                            <>                            
                            {Object.keys(statTitles).map((key) => (
                                <div className="container" key={key}>
                                    <div className="title">{statTitles[key]}</div>
                                    <div className="value">{String(stats[key])}</div>
                                </div>
                            ))}
                            </>
                        )
                        : 'No data for retrieval'
                    }
                </div>
            </div>
        }/>
    )
};


export default Portfolio;