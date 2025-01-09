import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Onboarding from "../components/Onboarding";
import Login from "./Login";
import Register from "./Register";

const Auth: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [cardNum, setCardNum] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // useEffect(() => {
  //   const p = location.pathname.split("/")[2];
  //   p === "login" ? setCardNum(0) : setCardNum(1);
  // }, [location.pathname]);

  useEffect(() => {
    if (showOnboarding) {
      setCardNum(2);
    }
  }, [showOnboarding]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/trade");
    }
  }, [isLoggedIn]);

  return (
    <>
      {cardNum === 0 ? <Login setIsLoggedIn={setIsLoggedIn}/> : null}
      {cardNum === 1 ? (
        <Register setShowOnboarding={setShowOnboarding} />
      ) : null}
      {cardNum === 2 ? <Onboarding setIsLoggedIn={setIsLoggedIn} /> : null}
    </>
  );
};

export default Auth;
