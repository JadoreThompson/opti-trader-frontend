import { FC, useEffect } from "react"

// Local
import Sidebar from "./Sidebar";
import Chart from "./Chart";

const Dashboard: FC = (() => {
    useEffect(() => { console.log('Loaded Dashboard'); });

    return (
        <>
            <div className="main-container">
                <Sidebar />
                <div className="main-content">
                    <Chart />
                </div>
            </div>
        </>
    );
});

export default Dashboard;