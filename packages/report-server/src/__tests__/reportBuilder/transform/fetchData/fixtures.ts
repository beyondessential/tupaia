import { periodToMoment, utcMoment } from '@tupaia/tsutils';
import { EARLIEST_DATA_DATE_STRING, getPeriodsInRange, yup } from '@tupaia/utils';
import { CURRENT_DATE_STUB } from '../../../fixtures';

export const HIERARCHY = 'explore';

export const ENTITIES = [
  { code: 'explore', country_code: null, type: 'project' },
  { code: 'TO', country_code: 'TO', type: 'country' },
  { code: 'WS', country_code: 'WS', type: 'country' },
  { code: 'KI', country_code: 'KI', type: 'country' },
  { code: 'MY', country_code: 'MY', type: 'country' },
  { code: 'PG', country_code: 'PG', type: 'country' },
  { code: 'PG_District', country_code: 'PG', type: 'district' },
  { code: 'PG_Facility', country_code: 'PG', type: 'facility' },
  { code: 'underwater_world', country_code: null, type: 'project' },
  { code: 'AQUA_LAND', country_code: 'AQUA_LAND', type: 'country' },
];

export const RELATIONS = {
  explore: [
    { parent: 'explore', child: 'TO' },
    { parent: 'explore', child: 'WS' },
    { parent: 'explore', child: 'KI' },
    { parent: 'explore', child: 'MY' },
    { parent: 'explore', child: 'PG' },
    { parent: 'PG', child: 'PG_District' },
    { parent: 'PG_District', child: 'PG_Facility' },
  ],
  underwater_world: [{ parent: 'underwater_world', child: 'AQUA_LAND' }],
};

const SURVEY_QUESTIONS = {
  BCD: ['BCD1', 'BCD2'],
  ABC: ['ABC1', 'ABC2'],
};

const generateFakeAnalytics = () => {
  const periods = getPeriodsInRange(EARLIEST_DATA_DATE_STRING, CURRENT_DATE_STUB, 'DAY');
  const organisationUnits = ENTITIES.map(({ code }) => code);
  const dataElements = Object.values(SURVEY_QUESTIONS).flat();
  let count = 0;
  const fakeAnalytics: {
    period: string;
    organisationUnit: string;
    dataElement: string;
    value: number;
  }[] = [];
  periods.forEach(period =>
    organisationUnits.forEach(organisationUnit =>
      dataElements.forEach(dataElement => {
        // Only add each 234th analytic, to cut down on the record size to make error messages more helpful
        if (count % 233 === 0) {
          fakeAnalytics.push({ period, organisationUnit, dataElement, value: count });
        }

        count++;
      }),
    ),
  );
  return fakeAnalytics;
};

const ANALYTICS = generateFakeAnalytics();

const analyticsParamsValidator = yup.object({
  dataElementCodes: yup.array(yup.string().required()).required(),
  organisationUnitCodes: yup.array(yup.string().required()).required(),
  startDate: yup.string().default(EARLIEST_DATA_DATE_STRING),
  endDate: yup.string().default(CURRENT_DATE_STUB),
});

export const analyticsDataTable = {
  fetchData: (parameters: Record<string, unknown>) => {
    const validParameters = analyticsParamsValidator.validateSync(parameters);
    const { dataElementCodes, organisationUnitCodes, startDate, endDate } = validParameters;
    return ANALYTICS.filter(
      analytic =>
        dataElementCodes.includes(analytic.dataElement) &&
        organisationUnitCodes.includes(analytic.organisationUnit) &&
        periodToMoment(analytic.period) >= utcMoment(startDate) &&
        periodToMoment(analytic.period) <= utcMoment(endDate),
    );
  },
};
