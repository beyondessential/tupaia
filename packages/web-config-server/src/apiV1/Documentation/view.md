## view

Request a chart or view

* ###### URL

 `/view`

* ###### METHOD

  `GET`

* ###### URL PARAMS

  ```
  viewId: ${viewId}
  organisationUnitCode: ${organisationUnitCode}
  dashboardGroupId: ${dashboardGroupId}
  ```

* ###### SAMPLE request

 `/api/v1/view?viewId=1&organisationUnitCode=World&dashboardGroupId=1`

* ###### ON SUCCESS
  * code:  `200`
  * content:
  ```
  {
      name: caption,
      xName: xCaption,
      yName: yCaption,
      type: chart,
      viewId: asPerQueryParams,
      dashboardGroupId: asPerQueryParams,
      organisationUnitCode: asPerQueryParams,
      chartType: bar (chart type)
      data: [ { x: date1, y: value1 },
               { x: date2, y: value2 } ],
      status: success
  }
  // or for a custom view
  {
      type: view,
      name: caption,
      viewId: asPerQueryParams,
      dashboardGroupId: asPerQueryParams,
      organisationUnitCode: asPerQueryParams,
      dashboardGroupId: asPerQueryParams,
      viewType: facilityServices (view type)
      data: [ {name: Vaccinations, status: true },
              { name: Surgery, status: false },
              { name: X-Ray, status: false } ]
  }
  ```

* ###### ON FAIL
 * code: `401` content: `{ status: permissionFail, details.. }`
   * `{details: Organisation unit does not exist}` - invalid organisation units or organisationUnitCode is not the query params
   * `{details: Dashboard with this id and matching organisation unit does not exist}`  - invalid user group config id, dashboardGroup doesn't match userGroup or user group config id does not match userGroup and organisationUnitCode it is for or dashboardGroupId is not the query params
   * `{ details: Dashboard does not match allowed userGroup }` - user group in userConfig does not match userGroup for the given dashboardGroupId
   * `{details: Dashboard with this id does not match organisation level}` - dashboard with given dashboardGroupId does not match organisationUnit level
   * `{details: View does not exist in dashboard}` - viewId is not found in dashboardGroup
 * code: `400` content: `{ status: viewError, details.. }`
   * `{details: 'No view with corresponding id'}` - cannot find view with corresponding id in database
   * `{details: No data builder defined for current view}` - no data builder found to match view_type
 * common responses as per `./Index.md`
