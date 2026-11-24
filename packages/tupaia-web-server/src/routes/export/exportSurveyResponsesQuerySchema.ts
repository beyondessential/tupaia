import { z } from 'zod';

import type { TupaiaWebExportSurveyResponsesRequest } from '@tupaia/types';

/** Query params arrive as strings; central-server compares against `'true'` */
const booleanString = z.enum(['true', 'false']);

/**
 * Describes the query as it arrives on the wire. Unknown params are stripped (the download URL
 * carries extra params from the report query), and values are forwarded as-is, without coercion.
 */
export const exportSurveyResponsesQuerySchema = z.object({
  itemCode: z.string().min(1),
  organisationUnitCode: z.string().min(1),
  /** Comma-separated string, or repeated param (`?surveyCodes=a&surveyCodes=b`) */
  surveyCodes: z.union([z.string(), z.array(z.string())]).optional(),
  latest: booleanString.optional(),
  easyReadingMode: booleanString.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().optional(),
}) satisfies z.ZodType<TupaiaWebExportSurveyResponsesRequest.ReqQuery>;

export type ExportSurveyResponsesQuery = z.infer<typeof exportSurveyResponsesQuerySchema>;
