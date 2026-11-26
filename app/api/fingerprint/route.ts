// app/api/device-fingerprint/route.ts

import { createDeviceFingerprint } from "@/src/lib/fingerprint";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";

async function generateCsrfToken(): Promise<string> {
    return await bcrypt.hash("csrf", 10);
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const userAgent = req.headers.get("user-agent") ?? "";

    const forwardedFor = req.headers.get("x-forwarded-for");

    const ip =
        forwardedFor?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "";

    const fingerprint = createDeviceFingerprint({
        userAgent,
        ip,
    });

    const forwardedProto = req.headers.get("x-forwarded-proto");
    const isSecureRequest =
        forwardedProto?.split(",")[0]?.trim() === "https" ||
        req.nextUrl.protocol === "https:";


    const response = NextResponse.json({
        fingerprint,
    });

    response.cookies.set("device_screen", JSON.stringify(body.screen), {
        httpOnly: true,
        secure: isSecureRequest,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    response.cookies.set("device_fingerprint", fingerprint, {
        httpOnly: true,
        secure: isSecureRequest,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    response.cookies.set("device_ip", ip, {
        httpOnly: true,
        secure: isSecureRequest,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    const csrfToken = await generateCsrfToken();

    response.cookies.set("csrfToken", csrfToken, {
        secure: isSecureRequest,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
}
