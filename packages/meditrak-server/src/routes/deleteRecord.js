/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import {
  constructRecordExistsWithId,
  respond,
  singularise,
  ValidationError,
  DatabaseError,
} from '@tupaia/utils';

/**
 * Responds to the DELETE requests by deleting the record with the given id
 **/
export async function deleteRecord(req, res) {
  const { models, params } = req;
  const { resource: pluralResource, recordId } = params;
  const resource = singularise(pluralResource);
  const model = models[resource];
  if (!model.isDeletableViaApi) {
    throw new ValidationError(`${resource} is not a valid DELETE endpoint`);
  }

  // Validate that the record to be deleted actually exists (will throw an error if not)
  await constructRecordExistsWithId(model)(recordId);

  // Delete the record (which will delete associated child records if cascading is set up)
  try {
    await model.deleteById(recordId);
  } catch (error) {
    if (error.constraint && error.constraint.endsWith('fkey')) {
      throw new DatabaseError(
        `Cannot delete ${resource} while there are still records in the ${error.table} table`,
      );
    }
    throw error;
  }
  respond(res, { message: `Successfully deleted ${resource}` });
}
