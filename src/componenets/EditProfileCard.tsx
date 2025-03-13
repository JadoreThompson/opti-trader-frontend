import React, { FC, useRef, useState } from "react";
import { Profile, useProfile } from "../contexts/useProfile";
import CloseIcon from "./icons/CloseIcon";
import PencilIcon from "./icons/PencilIcon";

const EditProfileCard: FC<{
  setShow: (arg: boolean) => void;
  imgSrc: string;
}> = ({ setShow, imgSrc }) => {
  const { setProfile } = useProfile();
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(imgSrc);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarImgRef = useRef<HTMLImageElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  async function saveChanges(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    let formData: Record<string, any> = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries()
    );

    Object.keys(formData).forEach((k) => {
      const value = formData[k];
      if (value instanceof File) {
        delete formData[k];
      }
    });

    if (Object.keys(formData).length == 0) return;

    try {
      const rsp = await fetch(
        import.meta.env.VITE_BASE_URL + "/account/update",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!rsp.ok) {
        const data = await rsp.json();
        throw new Error(data["detail"]);
      }

      setProfile((state) => ({ ...(state ?? {}), ...formData } as Profile));
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <>
      <form onSubmit={saveChanges} className="w-full h-full">
        <input
          ref={avatarInputRef}
          type="file"
          name="avatar"
          className="fixed hidden"
          style={{ height: "10px", width: "10px", pointerEvents: "none" }}
          onChange={(e) => {
            if (avatarImgRef.current) {
              const file = e.target.files![0];
              setCurrentImgSrc(URL.createObjectURL(file));
            }
          }}
        />
        <div className="w-full h-full flex-column g-3 p-sm justify-between border-radius-primary bg-background-primary">
          <div className="flex-column g-3">
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
            <div className="w-full flex-col" style={{ height: "3.5rem" }}>
              <div style={{ height: "1.5rem" }}>
                <label htmlFor="username" className="">
                  Email
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
            >
              Save
            </button>
          </div>
          {errorMsg && (
            <div
              className="w-full flex align-center justify-center"
              style={{ height: "2rem" }}
            >
              <span className="error">{errorMsg}</span>
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default EditProfileCard;
