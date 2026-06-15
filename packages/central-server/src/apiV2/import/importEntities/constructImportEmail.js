/**
 * Builds the email sent when an entity import runs past the emailAfterTimeout
 * window (large imports). Mirrors the survey-response import email.
 */
export const constructEntityImportEmail = responseBody => {
  const { error } = responseBody;
  const templateContext = error
    ? {
        title: 'Import Failed',
        message: `Unfortunately, your entity import failed.\n\n${error}`,
      }
    : {
        title: 'Import Successful',
        message: 'Your entities have been successfully imported.',
      };
  return { subject: 'Tupaia Entity Import', templateContext };
};
