import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useUserOrders = create(
  combine(
    {
      orders: [],
    },
    (set) => {
      return {
        setOrders: (newOrders: any) => {
          set((state) => ({
            orders:
              typeof newOrders === "function"
                ? newOrders(state.orders)
                : newOrders,
          }));
        },
      };
    }
  )
);
