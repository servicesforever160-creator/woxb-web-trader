import { Socket } from "socket.io-client";

export {};

declare global {
  interface Window {
    deviceFingerprint?: string;
    deviceFingerprintPromise?: Promise<string>;
    socket: Socket | undefined | null,
  }
}