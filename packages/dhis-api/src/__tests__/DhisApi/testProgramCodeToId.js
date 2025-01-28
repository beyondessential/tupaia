import { when } from 'jest-when';
import { createDhisApi } from './helpers';

const PROGRAM = { code: 'PROGRAM_CODE', id: 'program_dhisId' };

const fetchStub = jest.fn();
when(fetchStub)
  .mockResolvedValue({ programs: [] })
  .calledWith(
    'programs',
    {
      fields: expect.arrayContaining(['id']),
      filter: { code: PROGRAM.code },
    },
    undefined,
  )
  .mockResolvedValue({ programs: [{ id: PROGRAM.id }] });

const dhisApi = createDhisApi({ fetch: fetchStub });

export const testProgramCodeToId = () => {
  it('non existing program', () =>
    expect(dhisApi.programCodeToId('NON_EXISTING_CODE')).toBeRejectedWith('Program not found'));

  it('existing program', () =>
    expect(dhisApi.programCodeToId(PROGRAM.code)).resolves.toStrictEqual(PROGRAM.id));
};
