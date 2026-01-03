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
  value: string | number;
  icon: IconType;
  bgColor: string;
  textColor: string;
  link?: string;
}

export interface Column {
  label: string;
  accessor: string;
  align?: "right" | "left";
  render?: (row: Record<string, unknown>) => React.ReactNode;
  showCheckbox?: boolean;
}

export interface TableComponentProps<T extends Record<string, unknown>> {
  largeContainer?: boolean;
  columns: Column[];
  data: T[];
  setIsOrderModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onRowClick?: (row: T) => void;
  title?: string;
  interactiveRows: boolean;
  noDataMessage?: string;
  colorCodeExpiry?: boolean;
  filter?: React.ReactNode;
  linkCell?: boolean;
}

export interface ProductData {
  id: number;
  product_name: string;
  minimumStockAlert?: number;
  price: number;
  genericName: string | null;
  strength: string | null;
  dosageForm: string | null;
  quantity: number;
  requiresPrescription?: boolean;
  batches?: Batch[];
}

export interface Batch {
  quantity: number;
  expiryDate?: Date;
}

export interface OrderItem {
  id?: string;
  productName: string;
  strength?: string;
  dosageForm?: string;
  quantityOrdered: number;
  price: number;
  category?: string[];
  subTotal?: number;
}

export interface Order {
  id: string;
  patient_name: string;
  createdAt: string;
  status: string;
  items?: string;
  totalAmount?: number;
  type?: "REGULAR" | "EMERGENCY" | "Pay Later";
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
  handledBy: string;
};

export type Patient = {
  id?: string;
  patientName: string;
  roomNumber?: number;
  contactNumber?: string;
  patientNumber?: number;
  unpaidOrders?: number;
  totalBalance?: number;
};

export type Payment = {
  processedAt: Date;
  processedBy: { username: string };
  amountDue: number;
  discountAmount: number;
  discountType: "PWD" | "SENIOR" | "CUSTOM" | "NONE";
  discountPercent: number;
};

export type OrderView = {
  type: "REGULAR" | "EMERGENCY" | "Walk In" | "Pay Later";
  id: number | string;
  requestedBy?: string;
  receivedBy?: string;
  receivedAt?: Date;
  paymentDetails?: Payment[];
  preparedBy?: string;
  preparedAt?: Date;
  dispensedAt?: Date;
  dispensedBy?: string;
  refundedAt?: Date;
  refundedBy?: string;
  refundedById?: string;
  refundedReason?: string | null;
  customer?: string;
  patientDetails?: Patient;
  notes?: string;
  source?: "Walk In" | "Request Order";
  quantity: number;
  price: number;
  remarks?: "preparing" | "prepared" | "dispensed";
  status: "pending" | "for_payment" | "paid" | "canceled" | "refunded";
  createdAt: Date;
  itemDetails: OrderItem[];
};

export type CombinedTransaction = WalkInOrder | OrderView;

export interface Notification {
  id: number;
  orderType?: "REGULAR" | "EMERGENCY";
  title: string;
  message?: string;
  read: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  senderId: string;
  patientName: string;
  roomNumber: number;
  recipientId: string;
  type?:
    | "ORDER_REQUEST"
    | "ADD_PRODUCT"
    | "ORDER_RECEIVED"
    | "PAYMENT_PROCESSED"
    | "EMERGENCY_ORDER"
    | "REMARKS"
    | "WALK_IN"
    | "MEDTECH_REQUEST"
    | "MEDTECH_REQUEST_EDIT"
    | "MT_REQUEST_READY"
    | "MT_REQUEST_RELEASED"
    | "MT_REQUEST_APPROVED"
    | "MT_REQUEST_DECLINED";

  orderId?: number | null;
  walkInOrderId?: number | null;
  medTechRequestId?: number | null;
  productId?: number | null;

  submittedBy?: string;
  role?: string;
  notes?: string;

  sender?: {
    username: string;
    role: string;
  };
  order?: {
    id: number;
    patientDetails: Patient;
    products?: OrderItem[];
  };
}

export interface Links {
  name: string;
  href?: string;
  subLinks?: { name: string; href: string }[];
  icon: IconType;
}

export type UserFormValues = {
  id?: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: "Pharmacist_Staff" | "Nurse" | "Manager" | "Cashier";
  password?: string;
  confirmPassword?: string;
  status?: "DISABLE" | "ACTIVE";
  isOnline?: "Offline" | "Online";
  email: string;
  bannedReason?: string;
};
