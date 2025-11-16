export const roleConfig = {
   SuperAdmin: {
    base: "/dashboard",
    routes: [
      "/dashboard",
      "/inventory/products",
      "/inventory/batches",
      "/transaction",
      "/audit_log",
      "/manager_settings",
      "/user_management",
      "/archive"
    ],
  },
  Manager: {
    base: "/dashboard",
    routes: [
      "/dashboard",
      "/inventory/products",
      "/inventory/batches",
      "/transaction",
      "/audit_log",
      "/manager_settings",
      "/user_management",
      "/archive"
    ],
  },
  Nurse: {
    base: "/nurse_dashboard",
    routes: ["/nurse_dashboard", "/nurse_inventory", "/nurse_transaction", "/archive"],
  },
  MedTech: {
    base: "/medtech_dashboard",
    routes: ["/medtech_dashboard", "/medtech_transaction", "/medtech_inventory", "/medtech_inventory/products", "/medtech_inventory/batches"],
  },
  Cashier: {
    base: "/cashier_dashboard",
    routes: ["/cashier_dashboard", "/cashier_inventory", "/cashier_transaction"],
  },
  Pharmacist_Staff: {
    base: "/pharmacist_dashboard",
    routes: [
      "/pharmacist_dashboard",
      "/pharmacist_inventory",
      "/pharmacist_transaction",
      "/archive"
    ],
  },
} as const;

export const publicPaths = [
  "/auth/signin",
  "/unauthorized",
  "/change-password",
];
