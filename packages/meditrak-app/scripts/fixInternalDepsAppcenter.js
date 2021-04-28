const fs = require('fs');

// This will redirect package.json entries for any '@tupaia' package to look at the local filesystem,
// rather than relying on yarn workspaces, which isn't supported on appcenter
const fixInternalDepsAppcenter = () => {
  console.log(
    'Fixing local dependencies for appcenter (see https://github.com/microsoft/appcenter/issues/278)',
  );
  fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const result = data.replace(/"@tupaia\/([^"]*)": "[^"]*"/g, '"@tupaia/$1": "file:../$1"');

    fs.writeFile('package.json', result, 'utf8', writeError => {
      if (writeError) {
        console.log(writeError);
      }
    });
  });
};

fixInternalDepsAppcenter();
