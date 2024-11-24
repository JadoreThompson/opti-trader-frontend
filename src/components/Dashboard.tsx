import { FC, useEffect, useState } from "react"

// Local
import Sidebar from "./Sidebar";
import Chart from "./Chart";
import Portfolio from "./Portfolio";
import { getComputedStyle } from "echarts/types/src/component/tooltip/helper.js";


const Dashboard: FC = (() => {
    const [showChartScreen, setShowChartScreen] = useState<boolean>(true);

    const enableChartScreen = () => { setShowChartScreen(true); }
    const disableChartScreen = () => { setShowChartScreen(false); }

    const rootStyles = {
        display: "flex",
        flexDirection: 'row',
        height: "100%",
        width: "100%",
        gap: '1rem'
    }

    const sidebarStyles = {
        width: "auto",
        height: "100%",
        position: "fixed"
    }

    const mainStyles = {
        backgroundColor: "#131415",
        maxWidth: "100%",
        width: "100%",
        padding: "1rem",
        marginLeft: "3%"
    }

    return (
        <>
            <div style={rootStyles}>
                <div style={sidebarStyles} className="sidebar">
                    <Sidebar showChart={enableChartScreen} disableChart={disableChartScreen}/>
                </div>
                <div style={mainStyles}>
                    { showChartScreen ? (<Chart />) : (<Portfolio />)}
                </div>
            </div>
        </>
    );
});

export default Dashboard;