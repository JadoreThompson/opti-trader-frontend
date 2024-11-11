import { FC } from 'react';


const Sidebar: FC<{showChart?: () => void, disableChart?: () => void}> = ({showChart, disableChart}) => {
    return (
        <div className="sidebar">
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-house" onClick={disableChart}/>
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-chart-line" onClick={showChart} />
            </div>
        </div>
    );
}

export default Sidebar;