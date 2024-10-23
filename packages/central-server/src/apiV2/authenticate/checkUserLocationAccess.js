/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { getCountryForTimezone } from 'countries-and-timezones';
import { createSupportTicket } from '../../utilities';

export const checkUserLocationAccess = async (req, user) => {
  if (!user) return;
  const { body, models } = req;
  const { timezone } = body;

  // The easiest way to get the country code is to use the timezone and get the most likely country using this timezone. This doesn't infringe on the user's privacy as the timezone is a very broad location. It also doesn't require the user to provide their location, which is a barrier to entry for some users.
  const country = getCountryForTimezone(timezone);
  if (!country) return;
  // the ID is the ISO country code.
  const { id, name } = country;

  const existingEntry = await models.userCountryAccessAttempt.findOne({
    user_id: user.id,
    country_code: id,
  });

  // If there is already an entry for this user and country, return
  if (existingEntry) return;

  const userEntryCount = await models.userCountryAccessAttempt.count({
    user_id: user.id,
  });

  const hasAnyEntries = userEntryCount > 0;

  await models.userCountryAccessAttempt.create({
    user_id: user.id,
    country_code: id,
  });

  // Don't send an email if this is the first time the user has attempted to login
  if (!hasAnyEntries) return;

  // create a support ticket if the user has attempted to login from a new country
  await createSupportTicket(
    'User attempted to login from a new country',
    `User ${user.first_name} ${user.last_name} (${user.id} - ${user.email}) attempted to access Tupaia from a new country: ${name}`,
  );
};
