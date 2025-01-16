import moment from 'moment';

/**
 * @param  {...any} args
 * @returns {Moment}
 */
export const utcMoment = (...args) => moment.utc(...args);
