## measures

Get measure data and option set for country level organisationUnit

- ###### URL

`/measureData`

- ###### METHOD

  `GET`

- ###### URL PARAMS

  ```
  organisationUnitCode: ${organisationUnitCode}
  mapOverlayIds: ${mapOverlayIds}
  ```

- ###### SAMPLE request

`/api/v1/measureData?organisationUnitCode=DL&mapOverlayIds=93`

- ###### ON SUCCESS
  - code: `200`
  - content:

```JSON
{
    "measureOptions": [
        {
            "name": "Yes",
            "value": "0"
        },
        {
            "name": "No",
            "value": "1"
        },
        {
            "name": "Yes but Expired",
            "value": "2"
        }
    ],
    "measureData": [
        {
            "coordinates": [],
            "organisationUnitCode": "DL_11",
            "value": ""
        },
        {
            "coordinates": [
                -22.004646,
                157.190728
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512296_919095.png",
            "organisationUnitCode": "DL_7",
            "value": "0"
        },
        {
            "coordinates": [
                -22.111591,
                157.550022
            ],
            "photoUrl": "https://tupaia.s3.amazonaws.com/uploads/images/1498714522490_504495.png",
            "organisationUnitCode": "DL_1",
            "value": "1"
        },
        {
            "coordinates": [
                -22.060563,
                157.306445
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498714965712_692443.png",
            "organisationUnitCode": "DL_9",
            "value": "0"
        },
        {
            "coordinates": [
                -22.134552,
                157.239739
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512334_936781.png",
            "organisationUnitCode": "DL_5",
            "value": "1"
        },
        {
            "coordinates": [
                -22.15192,
                157.331593
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512316_936699.png",
            "organisationUnitCode": "DL_4",
            "value": "1"
        },
        {
            "coordinates": [
                -21.926187,
                157.215091
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498694968233_858922.png",
            "organisationUnitCode": "DL_10",
            "value": "0"
        },
        {
            "coordinates": [
                -21.853884,
                157.316007
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498714965685_575385.png",
            "organisationUnitCode": "DL_6",
            "value": "1"
        },
        {
            "coordinates": [
                -21.847616,
                157.454339
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512278_282869.png",
            "organisationUnitCode": "DL_8",
            "value": "1"
        },
        {
            "coordinates": [
                -22.063252,
                157.43408
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512265_824141.png",
            "organisationUnitCode": "DL_2",
            "value": "1"
        },
        {
            "coordinates": [
                -21.96693,
                157.425675
            ],
            "photoUrl": "https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498698949872_751231.png",
            "organisationUnitCode": "DL_3",
            "value": "1"
        }
    ],
    "mapOverlayIds": [84],
    "displayType": ""
}
```

- ###### ON FAIL

- code: `401` content: `{ status: permissionFail, details.. }`
  - `{details: Organisation unit does not exist}` - invalid organisation units or organisationUnitCode is not the query params
  - `{details: Measure with this id does not exist}`
  - `{details: Measure does not match allowed userGroup}`
  - `{details: Measure with this id is not allowed for given organisation unit}`
  - `{details: Measures data not allowed for world}`
  - `{details: measureId is not present in query}`
  - code: `404` content: `{ status: Not Found, details:Cannot find country level in hierarchy }`
- common responses as per `./Index.md`
