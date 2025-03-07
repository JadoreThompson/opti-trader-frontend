import { FC } from "react";

const Pencil: FC<{ className?: string; fill?: string; size?: string }> = ({
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
        d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2v2zM6 16H4v4h4v-2H6v-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Pencil;
