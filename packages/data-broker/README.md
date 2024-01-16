# @tupaia/data-broker

Centralised gateway which provides a common interface to external data sources.

### Concepts

- data element - an individual type of data point in a data source (eg. a question in a survey)
- data group - a grouped set of data elements (eg. a survey)
- sync group - a set of data elements that are synced with an external source
- analytic - a data point for a data element (eg. an answer to a question)
- event - a set of data points for each data element in a data group (eg. a survey response)

### Interface

- `push` - pushes data to an external data source
- `pullAnalytics` - pulls analytics for requested data elements
- `pullEvents` - pulls event data for requested data groups
- `pullSyncGroupResults` - pulls data for requested sync groups
- `pullDataElements` - pull metadata around requested data elements
- `pullDataGroup` - pull metadata around requested data group
