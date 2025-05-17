"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { AuthError } from "next-auth";

export async function handleCredentialsSignIn({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  try {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, 
    });

    if (result?.error) {
      return { message: "Incorrect password or username" };
    }

    // Fetch the user's role from the database
    const user = await db.user.findUnique({
      where: { username },
      select: { role: true },
    });

    // Redirect based on role
    if (user?.role === "Manager") {
      return { redirectUrl: "/dashboard" };
    } else if (user?.role === "Nurse") {
      return { redirectUrl: "/request-order" };
    } else if (user?.role === "Pharmacist_Staff"){
      return {redirectUrl: "/pharmacist_dashboard"}
    } else if (user?.role === "Cashier"){
      return {redirectUrl: "/cashier_dashboard"}
    }

    return { message: "Login successful" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Incorrect password or username",
          };
        default:
          return {
            message: "Something went wrong",
          };
      }
    }
    throw error;
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/auth/signin" });
}

