export const useIsWebApp = () => window.matchMedia('(display-mode: standalone)').matches;
