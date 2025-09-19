## Surveys

The `/surveys` routes represent a custom CRUD endpoint on the Survey resource.

The Survey _resource model_ also includes some child _data models_:

- `survey_screen`
- `survey_screen_component`
- `question`

Currently, properties of a survey are managed normally, and the child data is managed by:

- `GET`: property `surveyQuestions` returns a string value e.g. '16 Questions'
- `PUT`: property `surveyQuestions` can be a file
- `POST`: property `surveyQuestions` can be a file

In the future we might expand `surveyQuestions` to actually contain the child data as JSON, e.g.:

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
        component_number,
        question: {
          id: '...',
          name: 'Hmm I wonder',
          code: 'CODE123',
          type: 'Text'
        }
      ]
    }
  ]
}
```
