declare global {
  namespace Express {
    export interface Request {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: Record<string, any>;
    }

    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: Record<string, any>;
    }
  }
}

export {};
