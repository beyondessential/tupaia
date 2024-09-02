/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebLeaderboardRequest } from '@tupaia/types';
import { hash, verify } from '@node-rs/argon2';
import { encryptPassword as sha256Encrypt } from '@tupaia/auth';

export type LeaderboardRequest = Request<
  DatatrakWebLeaderboardRequest.Params,
  DatatrakWebLeaderboardRequest.ResBody,
  DatatrakWebLeaderboardRequest.ReqBody,
  DatatrakWebLeaderboardRequest.ReqQuery
>;

export function encryptPassword(password: string, salt: string) {
  return hash(`${password}${salt}`);
}

export async function verifyPasswordOld(password: string, salt: string, hash: string) {
  return verify(hash, `${password}${salt}`);
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  // Try to verify password using argon2 directly
  const verify1 = await verify(hash, `${password}${salt}`);
  if (verify1) {
    return true;
  }

  // Try to verify password using sha256 plus argon2
  const hashedUserInput = sha256Encrypt(password, salt);

  return verify(hash, `${hashedUserInput}${salt}`);
}
export class LeaderboardRoute extends Route<LeaderboardRequest> {
  public async buildResponse() {
    const { models, query = {} } = this.req;
    console.log('LeaderboardRoute:buildResponse');

    const password = 'mysecretpassword';
    const salt = 'mysalt';
    const hashed = await encryptPassword(password, salt);
    const verified = await verifyPassword(password, salt, hashed);

    // Test with sha256 module
    const sha256Hash = sha256Encrypt(password, salt);
    console.log('INPUT', sha256Hash);
    const superHash = await encryptPassword(sha256Hash, salt);
    const verified2 = await verifyPassword(password, salt, superHash);

    console.log('verified super hash', verified2);

    // Wrong password
    // const wrong = await verifyPasswordOld('123', salt, hashed);
    // console.log('wrong', wrong);

    const leaderboard = await models.surveyResponse.getLeaderboard(query.projectId);
    return camelcaseKeys(leaderboard, { deep: true });
  }
}
