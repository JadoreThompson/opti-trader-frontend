import axios from "axios";
import { FC } from "react";
import { MarketType, OrderType } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const CopyTradeForm: FC<{
  username: string;
  visible: boolean;
  setVisible: (arg: boolean) => void;
}> = ({ username, visible, setVisible }) => {
  const checkboxHandler = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    const targetElement = e.target as HTMLElement;
    const checkbox = targetElement.querySelector(
      "input[type=checkbox]"
    ) as HTMLInputElement;

    if (targetElement.classList.contains("active")) {
      checkbox.checked = false;
      targetElement.classList.remove("active");
    } else {
      checkbox.checked = true;
      targetElement.classList.add("active");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const payload = {
      ...{ username: username },
      ...Object.fromEntries(
        Array.from(new FormData(e.target as HTMLFormElement).entries()).map(
          ([k, v]) => [k, v ? true : false]
        )
      ),
    };

    try {
      await axios.post(
        RequestBuilder.getBaseUrl() + "/portfolio/copy",
        payload,
        RequestBuilder.constructHeader()
      );
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <div
        className="overlay-container d-flex justify-center align-center"
        style={{ display: `${visible ? "flex" : ""}` }}
      >
        <div className="card overlay">
          <div className="d-flex justify-end">
            <svg
              className="icon"
              onClick={() => {
                setVisible(false);
              }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M5 3H3v18h18V3H5zm14 2v14H5V5h14zm-8 4H9V7H7v2h2v2h2v2H9v2H7v2h2v-2h2v-2h2v2h2v2h2v-2h-2v-2h-2v-2h2V9h2V7h-2v2h-2v2h-2V9z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
          <form action="" onSubmit={handleSubmit}>
            <div className="d-row dual-button w-100 align-center">
              {Object.values(MarketType).map((value, index) => (
                <button
                  key={index}
                  className="btn w-100 text-secondary"
                  onClick={checkboxHandler}
                >
                  {value.toUpperCase()}
                  <input
                    type="checkbox"
                    name={value}
                    id={value}
                    style={{ height: 0 }}
                  />
                </button>
              ))}
            </div>
            <div className="d-row dual-button w-100 align-center">
              {[OrderType.LIMIT_ORDER, OrderType.MARKET_ORDER].map(
                (value, index) => (
                  <button
                    className="btn w-100 text-secondary"
                    onClick={checkboxHandler}
                  >
                    {value.toUpperCase()}
                    <input
                      type="checkbox"
                      name={value}
                      id={value}
                      style={{ height: 0 }}
                    />
                  </button>
                )
              )}
            </div>
            <div className="">
              <button
                className="btn w-100 border-radius-2 primary"
                type="submit"
              >
                Copy
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CopyTradeForm;
