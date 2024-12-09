import { FC, ReactNode, useState } from "react"

// Local
import Sidebar from "./Sidebar";
import Chart from "./TradingPage";
import Portfolio from "./PortfolioPage";
import LeaderBoard from "./Leaderboard";
import ProfilePage from "./Profile";
import FollowPage from "./FollowPage";


const Dashboard: FC = (() => {
    const [currentModal, setShowModal] = useState<number>(1);
    const modalOptions: Record<number, ReactNode> = {
        0: <Portfolio />,
        1: <Chart />,
        2: <LeaderBoard />,
        3: <ProfilePage />,
        4: <FollowPage />,
    };

    const changeModal: (arg: number) => void = (arg: number): void => {
        setShowModal(arg);
    };

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
        // backgroundColor: "#131415",
        maxWidth: "100%",
        width: "100%",
        padding: "1rem",
        marginLeft: "3%"
    }

    return (
        <>
            <div style={rootStyles}>
                <div style={sidebarStyles} className="sidebar">
                    <Sidebar showModal={changeModal}/>
                </div>
                <div style={mainStyles} className="main-content">
                    {modalOptions[currentModal]}
                </div>
            </div>
        </>
    );
});

export default Dashboard;