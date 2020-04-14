/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { SECRET_SALT } from 'react-native-dotenv';
import { encryptPassword } from '@tupaia/auth';

export const saltAndHash = password => encryptPassword(password, SECRET_SALT);
