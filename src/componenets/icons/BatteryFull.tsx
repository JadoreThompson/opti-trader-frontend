import { FC } from "react";

const BatteryFull: FC<{ className?: string; fill?: string; size?: string }> = ({
  className = "",
  fill = "white",
  size = "100px",
}) => {
  return (
    <svg
      fill={fill}
      className={className}
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M18 5H2v14h18v-4h2V9h-2V5h-2zm0 2v10H4V7h14zM8 9H6v6h2V9zm2 0h2v6h-2V9zm6 0h-2v6h2V9z"
        fill={fill}
      />
    </svg>
  );
};

export default BatteryFull;
