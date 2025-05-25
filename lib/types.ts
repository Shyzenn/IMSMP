import { object, string, z } from "zod";

// Register Form
export const signUpSchema = z
  .object({
    username: z.string().min(4, "Username must contain at least 4 characters"),
    role: z.enum(["Pharmacist_Staff", "Nurse","Manager", "Cashier"], { message: "User Type is required." }),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must contain at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TSignUpSchema = z.infer<typeof signUpSchema>;

// Login Form
export const signInSchema = object({
  username: z.string().min(4, "Username must contain at least 4 characters"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export type TSignInSchema = z.infer<typeof signInSchema>;

// Add Product
export const addProductSchema = z.object({
  product_name: z.string().min(1, "Product Name is required"),
  category: z.enum(["ANTIBIOTIC", "GASTROINTESTINAL", "PAIN_RELIEVER", "ANTI_INFLAMMATORY", "GENERAL_MEDICATION"], {
    message: "Category is required.",
  }),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Quantity is required" })
    .min(0, "Quantity must be 0 or higher")
  ),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Price is required" })
      .min(0, "Price must be 0 or higher")
      .multipleOf(0.01, "Price must be a valid decimal number")
  ),
  releaseDate: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date({ required_error: "Release Date is required" })),
  expiryDate: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date({ required_error: "Expiry Date is required" })),
});

export type TAddProductSchema = z.infer<typeof addProductSchema>;

export const addRequestOrderSchema = z.object({
  room_number: z.string().optional(),
  patient_name: z.string().optional(),
  status: z.enum(["pending", "for_payment", "paid"]),
  products: z.array(
    z.object({
      productId: z.string().min(1, "required"),
      quantity: z.number().min(1, "Quantity must be at least 1")
    })
  ),
});

export type TAddRequestOrderSchema = z.infer<typeof addRequestOrderSchema>;