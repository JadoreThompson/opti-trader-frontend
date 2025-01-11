// Hook used to manage the state of the current order table in view when trading

import { createContext } from "react";

interface CurrentOrdersTypes {
  currentOrders: Record<string, string | Number>[] | null;
  setCurrentOrders: (arg: Record<string, string | Number>[]) => void;
}

const CurrentOrders = createContext<CurrentOrdersTypes>({
    currentOrders: null,
    setCurrentOrders: () => { throw new Error('Must be implemented by provider') }
});


export default CurrentOrders