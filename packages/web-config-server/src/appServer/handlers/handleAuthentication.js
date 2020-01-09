import { fetchFromMediTrakServer } from '/appServer/requestHelpers';
import { UserSession } from '/models';

/*
 * Function will authenticate again tupaia app auth server and translate
 * permissionGroups to userGroups
 *
 * onError: will be called if there is problem communicating or mapping
 * permissionGroups -> to userGroups or country -> countryCode
 *
 * onResults: will be called with null if credentials missmatch or keys missing
 * in json -> (userAddress, password, or deviceName), otherwise onResults will return
 * userSettings in the format: { userName: .., userGroups: { group: [orgUnitCode]..}
 * publicUserConfig userGroups will be joined to every user's userGroups
 *
 */
export const handleAuthentication = async (userCredentials, grantType = 'password') => {
  const response = await fetchFromMediTrakServer('auth', userCredentials, { grantType });
  return processResponse(response);
};

const processResponse = resultJson => {
  // if error keys present there is auth problem or following keys missing in body:
  // userAddress, password, or deviceName
  if (resultJson.error) {
    return null;
  }
  const { user } = resultJson;
  console.log(user);
  const { accessPolicy } = user;
  // attach public user groups permissions to every user
  UserSession.updateOrCreate({ userName: user.name }, { ...resultJson, accessPolicy }); // Save tokens for user
  const { name: userName, email, verifiedEmail } = user;
  return {
    userName,
    email,
    verifiedEmail,
  };
};

/*
*** dealWithResults from:

{ user:
   { id: '590fb2d10c2a174db520c41d',
     name: 'Test User',
     accessPolicy: { 'Demo Land': [Object] } } }

*** dealWithResults to:

{
    "userName": "Test User",
    "email": "testuser@test.com",
    "accessPolicy": {
       ...
    }
}
NOTE: Public->World is from publicUserConfig

*/
