import { FC, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaBook } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import CustomHeader from "../componenets/CustomHeader";
import DefaultLayout from "../componenets/DefaultLayout";
import EditProfileCard from "../componenets/EditProfileCard";
import OrdersTable from "../componenets/OrdersTable";
import LockIcon from "../componenets/icons/LockIcon";
import { Profile, useProfile } from "../contexts/useProfile";
import UtilsManager from "../utils/classses/UtilsManager";
import { MarketType, OrderStatus } from "../utils/types";
import { PaginatedOrders } from "./TradingPage";

const UserPage: FC = () => {
  const { username } = useParams();
  const { profile } = useProfile();

  const [userProfile, setUserProfile] = useState<Profile | undefined>(
    undefined
  );
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [orders, setOrders] = useState<Record<string, any>[] | undefined>(
    undefined
  );
  const [ordersTableRenderProp, setOrdersTableRenderProp] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [instrument, setInstrument] = useState<string | undefined>(undefined);
  const [marketType, setMarketType] = useState<MarketType>(MarketType.FUTURES);
  const [tablePage, setTablePage] = useState<number>(0);
  const [isUser, setIsUser] = useState<boolean>(false);
  const [tab, setTab] = useState<number>(0);

  const ordersFilter: OrderStatus[] = [OrderStatus.CLOSED];

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
        if (data.is_user) {
          setIsUser(true);
        }
        setUserProfile(data as unknown as Profile);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [profile]);

  useEffect(() => {
    if (tab === 0) {
      (async () => {
        const data = await getOrders(username!);
        if (data) {
          setOrders(UtilsManager.removeDuplicateOrders(data.orders, orders));
          setHasNextPage(data.has_next_page);
          setOrdersTableRenderProp(ordersTableRenderProp + 1);
        }
      })();
    }
  }, [username, tab]);

  useEffect(() => console.log(orders), [orders]);

  async function getOrders(username: string) {
    try {
      const rsp = await fetch(
        import.meta.env.VITE_BASE_URL +
          `/account/orders?username=${username}${
            instrument ? `&instrument=${instrument}` : ""
          }&market_type=${marketType}&status=${ordersFilter[0]}&page=${Math.max(
            0,
            tablePage - 1
          )}`,
        { method: "GET", credentials: "include" }
      );

      const data = await rsp.json();
      if (!rsp.ok) throw new Error(data["detail"]);
      return data as PaginatedOrders;
    } catch (err) {
      UtilsManager.toastError((err as Error).message);
    }
  }

  const contentOptions: Record<number, JSX.Element> = {
    0: (
      <OrdersTable
        orders={orders!}
        filter={ordersFilter}
        page={tablePage}
        setPage={setTablePage}
        allowClose={false}
        hasNextPage={hasNextPage}
        showSnackbar={false}
      />
    ),
  };

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
                  <div
                    className="w-full flex align-center justify-start"
                    style={{ height: "2rem" }}
                  >
                    {[
                      {
                        icon: FaBook,
                        text: "Trades",
                      },
                    ].map((obj, ind) => (
                      <button
                        key={ind}
                        className={`btn bg-transparent border-none hover-pointer flex g-1 ${
                          tab === ind ? "text-white" : "text-grey"
                        }`}
                        type="button"
                        onClick={() => setTab(ind)}
                      >
                        <obj.icon fill={tab === ind ? "white" : "grey"} />
                        {obj.text}
                      </button>
                    ))}
                  </div>
                  <div
                    className="h-full w-full"
                    // style={{ backgroundColor: "red" }}
                  >
                    {contentOptions[tab]}
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
