import { FC, useEffect } from 'react';
import { ColorType, createChart, GridOptions, LayoutOptions } from 'lightweight-charts';
import { getCookie } from 'typescript-cookie';


const Chart: FC = () => {
    const socket = new WebSocket("http://127.0.0.1:8000/stream/trade");
    let chart;

    useEffect(() => {
        /* --------------------
                Websocket
        -------------------- */
        socket.onopen = () => {
            socket.send(JSON.stringify({ token: getCookie('jwt')}));
        };

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
            chart = createChart(document.getElementById('chart-container')!, chartOptions);
            const areaSeries = chart.addAreaSeries();
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

    /* --------------------
            Styles
    -------------------- */
    const containerStyle = {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        padding: "1rem"
    };


    /* --------------------
            Handlers
    -------------------- */
    const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        socket.send(JSON.stringify(Object.fromEntries(new FormData(this).entries())));
    };
    

    // Socket Handlers
    socket.onmessage = (e: MessageEvent<any>) => {
        const socketMessage = JSON.parse(e.data);
        console.log(socketMessage);
    }


    
    /* -------------------
            Styles
    ------------------- */


    const containerStyles = {
        width: "auto"
    };


    /* --------------------
        Return Content
    -------------------- */
    return (
        <>
            <header className='chart-header'>
                <div style={containerStyles} className="container">
                    <div className="loading-container">
                        <span className="circle"></span>
                    </div>
                    <span>Connected</span>
                </div>
            </header>
            <div style={containerStyle} className="container">
                <div className="inner-container">
                    <div className="col left-col">
                        <div className="chart-card card">
                            <div className="chart-container">
                                <div id="chart-container"></div>
                            </div>
                            <div className="card-footer"></div>
                        </div>
                    </div>

                    <div className="col right-col">
                        <div className="card">
                            <form id='orderForm' onSubmit={formSubmit}>
                                <input type="text" name='ticker' placeholder='Ticker'required/>
                                <input type="number" name='quantity' placeholder='Quantity'required/>
                                <button type='submit' className='btn btn-primary'>Open Order</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chart;
