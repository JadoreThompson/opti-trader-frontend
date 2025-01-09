import axios from "axios";
import { FC, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBodyStyles } from "../utils/BodyStyles";
import RequestBuilder from "../utils/RequestBuilder";
import SiteThemeSwitch from "./SiteThemeSwitch";

const Onboarding: FC<{ setIsLoggedIn: (arg: boolean) => void }> = ({ setIsLoggedIn }) => {
  const bodyStyles = useBodyStyles();
  const navigate = useNavigate();
  const payload = useRef<Record<string, boolean>>({});

  async function handleChoice(
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    e.preventDefault();

    const element = e.target as HTMLButtonElement;
    payload.current = {
      ...payload.current,
      ...{ [element.name]: String(element.value).trim() ? true : false },
    };

    try {
      await axios.post(
        RequestBuilder.getBaseUrl() + "/accounts/modify",
        payload.current,
        RequestBuilder.constructHeader()
      );
    } catch (err) {
      console.error(err);
    }
    setIsLoggedIn(true);
    // navigate("/trade");
  }

  return (
    <>
      <SiteThemeSwitch />
      <div className="card border-grey d-col container justify-center align-center">
        <div className="w-50 h-100 d-col justify-center align-center g-1">
          <div className="">
            <svg
              className="icon"
              style={{ height: "10rem" }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
          <div className="w-100">
            <h2>Make account Visible</h2>
            <span>
              Other trades will be able to copy your trades and view your
              profile
            </span>
          </div>
          <div className="d-row g-1 w-50">
            <button
              value={"y"}
              name="visible"
              className="btn primary w-100"
              style={{ height: "3rem" }}
              onClick={handleChoice}
            >
              Make visible
            </button>
            <button
              className="btn w-100"
              value={""}
              name="visible"
              onClick={handleChoice}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;
