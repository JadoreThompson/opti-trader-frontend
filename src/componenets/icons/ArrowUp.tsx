import { FC } from "react";

const ArrowUp: FC<{ className?: string; fill?: string; size?: string }> = ({
  className,
  fill = "var(--color)",
  size = "100px",
}) => {
  return (
    <svg
      className={className}
      height={size}
      width={size}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2v12zM7 10V8h2v2H7zm0 0v2H5v-2h2zm10 0V8h-2v2h2zm0 0v2h2v-2h-2z"
        fill={fill}
      />
    </svg>
  );
};

export default ArrowUp;
