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
  value: number;
  icon: IconType;
  bgColor: string;
  textColor: string;
}

export interface Column {
  label: string;
  accessor: string;
  align?: "right" | "left";
}

export interface TableComponentProps<T extends Record<string, unknown>> {
  columns: Column[];
  data: T[];
}