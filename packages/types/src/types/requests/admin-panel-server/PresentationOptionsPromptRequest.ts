export type Params = Record<string, never>;

export type ResBody = {
  status_code: number;
  presentationConfig?: Record<string, unknown>;
  message: string;
};
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
}
