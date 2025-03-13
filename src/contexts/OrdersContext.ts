import { createContext } from "react";

interface UserOrdersContextProps {
  orders: Record<string, any>[];
  setOrders: (
    arg: Record<string, any>[] | ((arg: Record<string, any>[]) => Record<string, any>[])
  ) => void;
}

export const UserOrdersContext = createContext<UserOrdersContextProps>({
  orders: [],
  setOrders: (): void => {},
});
