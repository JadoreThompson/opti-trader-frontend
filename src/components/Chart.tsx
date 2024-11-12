import { FC, useEffect, useState, useRef } from 'react';
import { ColorType, createChart, GridOptions, LayoutOptions } from 'lightweight-charts';
import { getCookie } from 'typescript-cookie';


// Local
import Alert from './Alert';
import { AlertTypes } from './Alert';
import DashboardLayout from './DashboardLayout';


enum OrderType {
    MARKET_ORDER = 'market_order',
    LIMIT_ORDER = 'limit_order'
}

enum SocketMessageType {
    PRICE = 'price',
}

const Chart: FC = () => {
    let chart;

    const candlestickSeriesRef = useRef<any>();
    const candlestickSeriesData = [{ open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876 }, { open: 9.55, high: 10.30, low: 9.42, close: 9.94, time: 1642514276 }, { open: 9.94, high: 10.17, low: 9.92, close: 9.78, time: 1642600676 }, { open: 9.78, high: 10.59, low: 9.18, close: 9.51, time: 1642687076 }, { open: 9.51, high: 10.46, low: 9.10, close: 10.17, time: 1642773476 }, { open: 10.17, high: 10.96, low: 10.16, close: 10.47, time: 1642859876 }, { open: 10.47, high: 11.39, low: 10.40, close: 10.81, time: 1642946276 }, { open: 10.81, high: 11.60, low: 10.30, close: 10.75, time: 1643032676 }, { open: 10.75, high: 11.60, low: 10.49, close: 10.93, time: 1643119076 }, { open: 10.93, high: 11.53, low: 10.76, close: 10.96, time: 1643205476 }];

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

            chart = createChart(document.getElementById('chart-container')!, chartOptions);
            candlestickSeriesRef.current = chart.addCandlestickSeries({ upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
            candlestickSeriesRef.current.setData(candlestickSeriesData);

            chart.timeScale().fitContent();
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
            Websocket
    -------------------- */
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    
    const [alertType, setAlertType] = useState<AlertTypes | null>(null);
    const [alertMessage, setAlertMessage] = useState<string>('');

    let lastUpdateTime = 1643205476;

    useEffect(() => {
        /*
            Initialises and configures the functionality of the websocket
            object
        */

        // Updates the chart
        const updateChartPrice = (newPrice: number, newTime: number) => {            
            if (candlestickSeriesRef.current) {
                
                let newCandle;
                if (Number(String(newTime).slice(-3)) % 60 === 0 || newTime > (lastUpdateTime + 60)) {
                    newCandle = {
                        time: newTime,
                        open: newPrice,
                        low: newPrice,
                        high: newPrice,
                        close: newPrice
                    };

                    console.log(newTime);
                    lastUpdateTime = newTime;
                    candlestickSeriesData.push(newCandle);

                    // if (newTime >= (lastUpdateTime + 60) && newTime !== lastUpdateTime) {
                    //     console.log(0);
                    //     newCandle = {
                    //         time: newTime,
                    //         open: newPrice,
                    //         low: newPrice,
                    //         high: newPrice,
                    //         close: newPrice
                    //     };
                    // }
                } else {
                    console.log(1);
                    const oldCandle = candlestickSeriesData[candlestickSeriesData.length - 1];
                    newCandle = oldCandle;
                
                    newCandle.high = Math.max(oldCandle.high, newPrice);
                    newCandle.close = Math.max(oldCandle.high, newPrice);
                    candlestickSeriesData.push(newCandle);
                }
                
                console.log(newCandle);
                candlestickSeriesRef.current.update(newCandle);
            }
        };

        socketRef.current = new WebSocket("ws://127.0.0.1:8000/stream/trade");

        socketRef.current.onopen = () => {
            console.log('Connection open');
            socketRef.current?.send(JSON.stringify({ token: getCookie('jwt') }));
            setIsConnected(true);
            console.log('sent the token over');
        };

        socketRef.current.onclose = (e) => {
            console.log(e.reason);
        };

        socketRef.current.onmessage = (e) => {
            const socketMessage = JSON.parse(e.data);
            
            if (Object.values(AlertTypes).includes(socketMessage.status)) {
                setAlertType(socketMessage.status as AlertTypes);
                setAlertMessage(socketMessage.message);
            }

            // Routing
            if (socketMessage.status === SocketMessageType.PRICE){
                updateChartPrice(socketMessage.message.price, socketMessage.message.time);
            }
        };

        return () => {
            if (socketRef.current) { 
                socketRef.current.close(); 
            }
        };
    }, []);


    /* --------------------
            Handlers
    -------------------- */
    const [showOrderTypes, setShowOrderTypes] = useState<boolean>(false);
    const [showLimitOptions, setShowLimitOptions] = useState<boolean>(false);


    const toggleOrderTypes = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setShowOrderTypes(true);
        (e.target as HTMLElement).classList.add('active');
    }

    const disableOrderTypes = () => {
        (document.getElementById('orderType') as HTMLElement).classList.remove('active');
        setShowOrderTypes(false);
    }

    const enableLimitOptions = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setShowLimitOptions(true);
        (document.getElementById('orderType') as HTMLElement).textContent = e.currentTarget.textContent;
        disableOrderTypes();
    }

    const disableLimitOptions = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setShowLimitOptions(false);
        (document.getElementById('orderType') as HTMLElement).textContent = e.currentTarget.textContent;
        disableOrderTypes();
    }


    const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        /*
            Sends form data over to the engine
        */

        e.preventDefault();

        let payload: Record<string, any> = {};

        const orderData = Object.fromEntries(
            Array.from(new FormData(e.target as HTMLFormElement).entries())
            .filter(([_, v]) => v !== '')
            .map(([k, v]) => {
                if (['quantity', 'limit_price'].includes(k)) { return [k, Number(v)]; }
                return [k, v];
            })
        );
        
        payload['type'] = orderData.limit_price ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER;
        if (payload.type === OrderType.MARKET_ORDER) { payload['market_order'] = orderData; }
        else if (payload.type === OrderType.LIMIT_ORDER) { payload['limit_order'] = orderData; }

        if (isConnected && socketRef?.current) { 
            socketRef.current.send(JSON.stringify(payload)); 
            (e.target as HTMLFormElement).reset();
        }
    };


    /* --------------------
        Return Content
    -------------------- */
    return (
        <>
            <Alert message={alertMessage} type={alertType}/>
            <DashboardLayout leftContent={
                <div className="chart-card card">
                    <div className="chart-container">
                        <div id="chart-container"></div>
                    </div>
                    <div className="card-footer"></div>
                </div>

            } rightContent={
                <div className="card">
                    <form id='orderForm' onSubmit={formSubmit}>
                        <input type="text" name='ticker' placeholder='Ticker' pattern="[A-Za-z]+" required/>
                        <input type="number" name='quantity' placeholder='Quantity'required/>
                        <button type='button' id='orderType' className="container" onClick={toggleOrderTypes}>Order Type</button>
                        <div className="options-container container" style={{display: showOrderTypes ? 'block': 'none'}}>
                            <div className="option">
                                <button onClick={disableLimitOptions} type="button" value={OrderType.MARKET_ORDER}>Market</button>
                            </div>
                            <div className="option">
                                <button onClick={enableLimitOptions} type="button" value={OrderType.LIMIT_ORDER}>Limit</button>
                            </div>
                        </div>
                        <div className="container limit-options" style={{display: showLimitOptions ? 'block': 'none'}}>
                            <input type="number" name='limit_price' placeholder='Limit Price' required={showLimitOptions}/>
                        </div>
                        <button type='submit' className='btn btn-primary'>Open Order</button>
                    </form>
                </div>
            }/>
        </>
    );
};

export default Chart;
