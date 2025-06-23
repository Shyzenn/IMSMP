'use client'

import { RiDashboardHorizontalLine } from "react-icons/ri";
import { MdOutlineInventory2 } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { BsBoxSeam } from "react-icons/bs";
import { Links } from "./interfaces";

export const links: Links[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: MdOutlineInventory2,
  },
  { name: "Transaction", href: "/transaction", icon: GrTransaction },
  
  { name: "Order", href: "/order", icon: BsBoxSeam },
];

export const nurseLinks = [
  {
    name: "Request Order",
    href: "/request-order",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Transaction",
    href: "/(nurse)/transaction",
    icon: GrTransaction,
  },
];

export const pharmacistLinks = [
  
  {
    name: "Dashboard",
    href: "/pharmacist_dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory",
    href: "/pharmacist_inventory",
    icon: MdOutlineInventory2,
  },
  { name: "Transaction", href: "/pharmacist_transaction", icon: GrTransaction },
]