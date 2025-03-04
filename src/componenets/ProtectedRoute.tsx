import { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IsLoggedInContext } from "../contexts/IsLoggedInContext";
import LoadingScreen from "../pages/LoadingScreen";

const ProtectedRoute: FC<{ element: JSX.Element }> = ({ element }) => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(IsLoggedInContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL + "/auth/verify-token",
          { method: "GET", credentials: "include" }
        );

        if (!rsp.ok) throw new Error(rsp.statusText);
        setIsLoggedIn(true);
        setIsLoading(false);
      } catch (err) {
        setIsLoggedIn(false);
        setIsLoading(false);
        navigate("/login");
      }
    })();
  }, [navigate, setIsLoggedIn]);

  if (isLoading) {
    return <LoadingScreen stop={!isLoading} />;
  }

  if (isLoggedIn) {
    return element;
  }
};

export default ProtectedRoute;
