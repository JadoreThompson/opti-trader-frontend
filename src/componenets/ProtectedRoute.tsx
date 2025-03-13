import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsLoggedIn } from "../contexts/useIsLoggedIn";
import { useProfile } from "../contexts/useProfile";
import LoadingScreen from "../pages/LoadingScreen";
import UtilsManager from "../utils/classses/UtilsManager";

const ProtectedRoute: FC<{ element: JSX.Element }> = ({ element }) => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useIsLoggedIn();
  const { setProfile } = useProfile();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const rsp = await fetch(
          import.meta.env.VITE_BASE_URL + "/auth/verify-token",
          { method: "GET", credentials: "include" }
        );

        if (!rsp.ok) throw new Error(rsp.statusText);
        setIsLoggedIn(true);
        setProfile(await UtilsManager.fetchProfile());
      } catch (err) {
        setIsLoggedIn(false);
        setProfile(undefined);
      }

      setIsLoading(false);
    })();
  }, [navigate, setIsLoggedIn]);

  if (isLoading) {
    return <LoadingScreen stop={!isLoading} />;
  }

  return element;
};

export default ProtectedRoute;
