/**
 * @deprecated use @tupaia/api-client
 */
export interface AuthHandler {
  email?: string;
  getAuthHeader: () => Promise<string>;
}
