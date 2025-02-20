import { FC } from "react";

const ArrowDown: FC<{ className?: string; fill?: string; size?: string }> = ({
  className,
  fill = "white",
  size = "100px",
}) => {
  return (
    <svg
      className={className}
      fill={fill}
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M11 4h2v12h2v2h-2v2h-2v-2H9v-2h2V4zM7 14v2h2v-2H7zm0 0v-2H5v2h2zm10 0v2h-2v-2h2zm0 0v-2h2v2h-2z"
        fill={fill}
      />
    </svg>
  );
};

export default ArrowDown;
