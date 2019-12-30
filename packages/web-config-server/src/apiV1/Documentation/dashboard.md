## dashboard

Dashboard layout and report contents

* ###### URL

 `/dashboard`

* ###### METHOD

  `GET`

* ###### URL PARAMS

  ```
  organisationUnitCode: ${organisationUnitCode}
  ```

* ###### SAMPLE request

 `/api/v1/dashboard?organisationUnitCode=World`

* ###### ON SUCCESS
  * code:  `200`
  * content:
```
{
  "General": {
      "Public": {
        "organisationUnitType": "Province",
        "organisationUnitCode": "rXCRwvytBu3",
        "name": "DistrictThree",
        "views": [ { "viewId": "1" }, ...],
        "dashboardGroupId": 1
      },
      "Admin": {
        "organisationUnitType": "Province",
        "organisationUnitCode": "rXCRwvytBu3",
        "name": "DistrictThree",
        "views": [ { "viewId": "1" }, ...],
        "dashboardGroupId": 4
      }
  }
}
```

* ###### ON FAIL
 * code: `401` content: `{ status: permissionFail, details: Organisation unit does not exist }` if organisation unit is invalid or no url parameter organisationUnitCode
 * common responses as per `./Index.md`


* ###### NOTES

 Will return all dashboards for current organisation unit base currently logged in user
