export const CAT_USER = {
  firstName: 'Cat',
  lastName: 'Meow',
  email: 'cat@cathouse.com',
  password: 'dogbad',
};
export const CAT_USER_SESSION = { email: 'cat@cathouse.com', refresh_token: 'cat_dog' };

const USERS = [CAT_USER];

const SESSIONS = [CAT_USER_SESSION];

export const CAT_QUESTION = { code: 'CAT_QUESTION', text: 'What kind of cat do you have?' };
export const CAT_SURVEY = {
  code: 'CAT_SURVEY',
  name: 'Cat Survey',
  questions: [CAT_QUESTION],
};

export const TEST_DATA = {
  users: USERS,
  sessions: SESSIONS,
};
