/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedRouteHandler } from './UnauthenticatedRouteHandler';

// @todo remove and replace with connection to meditrak-server
const response = {
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OTBmYjJkMTBjMmExNzRkYjUyMGM0MWQiLCJyZWZyZXNoVG9rZW4iOiJTcGVGYU01dzhWNHVJZ1JCMWZRbW9pWTRqQTZuc1NZa1ZSWGNwVEM1IiwiaWF0IjoxNjA2MTk4MTY0LCJleHAiOjE2MDYxOTkwNjR9.6KT5RWIX3HN2rwYUnuifSnYLItUH52lZZjKnpZhO8wQ',
  refreshToken: 'SpeFaM5w8V4uIgRB1fQmoiY4jA6nsSYkVRXcpTC5',
  user: {
    id: '590fb2d10c2a174db520c41d',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    position: 'Tester',
    employer: 'Test Company',
    email: 'testuser@test.com',
    profileImage: null,
    verifiedEmail: 'verified',
    accessPolicy: {
      FJ: ['PSSS'],
      TO: ['PSSS'],
    },
  },
};

export class LoginHandler extends UnauthenticatedRouteHandler {
  async buildResponse() {
    // @todo fetch from meditrak-server
    const { accessToken, refreshToken, user } = response;
    const { accessPolicy, email } = user;

    const { id } = await this.sessionModel.create({
      email,
      access_policy: JSON.stringify(accessPolicy),
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // set sessionId cookie
    this.req.sessionCookie = { id, email };

    return { accessPolicy };
  }
}
