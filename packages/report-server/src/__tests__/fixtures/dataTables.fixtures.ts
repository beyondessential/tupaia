import { EARLIEST_DATA_DATE_STRING, yup } from '@tupaia/utils';

export const CURRENT_DATE_STUB = '2020-12-15T00:00:00Z';

const EVENTS: Record<
  string,
  { orgUnit: string; eventDate: string; orgUnitName: string; dataValues: Record<string, unknown> }[]
> = {
  BCD: [
    {
      orgUnit: 'TO',
      eventDate: '2020-01-01',
      orgUnitName: 'Tonga',
      dataValues: { BCD1: 7, BCD2: 8 },
    },
  ],
  ABC: [
    {
      orgUnit: 'TO',
      eventDate: '2020-01-01',
      orgUnitName: 'Tonga',
      dataValues: { ABC1: 7, ABC2: 8 },
    },
    {
      orgUnit: 'TO_village',
      eventDate: '2020-01-01',
      orgUnitName: 'Village 1',
      dataValues: { ABC1: 9, ABC2: 10 },
    },
  ],
};

const eventsParamsValidator = yup.object({
  dataGroupCode: yup.string().required(),
  dataElementCodes: yup.array(yup.string().required()).required(),
  organisationUnitCodes: yup.array(yup.string().required()).required(),
  startDate: yup.string().default(EARLIEST_DATA_DATE_STRING),
  endDate: yup.string().default(CURRENT_DATE_STUB),
});

export const eventsDataTable = {
  fetchData: (parameters: Record<string, unknown>) => {
    const validParameters = eventsParamsValidator.validateSync(parameters);
    const { dataGroupCode, dataElementCodes, organisationUnitCodes, startDate, endDate } =
      validParameters;
    const eventsForDataGroup = EVENTS[dataGroupCode];
    const eventsMatchingFilters = eventsForDataGroup.filter(
      event =>
        organisationUnitCodes.includes(event.orgUnit) &&
        event.eventDate >= startDate &&
        event.eventDate <= endDate,
    );
    const events = eventsMatchingFilters.map(({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: Object.fromEntries(
        Object.entries(dataValues).filter(([dataElement]) =>
          dataElementCodes.includes(dataElement),
        ),
      ),
    }));

    return events.map(({ dataValues, ...restOfEvent }) => ({ ...dataValues, ...restOfEvent }));
  },
};
