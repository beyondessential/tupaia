## measures

Measures information for given organisationUnit

* ###### URL

 `/measures`

* ###### METHOD

  `GET`

* ###### URL PARAMS

  ```
  organisationUnitCode: ${organisationUnitCode}
  ```

* ###### SAMPLE request

 `/api/v1/measures?organisationUnitCode=DL`

* ###### ON SUCCESS
  * code:  `200`
  * content:
```JSON
{
    "organisationUnitType": "Country",
    "organisationUnitCode": "DL",
    "name": "Demo Land",
    "measures": {
        "Water and Sanitation": [
            {
                "measureId": 84,
                "name": "Clean water"
            },
            {
                "measureId": 85,
                "name": "Is the main source of water drinkable?"
            },
            {
                "measureId": 86,
                "name": "Functional toilet for patients?"
            }
        ],
        "Electricity": [
            {
                "measureId": 93,
                "name": "Electricity"
            },
            {
                "measureId": 94,
                "name": "Main source of electricity"
            },
            {
                "measureId": 95,
                "name": "Functional generator"
            },
            {
                "measureId": 96,
                "name": "Functional solar power"
            }
        ],
        "Cold Chain": [
            {
                "measureId": 107,
                "name": "Working fridge"
            }
        ],
        "Services provided": [
            {
                "measureId": 125,
                "name": "Inpatient facilities"
            },
            {
                "measureId": 126,
                "name": "Basic first aid and life support"
            },
            {
                "measureId": 127,
                "name": "Initial wound care"
            },
            {
                "measureId": 128,
                "name": "Contraception"
            },
            {
                "measureId": 129,
                "name": "Antenatal care"
            },
            {
                "measureId": 130,
                "name": "Delivery of babies"
            },
            {
                "measureId": 131,
                "name": "Cesarean sections"
            },
            {
                "measureId": 132,
                "name": "Regular immunisation services"
            },
            {
                "measureId": 133,
                "name": "Diagnosis and management of TB"
            },
            {
                "measureId": 134,
                "name": "Diagnosis and treatment of malaria"
            },
            {
                "measureId": 135,
                "name": "Treatment for STIs (other than HIV)"
            }
        ],
        "Laboratory and diagnosis": [
            {
                "measureId": 155,
                "name": "Cholesterol testing"
            },
            {
                "measureId": 156,
                "name": "X-Ray Machine"
            },
            {
                "measureId": 157,
                "name": "Ultrasound"
            },
            {
                "measureId": 158,
                "name": "Pregnancy tests"
            },
            {
                "measureId": 159,
                "name": "Malaria Rapid Diagnostic Test Kit"
            },
            {
                "measureId": 160,
                "name": "Blood Glucose testing"
            }
        ]
    }
}
```

* ###### ON FAIL
 * code: `401` content: `{ status: permissionFail, details: Organisation unit does not exist }` if organisation unit is invalid or no url parameter organisationUnitCode
 * common responses as per `./Index.md`
