import { FC, ReactElement, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const Sidebar: FC<{ mainContent: ReactElement }> = ({ mainContent }) => {
    const location = useLocation();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const options: Record<string, string> = {
            follow: 'follow',
            profile: 'profile',
            leaderboard: 'leadberboard',
            trade: 'trade',
        };
        
        document.getElementById(options[location.pathname.split("/")[2]])?.classList.add('active');

    }, [location.pathname]);

    useEffect(() => {
        console.log(localStorage.getItem('username'));
    }, [])

    const rootStyles: Record<string, string> = {
        display: "flex",
        flexDirection: 'row',
        height: "100%",
        width: "100%",
        gap: '1rem'
    };

    const sidebarStyles: Record<string, string> = {
        width: "auto",
        height: "100%",
        position: "fixed"
    };

    const mainStyles: Record<string, string> = {
        maxWidth: "100%",
        width: "100%",
        padding: "1rem",
        marginLeft: "3%"
    };

    return (
        <>
            <div style={rootStyles}>
                <div className="sidebar" style={sidebarStyles}>
                    <div className="sidebar-icon-container">
                        <Link to={`/dashboard/profile/${localStorage.getItem('username')}`}>
                            <i className="fa-solid fa-user sidebar-icon" id="profile" />
                        </Link>
                    </div>
                    <div className="sidebar-icon-container">
                        <Link to="/dashboard/trade">
                            <i className="fa-solid fa-chart-line sidebar-icon" id="trade" />
                        </Link>
                    </div>
                    <div className="sidebar-icon-container">
                        <Link to="/dashboard/leaderboard">
                            <i className="fa-solid fa-trophy sidebar-icon" id='leaderboard'/>
                        </Link>
                    </div>
                    <div className="sidebar-icon-container">
                        <Link to="/dashboard/follow">
                            <i className="fa-solid fa-user-plus sidebar-icon" id='follow'/>
                        </Link>
                    </div>
                </div>
                <div className="main-content" style={mainStyles}>
                    {mainContent}
                </div>
            </div>
        </>
        
    );
}

export default Sidebar;