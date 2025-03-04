import { createContext } from "react";

interface isLoggedInProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (arg: boolean) => void;
}

export const IsLoggedInContext = createContext<isLoggedInProps>({
    isLoggedIn: false,
    setIsLoggedIn: (arg: boolean): void => {}
})