import { FC } from "react";

const WalletIcon: FC<{ fill?: string; size?: string }> = ({
  fill = "var(--color)",
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
        d="M18 3H2v18h18v-4h2V7h-2V3h-2zm0 14v2H4V5h14v2h-8v10h8zm2-2h-8V9h8v6zm-4-4h-2v2h2v-2z"
        fill={fill}
      />
    </svg>
  );
};

export default WalletIcon;
