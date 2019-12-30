/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { hashPassword } from 'authentication-utilities';
import { SECRET_SALT } from 'react-native-dotenv';

export const saltAndHash = password => hashPassword(password, SECRET_SALT);
