import { PermissionsError } from '@tupaia/utils';
import winston from '../log';

const isPermissionAssertionValid = (flagPermissionsChecked, assertion) => {
  const flaggerType = typeof flagPermissionsChecked;
  const assertionType = typeof assertion;
  const isFlaggerValid = flaggerType === 'function';
  const isAssertionValid = assertionType === 'function';

  if (!isFlaggerValid) {
    // Differential for null vs “real” object
    const suffix = flagPermissionsChecked === null ? `is null` : `has type '${flaggerType}'`;
    winston.warn(`flagPermissionsChecked should be a function, but ${suffix}`);
  }
  if (!isAssertionValid) {
    const suffix = assertion === null ? `is null` : `has type '${assertionType}'`;
    winston.warn(`assertion should be a function, but ${suffix}`);
  }

  return isFlaggerValid && isAssertionValid;
};

const assertPermissions = async (req, assertion) => {
  const { accessPolicy, flagPermissionsChecked } = req;
  // Need to pass in a real permission assertion function to be executed.
  if (!isPermissionAssertionValid(flagPermissionsChecked, assertion)) {
    winston.warn('Skipping invalid permission assertion');
    return;
  }

  flagPermissionsChecked();
  try {
    await assertion(accessPolicy);
  } catch (e) {
    winston.debug(`Assertion ${assertion.name || '<anonymous>'} failed`);
    throw new PermissionsError(e.message);
  }
};

export const ensurePermissionCheck = async (req, res, next) => {
  const originalResSend = res.send;

  // Assign generic assertPermissions method to req
  // Every endpoint will have to call req.assertPermissions(assertion) to authorize the resources.
  req.assertPermissions = async assertion => {
    await assertPermissions(req, assertion); // req should have all the info required by the assertion (e.g. accessPolicy)
  };

  // when permissionChecked is flagged, reset send method
  // to the originalResSend to allow sending response as normal
  req.flagPermissionsChecked = () => {
    res.send = originalResSend;
  };

  // Modify the send method of res to send back NoPermissionCheckError.
  // If Permission is already checked, req.flagPermissionsChecked() should have already been called, which will reset res.send() back to normal
  // If Permission is not yet checked, res.send() will execute like below, sending back NoPermissionCheckError.
  res.send = (...args) => {
    res.send = originalResSend;
    // allow errors to be sent without a permissions check
    if (res.statusCode < 200 || res.statusCode >= 300) {
      res.send(...args);
      return;
    }
    res.status(501).send({
      error: 'No permission check was implemented for this endpoint',
    });
  };

  next();
};
