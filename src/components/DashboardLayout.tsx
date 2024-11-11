import { FC, ReactNode } from "react";

interface DashboardLayoutProps {
    leftContent: ReactNode;
    rightContent: ReactNode;
}


const DashboardLayout: FC<DashboardLayoutProps> = ({ leftContent, rightContent }) => {
    return (
        <div className="container">
            <div className="inner-container">
                <div className="col left-col">
                    {leftContent}
                </div>
                <div className="col right-col">
                    {rightContent}
                </div>
            </div>
        </div>
    )
};


export default DashboardLayout;