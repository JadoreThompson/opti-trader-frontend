import { FC } from "react";

const Coin: FC<{ fill?: string; size?: string }> = ({
  fill = "gold",
  size = "100px",
}) => {
  return (
    <svg
      height={size}
      width={size}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z"
        fill={fill}
      />
    </svg>
  );
};

export default Coin;
