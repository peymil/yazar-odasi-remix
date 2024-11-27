import {
  Box,
  Key,
  LogIn,
  LogOut,
  UserRoundPlus,
  MessageCircleQuestion,
  Percent,
  User,
  Wallet,
} from "lucide-react";
import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/lib/authUtils";
import React from "react";
// background: #FAFBFF;
// text-color: #9197B3;;
const Navbar = () => {
  const user = useOptionalUser();
  return (
    <>
      <div className=" h-36 sticky flex items-center justify-evenly text-[#9197B3]">
        <div className={"relative w-32 h-32"}>
          <img
            src={"https://cdn.yazarodasi.com/yazar_odasi_logo.svg"}
            alt={"yazar odasi logo"}
            sizes={"10vv"}
          />
        </div>
        <Link to="/about" className={"flex gap-2"}>
          <Key size={24} />
          <p>Anasayfa</p>
        </Link>
        <Link to="/services" className={"flex gap-2"}>
          <Box />
          <p>Öne Çıkanlar</p>
        </Link>
        <Link to="/contacts" className={"flex gap-2"}>
          <Percent />
          <p>Proje Keşfet</p>
        </Link>
        <Link to="/contacts" className={"flex gap-2"}>
          <Wallet />
          <p>Yazar Keşfet</p>
        </Link>
        <Link to="/contacts" className={"flex gap-2"}>
          <MessageCircleQuestion />
          <p>Açık Çağrılar</p>
        </Link>
        <form className="">
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg "
              placeholder="Yazar, Proje ya da Çağrı "
              required
            />
          </div>
        </form>

        {user ? (
          <>
            <Link to={`/user/${user.id}/profile`} className={"flex gap-2"}>
              <User />
              <p>Profil</p>
            </Link>
            <Link to="/auth/signout" className={"flex gap-2"}>
              <LogOut />
              <p>Çıkış Yap</p>
            </Link>
          </>
        ) : (
          <>
            <Link to="/auth/sign-in" className={"flex gap-2"}>
              <LogIn />
              <p>Giriş Yap / Üye ol</p>
            </Link>
            <Link to="/auth/sign-up" className={"flex gap-2"}>
              <UserRoundPlus />
              <p> Üye ol</p>
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
