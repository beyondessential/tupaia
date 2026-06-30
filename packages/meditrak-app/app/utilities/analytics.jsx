// Analytics previously reported to Microsoft App Center, which has been retired.
// These are now no-ops, but the API is preserved so call sites don't need to change.
// If analytics are reinstated in future, wire these methods up to the new provider.
export const analytics = {
  trackEvent: () => {},
  trackButtonPress: () => {},
};
