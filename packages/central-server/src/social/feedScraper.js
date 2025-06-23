import winston from 'winston';
import { ANSWER_TYPES } from '../database/models/Answer';

const SKIPPED_COUNTRY_CODES = ['DL']; // Exclude Demo Land survey responses from the feed
const POLL_TIME = 5 * 60 * 1000; // Run every 5 minutes.
let isRunning = false;

export const startFeedScraper = models => {
  // Start recursive sync loop (enabled by default)
  if (process.env.FEED_SCRAPER_DISABLE === 'true') {
    winston.info('Feed scraper is disabled');
    return;
  }

  setInterval(async () => {
    try {
      if (!isRunning) {
        isRunning = true;
        addLatestSurveyFeedItems(models);
      }
    } catch (e) {
      winston.warn('Feed scraper failed');
      winston.error(e);
    } finally {
      isRunning = false;
    }
  }, POLL_TIME);

  addLatestSurveyFeedItems(models);
};

const addLatestSurveyFeedItems = async models => {
  const type = 'SurveyResponse';

  const latestSurveyFeedItem = await getLastFeedItemOfType(models, type);
  const minimumDateOfSurveyToAddToFeed = '2018-01-01';
  const lastSurveyFeedItemDate = latestSurveyFeedItem
    ? latestSurveyFeedItem.creation_date
    : minimumDateOfSurveyToAddToFeed;

  const newSurveyResponses = await getLatestSurveyResponses(models, lastSurveyFeedItemDate);

  // Use async for loop instead of Promise.all because this process doesn't block
  // user events and should pace itself to avoid overloading the database.
  for (const surveyResponse of newSurveyResponses) {
    try {
      const { id: surveyResponseId, end_time: endTime } = surveyResponse;

      const { name: surveyName, permission_group_id: permissionGroupId } =
        await surveyResponse.survey();
      const { facilityCode, facilityName, geographicalAreaId, regionName } =
        await getSurveyResponseFacilityData(models, surveyResponse);
      const {
        id: countryId,
        name: countryName,
        code: countryCode,
      } = await surveyResponse.country();
      const { id: userId, fullName: authorName } = await surveyResponse.user();
      if (SKIPPED_COUNTRY_CODES.includes(countryCode)) {
        continue;
      }

      const photoAnswer = await models.answer.findOne(
        {
          type: ANSWER_TYPES.PHOTO,
          survey_response_id: surveyResponse.id,
        },
        {},
      );
      const imageUrl = photoAnswer ? photoAnswer.text : null;
      const link = facilityCode
        ? `https://mobile.tupaia.org/explore/${facilityCode}`
        : `https://mobile.tupaia.org/explore/${countryCode}`;

      await models.feedItem.create({
        type,
        record_id: surveyResponseId,
        user_id: userId,
        country_id: countryId,
        geographical_area_id: geographicalAreaId,
        permission_group_id: permissionGroupId,
        creation_date: endTime,
        template_variables: {
          authorName,
          surveyName,
          facilityName,
          regionName,
          countryName,
          imageUrl,
          link,
        },
      });
    } catch (e) {
      winston.warn('Skipping creating of feed item due to error');
      winston.error(e);
    }
  }
};

const getSurveyResponseFacilityData = async (models, surveyResponse) => {
  const data = {};

  const { code: orgUnitCode } = await surveyResponse.fetchOrganisationUnit();
  const facility = await models.facility.findOne({ code: orgUnitCode });
  if (facility) {
    data.geographicalAreaId = facility.geographical_area_id;
    data.facilityName = facility.name;
    data.facilityCode = facility.code;
    data.regionName = (await facility.geographicalArea()).name;
  } else {
    const geographicalArea = await models.geographicalArea.findOne({ code: orgUnitCode });
    if (geographicalArea) {
      data.geographicalAreaId = geographicalArea.id;
      data.regionName = geographicalArea.name;
    }
  }

  return data;
};

const getLatestSurveyResponses = async (models, lastPostedTime, databaseWhereConditions = {}) => {
  const whereConditions = {
    end_time: {
      comparator: '>',
      comparisonValue: lastPostedTime,
    },
    ...databaseWhereConditions,
  };
  const queryOptions = {
    sort: ['end_time'],
  };

  return models.surveyResponse.find(whereConditions, queryOptions);
};

const getLastFeedItemOfType = async (models, type) => {
  const whereConditions = {
    type,
  };
  const queryOptions = {
    sort: ['creation_date DESC'],
  };

  try {
    return models.feedItem.findOne(whereConditions, queryOptions);
  } catch (e) {
    winston.warn('Did not find feed item', { type });
    return null;
  }
};
