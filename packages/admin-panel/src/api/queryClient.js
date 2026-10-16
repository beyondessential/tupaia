import { QueryClient } from '@tanstack/react-query';

// Shared singleton so non-React code (e.g. the redux editor save flow) can
// invalidate react-query caches that React components read from.
export const queryClient = new QueryClient();
