/**
 * File: src/utils/googleAuth.ts
 * Description: Google OAuth utility functions
 */

const GOOGLE_CLIENT_ID =
  "981809046914-9qvk231b373td299fup6hjfuv2ms92jd.apps.googleusercontent.com";

interface GoogleAuthResponse {
  code: string;
}

export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};

export const handleGoogleSignIn = async (): Promise<string> => {
  try {
    await initializeGoogleAuth();

    return new Promise((resolve, reject) => {
      // @ts-expect-error - Google client is loaded dynamically
      const client = google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        ux_mode: "popup",
        access_type: "offline",
        include_granted_scopes: true,
        enable_serial_consent: true,
        callback: (response: GoogleAuthResponse) => {
          if (response.code) {
            resolve(response.code);
          } else {
            reject(new Error("Failed to get authorization code"));
          }
        },
      });

      client.requestCode();
    });
  } catch (error) {
    console.error("Google sign in failed:", error);
    throw error;
  }
};
