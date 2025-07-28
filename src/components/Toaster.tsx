import type { FC } from "react";
import { Toaster as SonnerToaster } from "sonner";

const Toaster: FC = () => {
  return (
    <SonnerToaster
      toastOptions={{
        style: {
          background: "#141414",
          color: "white",
        },
      }}
    />
  );
};

export default Toaster;
