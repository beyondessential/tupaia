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
    const filename = filepathComponents.pop();
    const directory = filepathComponents.pop();
    const parentDirectory = filepathComponents.pop();

    if (directory === 'migrations' || directory === 'migrationData') {
      return checkMigrationOutdated(filename);
    }

    // Some migration data is broken into separate subfiles within a folder named with the
    // same name as the migration, be sure to ignore that if it's outdated too
    if (parentDirectory === 'migrationData') {
      return checkMigrationOutdated(directory);
    }
    return false;
  },
];

module.exports = { env, ignore };
