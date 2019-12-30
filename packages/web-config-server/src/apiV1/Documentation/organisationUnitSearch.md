## organisationUnit

Search for organisation unit by name

* ###### URL

 `/organisationUnitSearch`

* ###### METHOD

  `GET`

* ###### URL PARAMS

  ```
  criteria: ${searchCriteria}
  limit: ${searchLimit} [max 20]
  ```

* ###### SAMPLE request

  `/api/v1/organisationUnitSearch?criteria=east&limit=5`

* ###### ON SUCCESS
  * code:  `200`
  * content:
```json
[
    {
        "organisationUnitCode": "KI_Bikenibeu East clinic_BIKUC03",
        "displayName": "Bikenibeu East clinic, Tarawa Teinainano, Gilbert Islands, Kiribati",
        "location": {
            "type": "no-coordinates",
            "coordinates": "",
            "bounds": ""
        }
    },
    {
        "organisationUnitCode": "DL_Hawthorn East_5",
        "displayName": "Hawthorn East, Ravenclaw, South West, Demo Land",
        "location": {
            "type": "point",
            "coordinates": [
                -52.022768,
                146.294362
            ]
        }
    },
    {
        "organisationUnitCode": "DL_South East",
        "displayName": "South East, Demo Land",
        "location": {
            "type": "area",
            "bounds": [
                [
                    -22.203709999999997,
                    157.387033
                ],
                [
                    -21.8956,
                    157.587267
                ]
            ]
        }
    }
]
```

* ###### ON FAIL
 * common responses as per `./Index.md`
