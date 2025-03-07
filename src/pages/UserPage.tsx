import { FC, useState } from "react";
import ReactDOM from "react-dom";
import CustomHeader from "../componenets/CustomHeader";
import EditProfileCard from "../componenets/EditProfileCard";

export interface Profile {
  avatar: string;
  username: string;
  balance: string;
}

const UserPage: FC<{ profile?: Profile }> = ({ profile }) => {
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);

  if (!profile) {
    profile = {
      avatar:
        "https://i.seadn.io/s/primary-drops/0xa06096e4640902c9713fcd91acf3d856ba4b0cc8/34399034:about:preview_media:b9117ca9-c56a-4c69-b3bf-5ec2d1ff3493.gif?auto=format&dpr=1&w=2048",
      username: "john_doe",
      balance: "1000",
    };
  }

  return (
    <>
      <CustomHeader />
      <main>
        {showEditProfile && (
          <>
            {ReactDOM.createPortal(
              <div
                className="w-full h-full fixed flex align-center justify-center"
                style={{ top: "0", backdropFilter: "blur(1px)" }}
              >
                <div className="edit-profile-container" style={{}}>
                  <EditProfileCard
                    setShow={setShowEditProfile}
                    imgSrc={profile.avatar}
                  />
                </div>
              </div>,
              document.body
            )}
          </>
        )}

        <div className="w-full h-full flex justify-center">
          <div
            className="flex-column justify-start p-md mt-3"
            style={{ width: "75%" }}
          >
            <div
              className="w-full flex justify-between align-center p-md"
              style={{
                height: "7rem",
              }}
            >
              <div className="h-full flex g-3 align-center">
                <div className="h-full border-radius-primary relative">
                  <div
                    className="w-full h-full border-radius-primary overflow-hidden"
                    style={{ width: "5.5rem" }}
                  >
                    <img
                      src={profile!.avatar ?? undefined}
                      alt=""
                      className="h-full w-full cover"
                    />
                  </div>
                </div>
                <div className="h-full flex align-center justify-center">
                  <div>
                    <h2 className="bold w-full">{profile!.username}</h2>
                    <span className="text-grey w-full">
                      {(profile!["email"] as string) ?? "jack@email.com"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex align-start h-full">
                <button
                  className="btn btn-default bg-background-secondary border-none hover-pointer"
                  style={{ height: "2rem" }}
                  onClick={() => setShowEditProfile(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserPage;
