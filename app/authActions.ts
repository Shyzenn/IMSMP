"use server";

import { auth, signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/lib/mailer";
import { AuthError } from "next-auth";

export async function handleCredentialsSignIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        password: true,       
        otpExpiresAt: true,
        mustChangePassword: true
      },
    });

    if (!user) return { message: "User does not exist" };
    if (user.status === "DISABLE") {
      return { message: "Your account has been banned. Contact admin." };
    }

    // OTP Expiration check
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      const newOtp = Math.floor(10000000 + Math.random() * 90000000).toString();
      const hashedOtp = await bcrypt.hash(newOtp, 10);

      await db.user.update({
        where: { id: user.id },
        data: {
          password: hashedOtp,
          otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await sendOTPEmail(email, newOtp);

      return { message: "Your OTP expired. A new one has been sent to your email." };
    }

    // NextAuth will check the OTP (stored as password)
    const isOtpValid = await bcrypt.compare(password, user.password);
    if (!isOtpValid) {
      return { message: "Invalid OTP" };
    }

    if (user.mustChangePassword) {
      return { redirectUrl: "/change-password" };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      redirectTo:
        user.mustChangePassword
          ? "/change-password"
          : user.role === "Manager"
          ? "/dashboard"
          : user.role === "Nurse"
          ? "/nurse_dashboard"
          : user.role === "Pharmacist_Staff"
          ? "/pharmacist_dashboard"
          : user.role === "Cashier"
          ? "/cashier_dashboard"
          : "/",
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "Login",
        entityType: "Session",
        description: `User ${user.username} (${user.role}) signed in.`,
      },
    });

    // Role-based redirects
    if (user.role === "Manager") return { redirectUrl: "/dashboard" };
    if (user.role === "Nurse") return { redirectUrl: "/nurse_dashboard" };
    if (user.role === "Pharmacist_Staff") return { redirectUrl: "/pharmacist_dashboard" };
    if (user.role === "Cashier") return { redirectUrl: "/cashier_dashboard" };

    return { message: "Login successful" };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { message: "Wrong password" }; 
      }
      return { message: error.message }; 
    }
    throw error;
  }

}


export async function handleSignOut() {
  const session = await auth();

  if (session?.user?.id) {
    //  Mark user offline
    await db.user.update({
      where: { id: session.user.id },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    });

    // Audit log entry
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Logout",
        entityType: "Session",
        description: `User ${session.user.username} (${session.user.role}) signed out.`,
      },
    });
  }

  await signOut({ redirectTo: "/auth/signin" });
}
