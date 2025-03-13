import { FC, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import CustomHeader from "../componenets/CustomHeader";
import DefaultLayout from "../componenets/DefaultLayout";
import EditProfileCard from "../componenets/EditProfileCard";
import LockIcon from "../componenets/icons/LockIcon";
import { Profile, useProfile } from "../contexts/useProfile";
import UtilsManager from "../utils/classses/UtilsManager";

const UserPage: FC = () => {
  const { username } = useParams();
  const { profile } = useProfile();
  const [userProfile, setUserProfile] = useState<Profile | undefined>(
    undefined
  );
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      if (profile.username === username) {
        setUserProfile(profile);
        setIsUser(true);
        return;
      }
    }

    (async () => {
      try {
        const data = await UtilsManager.fetchProfile(username);
        if (data['is_user']) {
          setIsUser(true);
        }
        setUserProfile(data as unknown as Profile);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [profile]);

  return (
    <>
      <CustomHeader />

      <DefaultLayout
        element={
          <>
            {showEditProfile && (
              <>
                {ReactDOM.createPortal(
                  <div
                    className="w-full h-full fixed flex align-center justify-center"
                    style={{ top: "0", backdropFilter: "blur(1px)" }}
                  >
                    <div className="edit-profile-container flex align-center justify-center">
                      <EditProfileCard
                        setShow={setShowEditProfile}
                        imgSrc={userProfile!.avatar}
                      />
                    </div>
                  </div>,
                  document.body
                )}
              </>
            )}

            {userProfile && (
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
                            src={userProfile!.avatar ?? undefined}
                            alt=""
                            className="h-full w-full cover"
                          />
                        </div>
                      </div>
                      <div className="h-full flex-column align-center justify-end">
                        <div>
                          <h2 className="bold w-full">
                            {userProfile!.username}
                          </h2>
                        </div>
                      </div>
                    </div>
                    {isUser && (
                      <div className="flex align-start h-full">
                        <button
                          className="btn btn-default bg-background-secondary border-none hover-pointer"
                          style={{ height: "2rem" }}
                          onClick={() => setShowEditProfile(true)}
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!userProfile && (
              <div className="overlay-container flex align-center justify-center pointer-events-none">
                <div className="flex-column align-center g-2">
                  <LockIcon fill="white" />
                  <span className="span-lg">Sorry user not found</span>
                </div>
              </div>
            )}
          </>
        }
      />
    </>
  );
};

export default UserPage;
