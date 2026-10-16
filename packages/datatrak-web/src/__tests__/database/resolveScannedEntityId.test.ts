import { QueryConjunctions } from '@tupaia/tsmodels';
import { resolveScannedEntityId } from '../../database';
import type { DatatrakWebModelRegistry } from '../../types';

const PROJECT_CODE = 'test_project';
const PROJECT_ID = 'project-1';

const buildModels = ({
  sibling,
  localCopy,
}: {
  sibling: { code: string } | null;
  localCopy: { id: string } | null;
}) => {
  const findOne = jest.fn().mockResolvedValue(sibling);
  const findOneByCodeInProject = jest.fn().mockResolvedValue(localCopy);
  const projectFindOne = jest.fn().mockResolvedValue({ id: PROJECT_ID });

  const models = {
    entity: { findOne, findOneByCodeInProject },
    project: { findOne: projectFindOne },
  } as unknown as DatatrakWebModelRegistry;

  return { models, findOne, findOneByCodeInProject, projectFindOne };
};

describe('resolveScannedEntityId', () => {
  it('resolves a scanned id found in a local entity’s duplicate_ids to the local project copy', async () => {
    const { models, findOne, findOneByCodeInProject } = buildModels({
      sibling: { code: 'FACILITY_A' },
      localCopy: { id: 'local-copy-id' },
    });

    const result = await resolveScannedEntityId(models, 'scanned-id', PROJECT_CODE);

    expect(result).toBe('local-copy-id');
    // Queried by the scanned id being contained in some entity's duplicate_ids
    expect(findOne).toHaveBeenCalledWith({
      [QueryConjunctions.RAW]: {
        sql: 'duplicate_ids @> ARRAY[?]',
        parameters: ['scanned-id'],
      },
    });
    // Then resolved that entity's code to this project's copy
    expect(findOneByCodeInProject).toHaveBeenCalledWith('FACILITY_A', PROJECT_ID);
  });

  it('returns undefined for a genuinely unknown id (caller then falls through to online)', async () => {
    const { models, findOneByCodeInProject } = buildModels({
      sibling: null,
      localCopy: null,
    });

    const result = await resolveScannedEntityId(models, 'unknown-id', PROJECT_CODE);

    expect(result).toBeUndefined();
    expect(findOneByCodeInProject).not.toHaveBeenCalled();
  });

  it('returns undefined when the sibling exists but this project has no local copy', async () => {
    const { models } = buildModels({
      sibling: { code: 'FACILITY_A' },
      localCopy: null,
    });

    const result = await resolveScannedEntityId(models, 'scanned-id', PROJECT_CODE);

    expect(result).toBeUndefined();
  });
});
