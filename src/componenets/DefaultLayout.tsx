import { FC } from "react";
import { FaChartArea, FaNewspaper, FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useIsLoggedIn } from "../contexts/useIsLoggedIn";
import { useProfile } from "../contexts/useProfile";

const DefaultLayout: FC<{ element: JSX.Element }> = ({ element }) => {
  const navigate = useNavigate();
  const { profile, setProfile } = useProfile();
  const { isLoggedIn, setIsLoggedIn } = useIsLoggedIn();

  return (
    <>
      <div
        id="sidebar"
        className="fixed h-full-view flex-column justify-between p-sm bg-background-primary"
      >
        <div className="w-full flex-column g-2 justif-start">
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
        <div className="login-logout h-full w-full" style={{ height: "2rem" }}>
          {isLoggedIn ? (
            <button
              type="button"
              className="btn btn-primary border-none hover-pointer h-full w-full"
              onClick={async () => {
                try {
                  await fetch(
                    import.meta.env.VITE_BASE_URL + "/auth/remove-token",
                    { method: "GET", credentials: "include" }
                  );
                  setIsLoggedIn(false);
                  setProfile(undefined);
                } catch (err) {}
              }}
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-green border-none hover-pointer h-full"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
      <main className="p-md">{element}</main>
    </>
  );
};

export default DefaultLayout;
