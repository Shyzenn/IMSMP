import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      status: string;
      username?: string | null; 
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    email: string;
    status: string;
    username?: string | null; 
    profileImage: string | null
    mustChangePassword: boolean
  }

  interface JWT {
    id: string;
    role: string;
    email: string;
    status: string;
    username?: string | null; 
    profileImage: string | null
    mustChangePassword: boolean
  }
}
