import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import { setCookie } from "typescript-cookie";
import RequestBuilder from "../utils/RequestBuilder";
import Utility from "../utils/Utility";

const Register: FC = () => {
  const emailRef = useRef<string>();
  const [displayConfirmationPage, setDisplayConfirmationPage] =
    useState<boolean>(true);
  const [countdown, setCountDown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const resendTokenButton = document.getElementById(
    "resendButton"
  ) as HTMLButtonElement;

  useEffect(() => {
    setErrorMessage(null);
    setResendDisabled(false);
  }, [displayConfirmationPage]);

  async function registerFormHandler(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    const payload = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries()
    );
    emailRef.current = payload.email as string;

    try {
      await axios.post(
        RequestBuilder.getBaseUrl() + "/accounts/register",
        payload
      );
      setDisplayConfirmationPage(true);
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        setErrorMessage(err.response?.data.error);
      }
    }
  }

  async function confirmationFormHandler(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (!emailRef.current) {
      setDisplayConfirmationPage(false);
      return;
    }

    const payload = {
      ...{ email: emailRef.current },
      ...Object.fromEntries(
        new FormData(e.target as HTMLFormElement).entries()
      ),
    };

    try {
      const { data } = await axios.post(
        RequestBuilder.getBaseUrl() + "/accounts/authenticate",
        payload
      );
      localStorage.setItem("username", data.username);
      setCookie("jwt", data.token);
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        setErrorMessage(err.response?.data.error);
      }
    }
  }

  useEffect(() => {
    async function delayResend(): Promise<void> {
      if (!resendTokenButton) {
        return;
      }

      if ((resendTokenButton as HTMLButtonElement).disabled === true) {
        const maxNum = 30;
        for (let i = maxNum; i > 0; i--) {
          await Utility.sleep(1000);
          setCountDown(i);
        }

        setResendDisabled(false);
        setCountDown(maxNum);
      }
    }

    if (resendDisabled) {
      delayResend();
    }

  }, [resendDisabled]);

  async function resendToken(
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    e.preventDefault();

    if (!emailRef.current) {
      setErrorMessage("Must register first");
      return;
    }

    try {
      await axios.post(RequestBuilder.getBaseUrl() + "/accounts/token", {
        email: emailRef.current,
      });
      setResendDisabled(true);
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        setErrorMessage(err.response?.data.error);
      }
    }
  }

  return (
    <>
      {displayConfirmationPage ? (
        <div className="card container d-col">
          <div className="d-row justify-start">
            <svg
              className="icon"
              onClick={() => {
                setDisplayConfirmationPage(false);
              }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
          <div className="w-100">
            <form onSubmit={confirmationFormHandler}>
              <label htmlFor="token">Enter token</label>
              <input
                type="text"
                className="w-100 rounded"
                name="token"
                id="token"
              />
              <div className="d-row" style={{ gap: "0.3rem" }}>
                <span className="secondary">We sent you a confirmation</span>
                <span className="secondary">•</span>
                <button
                  className="transparent"
                  style={{ color: "blue" }}
                  id="resendButton"
                  onClick={resendToken}
                  disabled={resendDisabled}
                >
                  Resend {resendDisabled ? countdown : null}
                </button>
              </div>
              <div className="w-100">
                <button
                  className="btn w-100 primary border-grey rounded"
                  type="submit"
                >
                  Confirm
                </button>
              </div>
              <div className="w-100 justify-center align-center">
                <span className="error">{errorMessage}</span>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card container">
          <form onSubmit={registerFormHandler}>
            <div className="w-100">
              <label htmlFor="username" className="secondary small">
                Username
              </label>
              <input
                className="w-100 rounded"
                type="text"
                name="username"
                id="username"
                required
              />
            </div>
            <div className="w-100">
              <label htmlFor="email" className="secondary small">
                Email
              </label>
              <input
                className="w-100 rounded"
                type="text"
                name="email"
                id="email"
                required
              />
            </div>
            <div className="w-100">
              <label htmlFor="password" className="secondary small">
                Password
              </label>
              <input
                className="w-100 rounded"
                type="text"
                name="password"
                id="password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn w-100 primary border-grey rounded"
              style={{
                boxShadow: "0px 3px 1px 0px red",
              }}
            >
              Create Account
            </button>
            <div className="w-100 align-center justify-center">
              <span className="error">{errorMessage}</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Register;
