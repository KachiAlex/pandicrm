import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    phone?: string | null;
    role?: string | null;
    isActive?: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    phone?: string | null;
    role?: string;
    isActive?: boolean;
  }
}
