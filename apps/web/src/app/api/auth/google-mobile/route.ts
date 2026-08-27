import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit-redis";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: [
      process.env.GOOGLE_CLIENT_ID!,
      "746042830925-tvbok7b7cde53p0qck7fq6ofru65ckl1.apps.googleusercontent.com",
    ],
  });
  return ticket.getPayload();
}

async function signSessionToken(user: {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
  role: string | null;
  avatar: string | null;
}) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company,
    phone: user.phone,
    role: user.role,
    image: user.avatar,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed, retryAfter } = await checkRateLimit(`mobile-google:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    let payload;
    try {
      payload = await verifyGoogleIdToken(idToken);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Token verification failed";
      return NextResponse.json({ error: "Invalid Google ID token", detail: msg }, { status: 401 });
    }

    if (!payload?.email) {
      return NextResponse.json({ error: "Google token has no email" }, { status: 400 });
    }

    const nameParts = payload.name?.split(" ") || [];
    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    let user;

    if (existing) {
      if (!existing.avatar && payload.picture) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { avatar: payload.picture },
        });
      }
      user = existing;
    } else {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || null,
          firstName: nameParts[0] || null,
          lastName: nameParts.slice(1).join(" ") || null,
          avatar: payload.picture || null,
          role: "user",
        },
      });
    }

    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("[GOOGLE-MOBILE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
