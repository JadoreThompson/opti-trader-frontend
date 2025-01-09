import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Register from "./Register";

const Auth: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  useEffect(() => {
    const p = location.pathname.split("/")[2];
    p === "login" ? setIsRegistering(false) : setIsRegistering(true);
  }, [location.pathname]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/trade");
    }
  }, [isLoggedIn]);

  return <>{isRegistering ? <Register /> : null}</>;
};

export default Auth;
