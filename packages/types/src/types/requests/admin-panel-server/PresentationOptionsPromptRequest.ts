export type Params = Record<string, never>;

export type ResBody = {
  status_code: number;
  presentationConfig?: Record<string, unknown>;
  message: string;
};

export type ReqBody = {
  inputMessage: string;
  dataStructure: Record<string, unknown>;
  presentationOptions: Record<string, unknown>;
};
export interface ReqQuery {
  fields?: string[];
}
