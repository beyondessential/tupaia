/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sha256 from 'sha256';
import { SECRET_SALT } from 'react-native-dotenv';

export const saltAndHash = password => sha256(`${password}${SECRET_SALT}`);
