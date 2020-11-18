/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';

export const formatPlural = (singular, plural, count) =>
  count === 1 ? singular.replace('@count', count) : plural.replace('@count', count);

export const formatDate = (date, format) => moment(date).format(format);
export const formatDateAgo = date => moment(date).fromNow();
