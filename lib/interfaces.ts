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
  value:string | number;
  icon: IconType;
  bgColor: string;
  textColor: string;
  link?:string 
}

export interface Column {
  label: string;
  accessor: string;
  align?: "right" | "left";
  render?: (row: Record<string, unknown>) => React.ReactNode;
  showCheckbox?: boolean;
}

export interface TableComponentProps<T extends Record<string, unknown>> {
  largeContainer?: boolean 
  columns: Column[];
  data: T[];
  setIsOrderModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onRowClick?: (row: T) => void;
  title?: string
  interactiveRows: boolean
  noDataMessage?:string
  colorCodeExpiry?: boolean
  filter?: React.ReactNode;
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

export type WalkInOrder = {
  id: number | string;
  customer: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: Date;
  itemDetails: OrderItem[];
  handledBy: string
};

export interface EmergencyOrderModalData {
  id: number | string;
  orderType: "REGULAR" | "EMERGENCY";
  sender: {
      username: string;
      role?: string;
    };
  order: {
      id?: number | string;
      patient_name: string;
      room_number: string;
      status?: "pending" | "for_payment" | "paid" | "canceled"
      products: OrderItem[];
    };
  notes: string;
  createdAt: Date;
}

export interface Notification {
  id: number;
  orderType: "REGULAR" | "EMERGENCY"
  title: string;
  message: string;
  read: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  senderId: string;
  recipientId: string;
  type?: "ORDER_REQUEST" | "ADD_PRODUCT" | "ORDER_RECEIVED" | "PAYMENT_PROCESSED" | "EMERGENCY_ORDER" | "REMARKS";
  orderId?: number | null;
  walkInOrderId?: number | null;
  productId?: number | null;
  sender?: {
    username: string;
    role: string;
  };
  order?: {
    id: number
    price?: number
    patient_name: string;
    room_number: string;
    products?: OrderItem[]
  };
  notes?: string
}

export interface Links {
  name: string;
  href?: string;
  subLinks?:{name: string, href:string}[]
  icon: IconType;
}

export type UserFormValues = {
  id?: string
  username: string;
  firstName: string
  lastName: string
  role: "Pharmacist_Staff" | "Nurse" | "Manager" | "Cashier";
  password?: string;
  confirmPassword?: string;
  status?: "DISABLE" | "ACTIVE"
  isOnline?: "Offline" | "Online"
  email: string
};
