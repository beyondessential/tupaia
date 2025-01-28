export interface SessionCookie {
  id: string;
  email: string;
  reset?: () => void;
}

export interface Credentials {
  emailAddress: string;
  password: string;
  deviceName: string;
  timezone: string;
}

export interface OneTimeCredentials {
  token: string;
  deviceName: string;
}

export interface RequestResetPasswordCredentials {
  emailAddress: string;
  resetPasswordUrl: string;
}
