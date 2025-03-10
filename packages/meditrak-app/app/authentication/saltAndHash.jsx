import sha256 from 'sha256';
import Config from 'react-native-config';

export const saltAndHash = password => sha256(`${password}${Config.SECRET_SALT}`);
