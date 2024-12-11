import { FC, ReactElement, ReactNode, useEffect, useState } from "react"
import { useLocation } from "react-router-dom";

// Local
import Sidebar from "../components/Sidebar";
import Trade from "./Trade";
import LeaderBoard from "../components/Leaderboard";
import Profile from "./Profile";
import Follow from "./Follow";


const Dashboard: FC = (() => {
    const [currentModalChoice, setModalChoice] = useState<number>(1);
    const modalOptions: Record<number, ReactNode> = {        
        1: <Trade />,
        2: <LeaderBoard />,
        3: <Profile isUsersProfile={true} user={'zenz'} />,        
        4: <Follow />,
    };

    const location = useLocation();

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
        maxWidth: "100%",
        width: "100%",
        padding: "1rem",
        marginLeft: "3%"
    }

    return (
        <>
            <div style={rootStyles}>
                <div style={sidebarStyles} className="sidebar">
                    <Sidebar showModal={setModalChoice}/>
                </div>
                <div style={mainStyles} className="main-content">
                    {modalOptions[currentModalChoice]}
                </div>
            </div>
        </>
    );
});

export default Dashboard;