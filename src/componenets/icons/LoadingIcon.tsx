import { FC } from "react";

const LoadingIcon: FC<{ className?: string; fill?: string; size?: string }> = ({
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
        d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
        fill={fill}
      />{" "}
    </svg>
  );
};

export default LoadingIcon;
