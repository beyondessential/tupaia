## view

Request a chart or view

* ###### URL

 `/survey`

* ###### METHOD

  `GET`

* ###### URL PARAMS

  ```
  viewId: ${viewId}
  organisationUnitCode: ${organisationUnitCode} // facility level only
  dashboardGroupId: ${dashboardGroupId}
  surveyCodes: ${surveyCodes} // array of one or more codes
  ```

* ###### SAMPLE request

 `/api/v1/survey?viewId=31&organisationUnitCode=TO&dashboardGroupId=18&surveyCodes=DP,CD`

* ###### ON SUCCESS
  * code:  `200`
  * content: FILE

* ###### ON FAIL
 * code: `401` content: `{ status: permissionFail, details.. }`
   * `{details: Organisation unit does not exist}` - invalid organisation units or organisationUnitCode is not the query params
   * `{details: Dashboard with this id and matching organisation unit does not exist}`  - invalid user group config id, dashboardGroup doesn't match userGroup or user group config id does not match userGroup and organisationUnitCode it is for or dashboardGroupId is not the query params
   * `{ details: Dashboard does not match allowed userGroup }` - user group in userConfig does not match userGroup for the given dashboardGroupId
   * `{details: Dashboard with this id does not match organisation level}` - dashboard with given dashboardGroupId does not match organisationUnit level
   * `{details: View does not exist in dashboard}` - viewId is not found in dashboardGroup
   * `{details: surveyCodes do not match the given view}`
 * code: `400` content: `{ status: viewError, details.. }`
   * `{details: 'No view with corresponding id'}` - cannot find view with corresponding id in database
 * common responses as per `./Index.md`
