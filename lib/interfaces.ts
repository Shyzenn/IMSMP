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