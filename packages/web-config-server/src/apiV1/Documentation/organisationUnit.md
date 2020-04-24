## organisationUnit

Organisation Unit and Immediate children info

- ###### URL

`/organisationUnit`

- ###### METHOD

  `GET`

- ###### URL PARAMS

  ```
  organisationUnitCode: ${organisationUnitCode}
  ```

- ###### SAMPLE request

`/api/v1/organisationUnit?organisationUnitCode=World`

- ###### ON SUCCESS
  - code: `200`
  - content:

```
  {
      type: Country|District|Facility,
      photoUrl: {if facility type === Facility and has photo record}
      organisationUnitCode: org_unit_code,
      name: org_unit_name,
      location: {
        type: area, // can also be 'no-coordinates' if no coordinates are present
        coordinates : [ [lon, lat] ,
                        [lon, lat],
                        [lon, lat],
                        [lon, lat] ] },
      organisationUnitChildren: [
        { organisationUnitCode:
          org_unit_code, name: org_unit_name,
          location: {
            type: point,
            coordinates : [lon, lat] },
        { organisationUnitCode: org_unit_code,name:
          org_unit_name,
          location: {
            type: point,
            coordinates : [lon, lat] } ]
  }
   // or for a bottom level facility
  {
      type: Country|District|Facility,
      organisationUnitCode: org_unit_code,
      photoUrl: {if facility type === Facility and has photo record}
      name: org_unit_name,
      location: {
        type: point,
        coordinates : { lat: ...., lon: .... } }
      organisationUnitChildren: []
  }
```

- ###### ON FAIL
- code: `401` content: `{ status: permissionFail, details: Organisation unit does not exist }` if organisation unit is invalid or no url parameter organisationUnitCode
- common responses as per `./Index.md`

* ###### NOTES

No permission checks, as public user will have access to all organisation units
