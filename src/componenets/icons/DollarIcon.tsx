import { FC } from "react";

const DollarIcon: FC<{ fill?: string; size?: string }> = ({
  fill = "white",
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
        d="M11 2h2v4h6v2H7v3H5V6h6V2zM5 18h6v4h2v-4h6v-2H5v2zm14-7H5v2h12v3h2v-5z"
        fill={fill}
      />
    </svg>
  );
};

export default DollarIcon;
