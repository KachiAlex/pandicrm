import "next-auth";

declare module "next-auth" {
  interface User {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    phone?: string | null;
    role?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      company?: string | null;
      phone?: string | null;
      role?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    phone?: string | null;
    role?: string | null;
  }
}
