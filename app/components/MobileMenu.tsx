"use client";

import Sidebar from "./AdminSidebar";
import { CiMenuFries } from "react-icons/ci";
import { useSidebar } from "../(manager)/SidebarContext";

const MobileMenu = () => {
  const { isOpen, toggleMenu } = useSidebar();

  return (
    <div className="xl:hidden relative">
      <div
        className=" cursor-pointer z-20 border border-green-500 size-10 flex items-center justify-center rounded-full"
        onClick={toggleMenu}
      >
        <CiMenuFries className="text-xl" />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 "
          onClick={toggleMenu}
        />
      )}

      <div
        className={`fixed top-0 h-svh bg-white flex flex-col items-center justify-center gap-8 font-medium text-xl z-20 transition-all ease-in-out duration-500 ${
          isOpen ? "left-0" : "-left-[50rem]"
        }`}
      >
        <Sidebar />
      </div>
    </div>
  );
};

export default MobileMenu;
