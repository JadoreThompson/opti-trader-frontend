import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "typescript-cookie";

const Register: FC<{
  submitHandler: (e: React.FormEvent<HTMLFormElement>) => void;
  showTokenBox: boolean;
  showOnboarding: boolean;
}> = ({ submitHandler, showTokenBox, showOnboarding }) => {
  const navigate = useNavigate();
  const payload = useRef<Record<string, string | boolean>>({});
  const [screenNum, setScreenNum] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  const addFeature: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    add: boolean
  ) => void = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    add: boolean
  ): void => {
    const key = (e.target as HTMLElement).parentElement?.parentElement
      ?.querySelector("i")
      ?.getAttribute("data-key");

    payload.current[String(key)] = add;
    setScreenNum((prev) => (prev += 1));
  };

  const resendToken: (
    e: React.PointerEvent<HTMLDivElement>
  ) => void = async () => {
    if (showCountdown) {
      return;
    }
    const formData = Object.fromEntries(
      new FormData(
        document.getElementById("registerForm") as HTMLFormElement
      ).entries()
    );

    if (
      ["email", "password", "username"].every((s) =>
        (formData[s] as string).trim()
      )
    ) {
      try {
        await axios.post("http://127.0.0.1:8000/accounts/token", {
          email: formData["email"],
        });
        setShowCountdown(true);
      } catch (e) {
        if (e instanceof axios.AxiosError) {
          (document.getElementById(
            "errorMessage"
          ) as HTMLElement)!.textContent = e!.response!.data.error;
        }
      }
    }
  };

  useEffect(() => {
    if (showCountdown) {
      const sleep = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const countdown = async () => {
        const element = document.getElementById("resendToken");
        for (let i = 30; i > 0; i--) {
          element!.textContent = `Resend ${i}`;
          await sleep(1000);
        }
        element!.textContent = "Resend token?";
        setShowCountdown(false);
      };
      countdown();
    }
  }, [showCountdown]);

  useEffect(() => {
    const sendData = async () => {
      if (screenNum === 1) {
        try {
          const { data } = await axios.post(
            "http://127.0.0.1:8000/accounts/modify",
            payload.current,
            { headers: { Authorization: `Bearer ${getCookie("jwt")}` } }
          );

          localStorage.setItem("username", data?.username);
          setCookie("jwt", data?.token);
          navigate("/dashboard/trade");
        } catch (e) {
          console.error(e);
        }
      }
    };

    sendData();
  }, [screenNum]);

  return (
    <>
      {showOnboarding ? (
        <div className="container auth-container">
          <div className="card auth-card onboarding">
            {
              {
                0: (
                  <>
                    <div className="card-body">
                      <i
                        data-key="visible"
                        className="fa-solid fa-binoculars"
                      ></i>
                      <div className="onboard-msg">
                        <h1>Make your account visible</h1>
                        <p>
                          Allow other people to view and track your portfolio
                        </p>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          addFeature(e, true);
                        }}
                      >
                        Allow
                      </button>
                      <button className="btn btn-secondary">
                        Skip for now
                      </button>
                    </div>
                  </>
                ),
              }[screenNum]
            }
          </div>
        </div>
      ) : (
        <div className="container auth-container">
          <div className="card auth-card">
            <div className="card-title">
              <h1>Register</h1>
            </div>
            <form id="registerForm" onSubmit={submitHandler}>
              <input type="text" name="username" placeholder="Username" />
              <input type="text" name="email" placeholder="Email" />
              <input type="text" name="password" placeholder="Password" />
              {showTokenBox ? (
                <>
                  <input type="text" name="token" placeholder="Enter Token" />
                  <div
                    className=""
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem" }}>
                      We sent a code to your inbox ·
                    </div>
                    <div
                      id="resendToken"
                      style={{
                        fontSize: "0.8rem",
                        marginLeft: "3px",
                        color: "#2383E2",
                        cursor: showCountdown ? "auto" : "pointer",
                        marginBottom: "0.5rem",
                      }}
                      onPointerDown={resendToken}
                    >
                      Resend token?
                    </div>
                  </div>
                </>
              ) : null}
              <button type="submit" className="btn btn-primary">
                Register
              </button>
            </form>
            <div className="card-footer">
              <p>
                Already have an account?{" "}
                <Link to="/auth/login" replace={true}>
                  login
                </Link>
              </p>
              <p style={{ color: "red" }} id="errorMessage"></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
