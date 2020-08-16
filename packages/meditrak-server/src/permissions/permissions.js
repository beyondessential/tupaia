/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 **/
import { PermissionsError } from '@tupaia/utils';

const checkPermissions = async (req, permissionsChecker) => {
  //Need to pass in a real permissionChecker function to be executed.
  if (req.flagPermissionChecked && permissionsChecker) {
    req.flagPermissionChecked();

    try {
      await permissionsChecker(req);
    } catch (e) {
      throw new PermissionsError(e.message);
    }
  }
};

export const ensurePermissionCheck = async (req, res, next) => {
  const originalResSend = res.send;

  //Assign generic checkPermission method to req
  //Every endpoint will have to call req.checkPermissions(permissionsChecker) to authorize the resources.
  req.checkPermissions = async permissionsChecker => {
    await checkPermissions(req, permissionsChecker); //req should have all the info to checkPermission including accessPolicy
  };

  //when permissionChecked is flagged, reset send method
  //to the originalResSend to allow sending response as normal
  req.flagPermissionChecked = () => {
    res.send = originalResSend;
  };

  //Modify the send method of res to send back NoPermissionCheckError.
  //If Permission is already checked, req.flagPermissionChecked() should have already been called, which will reset res.send() back to normal
  //If Permission is not yet checked, res.send() will execute like below, sending back NoPermissionCheckError.
  res.send = () => {
    res.send = originalResSend;
    res.status(501).send({
      error: 'No permission check was implemented for this endpoint',
    });
  };

  next();
};
