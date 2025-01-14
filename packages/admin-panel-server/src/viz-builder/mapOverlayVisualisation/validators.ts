import { yup } from '@tupaia/utils';

export const draftMapOverlayValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  name: yup.string().required('Requires "name" for the visualisation'),
  permissionGroup: yup.string().required(),
  linkedMeasures: yup.array().of(yup.string()).nullable(),
  config: yup.object().required('Requires "config" for the visualisation'),
  countryCodes: yup.array().of(yup.string()).required(),
  projectCodes: yup.array().of(yup.string()).required(),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
  legacy: yup.mixed<false>().oneOf([false]),
  dataServices: yup.array().of(yup.object().shape({ isDataRegional: yup.boolean() })),
});

export const mapOverlayGroupValidator = yup.object().shape({
  code: yup.string().required(),
  name: yup.string().required(),
});

export const mapOverlayGroupRelationsValidator = yup.object().shape({
  mapOverlayGroupCode: yup.string().required(),
  childCode: yup.string().required(),
  childType: yup.string().oneOf(['mapOverlay', 'mapOverlayGroup']),
  sortOrder: yup.number().nullable(true),
});
