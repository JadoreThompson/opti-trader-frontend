import { FC } from "react";

const ChartIcon: FC<{
  className?: string;
  fill?: string;
  size?: string;
}> = ({ className = "", fill = "white", size = "100px" }) => {
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
        d="M3 4h2v14h16v2H3V4zm6 10H7v2h2v-2zm2-2v2H9v-2h2zm2 0v-2h-2v2h2zm2 0h-2v2h2v-2zm2-2h-2v2h2v-2zm2-2v2h-2V8h2zm0 0V6h2v2h-2z"
        fill={fill}
      />
    </svg>
  );
};

export default ChartIcon;
