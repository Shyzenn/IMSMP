import { object, string, z } from "zod";

// Register Form
export const signUpSchema = z
  .object({
    username: z.string().min(4, "Username must contain at least 4 characters"),
    role: z.enum(["Pharmacist_Staff", "Nurse","Manager", "Cashier"], { message: "User Type is required." }),
    email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .refine(
      (val) =>
        val.endsWith("@gmail.com"),
      {
        message: "Only Gmail are allowed",
      }
    ),
  });

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, "Password must contain at least 8 characters"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must contain at least 8 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Confirm Password must contain at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password",
  });



export type TChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const editUserSchema = () =>
  z.object({
      id: z.string(),
      role: z.string().min(1, "Role is required"),
  })

export type TEditUserSchema = z.infer<ReturnType<typeof editUserSchema>>;

// Edit User Profile
export const editUserProfileSchema = z.object({
    profileImage: z.string().optional(),
    username: z.string().min(1, "Username is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
});

export type TeditUserProfileSchema = z.infer<typeof editUserProfileSchema>;

// Login Form
export const signInSchema = object({
  email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
  password: string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
});

export type TSignInSchema = z.infer<typeof signInSchema>;

// Add Product
export const addProductSchema = z.object({
  product_name: z.string().min(1, "Product Name is required").trim(),
  category: z.string({ required_error: "Category is required" }).min(1),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: "Price is required" })
      .min(0, "Price must be 0 or higher")
      .multipleOf(0.01, "Price must be a valid decimal number")
  ),
});

export type TAddProductSchema = z.infer<typeof addProductSchema>;

export const editProductSchema = z.object({
  productId: z.number(),
  product_name: z.string().min(1, "Product Name is required").trim(),
  category: z.string({ required_error: "Category is required" }).min(1),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: "Price is required" })
      .min(0, "Price must be 0 or higher")
      .multipleOf(0.01, "Price must be a valid decimal number")
  ),
});

export type TEditProductSchema = z.infer<typeof editProductSchema>;

// Edit Batch
export const editBatchSchema = z.object({
  id: z.number(),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Quantity is required" }).min(0, "Quantity must be 0 or higher")
  ),
  releaseDate: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date({ required_error: "Release Date is required" })
  ),
  expiryDate: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date({ required_error: "Expiry Date is required" })
  ),
});


export type TEditBatchSchema = z.infer<typeof editBatchSchema>;

// Replenish Product
export const replenishProductSchema = z.object({
  productId: z.number(),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Quantity is required" })
    .min(0, "Quantity must be 0 or higher")
  ),
  releaseDate: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date({ required_error: "Release Date is required" })),
  expiryDate: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date({ required_error: "Expiry Date is required" })),
});

export type TReplenishProductSchema = z.infer<typeof replenishProductSchema>;

export const addRequestOrderSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  patient_name: z.string().min(1, "Patient name is required"),
  status: z.enum(["pending", "for_payment", "paid"]),
  type: z.enum(["REGULAR", "EMERGENCY"]),
  notes: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string().min(1, "Product name is required"),
      quantity: z.number().min(1, "Quantity is required")
    })
  ),
});

export type TAddRequestOrderSchema = z.infer<typeof addRequestOrderSchema>;

export const editRequestOrderSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  patient_name: z.string().min(1, "Patient name is required"),
  status: z.enum(["pending", "for_payment", "paid"]).optional(),
  notes: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string().min(1, "Product name is required"),
      quantity: z.number().min(1, "Quantity is required")
    })
  ),
});

export type TEditRequestOrderSchema = z.infer<typeof editRequestOrderSchema>;

export const WalkInOrderSchema = z.object({
  customer_name: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string().min(1, "Product name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1")
    })
  ),
});

export type TWalkInOrderSchema = z.infer<typeof WalkInOrderSchema>;

// forgot password
export const forgotPasswordSchema = z.object({
   email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    
});

export const otpSchema = z.object({
  otp: z.string().length(8, "OTP must be 8 digits"),
});

export const resetPasswordSchema = z
  .object({
     newPassword: z
      .string()
      .trim()
      .min(8, "Password must contain at least 8 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Confirm Password must contain at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type TForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type TOtp = z.infer<typeof otpSchema>;
export type TResetPassword = z.infer<typeof resetPasswordSchema>;
