import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True only when the required public config is present. The app uses this to
 * degrade gracefully (clear setup message) instead of crashing when a developer
 * has not yet created a .env.local from .env.local.example.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

// App Check site key (reCAPTCHA Enterprise). When present, App Check is started
// to protect backend resources (notably the AI Logic / Gemini quota) from abuse.
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let appCheckStarted = false;

/**
 * Best-effort App Check initialization. Loaded lazily (only when a site key is
 * configured) so firebase/app-check isn't bundled otherwise. Swap
 * ReCaptchaEnterpriseProvider for ReCaptchaV3Provider if using classic reCAPTCHA.
 */
function maybeStartAppCheck(firebaseApp: FirebaseApp) {
  if (appCheckStarted || typeof window === "undefined" || !recaptchaSiteKey) return;
  appCheckStarted = true;
  void import("firebase/app-check")
    .then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    })
    .catch(() => {
      // App Check is best-effort; never let it break app startup.
      appCheckStarted = false;
    });
}

export function getFirebaseApp(): FirebaseApp | undefined {
  if (!isFirebaseConfigured) return undefined;
  if (!app) {
    app = getApps().length
      ? getApp()
      : initializeApp(firebaseConfig as Record<string, string>);
  }
  maybeStartAppCheck(app);
  return app;
}

export function getFirebaseAuth(): Auth | undefined {
  const a = getFirebaseApp();
  if (!a) return undefined;
  if (!authInstance) authInstance = getAuth(a);
  return authInstance;
}

export function getDb(): Firestore | undefined {
  const a = getFirebaseApp();
  if (!a) return undefined;
  if (!dbInstance) {
    // IndexedDB-backed offline cache lets progress survive refreshes and
    // closed tabs; it only exists in the browser, so guard for SSR/export.
    if (typeof window !== "undefined") {
      dbInstance = initializeFirestore(a, {
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } else {
      dbInstance = getFirestore(a);
    }
  }
  return dbInstance;
}
