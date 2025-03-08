import { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IsLoggedInContext } from "../contexts/IsLoggedInContext";
import UtilsManager from "../utils/classses/UtilsManager";
import Coin from "./icons/CoinIcon";
import WalletIcon from "./icons/WalletIcon";

const CustomHeader: FC<{
  renderProp?: any;
  avatar?: string;
  balance?: string;
  username?: string;
}> = ({ renderProp, avatar, balance, username }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(IsLoggedInContext);
  return (
    <header
      className={`${renderProp} fixed w-full bg-background-primary`}
      style={{
        height: "3rem",
        borderBottom: "1px solid var(--background-color-secondary)",
      }}
    >
      <div className="w-full h-full j-between flex-row p-xs">
        <div className="h-full w-full">
          <img src="../src/assets/images/Logo.png" alt="" className="h-full cover" />
        </div>

        {balance !== undefined && (
          <div className="h-full w-full flex-center">
            <div className="h-full border-bg-secondary border-radius-primary p-xs flex-center g-2">
              <div className="h-full w-auto flex g-1 align-center">
                <Coin size={"100%"} />
                <span className="span-lg bold">
                  {balance ? UtilsManager.formatPrice(balance) : ""}
                </span>
              </div>
              <div className="h-full w-auto flex align-center">
                <WalletIcon size="100%" />
              </div>
            </div>
          </div>
        )}
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
            href={username ? `/user/${username}` : "#"}
            className="h-full flex align-center g-1 border-radius-primary p-xs hover-pointer"
          >
            {avatar && (
              <div
                className="border-radius-primary h-full overflow-hidden"
                style={{ width: "2rem" }}
              >
                <img src={avatar} alt="" className="h-full w-full cover" />
              </div>
            )}
            <span className="bold span-lg">{username}</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
