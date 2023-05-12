## Surveys

The /surveys routes represent a somewhat custom CRUD endpoint on the Survey resource.

The Survey _resource_ model also includes some child _data_ models:
- survey_screen
- survey_screen_component
- question

Currently, properties of the survey data model are managed normally, and the child data models are managed by:
- GET: property `surveyQuestions` returns a string value e.g. '16 Questions'
- PUT: property `surveyQuestions` can be a base64 encoded spreadsheet
- POST: property `surveyQuestions` can be a base64 encoded spreadsheet

In the future we might expand surveyQuestions to actually contain the child data as json, e.g.:
```
GET/PUT/POST:
{
  id: '...',
  code: 'MY_SURVEY',
  name: '...',
  surveyQuestions: [
    {
      id: '...',
      screen_number: 1,
      survey_screen_components: [
        id: '...',
        visibility_criteria: '...',
        question: {
          id: '...',
          name: 'Hmm I wonder',
          type: 'Text'
        }
      ] 
    }
  ]
}
```