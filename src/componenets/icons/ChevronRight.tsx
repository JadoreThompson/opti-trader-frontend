import { FC } from "react";

const ChevronRight: FC<{
  className?: string;
  fill?: string;
  size?: string;
}> = ({ className = "", fill = "gold", size = "100px" }) => {
  return (
    <svg
      fill={fill}
      className={className}
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {" "}
      <path
        d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z"
        fill={fill}
      />{" "}
    </svg>
  );
};

export default ChevronRight;
