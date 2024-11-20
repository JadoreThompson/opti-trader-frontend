import { FC, useEffect, useState } from "react"

// Local
import Sidebar from "./Sidebar";
import Chart from "./Chart";
import Portfolio from "./Portfolio";
import { getComputedStyle } from "echarts/types/src/component/tooltip/helper.js";


const Dashboard: FC = (() => {
    const [showChartScreen, setShowChartScreen] = useState<boolean>(false);

    const enableChartScreen = () => { setShowChartScreen(true); }
    const disableChartScreen = () => { setShowChartScreen(false); }

    const rootStyles = {
        display: "flex",
        height: "100%",
        width: "100%"
    };

    const sidebarStyles = {
        width: "auto",
        height: "100%",
        position: "fixed"
    }

    const mainStyles = {
        backgroundColor: "#131415",
        width: "100%",
        padding: "1rem",
        marginLeft: "3%"
    }

    return (
        <>
            <div style={rootStyles} className="">
                <div style={sidebarStyles} className="sidebar">
                    <Sidebar showChart={enableChartScreen} disableChart={disableChartScreen}/>
                </div>
                <div style={mainStyles} className="c">
                    { showChartScreen ? (<Chart />) : (<Portfolio />)}
                </div>
            </div>
        </>
    );
});

export default Dashboard;