import { FC } from 'react';


// const Sidebar: FC<{showChart?: () => void, disableChart?: () => void}> = ({showChart, disableChart}) => {
const Sidebar: FC<{showModal: (num: number) => void}> = ({showModal}) => {
    return (
        <>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-house" onClick={() => showModal(0)}/>
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-chart-line" onClick={() => showModal(1)} />
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-trophy" onClick={() => showModal(2)}></i>
            </div>
        </>
        
    );
}

export default Sidebar;