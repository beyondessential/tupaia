const USERS_EXCLUDED_FROM_LEADER_BOARD = [
  "'edmofro@gmail.com'", // Edwin
  "'kahlinda.mahoney@gmail.com'", // Kahlinda
  "'lparish1980@gmail.com'", // Lewis
  "'sus.lake@gmail.com'", // Susie
  "'michaelnunan@hotmail.com'", // Michael
  "'vanbeekandrew@gmail.com'", // Andrew
  "'gerardckelly@gmail.com'", // Gerry K
  "'geoffreyfisher@hotmail.com'", // Geoff F
  "'unicef.laos.edu@gmail.com'", // Laos Schools Data Collector
];
const SYSTEM_USERS = [
  "'tamanu-server@tupaia.org'", // Tamanu Server
  "'public@tupaia.org'", // Public User
  "'josh@sussol.net'", // mSupply API Client
];
const INTERNAL_EMAIL = ['@beyondessential.com.au', '@bes.au'];
const INTERNAL_PROJECT_IDS = [
  '6684ac9d0f018e110b000a00', // bes_asset_demo
  '66a03660718c54751609eeed', // bes_asset_tracker
  '6704622a45a4fc4941071605', // bes_reporting
];

export function getLeaderboardQuery(projectId = '') {
  const isInternalProject = projectId && INTERNAL_PROJECT_IDS.includes(projectId);

  const besUsersFilter = `AND ${INTERNAL_EMAIL.map(email => `email NOT LIKE '%${email}'`).join(' AND ')}`;
  const excludedUserAccountList = isInternalProject
    ? SYSTEM_USERS
    : [...SYSTEM_USERS, ...USERS_EXCLUDED_FROM_LEADER_BOARD];

  return `
    SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
    FROM (
      SELECT user_id, COUNT(*)::INT AS coconuts, FLOOR(COUNT(*) / 100)::INT AS pigs
      FROM survey_response
      JOIN survey ON survey.id=survey_id
      ${projectId ? 'WHERE survey.project_id = ?' : ''}
      GROUP BY user_id
    ) r
    JOIN user_account ON user_account.id = r.user_id
    WHERE email NOT IN (${excludedUserAccountList.join(',')})
    ${!isInternalProject ? besUsersFilter : ''}
    ORDER BY coconuts DESC
    LIMIT ?;
  `;
}
