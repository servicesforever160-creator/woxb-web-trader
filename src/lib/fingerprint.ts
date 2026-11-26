import "server-only";
import crypto from "crypto";

const secret = process.env.FINGERPRINT_SECRET;

if (!secret) {
    throw new Error("FINGERPRINT_SECRET is not configured");
}

export function createDeviceFingerprint(data: {
    userAgent: string;
    ip: string;
}) {

    console.log(data.ip, data.userAgent);
    
    const payload = [
        data.ip,
        data.userAgent
    ].join("|");

    if (!secret) {
        throw new Error("Incorrect Environment");
    }

    return crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
}