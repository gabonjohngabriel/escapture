import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { sha256Hex } from "@/lib/hash";

export const DEVICE_COOKIE_NAME = "escapture_device_token";
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

export function hashDeviceToken(rawToken: string): string {
  return sha256Hex(rawToken);
}

export async function readDeviceTokenHash(): Promise<string | null> {
  try {
    const store = await cookies();
    const raw = store.get(DEVICE_COOKIE_NAME)?.value?.trim();
    if (!raw) return null;
    return hashDeviceToken(raw);
  } catch {
    return null;
  }
}

export function setDeviceTokenCookie(res: NextResponse, rawToken: string) {
  res.cookies.set(DEVICE_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  });
}

export function clearDeviceTokenCookie(res: NextResponse) {
  res.cookies.set(DEVICE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
