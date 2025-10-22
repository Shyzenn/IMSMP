"use client";

import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { memo, useEffect } from "react";
import WalkInOrder from "./WalkInOrder";
import Image from "next/image";
import PharmacyIcon from "@/public/macoleens_logo.png";
import HeaderLinks from "./HeaderLinks";
import ProfileDropdown from "./ProfileDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StaffNotificationBell from "./StaffNotificationBell";
import { pusherClient } from "@/lib/pusher/client";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import EmergencyOrderModal from "./EmergencyModal";
import { Notification } from "@/lib/interfaces";
import { HeaderLinksSkeleton } from "./Skeleton";

const Header = () => {
  const { data: session, status } = useSession();
  const userRole = session?.user.role;
  const MemoMobileMenu = memo(MobileMenu);
  const emergencyModal = useEmergencyModal();

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = pusherClient.subscribe(`private-user-${session.user.id}`);

    channel.bind("new-notification", (data: Notification) => {
      if (data.type === "EMERGENCY_ORDER") {
        emergencyModal.openModal({
          id: data.id,
          orderType: "EMERGENCY",
          sender: {
            username: data.sender?.username || "Unknown",
            role: data.sender?.role || "Unknown",
          },
          order: {
            patient_name: data.order?.patient_name || "Unknown",
            room_number: data.order?.room_number || "Unknown",
            products: data.order?.products || [],
          },
          notes: data.notes || "",
          createdAt: new Date(data.createdAt),
        });
      }
    });

    return () => {
      channel.unbind("new-notification");
      pusherClient.unsubscribe(`private-user-${session.user.id}`);
    };
  }, [session?.user?.id, emergencyModal]);

  return (
    <div className="fixed top-0 w-full bg-white mb-5 shadow-md z-20">
      <div className="flex justify-between items-center px-4 lg:px-10 2xl:max-w-screen-3xl mx-auto">
        <Image
          src={PharmacyIcon}
          alt="Macoleen's Pharmacy Icon"
          width={150}
          height={150}
          className="hidden lg:block"
        />
        <MemoMobileMenu />

        {status === "loading" ? (
          <HeaderLinksSkeleton />
        ) : (
          <HeaderLinks userRole={userRole} />
        )}

        <div className="flex items-center relative">
          {status === "authenticated" && (
            <>
              <div className="hidden md:block">
                {userRole === "Pharmacist_Staff" && <WalkInOrder />}
              </div>

              {userRole !== "Manager" && (
                <StaffNotificationBell
                  userId={session?.user.id}
                  userRole={userRole}
                />
              )}
            </>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ProfileDropdown session={session} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <EmergencyOrderModal />
        </div>
      </div>
    </div>
  );
};

export default Header;
