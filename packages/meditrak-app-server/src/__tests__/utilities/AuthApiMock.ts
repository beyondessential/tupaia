type User = {
  email: string;
  password: string;
};

type Session = {
  email: string;
  refresh_token: string;
};

export class AuthApiMock {
  private readonly users: User[];
  private readonly sessions: Session[];

  public constructor({ users, sessions }: { users: User[]; sessions: Session[] }) {
    this.users = users;
    this.sessions = sessions;
  }

  public login(userDetails: { emailAddress: string; password: string }) {
    const matchingUser = this.users.find(
      user => user.email === userDetails.emailAddress && user.password === userDetails.password,
    );
    if (!matchingUser) {
      throw new Error(
        `No user found with email: ${userDetails.emailAddress} and password: ${userDetails.password}`,
      );
    }

    return matchingUser;
  }

  public refreshAccessToken(refreshToken: string) {
    const matchingSession = this.sessions.find(session => session.refresh_token === refreshToken);
    if (!matchingSession) {
      throw new Error(`No session found with refresh_token: ${refreshToken}`);
    }

    const matchingUser = this.users.find(user => user.email === matchingSession.email);
    if (!matchingUser) {
      throw new Error(`No user found with email: ${matchingSession.email}`);
    }

    return matchingUser;
  }
}
