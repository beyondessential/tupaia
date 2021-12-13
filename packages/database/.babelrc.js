const env = {
  test: {
    plugins: ['istanbul'],
  },
};

const includedDateOffset = 90 * 24 * 60 * 60 * 1000; // include migrations up to 90 days old
const includedMigrationsDate = new Date().setTime(Date.now() - includedDateOffset);
const checkMigrationOutdated = function (migrationName) {
  const yearPart = migrationName.substring(0, 4);
  const monthPart = migrationName.substring(4, 6);
  const dayPart = migrationName.substring(6, 8);
  const migrationDate = new Date(`${yearPart}-${monthPart}-${dayPart}`);
  return migrationDate < includedMigrationsDate;
};

const ignore = [
  'src/tests/**',
  function (filepath) {
    const filepathComponents = filepath.split('/');
    const directory =
      filepathComponents.length > 2 ? filepathComponents[filepathComponents.length - 2] : null;
    if (directory === 'migrations' || directory === 'migrationData') {
      const filename = filepathComponents[filepathComponents.length - 1];
      return checkMigrationOutdated(filename);
    }
    const parentDirectory =
      filepathComponents.length > 3 ? filepathComponents[filepathComponents.length - 3] : null;
    if (parentDirectory === 'migrationData') {
      // Some migration data is broken into separate subfiles within a folder named with the
      // same name as the migration
      return checkMigrationOutdated(directory);
    }
    return false;
  },
];

module.exports = { env, ignore };
