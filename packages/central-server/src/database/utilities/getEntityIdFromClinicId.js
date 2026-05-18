// Required for backwards compatibility for meditrak instances
// that use clinic_id against SurveyResponse
export async function getEntityIdFromClinicId(models, clinicId, projectId = null) {
  if (!clinicId) {
    return null;
  }
  const clinic = await models.facility.findById(clinicId);
  // TUP-3156: facility codes (clinics, hospitals) are sub-country and duplicated
  // per project. Caller should pass the survey's project_id so we resolve to
  // the right copy. Falls back to bare lookup if projectId is null.
  const entity = await models.entity.findOneByCodeInProject(clinic.code, projectId);
  if (!entity) {
    throw new Error(`Entity could not be found for clinic with code ${clinic.code}.`);
  }

  return entity.id;
}
