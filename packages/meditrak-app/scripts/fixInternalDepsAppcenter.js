const fs = require('fs');

const fixLocalDepsForAppcenter = () => {
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

fixLocalDepsForAppcenter();
