'use client'

import { RiDashboardHorizontalLine } from "react-icons/ri";
import { AiOutlineAudit } from "react-icons/ai";
import { MdOutlineInventory2 } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { Links } from "./interfaces";

export const adminLinks: Links[] = [
  {
    name: "Dashboard",
    href: "/admin_dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory" ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/admin_inventory/products" },
      { name: "Batches", href: "/admin_inventory/batches" },
     
    ],
  },
   {
    name: "Transaction " ,
    icon: GrTransaction,
    subLinks: [
      { name: "Order Request / Walk In", href: "/admin_transaction/order_walkin" },
      { name: "MedTech Request", href: "/admin_transaction/medtech_transaction" },
     
    ],
  },
  { name: "Audit Log", href: "/admin_audit", icon: AiOutlineAudit },
];

export const managerLinks: Links[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory" ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/inventory/products" },
      { name: "Batches", href: "/inventory/batches" },
     
    ],
  },
   {
    name: "Transaction " ,
    icon: GrTransaction,
    subLinks: [
      { name: "Order Request / Walk In", href: "/transaction/order_walkin" },
      { name: "MedTech Request", href: "/transaction/medtech_transaction" },
     
    ],
  },
  { name: "Audit Log", href: "/audit_log", icon: AiOutlineAudit },
];

export const nurseLinks = [
  {
    name: "Dashboard",
    href: "/nurse_dashboard",
    icon: RiDashboardHorizontalLine,
  },
 {
    name: "Inventory" ,
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

export const pharmacistLinks = [
  
  {
    name: "Dashboard",
    href: "/pharmacist_dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory" ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/pharmacist_inventory/products" },
      { name: "Batches", href: "/pharmacist_inventory/batches" },
     
    ],
  },
  {
    name: "Transaction" ,
    icon: GrTransaction,
    subLinks: [
      { name: "Order Request / Walk In", href: "/pharmacist_transaction/order_walkin" },
      { name: "MedTech Request", href: "/pharmacist_transaction/medtech_transaction" },
     
    ],
  },
]

export const cashierLinks = [
  {
    name: "Dashboard",
    href: "/cashier_dashboard",
    icon: RiDashboardHorizontalLine,

  },
  { name: "Transaction", href: "/cashier_transaction", icon: GrTransaction }
]

export const medTechLinks = [
   {
    name: "Dashboard",
    href: "/medtech_dashboard",
    icon: RiDashboardHorizontalLine,
  },
  {
    name: "Inventory " ,
    icon: MdOutlineInventory2,
    subLinks: [
      { name: "Products", href: "/medtech_inventory/products" },
      { name: "Batches", href: "/medtech_inventory/batches" },
      
    ],
  },
  {
    name: "Transaction",
    href: "/medtech_transaction",
    icon: GrTransaction,
  },
]

export function getLogoLink(role?: string) {
  switch (role) {
    case "Pharmacist_Staff":
      return "/pharmacist_dashboard";
    case "Manager":
      return "/dashboard";
    case "Nurse":
      return "/nurse_dashboard";
    case "Cashier":
      return "/cashier_dashboard";
    case "MedTech":
      return "/medtech_dashboard";
    case "SuperAdmin":
      return "/admin_dashboard";  
    default:
      return "/"; 
  }
}
