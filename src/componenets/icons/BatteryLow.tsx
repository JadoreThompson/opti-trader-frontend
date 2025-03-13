import { FC } from "react";
import { IconProps } from "../../utils/utils";


const BatteryLow: FC<IconProps> = ({
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
        d="M4 5H2v14h18v-4h2V9h-2V5H4zm14 2v10H4V7h14zM8 9H6v6h2V9z"
        fill={fill}
      />
    </svg>
  );
};

export default BatteryLow;
