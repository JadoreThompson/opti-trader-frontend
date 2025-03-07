import { FC, useRef, useState } from "react";
import CloseIcon from "./icons/CloseIcon";
import PencilIcon from "./icons/PencilIcon";

const EditProfileCard: FC<{
  setShow: (arg: boolean) => void;
  imgSrc: string;
}> = ({ setShow, imgSrc }) => {
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(imgSrc);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarImgRef = useRef<HTMLImageElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  async function saveChanges(): Promise<void> {
    try {
    } catch (err) {}
  }

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        className="fixed hidden"
        style={{ height: "10px", width: "10px", pointerEvents: "none" }}
        onChange={(e) => {
          if (avatarImgRef.current) {
            const file = e.target.files![0];
            setCurrentImgSrc(URL.createObjectURL(file));
          }
        }}
      />
      <div className="w-full h-full flex-column justify-between border-radius-primary bg-background-primary">
        <div>
          <div
            className="w-full flex justify-between p-md"
            style={{
              height: "4rem",
            }}
            onClick={() => setShow(false)}
          >
            <div>
              <h3>Edit Profile</h3>
            </div>
            <div className="w-auto h-full flex align-center justify-center hover-pointer">
              <CloseIcon size="85%" />
            </div>
          </div>
          <div
            className="w-full flex align-center justify-center"
            style={{ height: "5rem" }}
          >
            <div
              className="tooltip-container h-full border-radius-primary overflow-hidden"
              style={{ width: "5rem" }}
            >
              <img
                ref={avatarImgRef}
                src={currentImgSrc}
                alt=""
                className="h-full w-full cover"
              />
              <div
                className="tooltip-item absolute border-radius-primary border-default p-md flex align-center justify-center w-full h-full hover-pointer"
                style={{
                  top: "0",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(1px)",
                }}
                onClick={() => {
                  if (avatarInputRef.current) {
                    avatarInputRef.current.click();
                  }
                }}
              >
                <PencilIcon />
              </div>
            </div>
          </div>
          <div className="w-full flex-col" style={{ height: "3.5rem" }}>
            <div style={{ height: "1.5rem" }}>
              <label htmlFor="username" className="">
                Username
              </label>
            </div>
            <input
              ref={usernameInputRef}
              type="text"
              className="w-full p-sm border-radius-primary border-none bg-background-secondary"
              style={{ height: "2rem" }}
            />
          </div>
        </div>
        <div className="w-full" style={{ height: "2rem" }}>
          <button
            type="submit"
            className="btn btn-blue border-none w-full h-full hover-pointer"
            onClick={() => saveChanges()}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default EditProfileCard;
