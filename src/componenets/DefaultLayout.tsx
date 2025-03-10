import { FC, useContext } from "react";
import { IsLoggedInContext } from "../contexts/IsLoggedInContext";
import ChartIcon from "./icons/ChartIcon";
import UserIcon from "./icons/UserIcon";

const DefaultLayout: FC<{ element: JSX.Element }> = ({ element }) => {
  const { isLoggedIn } = useContext(IsLoggedInContext);

  return (
    <>
      <div
        id="sidebar"
        className="fixed flex-column g-2 justify-start h-full p-sm"
        style={{ width: "4.5rem", backgroundColor: "#101012" }}
      >
        <a
          href="/"
          className="w-full btn btn-default border-none hover-pointer tooltip-container"
          style={{ height: "2rem" }}
        >
          <div className="w-full h-full flex align-center justify-center">
            <ChartIcon size="2rem" />
          </div>
          <div
            className="tooltip-item h-full bg-background-secondary flex align-center justify-center border-radius-primary p-sm"
            style={{ right: "-120%", zIndex: 999 }}
          >
            Trade
          </div>
        </a>
        {isLoggedIn && (
          <a
            href={`/user/${1}`}
            className="w-full btn btn-default border-none hover-pointer tooltip-container"
            style={{ height: "2rem" }}
          >
            <div className="w-full h-full flex align-center justify-center">
              <UserIcon size="2rem" />
            </div>
            <div
              className="tooltip-item h-full bg-background-secondary flex align-center justify-center border-radius-primary p-sm"
              style={{ right: "-120%", zIndex: 999 }}
            >
              Profile
            </div>
          </a>
        )}
      </div>
      <main>{element}</main>
    </>
  );
};

export default DefaultLayout;
