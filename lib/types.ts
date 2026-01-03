import { object, string, z } from "zod";

const nameRegex = /^[A-Za-z\s]+$/;
// Replenish Product
function parseLocalDateString(str: string) {
  // Accept only YYYY-MM-DD — prevent invalid parsing
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return undefined;

  const [year, month, day] = str.split("-").map(Number);

  // Convert using LOCAL timezone, not UTC
  return new Date(year, month - 1, day, 12); // Set noon to avoid UTC shifting
}

const datePreprocess = (val: unknown) => {
  if (!val) return undefined;

  // If it's already a Date from Calendar
  if (val instanceof Date) {
    const d = new Date(val);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  // If it's an ISO date string: "2025-11-19T16:00:00.000Z"
  if (typeof val === "string" && val.includes("T")) {
    const d = new Date(val);
    if (isNaN(d.getTime())) return undefined;

    d.setHours(12, 0, 0, 0);
    return d;
  }

  // If it's a plain YYYY-MM-DD string (from JSON)
  if (typeof val === "string") {
    const parsed = parseLocalDateString(val);
    return parsed;
  }

  return undefined;
};

// Register Form
export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "Username must contain at least 4 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      nameRegex,
      "Username must not contain numbers or special characters"
    ),
  role: z.enum(["Pharmacist_Staff", "Nurse", "Manager", "Cashier", "MedTech"], {
    message: "User Type is required.",
  }),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(30, "First name must not exceed 30 characters")
    .regex(
      nameRegex,
      "First name must not contain numbers or special characters"
    ),
  middleName: z
    .string()
    .trim()
    .max(30, "Middle name must not exceed 30 characters")
    .optional()
    .refine((val) => !val || nameRegex.test(val), {
      message: "Middle name must not contain numbers or special characters",
    }),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is Required")
    .max(30, "Last name must not exceed 30 characters")
    .regex(
      nameRegex,
      "Last name must not contain numbers or special characters"
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(50, "Email must not exceed 50 characters")
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only Gmail are allowed",
    }),
});

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, "Password must contain at least 8 characters")
      .max(32, "Current password must not exceed 32 characters"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must contain at least 8 characters")
      .max(32, "Password must not exceed 32 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Confirm Password must contain at least 8 characters")
      .max(32, "Confirm password must not exceed 32 characters"),
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
    username: z
      .string()
      .trim()
      .min(4, "Username must contain at least 4 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(
        nameRegex,
        "Username must not contain numbers or special characters"
      ),
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(30, "First name must not exceed 30 characters")
      .regex(
        nameRegex,
        "First name must not contain numbers or special characters"
      ),
    middleName: z
      .string()
      .trim()
      .max(30, "Middle name must not exceed 30 characters")
      .optional()
      .refine((val) => !val || nameRegex.test(val), {
        message: "Middle name must not contain numbers or special characters",
      }),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is Required")
      .max(30, "Last name must not exceed 30 characters")
      .regex(
        nameRegex,
        "Last name must not contain numbers or special characters"
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(50, "Email must not exceed 50 characters")
      .email("Invalid email address")
      .refine((val) => val.endsWith("@gmail.com"), {
        message: "Only Gmail are allowed",
      }),
    role: z.enum(
      ["Pharmacist_Staff", "Nurse", "Manager", "Cashier", "MedTech"],
      { message: "User Type is required." }
    ),
  });

export type TEditUserSchema = z.infer<ReturnType<typeof editUserSchema>>;

// Edit User Profile
export const editUserProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "Username must contain at least 4 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      nameRegex,
      "Username must not contain numbers or special characters"
    ),
  profileImage: z.string().optional(),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(30, "First name must not exceed 30 characters")
    .regex(
      nameRegex,
      "First name must not contain numbers or special characters"
    ),
  middleName: z
    .string()
    .trim()
    .max(30, "Middle name must not exceed 30 characters")
    .optional()
    .refine((val) => !val || nameRegex.test(val), {
      message: "Middle name must not contain numbers or special characters",
    }),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is Required")
    .max(30, "Last name must not exceed 30 characters")
    .regex(
      nameRegex,
      "Last name must not contain numbers or special characters"
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(50, "Email must not exceed 50 characters")
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only Gmail are allowed",
    }),
});

export type TeditUserProfileSchema = z.infer<typeof editUserProfileSchema>;

// Login Form
export const signInSchema = object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export type TSignInSchema = z.infer<typeof signInSchema>;

// Add Product
export const addProductSchema = z.object({
  product_name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must not exceed 100 characters"),

  genericName: z.string().trim().optional(),
  manufacturer: z.string().trim().max(150).optional(),
  description: z.string().trim().max(500).optional(),
  strength: z.string().trim().optional(),
  dosageForm: z.string().trim().optional(),

  category: z.string({ required_error: "Category is required" }).min(1),

  requiresPrescription: z.boolean().optional(),

  minimumStockAlert: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0).max(999999.99)
  ),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0).max(999999.99)
  ),
});

export type TAddProductSchema = z.infer<typeof addProductSchema>;

export const editProductSchema = addProductSchema.extend({
  productId: z.number(),
});

export type TEditProductSchema = z.infer<typeof editProductSchema>;

// Edit Batch
export const editBatchSchema = z.object({
  id: z.number(),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: "Quantity is required" })
      .min(1, "Quantity must be 0 or higher")
      .max(10000, "Quantity must not exceed 10,000")
  ),
  manufactureDate: z.preprocess(
    datePreprocess,
    z.date({ required_error: "Release Date is required" })
  ),

  expiryDate: z.preprocess(
    datePreprocess,
    z.date({ required_error: "Expiry Date is required" })
  ),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
});

export type TEditBatchSchema = z.infer<typeof editBatchSchema>;

export const replenishProductSchema = z.object({
  productId: z.number(),
  quantity: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: "Quantity is required" })
      .min(1, "Quantity must be 0 or higher")
      .max(10000, "Quantity must not exceed 10,000")
  ),
  releaseDate: z.preprocess(
    datePreprocess,
    z.date({ required_error: "Release Date is required" })
  ),

  expiryDate: z.preprocess(
    datePreprocess,
    z.date({ required_error: "Expiry Date is required" })
  ),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
});

export type TReplenishProductSchema = z.infer<typeof replenishProductSchema>;

export const addRequestOrderSchema = z.object({
  roomNumber: z
    .union([z.number().int().positive(), z.nan()])
    .optional()
    .transform((val) => (isNaN(val as number) ? undefined : val)),
  patientName: z
    .string()
    .trim()
    .min(1, "Patient name is required")
    .max(50, "First name must not exceed 50 characters"),
  contactNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^09\d{9}$/.test(val),
      "Contact number must start with 09 and be 11 digits"
    ),
  status: z.enum(["pending", "for_payment", "paid"]),
  type: z.enum(["REGULAR", "EMERGENCY"]),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
  remarks: z
    .enum(["preparing", "prepared", "dispensed"])
    .optional()
    .default("preparing"),
  products: z.array(
    z.object({
      productId: z.number(),
      quantityOrdered: z.number().min(1),
    })
  ),
});

export type TAddRequestOrderSchema = z.infer<typeof addRequestOrderSchema>;

export const addMedTechRequestSchema = z.object({
  status: z.enum(["pending_for_approval", "approved", "declined"]),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
  remarks: z
    .enum(["processing", "ready", "released"])
    .optional()
    .default("processing"),
  products: z.array(
    z.object({
      productId: z
        .string()
        .min(1, "Product name is required")
        .max(100, "Product name must not exceed 100 characters"),
      quantity: z
        .number()
        .min(1, "Quantity is required")
        .max(10000, "Quantity must not exceed 10,000"),
    })
  ),
});

export type TAddMedTechRequestSchema = z.infer<typeof addMedTechRequestSchema>;

export const editMedTechRequestSchema = addMedTechRequestSchema.extend({});

export type TEditMedTechRequestSchema = z.infer<
  typeof editMedTechRequestSchema
>;

export const editRequestOrderSchema = addRequestOrderSchema.extend({});

export type TEditRequestOrderSchema = z.infer<typeof editRequestOrderSchema>;

export const WalkInPaymentSchema = z
  .object({
    customer_name: z.string().optional(),
    discountType: z.enum(["NONE", "PWD", "SENIOR", "CUSTOM"]),
    discountPercent: z.number().min(0).max(100).optional(),
    amountTendered: z
      .number()
      .min(0.01, "Amount tendered must be greater than 0"),
    change: z.number().min(0),
    items: z
      .array(
        z.object({
          productId: z.number(),
          quantity: z.number().positive(),
          price: z.number().positive(),
        })
      )
      .min(1),
  })
  .refine(
    (data) =>
      data.discountType !== "CUSTOM" ||
      (data.discountPercent && data.discountPercent > 0),
    {
      message: "Custom discount requires a discount percent",
      path: ["discountPercent"],
    }
  );

// forgot password
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(50, "Email must not exceed 50 characters")
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only Gmail are allowed",
    }),
});

export const otpSchema = z.object({
  otp: z.string().length(8, "OTP must be 8 digits"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must contain at least 8 characters")
      .max(32, "Password must not exceed 32 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Confirm Password must contain at least 8 characters")
      .max(32, "Confirm password must not exceed 32 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type TOtp = z.infer<typeof otpSchema>;
export type TResetPassword = z.infer<typeof resetPasswordSchema>;
