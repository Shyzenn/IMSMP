import { TAddProductSchema, TAddRequestOrderSchema, TEditBatchSchema, TEditProductSchema, TEditUserSchema, TSignUpSchema, TWalkInOrderSchema } from "../types";

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

// edit batch
export const editBatch = async (data: TEditBatchSchema) => {
  const response = await fetch("/api/product/edit_batch", {
    method: "PATCH",
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

// edit new product
export const editNewProduct = async (data: TEditProductSchema) => {
  const response = await fetch("/api/product/update", {
    method: "PATCH",
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

// edit user
export const editUser = async (data: TEditUserSchema) => {
  const response = await fetch("/api/user/update", {
    method: "PATCH",
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

// walk in order
export const walkInOrder = async (data:TWalkInOrderSchema) => {
  const response = await fetch("/api/walkin_order", {
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


