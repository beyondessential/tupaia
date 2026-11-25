import { z } from 'zod';

import type { TupaiaWebExportSurveyResponsesRequest } from '@tupaia/types';

/** Query params arrive as strings; central-server compares against `'true'` */
const booleanString = z.enum(['true', 'false']);

/** One or more non-empty codes, e.g. `SURVEY_A` or `SURVEY_A,SURVEY_B` */
const commaSeparatedCodes = z
  .string()
  .regex(/^[^,]+(?:,[^,]+)*$/, 'Expected a comma-separated list of codes');

/**
 * Describes the query as it arrives on the wire. Unknown params are stripped (the download URL
 * carries extra params from the report query), and values are forwarded as-is, without coercion.
 */
export const exportSurveyResponsesQuerySchema = z.object({
  itemCode: z.string().min(1),
  organisationUnitCode: z.string().min(1),
  /**
   * Required and non-empty: central-server treats a missing or empty `surveyCodes` as “every
   * survey enabled for the country”. tupaia-web always sends the selected codes, comma-separated.
   */
  surveyCodes: commaSeparatedCodes,
  latest: booleanString.optional(),
  easyReadingMode: booleanString.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().optional(),
}) satisfies z.ZodType<TupaiaWebExportSurveyResponsesRequest.ReqQuery>;

export type ExportSurveyResponsesQuery = z.infer<typeof exportSurveyResponsesQuerySchema>;
