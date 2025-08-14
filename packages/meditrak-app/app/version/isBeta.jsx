import Config from 'react-native-config';

export const isBeta = !!Config.BETA_BRANCH;
export const betaBranch = Config.BETA_BRANCH;
export const centralApiUrl = Config.CENTRAL_API_URL;
