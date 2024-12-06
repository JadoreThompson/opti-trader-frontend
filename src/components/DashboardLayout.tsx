import { FC, ReactNode } from "react";

interface DashboardLayoutProps {
    leftContent: ReactNode;
    rightContent: ReactNode;
}


const DashboardLayout: FC<DashboardLayoutProps> = ({ leftContent, rightContent }) => {
    const main: Record<string, string> = {
        display: "flex",
        flexDirection: 'row',
        width: "100%",
        gap: "0.5rem"
    };

    return (
        <>
            <div style={main}>
                <div className="left side">
                    {leftContent}
                </div>
                <div className="right side">
                    {rightContent}
                </div>
            </div>
        </>
    )
};


export default DashboardLayout;