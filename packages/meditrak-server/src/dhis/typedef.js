/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef {(DhisResponseResults & { response: DhisResponseDetails } | DhisResponseDetails)} DhisResponse
 */

/**
 * Example:
 * ```json
 * {
 *   "httpStatus": "OK",
 *   "httpStatusCode": 200,
 *   "status": "OK",
 *   "message": "Import was successful."
 * }
 * ```
 *
 * @typedef {Object} DhisResponseResults
 * @property {string} httpStatus
 * @property {string} httpStatusCode
 * @property {string} status
 * @property {string} [message]
 */

/**
 * @interface
 * @typedef {Object} DhisResponseDetails
 * @property {string} responseType
 */

/**
 * @typedef {Object} ImportCount
 * @property {number} imported
 * @property {number} updated
 * @property {number} ignored
 * @property {number} deleted
 */

/**
 * Example:
 * ```json
 * {
 *   "responseType": "ImportSummary",
 *   "status": "SUCCESS",
 *   "description": "Deletion of tracked entity instance T5PtL07T9jp was successful",
 *   "importCount": { "imported": 0, "updated": 0, "ignored": 0, "deleted": 1 }
 * }
 * ```
 *
 * @typedef {DhisResponseDetails & ImportSummaryResponseDetailsI} ImportSummaryResponseDetails
 *
 * @interface
 * @typedef {Object} ImportSummaryResponseDetailsI
 * @property {string} responseType
 * @property {string} status
 * @property {string} description
 * @property {ImportCount} importCount
 * @property {string[]} [errors]
 * @property {Array<{ object, value }>} [conflicts]
 * @property {string} [reference]
 */

/**
 * Example:
 * ```json
 * {
 *   "responseType": "ImportSummaries",
 *   "status": "SUCCESS",
 *   "imported": 1,
 *   "updated": 0,
 *   "deleted": 0,
 *   "ignored": 0,
 *   "importOptions": { ... },
 *   "importSummaries": [
 *     {
 *       "responseType": "ImportSummary",
 *       "status": "SUCCESS",
 *       "importOptions": { ... },
 *       "importCount": { "imported": 1, "updated": 0, "ignored": 0, "deleted": 0 },
 *       "reference": "IzLsdiefbvR",
 *       "href": "https://dev-aggregation.tupaia.org/api/trackedEntityInstances/IzLsdiefbvR",
 *       "enrollments": { ... }
 *     }
 *   ],
 *   "total": 1
 * }
 * ```
 *
 * @typedef {ImportCount & DhisResponseDetails & ImportSummariesResponseDetailsI} ImportSummariesResponseDetails
 *
 * @typedef {Object} ImportSummariesResponseDetailsI
 * @property {string} responseType
 * @property {string} status
 * @property {Object<string, any>} importOptions
 * @property {ImportSummaryResponse[]} importSummaries
 * @property {number} total
 */

/**
 * Example:
 * ```json
 * {
 *   "responseType": "ObjectReport",
 *   "uid": "fN0oF4vw0Z1",
 *   "klass": "org.hisp.dhis.organisationunit.OrganisationUnit"
 * }
 * ```
 *
 * @typedef {DhisResponseDetails & ObjectReportResponseDetailsI} ObjectReportResponseDetails
 *
 * @typedef {Object} ObjectReportResponseDetailsI
 * @property {responseType} string
 * @property {string} uid
 * @property {string} klass
 */

/**
 * @typedef {Object} Diagnostics
 * @property {ImportCount} counts
 * @property {string[]} errors
 * @property {string[]} [references]
 * @property {boolean} wasSuccessful
 */
