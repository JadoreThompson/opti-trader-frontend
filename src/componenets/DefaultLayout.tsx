import { FC } from "react";
import { FaChartArea, FaNewspaper, FaUser } from "react-icons/fa6";
import { useIsLoggedIn } from "../contexts/useIsLoggedIn";
import { useProfile } from "../contexts/useProfile";

const DefaultLayout: FC<{ element: JSX.Element }> = ({ element }) => {
  const { isLoggedIn } = useIsLoggedIn();
  const { profile } = useProfile();

  return (
    <>
      <div
        id="sidebar"
        className="fixed flex-column g-2 justify-start h-full p-sm"
        style={{
          width: "4.5rem",
          boxShadow: "0 0 5px 1px #970707",
        }}
      >
        {isLoggedIn && profile && (
          <a
            href={`/user/${profile!.username}`}
            className="w-full btn btn-default border-none hover-pointer tooltip-container"
            style={{ height: "2rem" }}
          >
            <div className="w-full h-full flex align-center justify-center">
              <FaUser />
            </div>
            <div
              className="tooltip-item h-full bg-background-secondary flex align-center justify-center border-radius-primary p-sm"
              style={{ right: "-153%", zIndex: 999 }}
            >
              Profile
            </div>
          </a>
        )}
        <a
          href="/futures/BTCUSD"
          className="w-full btn btn-default border-none hover-pointer tooltip-container"
          style={{ height: "2rem" }}
        >
          <div className="w-full h-full flex align-center justify-center">
            <FaChartArea />
          </div>
          <div
            className="tooltip-item h-full bg-background-secondary flex align-center justify-center border-radius-primary p-sm"
            style={{ right: "-120%", zIndex: 999 }}
          >
            Trade
          </div>
        </a>
        <a
          href="/instruments"
          className="tooltip-container w-full btn btn-default border-none hover-pointer"
          style={{ height: "2rem" }}
        >
          <div className="w-full h-full flex align-center justify-center">
            <FaNewspaper />
          </div>
          <div
            className="tooltip-item h-full bg-background-secondary flex align-center justify-center border-radius-primary p-sm"
            style={{ right: "-218%", zIndex: 999 }}
          >
            Instruments
          </div>
        </a>
      </div>
      <main className="p-md">{element}</main>
    </>
  );
};

export default DefaultLayout;
