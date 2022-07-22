import { entityImage } from './entityImage';
import { entityHouseholdHead } from './entityHouseholdHead';
import { entityCoordinates } from './entityCoordinates';
import * as entityCreators from './entityCreate';
import { deduplicateQuestion } from './deduplicateQuestion';
import { registerHook } from './registry';

function registerAllHooks() {
  Object.entries({
    entityImage,
    entityHouseholdHead,
    entityCoordinates,
    ...entityCreators,
    deduplicateQuestion,
  }).map(([key, func]) => registerHook(key, func));
}

// all hooks work on dependency injection, so it's safe
// to register them all on import (ie, we don't need to
// wait for the database to connect, etc)
registerAllHooks();

export { registerHook, getHook } from './registry';
