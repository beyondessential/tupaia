import { createSelector } from 'reselect';
import { POLYGON_MEASURE_TYPES, calculateRadiusScaleFactor } from '../utils/measures';
import { getMeasureFromHierarchy } from '../utils';
import { getOrgUnitFromCountry } from './utils';

// QUESTION: Good pattern? Selectors folder?

/**
 * Selectors
 * These can be handy tools to allow for components/sagas to interact with the redux state, and fetch data from it.
 * It allows us to define usefully composed aspects of the state, so that clients are not so tightly coupled with the
 * internal structure of state. With the use of memoization, and caching, we are also able to improve the performance
 * of state lookups, and importantly cut down on React re-render calls.
 */

// Private selectors
