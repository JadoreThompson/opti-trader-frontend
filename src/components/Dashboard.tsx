import { FC, useEffect, useState } from "react"

// Local
import Sidebar from "./Sidebar";
import Chart from "./Chart";
import Portfolio from "./Portfolio";


const Dashboard: FC = (() => {
    const [showChartScreen, setShowChartScreen] = useState<boolean>(false);

    const enableChartScreen = () => { setShowChartScreen(true); }
    const disableChartScreen = () => { setShowChartScreen(false); }

    return (
        <>
            <div className="main-container">
                <Sidebar showChart={enableChartScreen} disableChart={disableChartScreen}/>
                <div className="main-content">
                    { showChartScreen ? (<Chart />) : (<Portfolio />)}
                </div>
            </div>
        </>
    );
});

export default Dashboard;