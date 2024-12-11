import { FC } from 'react';


const Sidebar: FC<{showModal: (num: number) => void}> = ({showModal}) => {
    return (
        <>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-user" onClick={() => showModal(3)}></i>
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-chart-line" onClick={() => showModal(1)} />
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-trophy" onClick={() => showModal(2)}></i>
            </div>
            <div className="sidebar-icon-container">
                <i className="fa-solid fa-user-plus" onClick={() => showModal(4)}></i>
            </div>
        </>
        
    );
}

export default Sidebar;