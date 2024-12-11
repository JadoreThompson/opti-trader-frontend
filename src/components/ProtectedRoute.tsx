import { ReactElement, FC } from "react";
import { Navigate } from "react-router-dom";
import { getCookie } from "typescript-cookie";


const ProtectedRoute: FC<{ element: ReactElement }> = ({ element }) => {
    if (getCookie('jwt')) { return element; }
    else { return <Navigate to="/auth/login" replace={true} />; }
};

export default ProtectedRoute;