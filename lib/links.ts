'use client'

import { RiDashboardHorizontalLine } from "react-icons/ri";
import { MdOutlineInventory2 } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { Links } from "./interfaces";

export const nurseLinks = [
  {
    name: "Request Order",
    href: "/request-order",
    icon: RiDashboardHorizontalLine,
  },
 {
    name: "Inventory " ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/nurse_inventory/products" },
      { name: "Batches", href: "/nurse_inventory/batches" },
      
    ],
  },
  {
    name: "Transaction",
    href: "/nurse_transaction",
    icon: GrTransaction,
  },
];

export const managerLinks: Links[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory " ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/inventory/products" },
      { name: "Batches", href: "/inventory/batches" },
     
    ],
  },
  { name: "Transaction", href: "/transaction", icon: GrTransaction },
  { name: "Audit Log", href: "/audit_log", icon: GrTransaction },
];

export const pharmacistLinks = [
  
  {
    name: "Dashboard",
    href: "/pharmacist_dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory " ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/pharmacist_inventory/products" },
      { name: "Batches", href: "/pharmacist_inventory/batches" },
     
    ],
  },
  { name: "Transaction", href: "/pharmacist_transaction", icon: GrTransaction },
]

export const cashierLinks = [
  {
    name: "Dashboard",
    href: "/cashier_dashboard",
    icon: RiDashboardHorizontalLine,

  },
  { name: "Transaction", href: "/cashier_transaction", icon: GrTransaction }
]