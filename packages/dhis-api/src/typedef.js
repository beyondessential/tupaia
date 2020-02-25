/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * Example:
 * ```
 * {
 *  "dataElement": "tW48OGi2zvE",
 *  "organisationUnit": "vQ5TA8iDGFL",
 *  "period": "20190531",
 *  "value": 4
 * }
 * ```
 *
 * @typedef {Object} AnalyticsResult
 * @property {string} dataElement
 * @property {string} organisationUnit
 * @property {string} period
 * @property {number|string} value
 */

/**
 * Example:
 * ```
 * {
 *   "dataElementCodeToName": {
 *     "MCH110": "Monthly Health Promotion: School Health",
 *     "MCH111": "Monthly Health Promotion: Family Planning",
 *   },
 * }
 * ```
 *
 * @typedef {Object} AnalyticsMetadata
 * @property {Object<string, string>} dataElementCodeToName
 */

/**
 * @typedef {Object} Analytics
 * @property {AnalyticsResult[]} results
 * @property {AnalyticsMetadata} metadata
 * @property {string} [period]
 */

/**
 * @typedef {Object} EventDataValueData
 * @property {string} dataElement
 * @property {string} value
 */

/**
 * Data that can be posted to the `events` api to create a new event
 *
 * Example:
 * ```
 * {
 *   "program": "HP05",
 *   "orgUnit": "vQ5TA8iDGFL",
 *   "eventDate": "2019-04-30T00:00:00.000",
 *   "status": "ACTIVE",
 *   "storedBy": "TupaiaApp",
 *   "dataValues": [
 *     { "dataElement": "LeBw9gAKB9m", "value": "Tonga Health" },
 *     { "dataElement": "LeBw9gAKB9a", "value": "3" },
 *   ]
 * }
 * ```
 *
 * @typedef {Object} EventData
 * @property {string} program
 * @property {string} orgUnit
 * @property {string} eventDate
 * @property {string} [completedDate]
 * @property {string} [status]
 * @property {string} [storedBy]
 * @property {EventDataValueData[]} dataValues
 *
 * @see https://docs.dhis2.org/master/en/developer/html/dhis2_developer_manual_full.html#webapi_events
 */

/**
 * @interface
 * @typedef {Object} EventDataValueI
 * @property {string} lastUpdated
 * @property {string} storedBy
 * @property {string} created
 * @property {boolean} providedElsewhere
 *
 * @typedef {EventDataValueData & EventDataValueI} EventDataValue
 */

/**
 * Event data that get returned from the `events` api
 *
 * Example:
 * ```
 * {
 *   "storedBy": "TupaiaApp",
 *   "dueDate": "2019-06-17T01:48:38.059",
 *   "program": "HP05",
 *   "href": "https://tonga-aggregation.tupaia.org/api/events/qAs0t2VRx5u",
 *   "event": "qAs0t2VRx5u",
 *   "programStage": "pDBwkhMYs27",
 *   "orgUnit": "vQ5TA8iDGFL",
 *   "status": "ACTIVE",
 *   "orgUnitName": "Haveluloto",
 *   "eventDate": "2019-04-30T00:00:00.000",
 *   "attributeCategoryOptions": "xYerKDKCefk",
 *   "lastUpdated": "2019-06-17T01:48:38.070",
 *   "created": "2019-06-17T01:48:38.062",
 *   "deleted": false,
 *   "attributeOptionCombo": "HllvX50cXC0",
 *   "dataValues": [
 *     {
 *       "lastUpdated": "2019-06-17T01:48:38.065",
 *       "storedBy": "TupaiaApp",
 *       "created": "2019-06-17T01:48:38.065",
 *       "dataElement": "LeBw9gAKB9m",
 *       "value": "Tonga Health",
 *       "providedElsewhere": false
 *     }
 *  ],
 *  "notes": []
 * }
 * ```
 *
 * @interface
 * @typedef {Object} EventI
 * @property {string} dueDate
 * @property {string} href
 * @property {string} event
 * @property {string} programStage
 * @property {string} orgUnitName
 * @property {string} attributeCategoryOptions
 * @property {string} lastUpdated
 * @property {string} created
 * @property {boolean} deleted
 * @property {string} attributeOptionCombo
 * @property {EventDataValue[]} dataValues
 * @property {Array} notes
 *
 * @typedef {EventData & EventI} Event
 *
 * @see https://docs.dhis2.org/master/en/developer/html/dhis2_developer_manual_full.html#webapi_events
 */
