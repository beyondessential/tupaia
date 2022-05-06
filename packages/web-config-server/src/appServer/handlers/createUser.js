import { fetchFromCentralServer } from '/appServer/requestHelpers';

/*
 * Function will attempt to create a new user on the TupaiaApp server
 * and check that the results of an App create user response are valid,
 * and throw an error if not
 *
 * Successful response should take the form of:
 * {
 *   "userId": "5a0ccc1ee54aa41b031c072b"
 * }
 *
 * Unsuccessful response should take the form of:
 * {
 *   "error": "Existing user found with same email address."
 * }
 * or
 * {
 *   "error": "Please complete fields."
 * }
 */
export const createUser = async userFields => {
  const result = await fetchFromCentralServer('user', userFields);
  if (result.error) {
    throw new Error(result.error);
  } else if (!result.userId) {
    throw new Error('Invalid response from user creation');
  }
  return result;
};
