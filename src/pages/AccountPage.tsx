import { FC } from "react";

export interface Profile {
  avatar: string;
  username: string;
  balance: string;
}

const AccountPage: FC<{ profile?: Profile }> = ({ profile }) => {
  if (!profile) {
    profile = {
      avatar:
        "https://i.seadn.io/s/primary-drops/0xa06096e4640902c9713fcd91acf3d856ba4b0cc8/34399034:about:preview_media:b9117ca9-c56a-4c69-b3bf-5ec2d1ff3493.gif?auto=format&dpr=1&w=2048",
      username: "john_doe",
      balance: "1000",
    };
  }

  return (
    <div className="w-full h-full">
      <div className="w-full flex justify-start">
        <div
          className="h-full border-radius-primary overflow-hidden"
          style={{ width: "10%" }}
        >
          <img
            src={profile!.avatar ?? undefined}
            alt=""
            className="h-full w-full cover"
          />
        </div>

        <div className="h-full flex-col justify-center p-md">
          <span className="span-lg bold">{profile!.username}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
