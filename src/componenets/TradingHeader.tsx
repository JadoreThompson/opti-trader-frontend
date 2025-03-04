import { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IsLoggedInContext } from "../contexts/IsLoggedInContext";
import { Profile } from "../pages/AccountPage";
import UtilsManager from "../utils/classses/UtilsManager";
import Coin from "./icons/Coin";
import WalletIcon from "./icons/WalletIcon";

const TradingHeader: FC<{
  profile?: Profile;
}> = ({ profile }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(IsLoggedInContext);
  return (
    <header
      style={{
        height: "3rem",
        borderBottom: "1px solid var(--background-color-secondary)",
      }}
    >
      <div className="w-full h-full j-between flex-row p-xs">
        <div className="h-full w-full">
          <img src="src/assets/Logo.png" alt="" className="h-full" />
        </div>
        <div className="h-full w-full flex-center">
          <div className="h-full border-bg-secondary border-radius-primary p-xs flex-center g-2">
            <div className="h-full w-auto flex g-1 align-center">
              <Coin size={"100%"} />
              <span className="span-lg bold">
                {profile ? UtilsManager.formatPrice(profile.balance) : ""}
              </span>
            </div>
            <div className="h-full w-auto flex align-center">
              <WalletIcon size="100%" />
            </div>
          </div>
        </div>
        <div className="h-full w-full flex justify-end">
          {isLoggedIn ? (
            <button
              type="button"
              className="btn btn-primary border-none hover-pointer"
              onClick={async () => {
                try {
                  await fetch(
                    import.meta.env.VITE_BASE_URL + "/auth/remove-token",
                    { method: "GET", credentials: "include" }
                  );
                  window.location.reload();
                } catch (err) {}
              }}
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              className="btn green border-none hover-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
          <a
            href={`/user/${profile ? profile.username : ""}`}
            className="h-full flex align-center g-1 border-radius-primary p-xs hover-pointer"
          >
            <div
              className="border-radius-primary h-full overflow-hidden"
              style={{ width: "2rem" }}
            >
              <img
                src={profile ? profile.avatar : ""}
                alt=""
                className="h-full w-full cover"
              />
            </div>
            <span className="bold span-lg">
              {profile ? profile.username : ""}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;
