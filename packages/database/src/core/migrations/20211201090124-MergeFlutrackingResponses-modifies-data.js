'use strict';

import assert from 'assert';
import { groupBy } from 'es-toolkit/compat';

import { arrayToDbString, insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const RESPONSE_GROUP_BATCH_SIZE = 20;

const getPercentage = (numerator, denominator) =>
  Math.round((numerator / denominator) * 10000) / 100;

const processInBatches = async (array, batchSize, processBatch) => {
  let i = 0;
  while (i < array.length) {
    const batch = array.slice(i, i + batchSize);
    await processBatch(batch, i);
    i += batchSize;
  }
};

const createAnswers = async (db, answers) => {
  for (const answer of answers) {
    await insertObject(db, 'answer', answer);
  }
};

const deleteResponses = async (db, responseIds) => {
  assert.ok(responseIds.length, 'Response ids to delete is empty');
  await db.runSql(`delete from survey_response where id in (${arrayToDbString(responseIds)});`);
};

/**
 * We merge group responses by using the most recent answers we can find in the group.
 * Start with the first (more recent) response and keep on adding any missing answers by using the
 * next response
 */
const mergeAnswersInResponseGroup = (responses, answersByResponseId) => {
  assert.ok(responses.length > 1, 'Each response group should have at least 2 elements');

  const sortedResponses = [...responses].sort(
    (responseA, responseB) => responseB.endTime.getTime() - responseA.endTime.getTime(),
  );

  const mostRecentResponse = sortedResponses[0];
  const mostRecentAnswers = answersByResponseId[mostRecentResponse.id];
  const answeredQuestionIds = mostRecentAnswers.map(a => a.question_id);

  const responseIdsToDelete = [];
  const answersToCreate = [];
  for (let i = 1; i < sortedResponses.length; i++) {
    const response = sortedResponses[i];
    const answers = answersByResponseId[response.id];
    responseIdsToDelete.push(response.id);

    answers.forEach(answer => {
      const { question_id: questionId } = answer;
      if (!answeredQuestionIds.includes(questionId)) {
        answeredQuestionIds.push(questionId);
        // Merge the answer from a response other than the most recent in the most recent response
        // All other responses (and their answers) can be deleted since they are redundant
        answersToCreate.push({ ...answer, survey_response_id: mostRecentResponse.id });
      }
    });
  }

  return { responseIdsToDelete, answersToCreate };
};

const selectAnswersForResponseGroups = async (db, responseGroups) => {
  const responseIds = responseGroups.flatMap(group => group.map(r => r.id));
  const { rows: answers } = await db.runSql(`
    select * from answer where survey_response_id IN (${arrayToDbString(responseIds)});
  `);
  return groupBy(answers, 'survey_response_id');
};

const processResponseGroups = async (db, responseGroupBatch) => {
  const answerByResponseId = await selectAnswersForResponseGroups(db, responseGroupBatch);
  const mergeData = responseGroupBatch.map(responseGroup =>
    mergeAnswersInResponseGroup(responseGroup, answerByResponseId),
  );

  const responseIdsToDelete = mergeData.flatMap(r => r.responseIdsToDelete);
  const answersToCreate = mergeData.flatMap(d => d.answersToCreate);
  await deleteResponses(db, responseIdsToDelete);
  await createAnswers(db, answersToCreate);
};

const groupResponsesByEntityAndWeek = duplicateResponses => {
  const groupedResponses = {};

  duplicateResponses.forEach(record => {
    const {
      id1,
      id2,
      end_time1: endTime1,
      end_time2: endTime2,
      entity_id: entityId,
      iso_week: isoWeek,
    } = record;
    const key = `${entityId}___${isoWeek}`;

    if (!(key in groupedResponses)) {
      groupedResponses[key] = {};
    }
    groupedResponses[key][id1] = { id: id1, endTime: endTime1 };
    groupedResponses[key][id2] = { id: id2, endTime: endTime2 };
  });

  return Object.values(groupedResponses).map(group => Object.values(group));
};

const selectDuplicateFlutrackingResponses = async (db, surveyCode) => {
  const { rows } = await db.runSql(`
    select
      sr.id as id1,
      sr2.id as id2,
      sr.end_time as end_time1,
      sr2.end_time as end_time2,
      sr.entity_id,
      concat(date_part('year', sr.data_time), 'W', date_part('week', sr.data_time)) as iso_week
    from survey_response sr
    join survey_response sr2 on sr2.id > sr.id and sr2.survey_id = sr.survey_id and sr2.entity_id = sr.entity_id
    join survey s on s.id = sr.survey_id
    where
      s.code = '${surveyCode}' and
      -- Join on same ISO week
      date_part('year', sr.data_time) = date_part('year', sr2.data_time) and
      date_part('week', sr.data_time) = date_part('week', sr2.data_time);
  `);

  return rows;
};

const mergeFlutrackingResponses = async (db, surveyCode) => {
  console.log(`* Merging duplicate responses for ${surveyCode}`);

  const duplicateResponses = await selectDuplicateFlutrackingResponses(db, surveyCode);
  const responseGroups = groupResponsesByEntityAndWeek(duplicateResponses);

  console.log(`Total groups found: ${responseGroups.length}`);

  // Note: we don't process all batches because it takes a really long time and may stall
  // other migrations. The execution strategy is:
  // 1. Run the migration once with a small subset of data
  // 2. Manually re-trigger the migration as many times as required until all data are processed
  const batchesToProcessCount = 1;
  const groupsToProcessCount = RESPONSE_GROUP_BATCH_SIZE * batchesToProcessCount;
  const groupsToProcess = responseGroups.slice(0, groupsToProcessCount);
  console.log(`Groups to process: ${groupsToProcess.length}`);

  await processInBatches(groupsToProcess, RESPONSE_GROUP_BATCH_SIZE, async (groupBatch, i) => {
    await db.runSql('START TRANSACTION');
    console.log(`${getPercentage(i, groupsToProcess.length)}%`);
    await processResponseGroups(db, groupBatch);
    await db.runSql('COMMIT');
  });

  console.log(`${surveyCode} responses merged successfully!`);
};

exports.up = async function (db) {
  await mergeFlutrackingResponses(db, 'FLWV'); // Flutracking LGA Weekly Values
  await mergeFlutrackingResponses(db, 'FPWV'); // Flutracking - Postcode
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
