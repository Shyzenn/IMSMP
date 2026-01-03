import { ProductCategory } from "@prisma/client";
import {
  TAddMedTechRequestSchema,
  TAddProductSchema,
  TAddRequestOrderSchema,
  TEditBatchSchema,
  TEditMedTechRequestSchema,
  TEditProductSchema,
  TEditRequestOrderSchema,
  TEditUserSchema,
  TReplenishProductSchema,
  TSignUpSchema,
} from "../types";
import { QueryObserverResult } from "@tanstack/react-query";

//register user
export const registerUser = async (data: TSignUpSchema) => {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    const responseData = await response.json();
    return responseData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "An unexpected error occurred while editing the product."
      );
    }
  }
};

// add new product
export const addNewProduct = async (data: TAddProductSchema) => {
  try {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while adding the product.");
    }
  }
};

// replenish product
export const replenishProduct = async (data: TReplenishProductSchema) => {
  try {
    const response = await fetch("/api/product/replenish", {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "An unexpected error occurred while replenish the product."
      );
    }
  }
};

// add product category
export const addCategory = async (
  newCategory: string,
  refetch: () => Promise<QueryObserverResult<ProductCategory[], Error>>
) => {
  if (!newCategory.trim()) return;

  try {
    const res = await fetch("/api/product/category", {
      method: "POST",
      body: JSON.stringify({ name: newCategory }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to add category");
    }

    await refetch();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while adding category.");
    }
  }
};

// update category
export const editCategory = async (
  selectedCategoryForEdit: ProductCategory,
  categoryName: string,
  refetch: () => Promise<QueryObserverResult<ProductCategory[], Error>>
) => {
  try {
    const response = await fetch(
      `/api/product/category/${selectedCategoryForEdit.id}/update`,
      {
        method: "PUT",
        body: JSON.stringify({ name: categoryName }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.errors?.product_name) {
        throw new Error(data.errors.product_name);
      }
      if (data.error) {
        throw new Error(data.error);
      }
      throw new Error("Failed to update category.");
    }

    await refetch();
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while editing category.");
    }
  }
};

// edit batch
export const editBatch = async (data: TEditBatchSchema) => {
  try {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while editing batch.");
    }
  }
};

// edit new product
export const editNewProduct = async (data: TEditProductSchema) => {
  try {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while editing product.");
    }
  }
};

// edit user
export const editUser = async (data: TEditUserSchema) => {
  try {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while editing user.");
    }
  }
};

//add request order
export const addRequesOrder = async (data: TAddRequestOrderSchema) => {
  try {
    const response = await fetch("/api/request_order", {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "An unexpected error occurred while adding request order."
      );
    }
  }
};

// add medtech request
export const addMedTechRequest = async (data: TAddMedTechRequestSchema) => {
  try {
    const response = await fetch("/api/medtech_request", {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "An unexpected error occurred while adding medtech request."
      );
    }
  }
};

// edit medtech request
export const editMedTechRequest = async (
  data: TEditMedTechRequestSchema,
  id: string
) => {
  try {
    const response = await fetch(`/api/medtech_request/${id}/update`, {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "An unexpected error occurred while adding medtech request."
      );
    }
  }
};

// edit request order
export const editRequesOrder = async (
  data: TEditRequestOrderSchema,
  id: string
) => {
  try {
    const response = await fetch(`/api/request_order/${id}/update`, {
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        "An unexpected error occurred while adding request order."
      );
    }
  }
};
