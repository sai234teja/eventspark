export const isBrowser = typeof window !== 'undefined';
export const safeLocalStorage = isBrowser ? window.localStorage : undefined;
export const safeSessionStorage = isBrowser ? window.sessionStorage : undefined;
export const safeDocument = isBrowser ? document : undefined;
export const safeNavigator = isBrowser ? navigator : undefined;
