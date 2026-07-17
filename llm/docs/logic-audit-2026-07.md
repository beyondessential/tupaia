# Tupaia Backend & Data-Pipeline Logic Audit

**Date:** 2026-07-16
**Scope:** Read-only logic audit of the Tupaia monorepo backend and shared libraries. No code was modified.
**Method:** Six parallel deep reads, each tracing real data flow (not pattern matching) through a slice of the system, cross-checking candidate defects against the existing test suites for documented intent. Only findings with a concrete failure scenario are included.

## What this is

This report catalogues **genuine logic bugs** — inverted conditions, missing `await`s, precedence errors, type-coercion mistakes, cache/transaction correctness problems, and validation that can be bypassed. It deliberately excludes style issues, naming, and speculative refactors.

Each finding carries a **confidence** rating:
- **confirmed** — the defective behaviour follows directly from the code as written.
- **likely** — the mechanism is confirmed; triggering it depends on data or call patterns that are plausible but not verified in production.
- **needs-verification** — the code path is wrong, but whether production actually exercises it needs a data/config check.

No fixes have been applied. Suggested fixes are one or two lines of direction only.

## Summary

**65 findings: 6 high, 33 medium, 26 low.**

| Area | High | Medium | Low | Total |
| --- | ---: | ---: | ---: | ---: |
| central-server (routes, imports, sync, accounts) | 2 | 9 | 4 | 15 |
| tupaia-web / datatrak-web (+ servers, boilerplate) | 2 | 6 | 7 | 15 |
| database & utils | 1 | 6 | 4 | 11 |
| entity-server / aggregator / data-api / indicators | 1 | 5 | 3 | 9 |
| report-server / data-table-server | 0 | 4 | 4 | 8 |
| auth / access-policy / central permissions | 0 | 3 | 4 | 7 |
| **Total** | **6** | **33** | **26** | **65** |

### The six high-severity findings

1. **Inverted field-whitelist lets any entity column be edited** — `PUT /entities/:id` guard uses `&&` where `||` was meant; a payload without `name` bypasses the "name only" restriction and can rewrite `code`/`type`/`country_code`. *(central-server — EditEntity.js)*
2. **Password-reset token emailed to a caller-controlled URL** — the reset link host comes straight from the unauthenticated request body, enabling phishing-assisted account takeover with genuine platform emails. *(central-server — requestPasswordReset.js)*
3. **Task-completion query OR-precedence leak** — unparenthesised raw SQL means the `status` filter only applies to the first survey/entity pair in a batch, so cancelled/completed tasks get resurrected to `completed` during bursty submissions. *(database — TaskCompletionHandler.js)*
4. **`getPreferredPeriod` uses `Math.max` on non-numeric periods** — WEEK/QUARTER analytics return `NaN`, so `MOST_RECENT` and `FINAL_EACH_*` silently keep the *oldest* value instead of the most recent. *(aggregator)*
5. **PrimaryEntity questions no longer forced mandatory** — a validator is called with a whole component array instead of each component, so a survey can be submitted without its primary entity and then fails opaquely at the server. *(datatrak-web — utils.ts, regression from commit `6002be54`)*
6. **Browser entity cache never invalidated after local writes** — entities created offline don't appear in later descendant queries, breaking "register then survey it" workflows. *(datatrak-web — model cache / sync)*

Additional security-relevant findings below the high bar worth early attention: **`PUT /me` allows self-service `verified_email`/`email` changes** (central-server, medium), **dashboard subscribe/unsubscribe act on an arbitrary body email** (tupaia-web-server, medium), **`findRecursiveTree` interpolates ids into SQL** (database, medium), and **`req.assertPermissions` fails open on an invalid assertion** (central permissions, medium).

---

The remainder of this document lists every finding in full, grouped by area.

---

# central-server — routes, imports, sync, user accounts


### [severity: high] Inverted field-whitelist condition lets any entity field be edited
- **File**: packages/central-server/src/apiV2/entities/EditEntity.js:18
- **Code**: `if (updatedFieldKeys.length !== 1 && updatedFieldKeys.includes('name')) { throw Error('Fields other than "name" cannot be updated'); }`
- **Problem**: The guard is meant to allow only a single `name` field update, so it should throw when `length !== 1 || !includes('name')`. As written it only throws when the payload has *multiple* fields *and one of them is name*. A payload of `{ code: 'X' }` (single non-name field) or `{ code: 'X', type: 'facility' }` (multiple fields without name) sails through to `entity.updateById`, which will happily update any schema column (`code`, `type`, `country_code`, `attributes`, `image_url`, ...).
- **Impact**: Anyone with country-level admin-panel access can rewrite arbitrary entity columns through PUT /entities/:id. Changing `code`/`type`/`country_code` corrupts sync, permissions scoping and analytics joins. The test file (src/tests/apiV2/entities/EditEntity.test.js) only covers the name-edit happy path, so nothing catches this.
- **Confidence**: confirmed
- **Suggested fix**: Change the condition to `if (updatedFieldKeys.length !== 1 || !updatedFieldKeys.includes('name'))`.

### [severity: high] Password-reset token is emailed to a caller-controlled URL
- **File**: packages/central-server/src/apiV2/requestPasswordReset.js:31-36
- **Code**: ``const passwordResetUrl = `${resetPasswordUrl || TUPAIA_FRONT_END_URL}/reset-password?passwordResetToken=${token}`;``
- **Problem**: `resetPasswordUrl` comes straight from the unauthenticated request body with no allow-list validation. An attacker can POST `{ emailAddress: victim@x.com, resetPasswordUrl: 'https://evil.example' }`; the victim receives a legitimate Tupaia email whose "Reset your password" button points at the attacker's domain with a valid one-time-login token in the query string. The token is then usable against `changePassword` (`oneTimeLoginToken` path) to take over the account. Additionally `sendEmail(...)` on line 36 is not awaited, so email failures surface as an unhandled rejection while the API still returns `success: true`.
- **Impact**: Phishing-assisted account takeover using genuine platform emails; silent failure of reset emails.
- **Confidence**: confirmed (code path; exploit requires victim click)
- **Suggested fix**: Validate `resetPasswordUrl` against an allow-list of known front-end origins (tupaia.org, datatrak, etc.), and `await` the `sendEmail` call.

### [severity: medium] importOptionSets silently swallows non-TypeValidation errors during option upsert
- **File**: packages/central-server/src/apiV2/import/importOptionSets.js:104-108
- **Code**: `} catch (error) { if (error instanceof TypeValidationError) { throw new ImportValidationError(...); } }`
- **Problem**: There is no `else throw error`. Any other failure from `option.updateOrCreate` (constraint violation, connection blip, JSON error) is discarded; the loop continues, `optionValues` already contains the value, so the orphan-deletion pass also leaves the stale DB row untouched or, worse, the option simply never gets written while the endpoint responds "Imported option sets".
- **Impact**: Partial imports reported as success — option sets silently diverge from the spreadsheet.
- **Confidence**: confirmed
- **Suggested fix**: Re-throw the original error when it is not a `TypeValidationError`.

### [severity: medium] importOptionSets orphan-deletion compares numeric sheet values with DB strings, deleting just-imported options
- **File**: packages/central-server/src/apiV2/import/importOptionSets.js:85, 110-118
- **Code**: `optionValues.add(option.value); ... if (!optionValues.has(option.value)) { await transactingModels.option.delete({ id: option.id }); }`
- **Problem**: `xlsx.utils.sheet_to_json` returns numeric cells as JS numbers, so `optionValues` holds e.g. `1`. `option.value` in the DB is a text column, so `existingOptions` return `'1'`. `Set.has('1')` is false when the set contains `1`, so every numeric-valued option is treated as an orphan and deleted immediately after being upserted in the same transaction.
- **Impact**: Importing an option set whose values are numbers (e.g. 1–5 scales) silently deletes those options; surveys referencing them lose their choices.
- **Confidence**: likely (type flow confirmed by reading; not executed)
- **Suggested fix**: Normalise values to strings (`String(option.value)`) both when adding to the set and when comparing during the orphan sweep.

### [severity: medium] ReferenceError in visibility-criteria validation masks the real import error
- **File**: packages/central-server/src/apiV2/import/importSurveys/importSurveyQuestions.js:93-99
- **Code**: ``throw new ImportValidationError(`Question with code ${questionCode} does not exist`, excelRowNumber, 'visibilityCriteria', tabName);``
- **Problem**: Inside `updateOrCreateSurveyScreenComponent`, neither `excelRowNumber` nor `tabName` is in scope (they exist only in the caller). In an ES module this throws `ReferenceError: excelRowNumber is not defined` instead of the intended validation error; the caller's catch pushes that ReferenceError into the `errors` array, so the user sees "excelRowNumber is not defined" rather than which question code was wrong.
- **Impact**: Survey imports with a bad visibility-criteria question code fail with a meaningless message; genuinely confusing for admins, and the row/tab context is lost.
- **Confidence**: confirmed
- **Suggested fix**: Pass `excelRowNumber`/`tabName` (or the `constructImportValidationError` helper) into `updateOrCreateSurveyScreenComponent` and use them in the throw.

### [severity: medium] Entity import crashes when a row has sub_district but no district
- **File**: packages/central-server/src/apiV2/import/importEntities/getOrCreateParentEntity.js:111
- **Code**: `if (district.id) { subDistrictObject.parent_id = district.id; ... }`
- **Problem**: `district` is only assigned inside `if (districtName)`. The validators (getEntityObjectValidator.js) mark both `district` and `sub_district` as optional, so a row supplying only `sub_district` reaches this line with `district === undefined` and throws `TypeError: Cannot read properties of undefined (reading 'id')`, aborting the whole import with a DatabaseError instead of either working (comment says district is optional: "If a district is also being added…") or a clear validation message.
- **Impact**: Legitimate spreadsheets with sub-district-only rows can never be imported; error is opaque.
- **Confidence**: confirmed
- **Suggested fix**: Use `if (district?.id)` (falling back to `countryEntity.id` as already coded), or add a validation rule requiring `district` when `sub_district` is present.

### [severity: medium] Re-importing an entity without parent columns nulls its existing parent_id
- **File**: packages/central-server/src/apiV2/import/importEntities/updateCountryEntities.js:166-176
- **Code**: `await transactingModels.entity.updateOrCreate({ code }, { ..., parent_id: parentEntity ? parentEntity.id : null, ... });`
- **Problem**: When a row has no `district`, `sub_district` or `parent_code`, `getOrCreateParentEntity` returns `null`, so `parent_id` is explicitly set to `null` (nulls survive `getDatabaseSafeData`; only `undefined` is stripped). For an *existing* entity being re-imported (e.g. to update name/attributes/geojson only), its current parent link is wiped, orphaning it from the hierarchy.
- **Impact**: Routine entity re-imports can silently detach entities from their parents, breaking hierarchy traversal, maps and permission scoping until manually repaired.
- **Confidence**: likely (code path confirmed; depends on users importing rows without parent columns, which the validators allow)
- **Suggested fix**: Omit `parent_id` from the upsert (leave `undefined`) when no parent information was supplied in the row, instead of coercing to `null`.

### [severity: medium] SurveyEditor creates survey groups outside the transaction
- **File**: packages/central-server/src/apiV2/surveys/surveyEditor/SurveyEditor.js:175
- **Code**: `const surveyGroup = await this.models.surveyGroup.findOrCreate({ name: surveyGroupName });`
- **Problem**: Everything else in `upsert()` uses `transactingModels`, but this line uses `this.models` — a separate, non-transactional connection. If the surrounding transaction rolls back (e.g. question import fails validation later in the same call), the newly created `survey_group` row persists as an orphan; conversely the write happens before the transaction commits, breaking atomicity.
- **Impact**: Failed survey edits/creates leave stray survey_group records; repeated retries accumulate them and they appear in admin dropdowns/sync queues.
- **Confidence**: confirmed
- **Suggested fix**: Use `transactingModels.surveyGroup.findOrCreate(...)`.

### [severity: medium] POST /userEntityPermissions never runs its declared validation rules
- **File**: packages/central-server/src/apiV2/CreateHandler/BulkCreateHandler.js:15-44 (and apiV2/userEntityPermissions/CreateUserEntityPermissions.js:24-30)
- **Code**: `async handleRequest() { ... await this.createRecords(...) ... }` — no call to `this.validate()`
- **Problem**: `CreateHandler.handleRequest` calls `validate()` before creating, but `BulkCreateHandler.handleRequest` (used by `CreateUserEntityPermissions`, the only subclass) never invokes `validate()`/`validateRecords()`, and the subclass doesn't either. The USER_ENTITY_PERMISSION rules in constructNewRecordValidationRules.js (user exists, permission group exists, **entity must be type 'country'**) are dead code for this endpoint. `assertUserEntityPermissionUpsertPermissions` checks existence and permissions but not the country-type restriction.
- **Impact**: Admins can create user_entity_permission records on non-country entities (districts, facilities), producing access-policy entries the rest of the system assumes cannot exist ("Only country level permissions are currently supported").
- **Confidence**: confirmed
- **Suggested fix**: Call `await this.validate()`/`this.validateRecords(newRecordData)` in `BulkCreateHandler.handleRequest` (mirroring `CreateHandler`), or in `CreateUserEntityPermissions.createRecords`.

### [severity: medium] AddSurveyImage / AddSurveyFile swallow all upload errors during /changes sync
- **File**: packages/central-server/src/apiV2/meditrakApp/utilities/addSurveyImage.js:9-11 (same pattern addSurveyFile.js:21-23)
- **Code**: `try { ... await s3Client.uploadImage(data, id); } catch (error) { winston.error(error.message); }`
- **Problem**: The paired `SubmitSurveyResponse` action stores the photo/file answer as a deterministic S3 URL "assuming it has been uploaded to that url" (comment in postChanges.js). If the S3 upload throws (bad credentials, network, oversized payload), the error is logged and discarded; `postChanges` still responds "Successfully integrated changes", so the mobile client marks the change as synced and deletes its local copy.
- **Impact**: Permanent loss of photo/file answer content — the answer row points at an S3 object that never existed, with no failure signal to the user or the app.
- **Confidence**: confirmed
- **Suggested fix**: Let the error propagate (failing the batch/transaction) or at minimum return a failure so the client retries the upload.

### [severity: medium] PUT /me allows self-service update of any user_account column, including verified_email and email
- **File**: packages/central-server/src/apiV2/userAccounts/EditUserForMe.js:5-18 (via EditUserAccounts.js:34-76)
- **Code**: `let updatedFields = restOfUpdatedFields; ... return this.models.user.updateById(this.recordId, updatedFields);`
- **Problem**: `EditUserAccounts.editRecord` explicitly blocks `preferences` but otherwise passes the request body through to `updateById`, which only filters to schema columns. Via `PUT /me` (permission check replaced with `allowNoPermissions`), any authenticated user can set `verified_email: 'verified'`, or change `email` to an arbitrary address without re-verification — the verification flow in verifyEmail.js is completely bypassable.
- **Impact**: Email-verification guarantees are void for logged-in users; an account can flip its email to one it doesn't own and keep 'verified' status, undermining password-reset and notification integrity.
- **Confidence**: confirmed (code path); exploitability requires an authenticated session
- **Suggested fix**: Whitelist the fields editable through /me (name, contact, password, profile image, preference fields) and force `verified_email = 'new_user'` whenever `email` changes.

### [severity: low] importUsers creates junk entities from workbook tab names
- **File**: packages/central-server/src/apiV2/import/importUsers.js:31
- **Code**: `const countryEntity = await transactingModels.entity.findOrCreate({ name: countryName });`
- **Problem**: The tab name is looked up by `name` only (matching any entity type, not just countries), and if not found an entity is *created* with only a `name` — no `code`, `type`, or `country_code`. A typo'd tab name mints a malformed entity and then grants user permissions against it (`countryEntity.code` is undefined, so the `accessPolicy.allows(undefined, ...)` check misbehaves for non-BES admins).
- **Impact**: Garbage entity records plus user_entity_permissions attached to them; hard-to-diagnose permission anomalies.
- **Confidence**: confirmed
- **Suggested fix**: Use `findOne({ name: countryName, type: 'country' })` and throw an ImportValidationError when missing.

### [severity: low] importUserPermissions responds success before the transaction commits
- **File**: packages/central-server/src/apiV2/import/importUserPermissions.js:107-110
- **Code**: `await models.wrapInTransaction(async transactingModels => { await create(req, transactingModels, items); respond(res, { message: 'Imported User Permissions' }); });`
- **Problem**: `respond` runs inside the transaction callback; if the commit itself fails afterwards, the client has already been told the import succeeded while everything rolled back. (Also, `excelRowNumber` starts at 1 for the first data row, which is spreadsheet row 2 — errors point one row too high in the sheet.)
- **Impact**: Rare, but produces a false-success response with zero rows written; off-by-one row numbers in every validation error message.
- **Confidence**: confirmed
- **Suggested fix**: Move `respond` outside `wrapInTransaction`; initialise `excelRowNumber` to 1 and increment after use (or use `+2` convention like sibling importers).

### [severity: low] Zero-valued coordinates are skipped in entity import
- **File**: packages/central-server/src/apiV2/import/importEntities/updateCountryEntities.js:181
- **Code**: `if (longitude && latitude) { await transactingModels.entity.updatePointCoordinates(code, { longitude, latitude }); }`
- **Problem**: A latitude of exactly `0` (or longitude `0`) is falsy, so the point is never written. Tupaia operates heavily in the Pacific where equatorial latitudes (Kiribati ≈ 0°) are realistic.
- **Impact**: Entities on the equator/prime meridian silently keep no/stale coordinates after import.
- **Confidence**: confirmed (logic); occurrence depends on data
- **Suggested fix**: Check `longitude !== undefined && latitude !== undefined` (after numeric coercion) instead of truthiness.

### [severity: low] Survey change handler crashes on surveys with null country_ids
- **File**: packages/central-server/src/database/meditrakSyncQueue/MeditrakSyncRecordUpdater.js:42-45
- **Code**: `arraysAreSame(newRecord.country_ids, oldRecord.country_ids)` with `const arraysAreSame = (arr1, arr2) => arr1.length === arr2.length && ...`
- **Problem**: `survey.country_ids` can be null/absent (older records, or surveys before countries are assigned). `arr1.length` on null throws inside the change handler, so the survey change (and the related-record fan-out that keeps devices' permissions-based sync correct) is never enqueued for that batch.
- **Impact**: Missed meditrak sync-queue entries → devices don't receive survey/permission updates until another change touches the record.
- **Confidence**: likely (null-ability of country_ids not verified against schema default)
- **Suggested fix**: Guard with `arraysAreSame(newRecord.country_ids ?? [], oldRecord.country_ids ?? [])`.

---

# tupaia-web-server / datatrak-web-server / datatrak-web / server-boilerplate


### [severity: high] `getAllSurveyComponents` passes whole component arrays into per-component validator, silently disabling forced-mandatory PrimaryEntity questions
- **File**: packages/datatrak-web/src/features/Survey/utils/utils.ts:39-45
- **Code**:
```ts
surveyScreens?.flatMap(({ surveyScreenComponents }) =>
  validateSurveyComponent(surveyScreenComponents),
) ?? []
```
- **Problem**: `validateSurveyComponent` expects a single component (`component.type === QuestionType.PrimaryEntity` → set `validationCriteria.mandatory = true`), but it is now given the whole `surveyScreenComponents` array. An array has no `.type`, so the check never matches and the function just returns the array (which `flatMap` flattens, masking the bug). Git history shows this is a regression introduced in commit `6002be54` ("feat(sync): RN-1545"): the previous code was `.flatMap(({ surveyScreenComponents }) => surveyScreenComponents).map(validateSurveyComponent)`. As a result, PrimaryEntity questions without `config.entity.createNew` are no longer forced to be mandatory in `useValidationResolver`.
- **Impact**: A user can navigate the entire survey and press submit without selecting the primary entity. Submission then fails at `processSurveyResponse` with a generic thrown error "Primary Entity question is a required field" (see packages/database/src/core/modelClasses/SurveyResponse/processSurveyResponse.js:133-135, behaviour confirmed by its test "throw an error when type is primary entity question and is not filled in") instead of an inline "Required" validation message — in both online and offline-first modes. Fully-completed surveys are stranded at submit with no indication of which question is the problem.
- **Confidence**: confirmed
- **Suggested fix**: Restore per-component application: `surveyScreens?.flatMap(({ surveyScreenComponents }) => surveyScreenComponents.map(validateSurveyComponent)) ?? []`.

### [severity: high] Browser Entity model cache is never invalidated after local writes, so entities created offline don't appear in descendant queries
- **File**: packages/datatrak-web/src/api/mutations/useSubmitSurveyResponse.ts:130-139 (with packages/database/src/core/DatabaseModel.js:55-68 and packages/database/src/core/modelClasses/Entity.js:441-448, 671-673)
- **Code**:
```ts
// On central, EntityHierarchyCacher rebuilds entity_parent_child_relation when an entity
// changes. That change handler doesn't run locally, so insert the parent-child link here
// so the new entity is immediately visible in descendant queries.
```
- **Problem**: `EntityModel.cacheEnabled` is `true`, and `getDescendantsFromParentChildRelation` results are memoized via `runCachedFunction`. Cache invalidation on record change is only wired up when `database.constructor.IS_CHANGE_HANDLER_SUPPORTED` (DatabaseModel.js:55), which is `false` for the browser database (`BaseDatabase.IS_CHANGE_HANDLER_SUPPORTED = false`; only the server `TupaiaDatabase` sets it true). The only manual `models.clearCache()` call in datatrak-web is in `ClientSyncManager.triggerSync` after a pull. So after an offline survey submission upserts a new entity and inserts its `entity_parent_child_relation` row, the react-query invalidation of `['entityDescendants']` refetches through `getEntityDescendants` → `models.entity.getDescendantsFromParentChildRelation`, which returns the stale cached list (same cache key) — the new entity is missing, contradicting the code comment.
- **Impact**: In offline-first mode, an entity created via a survey (e.g. registering a new household/patient, or a QR-code entity) does not show up in entity-selector lists for subsequent surveys until the model cache happens to be cleared, breaking "register then survey it" workflows.
- **Confidence**: confirmed (mechanics traced end-to-end); user-visible repro likely
- **Suggested fix**: Call `models.clearCache()` (or at minimum `models.entity.clearCache()`) after local mutations that write entities/relations, or enable change-handler-based invalidation in the browser database.

### [severity: medium] Sync completion invalidates react-query caches *before* clearing DB model caches
- **File**: packages/datatrak-web/src/sync/ClientSyncManager.ts:221-224
- **Code**:
```ts
const { pulledChangesCount } = await this.runSync(urgent);
if (pulledChangesCount) {
  await queryClient.invalidateQueries();
  this.models.clearCache();
}
```
- **Problem**: `await queryClient.invalidateQueries()` triggers and awaits refetches of all active queries. Those refetches run local DB query functions that hit the still-populated model caches (e.g. `Entity.getDescendantsFromParentChildRelation`, `AncestorDescendantRelation` cached functions). Only after the refetches complete is `clearCache()` called, and nothing refetches again afterwards.
- **Impact**: Data pulled down by a sync (new/renamed entities, etc.) does not appear in the UI after the sync completes; active screens keep showing pre-sync data until the user remounts components or another invalidation occurs. Combined with the previous finding, entity lists can stay stale across multiple syncs.
- **Confidence**: confirmed (ordering) / likely (visible staleness depends on which queries are active)
- **Suggested fix**: Swap the order: `this.models.clearCache(); await queryClient.invalidateQueries();`.

### [severity: medium] `stream()` treats 4xx responses as "recoverable" and parses error JSON as protocol frames
- **File**: packages/datatrak-web/src/api/stream.ts:18-20, 133-135
- **Code**:
```ts
const isRecoverableError = (response: Response) => {
  return response.status < 500;
};
...
if (!response.ok && !isRecoverableError(response)) {
  throw new Error(response.statusText || 'Stream ended with unknown error');
}
```
- **Problem**: Only 5xx responses throw. A 4xx (expired session cookie → 401, client-version rejection → 400, bad request) falls through, and the JSON error body (`{"error": ...}`) is fed into the binary frame decoder. `readUInt16BE(2)` on `{"e...` yields a garbage kind; the consumer logs "Unexpected message kind", the reader hits `done`, breaks, sleeps 10 s, and retries — 10 times — before throwing the generic `Stream: did not get proper END after 10 attempts`. The actual server error message is never surfaced. Note `ClientSyncManager.triggerSync` explicitly greps `error.message` for `'X-Client-Version'` to record compat errors — a message that can never arrive via this path, since version-check 4xx responses aren't framed.
- **Impact**: Sync failures caused by auth expiry or client/server version mismatch manifest as a ~100-second hang followed by a meaningless error, instead of an immediate, actionable message (and the version-compat GA event never fires).
- **Confidence**: likely
- **Suggested fix**: Invert the handling: throw immediately (with the parsed body message) for any `!response.ok` whose content type isn't the stream protocol — at minimum for status < 500 — and reserve retries for 5xx/network-level failures.

### [severity: medium] `stream()` yields a truncated frame with `message: undefined` on stream end
- **File**: packages/datatrak-web/src/api/stream.ts:173-193
- **Code**:
```ts
if (done) {
  const { length, kind, message } = decodeOne(buffer);
  if (!kind) { ... break reader; }
  if (length === undefined && kind === SYNC_STREAM_MESSAGE_KIND.END) { ... break reader; }
  yield { kind, message };   // reached when length === undefined and kind !== END
```
- **Problem**: When the connection drops mid-message, `decodeOne` returns `{ buf, kind }` (no `length`, no `message`) for a partially received non-END frame. The guard only handles the partial-END case; a partial `PULL_CHANGE` frame is yielded with `message === undefined`.
- **Impact**: In `pullIncomingChanges` (packages/datatrak-web/src/sync/pullIncomingChanges.ts:60-66), `message.data` is dereferenced (`data: { ...message.data, ... }`), so a network drop at an unlucky byte boundary crashes the whole sync with `TypeError: Cannot read properties of undefined (reading 'data')` instead of triggering the intended stream retry.
- **Confidence**: likely
- **Suggested fix**: In the `done` branch, only yield when `length !== undefined`; treat any incomplete frame (regardless of kind) as "partial data, will retry".

### [severity: medium] Offline `getTasks` returns the page length as the total record count
- **File**: packages/datatrak-web/src/database/task/getTasks.ts:74-76
- **Code**:
```ts
const count = await queryForCount(models, accessPolicy, processFilters);
const numberOfPages = Math.ceil(count / pageSize);
return { tasks, count: tasks.length, numberOfPages };
```
- **Problem**: The correct total (`count`) is computed and used for `numberOfPages`, but the returned `count` field is overwritten with `tasks.length` (the current page size). The server-side equivalent (packages/datatrak-web-server/src/routes/TasksRoute.ts:74-80) returns the full count.
- **Impact**: In offline-first mode, `useTasksTable` maps `count` to `totalRecords` (packages/datatrak-web/src/features/Tasks/TasksTable/useTasksTable.tsx:157, 283), so the tasks table shows e.g. "of 20" records regardless of the real total (45), while the pager still offers 3 pages — inconsistent, misleading pagination.
- **Confidence**: confirmed
- **Suggested fix**: `return { tasks, count, numberOfPages };`.

### [severity: medium] Validation skipped entirely when `min` or `max` is 0
- **File**: packages/datatrak-web/src/features/Survey/useValidationResolver.ts:70
- **Code**:
```ts
const { mandatory, min, max } = validationCriteria || {};
if (!mandatory && !min && !max) return schema;
```
- **Problem**: Truthiness check on numbers. A non-mandatory Number question with `validationCriteria: { min: 0 }` (a very common "cannot be negative" rule) has `!min === true`, so the whole field schema is skipped. The code below correctly uses `min !== undefined` / `max !== undefined`, confirming the intent. Same for `max: 0`.
- **Impact**: Users can submit negative values into fields whose survey config forbids them; the invalid data reaches the analytics pipeline.
- **Confidence**: confirmed
- **Suggested fix**: `if (!mandatory && min === undefined && max === undefined) return schema;`.

### [severity: medium] Dashboard subscribe/unsubscribe act on an arbitrary email from the request body
- **File**: packages/tupaia-web-server/src/routes/SubscribeDashboardRoute.ts:49-78 (also UnsubscribeDashboardRoute.ts:54-81)
- **Code**:
```ts
const { email } = this.req.body;
assertIsNotNullish(email);
const dashboardMailingListEntry = { dashboard_mailing_list_id: ..., email, subscribed: true, ... };
```
- **Problem**: Neither route verifies that `body.email` matches `session.email` (UnsubscribeDashboardRoute requires a session but then uses the body email; SubscribeDashboardRoute doesn't compare at all). Compare `UnsubscribeDashboardMailingListRoute`, which requires a signed token for exactly this reason.
- **Impact**: Any logged-in user can subscribe any third-party email address to dashboard report emails (spam vector) or silently unsubscribe another user from a mailing list by posting their email.
- **Confidence**: confirmed (code); exploitability assumes no upstream check in central-server's mailing-list entry CRUD
- **Suggested fix**: Use `session.email` (ignore the body value), or reject when `body.email !== session.email`.

### [severity: low] Map overlay `measureLevel` disable check breaks for entity types with more than one underscore
- **File**: packages/tupaia-web-server/src/routes/MapOverlaysRoute.ts:88, 156-157
- **Code**:
```ts
.map(ancestor => ancestor.type.toLowerCase().replace('_', ''));
...
const isDisabled = overlay.config.measureLevel
  ? ancestorTypes.includes(overlay.config.measureLevel.toLowerCase())
  : false;
```
- **Problem**: `String.replace('_', '')` removes only the first underscore. `wish_sub_district` → `wishsub_district`, which never equals `measureLevel.toLowerCase()` (`wishsubdistrict`). Multi-underscore types exist in `EntityTypeEnum` (`wish_sub_district`, `tmf_sub_district`, `srh_sub_district`, `fiji_aspen_facility`, `pacmossi_*`, `health_clinic_boundary`, …).
- **Impact**: For those hierarchies, overlays whose measure level is an ancestor of the selected entity are not disabled in the menu; selecting them yields an empty map instead of the intended disabled state.
- **Confidence**: confirmed (logic); affected projects limited to multi-underscore types
- **Suggested fix**: Use `.replaceAll('_', '')` (or `.replace(/_/g, '')`).

### [severity: low] `includeRootEntity=false` query param is treated as truthy in EntityAncestorsRoute
- **File**: packages/tupaia-web-server/src/routes/EntityAncestorsRoute.ts:20, 29-38
- **Code**:
```ts
const { includeRootEntity = false, ...restOfQuery } = query;
...
if (includeRootEntity) {
  const excludedTypes = await getTypesToExclude(...);
  if (excludedTypes.includes(rootEntity.type)) { throw new Error('Access to entity of type ... is denied.'); }
}
```
- **Problem**: Query params are strings; a client sending `?includeRootEntity=false` produces the truthy string `"false"`, so the route runs the excluded-type check and throws "Access denied" for a root entity of a frontend-excluded type — even though the root entity was never going to be included (downstream `EntityApi` stringifies and entity-server parses `'false'` correctly, so the actual ancestor list would have been fine). Currently latent: tupaia-web always sends `includeRootEntity: true`.
- **Impact**: Any client that explicitly passes `includeRootEntity=false` for an excluded-type entity gets a spurious 500/denial instead of its ancestors.
- **Confidence**: confirmed (logic), latent in current callers
- **Suggested fix**: Parse the param: `const includeRootEntity = String(query.includeRootEntity).toLowerCase() === 'true'`.

### [severity: low] `runSync` early return leaves `isRequestingSync = true` and "Requesting sync…" stuck
- **File**: packages/datatrak-web/src/sync/ClientSyncManager.ts:280-290, 235-249
- **Code**:
```ts
this.isRequestingSync = true;
...
if (projectIds.length === 0) {
  log.warn('ClientSyncManager.runSync(): No projects in sync');
  return {};
}
```
- **Problem**: The `finally` block in `triggerSync` only resets state `if (this.isSyncing)`. When there are no projects in sync (fresh login before selecting a project) — or if `getProjectsInSync`/`getSyncTick` throws — `isRequestingSync` stays `true` and `progressMessage` stays "Requesting sync…" with no `SYNC_ENDED` event.
- **Impact**: The sync UI (`useIsRequestingSync`/`useSyncProgress`) shows a permanently "requesting" state every 30 s cycle until a real sync eventually runs, misleading users into thinking sync is stuck.
- **Confidence**: confirmed (state trace)
- **Suggested fix**: Reset `isRequestingSync`/`progressMessage` (and emit `SYNC_ENDED`) in a `finally` that isn't gated on `isSyncing`, or before every early return in `runSync`.

### [severity: low] Resubmit fallback `dataTime: new Date()` produces a malformed timestamp after timezone appending
- **File**: packages/datatrak-web/src/api/mutations/useResubmitSurveyResponse.ts:28 (with packages/database/src/core/modelClasses/SurveyResponse/processSurveyResponse.js:12-15, 100)
- **Code**:
```ts
dataTime: surveyResponse?.dataTime ? surveyResponse?.dataTime : new Date(),
```
- **Problem**: `new Date()` serializes over JSON as a UTC ISO string with a `Z` suffix. Server-side, `processSurveyResponse` does `data_time: appendTimezoneToDateString(dataTime, timezone)` which blindly concatenates an offset: `"2026-07-16T05:00:00.000Z+10:00"` — an invalid timestamp (and even if parsed leniently, double-offset). Also `timezone: surveyResponse?.timezone` may be undefined for the same missing-data case, making `getOffsetForTimezone` fail.
- **Impact**: Resubmitting a response whose original `dataTime` is missing fails or stores a wrong `data_time`. Rare (responses normally have `data_time`), but the fallback exists precisely for that case and is wrong.
- **Confidence**: likely
- **Suggested fix**: Fall back to a timezone-naive local string (e.g. `format(new Date(), "yyyy-MM-dd HH:mm:ss")`) consistent with what `appendTimezoneToDateString` expects, or omit `dataTime` and let the server default apply.

### [severity: low] `useAutocompleteOptions` select crashes when a dependent answer is `null`
- **File**: packages/datatrak-web/src/api/queries/useAutocompleteOptions.ts:53-58
- **Code**:
```ts
const attributeValue = getAnswerByQuestionId(config.questionId);
if (attributeValue === undefined) return false;
if (Object.hasOwn(attributeValue, 'value')) ...
```
- **Problem**: Only `undefined` is guarded. `Object.hasOwn(null, 'value')` throws `TypeError: Cannot convert undefined or null to object`. A `null` answer is reachable, e.g. formData restored from a draft where a cleared answer was serialized as `null` (JSON round-trip converts nothing to `null`, never `undefined`).
- **Impact**: The options query's `select` throws, putting the autocomplete question into an error state with no options for the rest of the session.
- **Confidence**: likely
- **Suggested fix**: Guard with `attributeValue == null` and/or `typeof attributeValue === 'object' && attributeValue !== null && 'value' in attributeValue`.

### [severity: low] Draft list permission-filters after pagination, producing short pages and inflated `hasMorePages`
- **File**: packages/datatrak-web-server/src/routes/SurveyResponseDraft/GetSurveyResponseDraftsRoute.ts:31-47, 75
- **Code**:
```ts
const drafts = await models.surveyResponseDraft.find(findConditions, { limit: pageLimit + 1, offset: page * pageLimit, ... });
const hasMorePages = drafts.length > pageLimit;
...
const permittedDrafts = paginatedDrafts.filter(d => surveyMap.has(d.survey_id as string));
```
- **Problem**: `hasMorePages` and the page window are computed on the raw rows, but drafts whose surveys the user can no longer access are dropped afterwards. A page of 20 raw drafts where 5 are non-permitted renders 15 items; a final page consisting solely of non-permitted drafts renders as an empty page with `hasMorePages` having been `true` on the previous page.
- **Impact**: Infinite-scroll/paged draft lists can show a "load more" that loads nothing, or inconsistent page sizes; not data loss, but broken pagination behaviour whenever survey permissions have been revoked.
- **Confidence**: confirmed (logic)
- **Suggested fix**: Filter by permitted surveys in the DB query (join on accessible survey ids) before applying limit/offset.

### [severity: low] Offline entity attribute filters are snake_cased, diverging from the online path
- **File**: packages/datatrak-web/src/database/entity/getEntityDescendants.ts:130 (with packages/utils/src/object.js:274-297 and packages/datatrak-web/src/features/EntitySelector/useEntityBaseFilters.ts:35)
- **Code**:
```ts
return omitBy(snakeKeys(entityFilter), isNullish);
```
- **Problem**: Survey configs build filters like `attributes->>someKey` where `someKey` is a raw JSONB attribute key. `snakeKeys`/`jsonOperatorAwareSnake` snake-cases each operand, so `attributes->>facilityType` becomes `attributes->>facility_type`. The server path (datatrak-web-server `EntityDescendantsRoute` → entity-server) passes the key through untouched. Any entity attribute key that isn't already snake_case is silently rewritten only in offline mode.
- **Impact**: Entity questions filtered on camelCase attribute keys return an empty list offline while working online — answers effectively blocked for offline users of those surveys.
- **Confidence**: needs-verification (depends on whether any production survey uses non-snake_case attribute keys)
- **Suggested fix**: Exclude the JSONB key segment (anything after `->`/`->>`) from snake-casing, matching entity-server behaviour.

---

# database & utils


### [severity: high] TaskCompletionHandler OR-precedence leak lets non-`to_do` tasks be "completed" during batched survey response creation
- **File**: packages/database/src/server/changeHandlers/TaskCompletionHandler.js:36-56
- **Code**:
```js
return this.models.task.find({
  [QUERY_CONJUNCTIONS.AND]: { status: 'to_do', [QUERY_CONJUNCTIONS.OR]: { status: { comparator: 'IS', comparisonValue: null } } },
  [QUERY_CONJUNCTIONS.RAW]: {
    sql: `${surveyIdAndEntityIdPairs.map(() => `(task.survey_id = ? AND task.entity_id = ? AND created_at <= ?)`).join(' OR ')}`,
    ...
```
- **Problem**: Knex's `whereRaw` does not wrap the raw SQL in parentheses. With ≥2 survey responses in one debounced batch, the generated WHERE is `(status = 'to_do' OR status IS NULL) AND (p1) OR (p2) OR (p3)`. SQL precedence makes this `((statusOK AND p1) OR p2 OR p3)` — the status filter only applies to the *first* pair. Tasks matching any subsequent response's (survey, entity, created_at ≤ end_time) are returned regardless of status. `handleChanges` then finds a matching response for them and calls `task.handleCompletion(...)`, which unconditionally sets `status: 'completed'` and overwrites `survey_response_id` (Task.js:179-183). The single-pair sibling `Task.completeTaskForSurveyResponse` (Task.js:757-770) is unaffected, which shows the intended semantics.
- **Impact**: During bulk imports / bursts of submissions (the change queue routinely batches multiple creates within the 1s debounce), cancelled tasks get resurrected to `completed`, already-completed tasks get their linked `survey_response_id` overwritten and duplicate "completed" system comments added. Secondary issue: `handleChanges(_transactingModels, ...)` deliberately ignores the transacting models and reads/writes via `this.models`, so partial failures + the ChangeHandler retry loop re-run completions outside the advisory-locked transaction (more duplicate comments).
- **Confidence**: confirmed (code reading; knex `whereRaw` parenthesization semantics are well-established; tests only cover single-entity batches)
- **Suggested fix**: Wrap the whole OR-chain in parentheses in the raw SQL (`sql: '(' + pairs.join(' OR ') + ')'`), and use the transacting models in `handleChanges`.

### [severity: medium] getOffsetForTimezone produces garbage offsets for negative fractional-hour timezones, corrupting survey response data_time
- **File**: packages/utils/src/timezone.js:7-26 (consumed at packages/database/src/core/modelClasses/SurveyResponse/processSurveyResponse.js:12-15,100,161 and Task.js:708-710)
- **Code**:
```js
const hours = Math.abs(Math.floor(offsetDec));
const mins = (offsetDec % 1) * 60 || '00';
const prefix = offset > 0 ? '+' : '-';
```
- **Problem**: For a negative fractional offset, e.g. `America/St_Johns` in DST (−2.5h): `Math.floor(-2.5)` = −3 → `hours` = 3 (should be 2), and `(-2.5 % 1) * 60` = −30 → the string becomes `-03:-30`. Any negative half/quarter-hour zone (St_Johns −3:30/−2:30, Pacific/Marquesas −9:30) yields both a wrong hour and a negative minutes component. Also `offset === 0` yields prefix `'-'` (`-00:00`). Tests only cover positive fractional and negative whole-hour zones.
- **Impact**: `appendTimezoneToDateString` builds `data_time` for submitted survey responses (`'2024-05-06 10:00:00' + '-03:-30'`) — an unparseable/invalid timestamp for users in those timezones, breaking submission or storing corrupt datetimes; Task on-time completion stats (`new Date(formattedDate)`) become `Invalid Date` → `NaN` comparisons → tasks silently counted as not on time.
- **Confidence**: confirmed
- **Suggested fix**: Compute from absolute total minutes: `const total = Math.abs(offsetMs)/60000; hours = Math.floor(total/60); mins = String(total%60).padStart(2,'0'); prefix = offsetMs < 0 ? '-' : '+'`.

### [severity: medium] EntityHierarchyCacher hierarchy-change skip logic never works: array identity comparison + `return null` crashes the translator
- **File**: packages/database/src/server/changeHandlers/entityHierarchyCacher/EntityHierarchyCacher.js:94-96, with packages/database/src/server/changeHandlers/ChangeHandler.js:84
- **Code**:
```js
if (oldRecord && newRecord && oldRecord.canonical_types === newRecord.canonical_types) {
  return null; // ...
}
// ChangeHandler: this.changeQueue.push(...translatedChanges);
```
- **Problem**: `canonical_types` arrives in the pubsub payload as a JSON array; two parsed arrays are never `===`, so the "cache not invalidated" short-circuit only fires when both are `null`. Two consequences: (a) any update to an `entity_hierarchy` row whose canonical_types is a (unchanged) array — e.g. renaming the hierarchy — schedules a full delete-and-rebuild of every project hierarchy using it; (b) when the branch *does* fire (both null), it returns `null`, and `changeQueue.push(...null)` throws `TypeError: null is not iterable`, which is swallowed by `notifyChangeHandlers`' catch and logged as an error (net effect is a skip, but only by accident, and it spams error logs).
- **Impact**: Expensive spurious full hierarchy cache rebuilds on benign entity_hierarchy edits; misleading error logs.
- **Confidence**: confirmed (translator typedef even says `RebuildJob[] | null`, but ChangeHandler spreads the result unconditionally)
- **Suggested fix**: Compare with a deep/JSON-string equality and return `[]` instead of `null` (or make ChangeHandler treat `null` as no-op).

### [severity: medium] markRecordsAsChanged publishes NOTIFY before the transaction commits → stale model caches
- **File**: packages/database/src/server/TupaiaDatabase.js:160-162; triggered from packages/database/src/server/changeHandlers/entityHierarchyCacher/EntityHierarchyCacher.js:122-129
- **Code**:
```js
async markRecordsAsChanged(recordType, records) {
  await this.getOrCreateChangeChannel().publishRecordUpdates(recordType, records);
}
```
- **Problem**: `DatabaseChangeChannel` is a PGPubSub instance with its own dedicated connection. When `EntityHierarchyCacher.handleChanges` calls `markRecordsAsChanged` *inside* the rebuild transaction, the NOTIFY is delivered immediately (unlike table triggers, whose NOTIFYs are delivered at commit). Listeners reset the `entity`/`ancestorDescendantRelation` model caches (DatabaseModel.js:55-68) while the rebuild transaction is still uncommitted; any read in the window between NOTIFY and COMMIT repopulates the cache from pre-rebuild data, and no further invalidation arrives after commit. If the transaction retries/rolls back, notifications for a rebuild that never happened were still sent.
- **Impact**: Long-lived servers can serve stale hierarchy relations (child→parent maps, ancestor lookups) indefinitely after an entity move, until an unrelated change resets the cache.
- **Confidence**: likely (mechanism confirmed from code; hitting it requires a read racing the commit window, which is plausible since rebuilds take non-trivial time)
- **Suggested fix**: Defer `publishRecordUpdates` until after the transaction commits (e.g. queue the publish and flush it post-`wrapInTransaction`).

### [severity: medium] getDateRangeForGranularity memoize serializer destructures args in the wrong order — cache dedupe defeated, unbounded growth
- **File**: packages/utils/src/period/getDateRangeForGranularity.js:32-50
- **Code**:
```js
export const getDateRangeForGranularity = memoize(
  (datetime, periodGranularity) => { ... },
  { serializer: args => {
      const [periodGranularity, date] = args;   // <-- swapped
      const dateString = extractDateString(date);
      return JSON.stringify({ periodGranularity, date: dateString });
```
- **Problem**: The function is called as `(datetime, periodGranularity)`, so in the serializer `periodGranularity` actually holds the full datetime and `date` holds the granularity string. `extractDateString` therefore truncates the *granularity* (a no-op) while the full datetime — including the time part the comment explicitly says should be stripped — becomes part of the key. Results stay correct (keys are still unique per input), but every distinct `data_time` (each survey response has one, via `OutdatedResponseFlagger.getDimensionCombo`) creates a permanent new entry in fast-memoize's unbounded cache.
- **Impact**: The intended time-stripping memoization never dedupes; long-running servers leak memory in proportion to processed survey responses, and the hot path recomputes moment ranges per response.
- **Confidence**: confirmed
- **Suggested fix**: `const [date, periodGranularity] = args;` (match the parameter order).

### [severity: medium] TaskAssigneeEmailer sends emails inside a retried transaction — duplicate emails and batch-wide loss on one bad record
- **File**: packages/database/src/server/changeHandlers/TaskAssigneeEmailer.js:31-74, with retry loop at packages/database/src/server/changeHandlers/ChangeHandler.js:130-170
- **Code**:
```js
for (const task of changedTasks) {
  ...
  if (!entity) { throw new Error(`Entity with id ${entityId} not found`); }
  await sendEmail(assignee.email, {...});
}
```
- **Problem**: `handleChanges` runs inside `ChangeHandler.executeScheduledHandler`, which retries the whole batch up to 3 times on any error. `sendEmail` is a non-transactional side effect: if task N in the batch throws (missing survey/user/entity — quite possible since the lookup happens up to 1s+ after the change, or the record references were deleted), tasks 1..N−1 already had emails sent; the retry re-sends them, up to 3 times. After 3 failures the entire batch is dropped, so the remaining tasks' notifications are lost too.
- **Impact**: Users receive up to 3 duplicate "task assigned" emails whenever any task in a debounced batch fails its lookups; other users' notifications silently vanish.
- **Confidence**: confirmed (mechanism is unconditional in code; frequency depends on lookup failures)
- **Suggested fix**: Catch and log per-task errors inside the loop instead of throwing, and/or track already-emailed task ids so retries skip them.

### [severity: medium] findRecursiveTree interpolates ids directly into SQL (injection / broken query on quotes)
- **File**: packages/database/src/core/BaseDatabase.js:374-389
- **Code**:
```js
const sql = `
 with recursive findParents as (
   select * from ${recordType}
     where ${idKey} in ('${Array.isArray(id) ? id.join("','") : id}')
```
- **Problem**: `id` values are string-concatenated into the SQL, not bound. Any value containing `'` breaks the query, and a crafted value achieves SQL injection. Callers include `MapOverlayGroupRelation.findParentRelationTree(childIds)` and `PermissionGroup` ancestor/descendant traversal — ids typically originate internally, but these flow from server request handlers, so one unvalidated route parameter away from injection.
- **Impact**: SQL injection surface / query failures on ids containing quotes.
- **Confidence**: confirmed pattern; exploitability needs-verification (depends on whether any route passes user input through unvalidated)
- **Suggested fix**: Use parameter bindings for the id list (`in (${ids.map(() => '?').join(',')})`) and validate `recordType`/`idKey` against known identifiers.

### [severity: low] displayStringToMoment reads displayFormat off PERIOD_TYPES (a string map) — targetType branch always parses with `undefined` format
- **File**: packages/utils/src/period/period.js:209-213
- **Code**:
```js
if (validatedTargetType) {
  return utcMoment(displayString, PERIOD_TYPES[validatedTargetType].displayFormat, true);
}
```
- **Problem**: `PERIOD_TYPES` maps `'WEEK' → 'WEEK'` (plain strings); the display formats live in `PERIOD_TYPE_CONFIG`. `PERIOD_TYPES['WEEK'].displayFormat` is always `undefined`, so the strict parse runs with no format and returns Invalid Date for any real display string (e.g. `'Jan 2020'` with targetType `'month'`).
- **Impact**: Latent — the only current caller (`report-server` sortByFunctions) omits `targetType` — but the parameterised path is dead-wrong and will bite the next caller.
- **Confidence**: confirmed
- **Suggested fix**: Use `PERIOD_TYPE_CONFIG[validatedTargetType].displayFormat`.

### [severity: low] DatabaseRecord.assertValid treats a validator returning `true` as an error, contradicting its own documented contract
- **File**: packages/database/src/core/DatabaseRecord.js:108-132 (docblock lines 8-14)
- **Code**:
```js
// doc: "Each validator function should return true if the field passes the condition"
errors: results.filter(Boolean), // remove validations returning null (no error)
```
- **Problem**: `filter(Boolean)` keeps `true`, so a validator written per the class docblock ("return only an error string or true bool") makes every save/create throw `TypeValidationError` with `true` as the error. The only existing validator (Option.js:11-19) works around this by returning `hasContent(value) && null`, i.e. `null` on success — proving the documented contract is wrong.
- **Impact**: Any new model validator following the documentation breaks all writes to that model; error payload is an unhelpful `true`.
- **Confidence**: confirmed
- **Suggested fix**: Filter with `results.filter(r => r !== true && r != null)` (or fix the docblock to say "return null/undefined on success").

### [severity: low] DatabaseModel.update/updateOrCreate validate partial field sets as if they were full records
- **File**: packages/database/src/core/DatabaseModel.js:474-491
- **Code**:
```js
async update(whereCondition, fieldsToUpdate) {
  const data = await this.getDatabaseSafeData(fieldsToUpdate);
  const instance = await this.generateInstance(data);
  await instance.assertValid();
```
- **Problem**: `generateInstance` fills every schema field, leaving unspecified ones `undefined`, then `assertValid` runs all field validators against that sparse object. For `OptionModel`, `hasContent(undefined)` fails, so any `option.update(...)`/`updateById` that doesn't include `value` (e.g. updating only `sort_order`) throws `TypeValidationError` even though the row's actual `value` is untouched. Currently masked because both existing call sites (EditOptions, importOptionSets) happen to pass a full record.
- **Impact**: Latent correctness trap: partial updates on any model with field validators are rejected or, worse, validators that cross-check `this` see undefined siblings.
- **Confidence**: confirmed mechanism; latent in current call sites
- **Suggested fix**: On update, validate only the fields present in `fieldsToUpdate` (or merge with the existing record before validating).

### [severity: low] markRecordsForResync counts unrelated changes and leaks change handlers
- **File**: packages/database/src/core/utilities/markRecordsForResync.js:4-24
- **Code**:
```js
changeChannel.addDataChangeHandler(() => {
  changeCount++;
  if (changeCount === x) resolve();
});
```
- **Problem**: The handler subscribes to the global `change` channel, so *any* concurrent database change (other tables, other processes' publishes) increments the count → the batch promise can resolve before this batch's notifications were actually delivered. Handlers are never removed, so each batch adds another permanent listener that keeps counting forever (and earlier batches' listeners count later batches' changes, compounding the early-resolve problem across the loop).
- **Impact**: In an active system, `markRecordsForResync` returns before all records were published (defeating its purpose of back-pressure), and long scripts accumulate dead listeners.
- **Confidence**: confirmed
- **Suggested fix**: Filter counted changes by `record_type`/`handler_key` and record ids of the current batch, and remove the handler once resolved.

### Areas checked and found clean
Deliberately not reported: `isFuturePeriod` counting the current in-progress period's end (documented by tests as intended); `sanitizeComparisonValue` escaping only `_` and not `%` for LIKE/ILIKE (comment indicates `%` wildcards are intentionally allowed); the `getDefaultDates` throw for string `defaultTimePeriod` on single-date granularities (explicitly asserted in periodGranularities.test.js:130-141); `customFunctions.isUndefined` being inverted in name only (all usages are consistent); `getCacheKey` being passed a raw string instead of `arguments` in AncestorDescendantRelation (keys remain unique, cosmetic only).

---

# entity-server / aggregator / data-api / indicators


### [severity: high] `getPreferredPeriod` uses `Math.max` on non-numeric periods — WEEK/QUARTER analytics resolve to the *oldest* value under MOST_RECENT / FINAL_EACH_*

- **File**: packages/aggregator/src/analytics/aggregateAnalytics/aggregations/utils/getPreferredPeriod.js:39
- **Code**:
  ```js
  return Math.max(...filteredPeriods).toString();
  ```
- **Problem**: Week periods (`'2021W02'`) and quarter periods (`'2021Q2'`) are non-numeric strings (see `PERIOD_TYPE_CONFIG` in packages/utils/src/period/period.js). `Math.max('2021W01', '2021W02')` is `NaN`, so `getPreferredPeriod` returns `'NaN'`. Both call sites then treat the *incumbent* as preferred:
  - `filterLatest.js:21` — `if (period === getPreferredPeriod(mostRecentFoundSoFar.period, period))` is false for every analytic after the first, so `MOST_RECENT`/`MOST_RECENT_PER_ORG_GROUP`/`SUM_MOST_RECENT_PER_FACILITY` keep the **first-seen** (typically oldest, since analytics arrive sorted by date ascending) value per data element/org unit.
  - `getFinalValuePerPeriod.js:41` — `FinalValueCache` keeps the first analytic in each bucket instead of the final one, so `FINAL_EACH_MONTH`/`FINAL_EACH_QUARTER`/etc. over weekly or quarterly source data return the *first* value of each bucket, not the final one.
  Concrete: analytics `[{period:'2021W01', value:1}, {period:'2021W02', value:2}]` with `MOST_RECENT` returns value 1. Note the codebase's own string-safe `min`/`max` (`compareAsc`-based, packages/utils/src/array.js) exist but aren't used here — the sibling `sumPreviousPerPeriod` test even carries the comment "It won't work with non numeric periods. eg: 2020W2".
- **Impact**: Any weekly/quarterly-period data that is aggregated in JS (e.g. DHIS2 weekly datasets such as PSSS syndromic surveillance — DB-side aggregation only applies to the internal Tupaia data source) silently reports stale values for "most recent" and "final per period" visualisations.
- **Confidence**: confirmed (logic); production exposure depends on weekly/quarterly-period sources, which exist via DHIS2
- **Suggested fix**: Replace `Math.max(...filteredPeriods).toString()` with the `compareAsc`-based `max()` from `@tupaia/utils`, or compare via `comparePeriods()`.

### [severity: medium] `sumPreviousPerPeriod` never combines multiple analytics for the same org unit/data element within one period bucket

- **File**: packages/aggregator/src/analytics/aggregateAnalytics/aggregations/sumPreviousPerPeriod.js:21-29, 51-68
- **Code**:
  ```js
  if (!summedAnalytics.length) {
    let analyticsForFirstPeriod = analyticsForPeriod;   // returned raw if no earlier data
    ...
  }
  // sumByAnalytic:
  const returnAnalytics = currentAnalytics.map(analytic => ({ ...analytic, period }));
  ```
- **Problem**: `sumByAnalytic` maps `currentAnalytics` verbatim; duplicates *within* the current bucket are never merged (only `previousAnalytics` are merged into the first matching row). Example (`SUM_PREVIOUS_EACH_DAY`): two survey responses on the same first day, same org unit/data element, values 1 and 2 → output for day 1 is two rows `[1, 2]` instead of one row `3`; day 2 correctly collapses to `3`. Downstream consumers that cluster by orgUnit+period (e.g. `analyticsToAnalyticClusters`, `keyValueByDataElement`) keep the last row, so day 1 shows 2 while day 2 shows 3 — the cumulative series is understated at the point where duplicates occur. Additionally, when there is no data before the first period, the first bucket is returned without its period converted to the aggregation period type.
- **Impact**: Wrong starting values / kinked cumulative-total charts whenever more than one raw analytic exists per org unit/data element/day (multiple submissions in one day).
- **Confidence**: likely (tests only cover one analytic per bucket)
- **Suggested fix**: Pre-sum `analyticsByPeriod` buckets per (dataElement, organisationUnit) before the reduce, and always stamp the converted period on the first bucket.

### [severity: medium] Singleton `ExpressionParser.clearScope()` permanently deletes `customNamespaces` (`dateUtils`)

- **File**: packages/indicators/src/Builder/helpers.ts:49 (with packages/expression-parser/src/expression-parser/ExpressionParser.js:167-171, 51)
- **Code**:
  ```js
  parser.setAll(dataValues);
  const result = parser.evaluate(formula);
  parser.clearScope();          // clears customScope, which also holds customNamespaces
  ```
- **Problem**: The constructor installs `customNamespaces` (`dateUtils` = date-fns) into the same `customScope` Map that `clearScope()` wipes (`this.customScope.clear()` — its own doc says only imported *functions* survive). The indicators package uses a process-wide singleton (`getExpressionParserInstance`), so after the very first cluster of the very first indicator is evaluated, `dateUtils` is gone for the lifetime of the process. An indicator formula referencing `dateUtils.*` evaluates correctly for exactly one cluster and then throws "Undefined symbol dateUtils" for every subsequent cluster/request.
- **Impact**: Indicator formulas using the documented `dateUtils` namespace fail non-deterministically (first evaluation succeeds, everything after 500s).
- **Confidence**: confirmed behavior; needs-verification whether any production indicator formula uses `dateUtils`
- **Suggested fix**: Have `clearScope()` re-seed `customNamespaces` (or delete only the keys that were `set` since construction).

### [severity: medium] String entries in an aggregation list are silently re-interpreted as `MOST_RECENT` by the JS aggregator

- **File**: packages/aggregator/src/Aggregator.js:49-55 and packages/aggregator/src/analytics/aggregateAnalytics/aggregateAnalytics.js:20
- **Code**:
  ```js
  aggregationList.reduce((acc, { type, config }) => aggregateAnalytics(acc, type, {...}), analytics);
  // aggregateAnalytics.js
  export const aggregateAnalytics = (analytics, aggregationType = AGGREGATION_TYPES.MOST_RECENT, ...)
  ```
- **Problem**: Mixed string/object aggregation lists are an explicitly supported shape elsewhere: the data-api validator accepts strings, `AnalyticsFetchQuery` deliberately `break`s on them, and the aggregator's own `adjustOptionsToAggregationList` test uses `[offsetAgg, 'FINAL_EACH_MONTH', offsetAgg]`. But `Aggregator.aggregateAnalytics` destructures `{ type, config }` from each entry — for a string entry `type` is `undefined`, and `aggregateAnalytics`'s default parameter turns `undefined` into `MOST_RECENT`. So a config like `[{type:'OFFSET_PERIOD',...}, 'FINAL_EACH_MONTH']` executes OFFSET → **MOST_RECENT** instead of OFFSET → FINAL_EACH_MONTH. (`processEvents` has the analogous problem: strings become `RAW`, i.e. silently skipped.)
- **Impact**: Legacy configs with string aggregations in `aggregations` lists (e.g. via web-config-server data builders, which pass `this.config.aggregations` straight through) get a completely different aggregation applied with no error.
- **Confidence**: likely (mis-handling is certain; live configs with bare-string lists reaching this path unverified — report-server normalizes, web-config-server does not)
- **Suggested fix**: Normalize entries at the top of `Aggregator.aggregateAnalytics`/`processEvents` (`typeof a === 'string' ? { type: a } : a`), and remove the `MOST_RECENT` default for `undefined` type (throw instead).

### [severity: medium] `getRelativesOfEntities` passes relation-table criteria to a plain `entity` find — `generational_distance` filter crashes /relatives and /relationships

- **File**: packages/database/src/core/modelClasses/Entity.js:826-829 (surfaced via packages/entity-server/src/routes/hierarchy/EntityRelativesRoute.ts:21 and relationships/ResponseBuilder.ts:164)
- **Code**:
  ```js
  const self = await this.find({
    ...criteria,          // may contain generational_distance (a valid public filter field)
    id: entityIds,
  });
  ```
- **Problem**: `generational_distance` is a whitelisted filterable field (`tsmodels` `filterableFields`) that only exists on `ancestor_descendant_relation`. The ancestor/descendant lookups join that table so the criteria works there, but the `self` lookup queries the bare `entity` table with the same criteria. A request like `GET /v1/hierarchy/{h}/{entity}/relatives?filter=generational_distance==1`, or a relationships request with `descendant_filter=generational_distance==1`, produces `column entity.generational_distance does not exist` → 500 — while the same filter works fine on `/descendants`.
- **Impact**: Legitimate filter combinations crash two entity-server endpoints instead of returning data.
- **Confidence**: likely
- **Suggested fix**: Strip relation-only keys (`generational_distance`) from the criteria used for the `self` lookup.

### [severity: medium] `fetchParameterAnalytics` applies aggregation lists without the date-range adjustment that formula elements get

- **File**: packages/indicators/src/Builder/AnalyticArithmeticBuilder/AnalyticArithmeticBuilder.ts:98-108
- **Code**:
  ```ts
  const analytics = await this.api.buildAnalyticsForBuilders(this.paramBuilders, fetchOptions);
  ...
  return this.api.getAggregator().aggregateAnalytics(analyticsForElement, aggregationList, fetchOptions.period);
  ```
- **Problem**: For formula data elements, `fetchFormulaAnalytics` goes through `aggregator.fetchAnalytics` → `adjustOptionsToAggregationList`, which widens `startDate`/`endDate` for `OFFSET_PERIOD` (offset compensation) and `SUM_PREVIOUS_EACH_DAY` (fetch from earliest data date). For nested-indicator *parameters*, the nested builder fetches with the **original, unwidened** `fetchOptions`, and the parameter's aggregation list is then applied purely in JS. So a parameter aggregated with `OFFSET_PERIOD` (offset −1 MONTH) needs next month's data, which was never fetched; a parameter aggregated with `SUM_PREVIOUS_EACH_DAY` has no pre-range history to accumulate — the cumulative baseline is silently 0.
- **Impact**: Indicators whose parameter aggregations include OFFSET_PERIOD/SUM_PREVIOUS_EACH_DAY produce empty or understated values near/inside the requested range.
- **Confidence**: needs-verification (depends on configs using these aggregation types on parameters)
- **Suggested fix**: Apply the same `AGGREGATION_TYPE_TO_DATE_RANGE_GETTER` adjustment to `fetchOptions` before calling `buildAnalyticsForBuilders`, mirroring `adjustOptionsToAggregationList`.

### [severity: low] `fetchAncestorDetailsByDescendantCode` orders `generational_distance ASC` then overwrites — furthest same-type ancestor wins

- **File**: packages/database/src/core/modelClasses/Entity.js:570-583
- **Code**:
  ```js
  ORDER BY generational_distance ASC
  ...
  ancestorDescendantRelations.forEach(r => {
    ancestorDetailsByDescendantCode[r.descendant_code] = { code: r.ancestor_code, ... };
  });
  ```
- **Problem**: The map is built by overwriting, so the *last* row per descendant wins — with ASC ordering that is the ancestor with the **largest** generational distance. When a hierarchy contains more than one ancestor of the requested type on a descendant's path (possible with custom hierarchies where the same entity type nests), the entity is aggregated into the furthest ancestor, whereas the deliberate `ORDER BY` strongly suggests the nearest was intended. This map feeds `orgUnitMap` for all `*_PER_ORG_GROUP` aggregations (web-config-server `buildAggregationOptions`, entity-server `ResponseBuilder`), so data would roll up to the wrong level.
- **Impact**: Misattributed aggregation groups in hierarchies with same-type nesting; no effect on plain country→district→facility trees.
- **Confidence**: needs-verification (intent ambiguous; standard hierarchies unaffected)
- **Suggested fix**: Either `ORDER BY generational_distance DESC`, or skip assignment when the descendant already has an entry.

### [severity: low] Empty `organisationUnitCodes`/`dataElementCodes` produce invalid SQL `VALUES ()` instead of an empty result

- **File**: packages/data-api/src/AnalyticsFetchQuery.ts:298-300 (and EventsFetchQuery.ts:79-83) with packages/database/src/core/SqlQuery.js:30-31, 40-44
- **Code**:
  ```js
  static values = rows => `VALUES (${rows.map(v => v.map(() => '?').join(',')).join('), (')})`;
  // rows = []  →  'VALUES ()'  →  Postgres syntax error
  ```
- **Problem**: The yup validators (`yup.array().of(...).required()`) accept empty arrays, and `sanitiseFetchDataOptions` defaults `dataElementCodes` to `[]`. `SqlQuery.innerJoin(..., [])` renders `INNER JOIN (VALUES ()) ...`, which is a Postgres syntax error. `Aggregator.fetchAnalytics` guards empty org unit lists, but direct `TupaiaDataApi.fetchAnalytics`/`fetchEvents` callers (data-broker paths that filter codes by permission/data-service before calling) can hit this.
- **Impact**: 500 database syntax error instead of an empty analytics/events response.
- **Confidence**: confirmed for the SQL generation; caller exposure likely but path-dependent
- **Suggested fix**: Short-circuit fetch to an empty result when either code list is empty (or make `SqlQuery.values` reject/handle empty input explicitly).

### [severity: low] `getDateRangeForOffsetPeriod` expands the end of the compensated window but not the start

- **File**: packages/aggregator/src/analytics/aggregateAnalytics/aggregations/offsetPeriod.js:45-48
- **Code**:
  ```js
  const startMoment = utcMoment(dateRange.startDate).add(offsetCompensation, momentUnit);
  const endMoment = utcMoment(dateRange.endDate).add(offsetCompensation, momentUnit).endOf(momentUnit);
  ```
- **Problem**: The end date is snapped to the end of the offset unit ("so that enough data will be available"), but the start date keeps its day-of-month. For a mid-period start date (custom date-picker range, e.g. start 2020-01-15 with `OFFSET_PERIOD` MONTH −1 chained with `FINAL_EACH_MONTH`/`SUM_EACH_MONTH`), the compensated fetch starts 2020-02-15 and misses data recorded 2020-02-01→14 that belongs to the first displayed (offset) month — e.g. a stock take done on the 1st of the month yields an empty/understated first period. Existing tests only use period-aligned start dates, so the asymmetry is untested.
- **Impact**: Missing or understated first period in offset-period visualisations with unaligned start dates.
- **Confidence**: likely
- **Suggested fix**: Apply `.startOf(momentUnit)` to `startMoment`, mirroring the `endOf` on `endMoment`.

---

# report-server / data-table-server


### [severity: medium] orderColumns misplaces/loses columns when ordered columns follow the `*` wildcard

- **File**: packages/report-server/src/reportBuilder/transform/functions/orderColumns/orderColumns.ts:52-58
- **Code**:
```ts
const indexInNewColumns =
  indexInOrder < indexOfWildcard
    ? indexInOrder
    : indexInOrder + orderedColumns.length - 1; // wrong: should use wildcardColumns.length
```
- **Problem**: For a column placed after `'*'` in the configured order, the final position must be `indexInOrder - 1 + wildcardColumns.length` (one slot per explicit column before it, plus all wildcard-expanded columns). The code adds `orderedColumns.length` (the count of *explicitly ordered* columns) instead of `wildcardColumns.length`. The two only coincide when the counts happen to be equal — which is true for the one wildcard test case (`['dataElement','*','organisationUnit']` over 4 columns, 2 ordered / 2 wildcard), so the test suite passes by coincidence. Simulated: columns `[a,b,c]` with `order: ['*','b']` produces `["a","b",null]` (c is overwritten, hole left); columns `[a,b,c,d]` with `order: ['a','*','c','d']` produces `["a","b",null,null,"c","d"]`. Any hole then hits the `isDefined` check and throws `'Missing columns when determining new column order'`.
- **Impact**: Any report using `orderColumns` with an explicit order in which columns appear after `'*'` and the counts differ crashes at build time — the dashboard visual errors out for a perfectly valid config.
- **Confidence**: confirmed (logic simulated)
- **Suggested fix**: Compute post-wildcard positions as `indexInOrder - 1 + wildcardColumns.length`.

### [severity: medium] sortRows expression comparator removes `row1` from parser scope twice, leaking row2's values into later comparisons

- **File**: packages/report-server/src/reportBuilder/transform/functions/sortRows.ts:46
- **Code**:
```ts
sortParser.set('@current', row2);
sortParser.addRowToScope(row2);
const row2Value = sortParser.evaluate(expression);
sortParser.removeRowFromScope(row1);   // <-- should be row2
```
- **Problem**: After evaluating the expression for `row2`, the code removes `row1`'s fields from the scope again instead of `row2`'s. Whenever `row2` has a column that `row1` lacks (common for heterogeneous rows, e.g. after `keyValueByDataElementName`), that `$column` value stays in the scope and is visible to every subsequent comparison. E.g. rows `{x:1}`, `{x:2, y:5}`, `{x:3}` sorted by `'=exists($y) ? $y : $x'`: after comparing rows 1 and 2, `$y = 5` is stuck in scope, so row 3 evaluates to 5 instead of 3 — silently wrong ordering.
- **Impact**: Expression-based `sortRows` can produce silently wrong row order (which then feeds `mergeRows using: last/first` aliases like `mostRecentValuePerOrgUnit`, i.e. wrong values, not just wrong display order). Minor related issue in the same function: when `by` is an expression only `direction[0]` is honoured.
- **Confidence**: confirmed (clear typo; impact requires heterogeneous rows)
- **Suggested fix**: Change line 46 to `sortParser.removeRowFromScope(row2)`.

### [severity: medium] `min`/`max` expression functions don't filter `undefined`, giving order-dependent results

- **File**: packages/report-server/src/reportBuilder/transform/parser/functions/math.ts:62-76
- **Code**:
```ts
const minArrayValue = (arr: any[]) =>
  arr.reduce((smallest, current) => (current < smallest ? current : smallest));
```
- **Problem**: `sum` and `mean` in this same file explicitly filter out `undefined`, but the `min`/`max` overrides do not. All comparisons against `undefined` are false, so the reduce keeps whichever operand comes first: `min(undefined, 3)` → `undefined`, but `min(3, undefined)` → `3`. In a transform, `=min($a, $b)` where `$a` is missing on some rows yields `undefined` (the column is silently dropped for that row by `upsertColumns`), while `=min($b, $a)` yields `$b` — same data, different answers depending on argument order. Empty array also throws "Reduce of empty array with no initial value" rather than returning undefined like `sum`/`mean` do.
- **Impact**: Silently wrong or missing numbers in dashboard cells whenever a min/max is computed over columns that can be absent for a row; behaviour is inconsistent with the sibling `sum`/`mean` functions.
- **Confidence**: confirmed
- **Suggested fix**: Filter `undefined` (and arguably `null`) from the input before reducing, returning `undefined` when nothing remains — mirroring `sumArray`/`calculateMean`.

### [severity: medium] tongaCovidRawData: missing `break` after "Unknown" DOB — crashes on empty DOB, emits 1970-01-01 for null DOB

- **File**: packages/report-server/src/reportBuilder/customReports/tongaCovidRawData.ts:205-213
- **Code**:
```ts
case 'C19T004': {
  if (!rowData[fieldKey]) {
    formattedRow['Date of Birth'] = 'Unknown';
  }                                   // <-- no break/return: falls through
  const rawDate = new Date(rowData[fieldKey]);
  const dobValue = isDate(rawDate) && format(rawDate, 'yyyy-MM-dd');
  formattedRow['Date of Birth'] = dobValue;
  break;
}
```
- **Problem**: When the DOB value is falsy the code sets `'Unknown'` but then immediately overwrites it. For `null`, `new Date(null)` is 1970-01-01T00:00Z, so DOB is exported as `1970-01-01`. For `''`, `new Date('')` is an Invalid Date; date-fns `isDate` returns true for Invalid Date objects, so `format()` throws `RangeError: Invalid time value` and the entire report request 500s. Same `isDate`-on-Invalid-Date pattern makes `getAge` (line 160-167) return `NaN` for unparseable DOBs.
- **Impact**: The Tonga COVID raw-data export either crashes for the whole request or exports a wrong date of birth (1970-01-01 / NaN age) whenever a registration has an empty DOB answer.
- **Confidence**: confirmed
- **Suggested fix**: `break` (or `return`) inside the `if (!rowData[fieldKey])` branch, and guard `format()` with a real validity check (`!isNaN(rawDate.getTime())`).

### [severity: low] insertSummaryRowAndColumn renders "NaN%" for rows with no Y/N values

- **File**: packages/report-server/src/reportBuilder/transform/aliases/summaryAliases.ts:36-50
- **Code**:
```ts
const addPercentage = (numerator: number, denominator: number) => {
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
};
```
- **Problem**: `getSummaryColumn` computes numerator/denominator per row over the detected Y/N columns. A row that has no Y/N values in those columns (e.g. a numeric or blank row alongside Y/N rows — the detected columns are table-wide, but a given row may have all-undefined cells there) gets denominator 0 → `NaN/0` → the literal string `"NaN%"` in the `summaryColumn` cell.
- **Impact**: "NaN%" shown in matrix summary column on dashboards for partially-filled tables.
- **Confidence**: confirmed (code path); likely (frequency in real data)
- **Suggested fix**: Return `undefined` (or empty string) from `addPercentage` when the denominator is 0.

### [severity: low] Non-boolean `where` result is treated as "matches", which for excludeRows deletes rows

- **File**: packages/report-server/src/reportBuilder/transform/functions/where.ts:18-22
- **Code**:
```ts
const whereResult = parser.evaluate(params.where);
if (typeof whereResult === 'boolean') {
  return whereResult;
}
return true;
```
- **Problem**: If the `where` expression evaluates to anything non-boolean (config author writes `where: '=$flag'` where flag is 1/0, or an expression that yields a string/undefined), the row is treated as matching. In `updateColumns`/`insertColumns` this means the edit/insert applies to every row; in `excludeRows` it means **every** row is deleted — the opposite of the safe default for a destructive filter, and both 1-rows and 0-rows are removed identically so the misconfiguration is easy to miss.
- **Impact**: A subtly mistyped `where` yields an empty or fully-transformed table instead of an error, i.e. silently wrong dashboards.
- **Confidence**: confirmed behaviour; intent is debatable
- **Suggested fix**: Throw (or at least return false for excludeRows) when a `where` expression evaluates to a non-boolean.

### [severity: low] mergeRows / fillRows group keys can collide because values are joined with a plain `___` delimiter

- **File**: packages/report-server/src/reportBuilder/transform/functions/utils/buildRowKey.ts:5-10 (used by mergeRows via createGroupKey.ts:14 and fillRows via generateRowInserts.ts:19,27)
- **Code**:
```ts
return columnsOfInterest.map(columnName => row[columnName]).join(divider); // divider = '___'
```
- **Problem**: Keys are built by joining raw values with `___` and no escaping. Two distinct groups can produce the same key: `{c1: 'A_', c2: '_B'}` and `{c1: 'A', c2: '__B'}` both key to `'A____B'`. Also `undefined` and the literal string `"undefined"` collide (`createGroupKey` single-column branch stringifies with template literal). Colliding groups get merged into one row (with `sum` double-counting, `single` throwing, etc.); in fillRows a collision can falsely mark an expected row as present so the gap is never filled.
- **Impact**: Rare but silent data merging/loss for entity or label values containing underscores.
- **Confidence**: confirmed mechanism; likely rare in practice
- **Suggested fix**: JSON-encode the key parts (`JSON.stringify(columnsOfInterest.map(c => row[c]))`) instead of string-joining.

### [severity: low] TransformScope.keys() spreads Map keys into the Set constructor, returning characters of the first key

- **File**: packages/report-server/src/reportBuilder/transform/parser/TransformScope.ts:33-35
- **Code**:
```ts
public keys() {
  return Array.from(new Set(...this.scope.keys()));
}
```
- **Problem**: `new Set(...keys)` passes each key as a separate constructor argument; `Set` uses only the first, and because it's a string it is iterated character-by-character. With scope keys `['@params','where']` this returns `['@','p','a','r','m','s']` instead of the key list.
- **Impact**: Dormant unless mathjs (which duck-types this object as a Map, including `keys`) iterates the scope — e.g. sub-scope creation for inline function definitions in expressions. When hit, symbols would silently resolve wrongly.
- **Confidence**: confirmed code bug; needs-verification whether mathjs currently calls it
- **Suggested fix**: `return Array.from(this.scope.keys());`.

### Areas checked and found clean
No genuine logic bugs found in packages/data-table-server/src: the services validate and pass parameters through cleanly; the survey-response date-boundary handling is deliberate (commented); the only oddities are cosmetic (an inconsistent comparator in `orderParametersByName` that never returns 0 and sorts unknown names first, and the `date` param transform in dataTableParamsToYupSchema returning `new Error(...)` instead of throwing — both fail safe).

---

# auth / access-policy / central-server permissions


### [severity: medium] One-time login token is marked "used" without awaiting the save (fire-and-forget)
- **File**: packages/auth/src/Authenticator.js:111-113
- **Code**:
  ```js
  const foundToken = await this.models.oneTimeLogin.findValidOneTimeLoginOrFail(token);
  foundToken.use_date = new Date();
  foundToken.save();
  ```
- **Problem**: `save()` is async (`DatabaseRecord.save` returns a promise) but is not awaited. The single-use guarantee of one-time login tokens (enforced only by `isUsed`/`use_date` in `OneTimeLoginModel.findValidOneTimeLoginOrFail`, packages/database/src/core/modelClasses/OneTimeLogin.js:43) therefore relies on a write that (a) races with any concurrent request — two simultaneous requests with the same token both pass the `isUsed` check before either write lands (already a check-then-act race, widened by the missing await), and (b) may fail silently: if the UPDATE rejects, the login still succeeds, the token remains valid for the rest of its 1-hour expiry window, and the rejection is unhandled (in modern Node an unhandled rejection can terminate the process).
- **Impact**: One-time login (password-reset / email-login) tokens can be replayed; a failed save leaves a "used" token fully reusable; potential process crash from unhandled rejection.
- **Confidence**: confirmed
- **Suggested fix**: `await foundToken.save()` (and ideally make the mark-as-used atomic, e.g. `UPDATE ... SET use_date = now() WHERE token = ? AND use_date IS NULL RETURNING *`).

### [severity: medium] `req.assertPermissions` silently passes when given an invalid (e.g. `undefined`) assertion
- **File**: packages/central-server/src/permissions/permissions.js:23-29
- **Code**:
  ```js
  if (!isPermissionAssertionValid(flagPermissionsChecked, assertion)) {
    winston.warn('Skipping invalid permission assertion');
    return;
  }
  ```
- **Problem**: If a route calls `await req.assertPermissions(someAssertion)` where `someAssertion` is `undefined`/not a function (typo, circular-import returning `undefined`, or a builder that returns nothing on some branch), the function logs a warning and *resolves successfully* — the permission check is treated as passed rather than failing closed. The `res.send` 501 safety net only helps if this was the request's *only* check: `flagPermissionsChecked` isn't called here, but any other valid `assertPermissions` call in the same request (or a `permissionsFilteredInternally` handler touching the `accessPolicy` getter, RouteHandler.js:26-31) restores `res.send`, after which the skipped check is invisible. Even in the 501 case, mutation side effects (DB writes) have already executed by the time the response is blocked.
- **Impact**: A programming error anywhere in route code degrades to a silently skipped permission check instead of a hard failure — fail-open behavior in the central permission enforcement point.
- **Confidence**: confirmed (behavior); no currently-misfiring caller found, so exploitability is latent
- **Suggested fix**: Throw a `PermissionsError` (fail closed) when the assertion is not a function, instead of warning and returning.

### [severity: medium] `AccessPolicy` permission-set cache key is ambiguous — entity lists can collide
- **File**: packages/access-policy/src/AccessPolicy.js:102
- **Code**:
  ```js
  const cacheKey = `permissions-${entities.join('-')}`;
  ```
- **Problem**: `Array.join('-')` is not injective when entity codes themselves contain `-`. E.g. with policy `{ A: ['Admin'] }`, calling `getPermissionGroupsSet(['A', 'B'])` caches `{Admin}` under key `permissions-A-B`; a later `allows('A-B', 'Admin')` computes the same key and returns the cached `{Admin}` set, wrongly reporting access to entity `A-B` (and the inverse ordering can wrongly deny). All of `allows`, `allowsSome`, `allowsAll`, `allowsAnywhere` and `getPermissionGroups` funnel through this cache, and callers pass arbitrary entity-code arrays (e.g. `web-config-server` child-entity codes, central-server visualisation country lists).
- **Impact**: Wrong permission grant or denial whenever an entity code containing a hyphen shares an `AccessPolicy` instance with a colliding multi-entity query. Most Tupaia policy keys are country codes (no hyphens) and instances are typically per-request, so real-world occurrence is narrow — but nothing enforces hyphen-free entity codes.
- **Confidence**: confirmed (logic); needs-verification (whether hyphenated entity codes are queried in production)
- **Suggested fix**: Use an unambiguous key, e.g. `JSON.stringify(entities)` or `entities.join(' ')`.

### [severity: low] `upsertRefreshToken`'s try/catch is dead code — missing await
- **File**: packages/auth/src/Authenticator.js:172-182
- **Code**:
  ```js
  try {
    return this.models.refreshToken.updateOrCreate({ user_id: userId, device }, { ... });
  } catch (error) {
    throw new DatabaseError('storing refresh token', error);
  }
  ```
- **Problem**: The promise is returned without `await`, so a rejection from `updateOrCreate` can never be caught by this `catch`; the intended `DatabaseError('storing refresh token', ...)` wrapping never happens and the raw DB error propagates to the caller instead.
- **Impact**: Cosmetic/diagnostic only in practice (wrong error type/message surfaces on refresh-token storage failure), but the code demonstrably does not do what it was written to do.
- **Confidence**: confirmed
- **Suggested fix**: `return await this.models.refreshToken.updateOrCreate(...)` inside the try block.

### [severity: low] `SessionRecord.refreshAccessToken` caches a rejected refresh promise forever
- **File**: packages/server-boilerplate/src/orchestrator/models/Session.ts:86-97
- **Code**:
  ```ts
  const refreshAndUpdate = async () => {
    const sessionDetails = await this.authConnection.refreshAccessToken(this.refresh_token);
    await this.updateSessionDetails(sessionDetails);
    this.refreshAccessTokenPromise = null;   // only reached on success
  };
  ```
- **Problem**: `this.refreshAccessTokenPromise = null` is only executed after both awaits succeed. If the refresh fails (e.g. transient network error to central-server, non-401), the field keeps holding the rejected promise, so every subsequent `getAuthHeader()` on this record instance re-returns the same stale rejection and never retries. Since session records are re-fetched per request (`attachSession`), the blast radius is one request — but an orchestration request that fans out to several micro-service calls will fail all of them off one transient error, and the 401-cleanup branch in `getAuthHeader` never gets a chance to run on retry within that request.
- **Impact**: Transient refresh failures are amplified; no retry within a request.
- **Confidence**: confirmed
- **Suggested fix**: Clear `refreshAccessTokenPromise` in a `finally` block instead of after the last `await`.

### [severity: low] Null-user paths in `Authenticator` crash with TypeError (500) instead of clean auth errors
- **File**: packages/auth/src/Authenticator.js:29-30 and 55-56
- **Code**:
  ```js
  const user = await this.models.user.findById(userId);
  const userAccessPolicy = await this.getAccessPolicyForUser(user.id);
  // ...
  const user = await apiClient.getUser();
  const accessPolicy = await this.getAccessPolicyForUser(user.id);
  ```
- **Problem**: (1) `authenticateAccessToken`: a JWT for a since-deleted user makes `findById` return null, so `user.id` throws TypeError rather than `UnauthenticatedError`. (2) `authenticateApiClient`: `ApiClientRecord.getUser()` (packages/database/src/core/modelClasses/ApiClient.js:74) deliberately returns `null` for api clients with no `user_account_id` — the comment says "the consuming function should auth the user separately" — but this consumer dereferences `user.id` unconditionally, so any such api client gets a 500 on every basic-auth request via `buildBasicBearerAuthMiddleware`.
- **Impact**: 500s (and misleading logs) instead of 401s; no access-control bypass. Whether a user-less api client currently exists in production data is unverified.
- **Confidence**: confirmed (code path); needs-verification (production data for case 2)
- **Suggested fix**: Null-check the user in both paths and throw `UnauthenticatedError`.

### [severity: low] `extractRefreshTokenFromReq` throws TypeError when no Authorization header is present
- **File**: packages/auth/src/security.js:34-42
- **Code**:
  ```js
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!isJwtToken(authHeader)) { ... }   // isJwtToken = h => h.startsWith('Bearer ')
  ```
- **Problem**: With no Authorization header, `authHeader` is `undefined` and `undefined.startsWith(...)` throws TypeError. It also calls `jwt.verify` (line 41), so an expired-but-previously-valid token makes this *logging* helper throw `TokenExpiredError`. Its only current caller, `logApiRequest` (packages/central-server/src/apiV2/middleware/logApiRequest.js:4), runs after `buildBasicBearerAuthMiddleware`, which guarantees a header and a fresh token, so the bug is currently shielded by middleware ordering — but the function is exported from `@tupaia/auth` with no such contract, and `logApiRequest` is an async middleware with no error handling (a throw there becomes an unhandled rejection / hung request under Express 4).
- **Impact**: Latent 500/hung-request path if the helper is ever called before authentication, or if middleware ordering changes.
- **Confidence**: confirmed (logic); currently unreachable in production wiring
- **Suggested fix**: Guard `if (!authHeader) return undefined;` and use `jwt.decode` (or catch verify errors) since the function's purpose is log enrichment, not validation.

### Areas checked and found clean
- **`buildAccessPolicy` SQL** (packages/auth/src/buildAccessPolicy.js): recursive expansion direction (held group → descendant groups) matches the documented hierarchy in test fixtures (Admin is root; Donor/Public are descendants); empty-permission users correctly get `{}`.
- **`mergeAccessPolicies` / `isLegacyAccessPolicy`**: union logic correct; legacy short-circuit is intentional per tests.
- **Password/secret-key verification** (packages/auth/src/passwordEncryption.js; User.js `checkPassword`; ApiClient.js `verifySecretKey`): argon2 argument order correct in all call sites, legacy sha256→argon2 migration path returns the pre-migration verification result correctly, no fail-open branches.
- **`assertAnyPermissions`/`assertAllPermissions`** (packages/access-policy/src/permissions.js): empty `assertAnyPermissions` list denies; both rely on throw-based assertions and ignore return values — no caller passes a boolean *checker* where an assertion is expected, so no active bug (though `assertAllPermissions([])` would allow; no such caller exists). Note `hasPermissionGroupsAccess(policy, [])` returns `true` (`.every` on empty array); its callers (e.g. GETDashboardVisualisations) reach it only after a base permission gate and it appears intentional ("no permission group set" = unrestricted).
- **`AccessPolicyBuilder`** cache invalidation (userEntityPermission + permissionGroup change handlers, rejected-promise eviction) is sound; DB change handlers propagate cross-process via pg NOTIFY.
- **Session cookie / `attachSession` / `RequiresSessionAuthHandler` / `SessionSwitchingAuthHandler`**: no inverted conditions; the anonymous fallback to the server's API client in `SessionSwitchingAuthHandler` is intentional public-access design.
- **`getJwtToken` / `getUserAndPassFromBasicAuth` / `getTokenClaims`**: scheme checks and split-on-first-colon password parsing are correct.
