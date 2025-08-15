import { IconType } from "react-icons/lib";

export interface OrderProduct {
   id: number;
   productName: string;
   quantity: string;
   price: number;
}

export interface RequestFormData {
   roomNumber: string;
   patientName: string;
   products: OrderProduct[];
}

export interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  bgColor: string;
  textColor: string;
  link?:string 
}

export interface Column {
  label: string;
  accessor: string;
  align?: "right" | "left";
  render?: (row: Record<string, unknown>) => React.ReactNode;}

export interface TableComponentProps<T extends Record<string, unknown>> {
  columns: Column[];
  data: T[];
  setIsOrderModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onRowClick?: (row: T) => void;
  title?: string
  requestOrderBtn?: React.ReactNode
  interactiveRows: boolean
  noDataMessage?:string
  colorCodeExpiry?: boolean
}

export interface ProductData {
  id: number;
  productName: string;
  quantity: number;
  price?: number
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price?: number
}

export interface Order {
  id: string;
  patient_name: string;
  createdAt: string;
  status: string;
  items?: string;
  roomNumber: string
  itemDetails: OrderItem[];
}

export interface Links {
  name: string;
  href: string;
  icon: IconType;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "ORDER_REQUEST" | "ADD_PRODUCT";
}

export type UserFormValues = {
  id?: string
  username: string;
  role: "Pharmacist_Staff" | "Nurse" | "Manager" | "Cashier";
  password: string;
  confirmPassword: string;
};
