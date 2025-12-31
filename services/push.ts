// Expo push delivery is no longer available. Keep a small shim so callers can
// gracefully detect the state without bundling Expo push dependencies.
export type PushRegistrationResult =
  | { ok: false; reason: 'unsupported'; message?: string };

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  return {
    ok: false,
    reason: 'unsupported',
    message: 'Remote push delivery is disabled; rely on in-app alerts and email digests instead.',
  };
}

export async function getCachedPushToken(): Promise<string | null> {
  return null;
}
