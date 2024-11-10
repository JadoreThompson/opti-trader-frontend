import { FC, useEffect } from "react"

// Local
import Sidebar from "./Sidebar";
import Chart from "./Chart";


const Dashboard: FC = (() => {
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