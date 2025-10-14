import { getBrowserTimeZone } from '@tupaia/utils';
import { post } from '../api';
import { SignInParams } from './AuthService';

export const login = async (params: SignInParams) =>
  post('login', {
    data: {
      emailAddress: params.email,
      password: params.password,
      deviceName: window.navigator.userAgent,
      timezone: getBrowserTimeZone(),
    },
  });
