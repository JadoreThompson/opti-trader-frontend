import { FC, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaBook, FaLayerGroup, FaLock, FaMagnifyingGlass } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import AUMCard from "../componenets/AUMCard";
import CustomHeader from "../componenets/CustomHeader";
import DefaultLayout from "../componenets/DefaultLayout";
import EditProfileCard from "../componenets/EditProfileCard";
import OrdersTable from "../componenets/OrdersTable";
import { Profile, useProfile } from "../contexts/useProfile";
import UtilsManager from "../utils/classses/UtilsManager";
import { MarketType, OrderStatus } from "../utils/types";
import { PaginatedOrders } from "./TradingPage";

const UserPage: FC = () => {
  const { username } = useParams();
  const { profile } = useProfile();

  const [tab, setTab] = useState<number>(0);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<Profile | undefined>(
    undefined
  );
  const [isUser, setIsUser] = useState<boolean>(false);
  const [orders, setOrders] = useState<Record<string, any>[] | undefined>([]);
  const [ordersTableRenderProp, setOrdersTableRenderProp] = useState<number>(0);
  const [requestOrders, setRequestOrders] = useState<number>(0);
  const [tablePage, setTablePage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [instrument, setInstrument] = useState<string | undefined>(undefined);
  const [marketType, setMarketType] = useState<MarketType>(MarketType.FUTURES);

  const ordersFilter: OrderStatus[] = [OrderStatus.CLOSED];
  const tablePageRef = useRef<number[]>([]);
  const instrumentInputRef = useRef<HTMLInputElement>(null);

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
      } catch (err) {}
    })();
  }, [profile]);

  useEffect(() => {
    if (tab === 0) {
      (async () => {
        const data = await getOrders(username!);

        if (data) {
          if (data.orders.length > 0) {
            setOrders(UtilsManager.removeDuplicateOrders(data.orders, orders));
          } else {
            setOrders([]);
          }

          setHasNextPage(data.has_next_page);
          setOrdersTableRenderProp(ordersTableRenderProp + 1);
          setTab(0);
        }
      })();
    }
  }, [username, tab]);

  useEffect(() => {
    if (tablePage > 1) {
      if (tablePageRef.current.includes(tablePage)) {
        return;
      }

      (async () => {
        const data = await getOrders(username!);

        if (data) {
          setOrders(UtilsManager.removeDuplicateOrders(data.orders, orders));
          setHasNextPage(data.has_next_page);
          setOrdersTableRenderProp(ordersTableRenderProp + 1);
          tablePageRef.current.push(tablePage);
        }
      })();
    }
  }, [tablePage]);

  useEffect(() => {
    (async () => {
      const data = await getOrders(username!);

      if (data) {
        if (data.orders.length > 0) {
          setOrders(UtilsManager.removeDuplicateOrders(data.orders, orders));
        } else {
          setOrders([]);
        }

        setHasNextPage(data.has_next_page);
        setOrdersTableRenderProp(ordersTableRenderProp + 1);
        setTab(0);
        setTablePage(1);
      }
    })();
  }, [requestOrders]);

  async function getOrders(username: string): Promise<PaginatedOrders | null> {
    try {
      let url: string =
        import.meta.env.VITE_BASE_URL + `/account/orders?username=${username}`;

      if (instrument) {
        url += `&instrument=${instrument}`;
      }

      url += `&market_type=${marketType}&status=${
        ordersFilter[0]
      }&page=${Math.max(0, tablePage - 1)}`;

      const rsp = await fetch(url, { method: "GET", credentials: "include" });
      const data = await rsp.json();

      if (!rsp.ok) throw new Error(data["detail"]);

      return data as PaginatedOrders;
    } catch (err) {
      UtilsManager.toastError((err as Error).message);
      return null;
    }
  }

  const contentOptions: Record<number, JSX.Element> = {
    0: (
      <OrdersTable
        orders={orders!}
        filter={ordersFilter}
        page={tablePage}
        setPage={setTablePage}
        allowModify={false}
        allowClose={false}
        hasNextPage={hasNextPage}
        showSnackbar={false}
      />
    ),
    1: <AUMCard username={username!}/>,
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
                      {
                        icon: FaLayerGroup,
                        text: "AUM",
                      }
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

                  {tab === 0 && (
                    <div className="w-full flex align-center justify-start">
                      <div
                        className="flex g-1 align-center justify-start border-default border-radius-secondary p-sm"
                        style={{ height: "2rem" }}
                      >
                        <FaMagnifyingGlass />
                        <input
                          ref={instrumentInputRef}
                          type="text"
                          className="border-none w-full h-full"
                          onBlur={(e) => {
                            const value: null | string = (
                              e.target as HTMLInputElement
                            ).value.trim();

                            if (value) {
                              setInstrument(value.trim());
                            } else {
                              setInstrument(undefined);
                            }

                            setRequestOrders(requestOrders + 1);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="h-full w-full" style={{ height: '20rem'}}>{contentOptions[tab]}</div>
                </div>
              </div>
            )}

            {!userProfile && (
              <div className="overlay-container flex align-center justify-center pointer-events-none">
                <div className="flex-column align-center g-2">
                  <FaLock fill="white" />
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
