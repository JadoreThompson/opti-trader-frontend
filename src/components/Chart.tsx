import { FC, useEffect, useState, useRef } from 'react';
import { ColorType, createChart, GridOptions, LayoutOptions } from 'lightweight-charts';
import { getCookie } from 'typescript-cookie';


// Local
import Alert from './Alert';
import { AlertOptions, AlertTypes } from './Alert';


enum OrderType {
    MARKET_ORDER = 'market_order',
    LIMIT_ORDER = 'limit_order'
}


const Chart: FC = () => {
    let chart;

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
            Websocket
    -------------------- */
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    
    const [alertType, setAlertType] = useState<AlertTypes | null>(null);
    const [alertMessage, setAlertMessage] = useState<string>('');


    useEffect(() => {
        /*
            Initialises and configures the functionality of the websocket
            object
        */
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
            setAlertType(
                Object.values(AlertTypes).includes(socketMessage.status) 
                ? socketMessage.status as AlertTypes : null 
            );
            setAlertMessage(socketMessage.message);
            
        };

        return () => {
            if (socketRef.current) { socketRef.current.close(); }
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
            {/* <div className='chart-header'>
                <div style={containerStyles} className="container">
                    <div className="loading-container">
                        <span className="circle"></span>
                    </div>
                    <span>Connected</span>
                </div>
            </div> */}
            <Alert message={alertMessage} type={alertType}/>
            <div className="container">
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chart;
