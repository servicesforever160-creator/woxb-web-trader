export async function getFingerprint(): Promise<string | undefined> {

  if (typeof window === "undefined") return undefined;

  if (window.deviceFingerprint) {
    return window.deviceFingerprint;
  }

  if (window.deviceFingerprintPromise) {
    try {
      return await window.deviceFingerprintPromise;
    } catch {
      return undefined;
    }
  }

  try {
    window.deviceFingerprintPromise = fetch("/api/fingerprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          pixelRatio: window.devicePixelRatio,
        },
      }),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to generate device fingerprint");
      }
      const { fingerprint } = await response.json();
      window.deviceFingerprint = fingerprint;
      return fingerprint;
    });

    return await window.deviceFingerprintPromise;
  } catch (error) {
    console.error("Device fingerprint initialization failed:", error);
    window.deviceFingerprintPromise = undefined;
    return undefined;
  }
}
