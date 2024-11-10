import { FC } from 'react';


const Sidebar: FC = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-house"></i>
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-chart-line"></i>
            </div>
        </div>
    );
}

export default Sidebar;