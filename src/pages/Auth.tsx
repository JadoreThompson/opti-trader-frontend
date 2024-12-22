import axios from "axios";
import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "typescript-cookie";
import Login from "./Login";
import Register from "./Register";

const Auth: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState<boolean | null>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showTokenBox, setShowTokenBox] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (location.pathname === "/auth/register") {
      setIsRegistering(true);
    } else if (location.pathname === "/auth/login") {
      setIsRegistering(false);
    }
  }, [location.pathname]);

  const loginHandler: (arg: React.FormEvent<HTMLFormElement>) => void = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    );

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/accounts/login",
        formData,
        { headers: { Authorization: `Bearer ${getCookie("jwt")}` } }
      );

      setCookie("jwt", data?.token);
      localStorage.setItem("username", data?.username);
      navigate("/dashboard/trade");
    } catch (e) {
      console.error(e);
    }
  };

  const registerHandler: (
    arg: React.FormEvent<HTMLFormElement>
  ) => Promise<void> = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    );

    try {
      if (!showTokenBox) {
        await axios.post("http://127.0.0.1:8000/accounts/register", formData);
        setShowTokenBox(true);
      } else {
        console.log(formData);
        const { data } = await axios.post(
          "http://127.0.0.1:8000/accounts/authenticate",
          formData
        );

        
        setCookie("jwt", data?.token);
        localStorage.setItem("username", data?.username);
        setShowOnboarding(true);
      }
    } catch (e) {
      if (e instanceof axios.AxiosError) {
        document.getElementById("errorMessage")!.textContent =
          e.response?.data.error;
      }
      console.error(e);
    }
  };

  return (
    <>
      {isRegistering ? (
        <Register
          submitHandler={registerHandler}
          showTokenBox={showTokenBox}
          showOnboarding={showOnboarding}
        />
      ) : (
        <Login handleSubmit={loginHandler} />
      )}
    </>
  );
};

export default Auth;
