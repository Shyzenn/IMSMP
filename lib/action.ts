import { TAddProductSchema, TAddRequestOrderSchema, TSignUpSchema } from "@/lib/types";

//register user
export const registerUser = async (data: TSignUpSchema) => {
  const response = await fetch("/api/user", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // If the response is not OK, throw an error
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }
  const responseData = await response.json();
  return responseData;
};

// add new product
export const addNewProduct = async (data: TAddProductSchema) => {
  const response = await fetch("/api/product", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // If the response is not OK, throw an error
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }
  const responseData = await response.json();
  return responseData;
};

//add request order
export const addRequesOrder = async (data:TAddRequestOrderSchema) => {
  const response = await fetch("/api/request_order", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    }
  })

  if (!response.ok) {
    // If the response is not OK, throw an error
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }
  const responseData = await response.json();
  return responseData;
}

import axios from "axios";

export const fetchOrderRequest = async () => {
  const { data } = await axios.get("/api/request_order");
  return Array.isArray(data) ? data : [];
};
  
export const fetchLowStocks = async () => {
  const { data } = await axios.get("api/low_stock");
  return Array.isArray(data) ? data : [];
};

export const fetchManagerCardData = async () => {
  const { data } = await axios.get("api/manager/manager_card");
  return Array.isArray(data) ? data : [];
};

export const fetchExpiryProducts = async () => {
  const { data } = await axios.get("api/manager/expiry_products");
  return Array.isArray(data) ? data : [];
};

