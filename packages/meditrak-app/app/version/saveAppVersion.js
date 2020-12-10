/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_VERSION_KEY } from './constants';

export const saveAppVersion = version => AsyncStorage.setItem(APP_VERSION_KEY, version);
