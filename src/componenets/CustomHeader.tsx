import { FC } from "react";
import { FaCoins, FaWallet } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useIsLoggedIn } from "../contexts/useIsLoggedIn";
import { useProfile } from "../contexts/useProfile";
import UtilsManager from "../utils/classses/UtilsManager";
import ViewListIcon from "./icons/ViewListIcon";

const CustomHeader: FC<{
  renderProp?: any;
}> = ({ renderProp }) => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useIsLoggedIn();
  const { profile, setProfile } = useProfile();

  return (
    <header
      className={`${renderProp} fixed w-full bg-background-primary`}
      style={{
        height: "3rem",
        borderBottom: "1px solid var(--background-color-secondary)",
        zIndex: 999,
      }}
    >
      <div className="w-full h-full j-between flex-row p-xs">
        <div className="h-full w-full">
          <img
            src="../src/assets/images/Logo.png"
            alt=""
            className="h-full cover"
          />
        </div>

        {profile?.balance !== undefined && (
          <div className="h-full w-full flex-center">
            <div className="h-full border-bg-secondary border-radius-primary flex-center g-2 overflow-hidden">
              <div className="h-full w-auto flex g-1 align-center p-xs">
                <FaCoins fill="gold" size="1.25rem" />
                <span className="span-lg bold">
                  {profile.balance
                    ? UtilsManager.formatPrice(profile.balance)
                    : ""}
                </span>
              </div>
              <div className="h-full w-auto flex align-center p-xs bg-secondary">
                <FaWallet size="1.25rem" fill="white" />
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
              className="btn btn-green border-none hover-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
          <button
            id="sidebarToggle"
            className="btn h-full bg-transparent border-none hover-pointer"
            type="button"
            style={{ backgroundColor: "red", width: "4rem" }}
            onClick={() => {
              const element = document.getElementById(
                "sidebar"
              ) as HTMLDivElement;
              if (element) {
                if (element.classList.contains("mobile")) {
                  element.classList.remove("mobile");
                } else {
                  element.classList.add("mobile");
                }
              }
            }}
          >
            <ViewListIcon size="3rem" fill="grey" />
          </button>
          {profile?.username && profile?.avatar && (
            <a
              href={profile.username ? `/user/${profile.username}` : "#"}
              className="h-full flex align-center g-1 border-radius-primary p-xs hover-pointer"
            >
              <div
                className="border-radius-primary h-full overflow-hidden"
                style={{ width: "2rem" }}
              >
                <img
                  src={profile.avatar}
                  alt=""
                  className="h-full w-full cover"
                />
              </div>

              <span className="bold span-lg">{profile.username}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
