import { KeysToCamelCase, TupaiaWebUserRequest } from '@tupaia/types';

export type User = KeysToCamelCase<TupaiaWebUserRequest.ResBody>;
