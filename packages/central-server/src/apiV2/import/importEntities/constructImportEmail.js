/**
 * Builds the email sent when an entity import runs past the emailAfterTimeout
 * window (large imports). Mirrors the survey-response import email.
 */
export const constructEntityImportEmail = responseBody => {
  const { error, warnings = [] } = responseBody;
  const successMessage = warnings.length
    ? `Your entities have been successfully imported.\n\n${warnings.join('\n')}`
    : 'Your entities have been successfully imported.';
  const templateContext = error
    ? {
        title: 'Import Failed',
        message: `Unfortunately, your entity import failed.\n\n${error}`,
      }
    : {
        title: 'Import Successful',
        message: successMessage,
      };
  return { subject: 'Tupaia Entity Import', templateContext };
};
