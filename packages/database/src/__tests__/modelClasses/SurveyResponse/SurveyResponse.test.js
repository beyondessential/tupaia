import { getLeaderboardQuery } from '../../../core/modelClasses/SurveyResponse/leaderboard';

const USERS_EXCLUDED_FROM_LEADER_BOARD = [
  "'edmofro@gmail.com'",
  "'kahlinda.mahoney@gmail.com'",
  "'lparish1980@gmail.com'",
  "'sus.lake@gmail.com'",
  "'michaelnunan@hotmail.com'",
  "'vanbeekandrew@gmail.com'",
  "'gerardckelly@gmail.com'",
  "'geoffreyfisher@hotmail.com'",
  "'unicef.laos.edu@gmail.com'",
];
const SYSTEM_USERS = ["'tamanu-server@tupaia.org'", "'public@tupaia.org'", "'josh@sussol.net'"];

const normalizeWhitespace = str => str.trim().replace(/(\s|\n)+/g, ' ');
const expectToBe = (expected, actual) => {
  expect(normalizeWhitespace(actual)).toBe(normalizeWhitespace(expected));
};

describe('getLeaderboardQuery()', () => {
  it('should filter out internal users on standard projects', async () => {
    const expectedLeaderboard = `
      SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
      FROM (
        SELECT user_id, COUNT(*)::INT AS coconuts, FLOOR(COUNT(*) / 100)::INT AS pigs
        FROM survey_response
        JOIN survey ON survey.id=survey_id
        WHERE survey.project_id = ?
        GROUP BY user_id
      ) r
      JOIN user_account ON user_account.id = r.user_id
      WHERE email NOT IN (${[...SYSTEM_USERS, ...USERS_EXCLUDED_FROM_LEADER_BOARD].join(',')})
      AND email NOT LIKE '%@beyondessential.com.au' AND email NOT LIKE '%@bes.au'
      ORDER BY coconuts DESC
      LIMIT ?;`;

    expectToBe(getLeaderboardQuery('5dfc6eaf61f76a497716cddf'), expectedLeaderboard);
  });

  it('should not filter out internal users on internal projects', async () => {
    const INTERNAL_PROJECT_IDS = [
      '6684ac9d0f018e110b000a00', // bes_asset_demo
      '66a03660718c54751609eeed', // bes_asset_tracker
      '6704622a45a4fc4941071605', // bes_reporting
    ];
    const expectedLeaderboard = `
      SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
      FROM (
        SELECT user_id, COUNT(*)::INT AS coconuts, FLOOR(COUNT(*) / 100)::INT AS pigs
        FROM survey_response
        JOIN survey ON survey.id=survey_id
        WHERE survey.project_id = ?
        GROUP BY user_id
      ) r
      JOIN user_account ON user_account.id = r.user_id
      WHERE email NOT IN (${SYSTEM_USERS.join(',')})
      ORDER BY coconuts DESC
      LIMIT ?;`;

    INTERNAL_PROJECT_IDS.forEach(projectId => {
      expectToBe(getLeaderboardQuery(projectId), expectedLeaderboard);
    });
  });
});
