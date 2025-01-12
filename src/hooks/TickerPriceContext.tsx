import { createContext } from "react";

interface TickerPriceContextType {
    lastPrice: number | null;
    setLastPrice: (arg: number) => void;
    currentPrice: number | null;
    setCurrentPrice: (arg: number) => void;
}

const TickerPriceContext = createContext<TickerPriceContextType>({
    lastPrice: null,
    setLastPrice: () => {
        throw new Error("setLastPrice function must be overridden via a provider");
    },
    currentPrice: null,
    setCurrentPrice: () => {
        throw new Error("setCurrentPrice function must be overridden via a provider");
    },
});

export default TickerPriceContext;
