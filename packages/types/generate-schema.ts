import path from 'path';
import fs from 'fs';
import * as TJS from 'typescript-json-schema';
import { filename, typesPath } from './config/schemaConfig.json';

const settings: TJS.PartialArgs = {
  required: true,
  ignoreErrors: true,
  validationKeywords: ['takesIdForm'],
};

const program = TJS.getProgramFromFiles([path.resolve(typesPath)]);
const schemas = TJS.generateSchema(program, '*', settings);

if (schemas?.definitions) {
  fs.writeFile(filename, '', () => {
    console.log(`Create file: ${filename}`);

    Object.entries(schemas.definitions || {}).forEach(([typeName, schema]) => {
      const finalisedSchema = `export const ${typeName} = ${JSON.stringify(
        schema,
        null,
        '\t',
      )} \n\n`;
      fs.appendFile(filename, finalisedSchema, 'utf8', () => {
        console.log(`Added schema: ${typeName}`);
      });
    });
  });
}
