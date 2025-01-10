import { FC, ReactElement } from "react";
import Sidebar from "./Sidebar";
import SiteThemeSwitch from "./SiteThemeSwitch";

const Header: FC<{ content: ReactElement }> = ({ content }) => {
  return (
    <>
      <header>
        <Sidebar />
        <SiteThemeSwitch />
      </header>
      <div
        style={{ paddingTop: "6rem", paddingBottom: "6rem", height: "100vh" }}
      >
        {content}
      </div>
    </>
  );
};

export default Header;
