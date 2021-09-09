import { respond, translateBounds, translatePoint } from '@tupaia/utils';

// disaster event types (match disasterEvent.type enum in postgres)
const DISASTER_EVENT_START = 'start';
const DISASTER_EVENT_END = 'end';
const DISASTER_EVENT_RESOLVE = 'resolve';

// disaster status types
const DISASTER_PENDING = 'pending'; // no events yet
const DISASTER_ACTIVE = 'active'; // has events that have started but not ended
const DISASTER_ENDED = 'ended'; // has events that have ended but not resolved
const DISASTER_RESOLVED = 'resolved'; // all events have resolved

const DISASTER_STATUS_PRIORITIES = [
  DISASTER_PENDING,
  DISASTER_EVENT_RESOLVE,
  DISASTER_EVENT_END,
  DISASTER_EVENT_START,
];

const DISASTER_STATUSES = [DISASTER_PENDING, DISASTER_RESOLVED, DISASTER_ENDED, DISASTER_ACTIVE];

function determineDisasterDetails(events) {
  // start and end dates for the entire disaster
  let earliest = null;
  let latest = null;

  // latest received state for each org unit
  const orgUnitStates = {};

  events
    .sort((a, b) => a.date - b.date)
    .forEach(({ date, type, organisationUnitCode }) => {
      orgUnitStates[organisationUnitCode] = type;
      if (date > latest || !latest) {
        latest = date;
      }
      if (date < earliest || !earliest) {
        earliest = date;
      }
    });

  // get "worst" condition from all affected units
  const overallPriority = Object.values(orgUnitStates).reduce((state, current) => {
    const priority = DISASTER_STATUS_PRIORITIES.indexOf(current);
    return Math.max(priority, state);
  }, 0);

  // map worst org unit status to overall disaster status
  const status = DISASTER_STATUSES[overallPriority];

  return {
    status,
    startDate: earliest,
    endDate: status !== DISASTER_ACTIVE ? latest : null,
  };
}

// get events from database and annotate disaster with more detailed info
async function addAdditionalDetails(models, disaster) {
  const events = await models.disasterEvent.find({
    disasterId: disaster.code,
  });

  const details = determineDisasterDetails(events);
  const location = (await models.entity.findOne({ code: disaster.countryCode })).name;

  return {
    ...disaster,
    ...details,
    location,
  };
}

export async function disasters(req, res) {
  const { models } = req;
  const allDisasters = await models.disaster.getAllDisasterDetails();
  const allDisastersWithExtraDetails = await Promise.all(
    allDisasters.map(d => addAdditionalDetails(models, d)),
  );
  const responseData = allDisastersWithExtraDetails
    .filter(d => d.status !== DISASTER_RESOLVED)
    .map(({ bounds, point, ...d }) => ({
      ...d,
      bounds: translateBounds(bounds),
      coordinates: translatePoint(point),
    }));

  respond(res, { disasters: responseData });
}
