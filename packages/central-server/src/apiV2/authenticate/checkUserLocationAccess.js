import { getCountryForTimezone } from 'countries-and-timezones';

export const checkUserLocationAccess = async (req, user) => {
  if (!user) return;
  const { body, models } = req;
  const { timezone } = body;

  // The easiest way to get the country code is to use the timezone and get the most likely country using this timezone. This doesn't infringe on the user's privacy as the timezone is a very broad location. It also doesn't require the user to provide their location, which is a barrier to entry for some users.
  const country = getCountryForTimezone(timezone);
  if (!country) return;
  // the ID is the ISO country code.
  const { id } = country;

  const existingEntry = await models.userCountryAccessAttempt.findOne({
    user_id: user.id,
    country_code: id,
  });

  // If there is already an entry for this user and country, return
  if (existingEntry) return;

  await models.userCountryAccessAttempt.create({
    user_id: user.id,
    country_code: id,
  });
};
