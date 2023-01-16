import path from 'path';
import fs from 'fs';
import * as TJS from 'typescript-json-schema';
import { filename, typesPath } from './config/schemaConfig.json';

const customAsyncValidationKeys = ['checkIdExists'];

const settings: TJS.PartialArgs = {
  ref: false,
  required: true,
  ignoreErrors: true,
  validationKeywords: customAsyncValidationKeys,
};

interface SchemaWithProperties {
  $async?: boolean;
  properties: { $async?: boolean; [key: string]: any };
}

const addAsyncKey = (schema: TJS.Definition) => {
  const { properties } = schema;

  if (properties) {
    const schemaWithAsyncKey: SchemaWithProperties = { properties: {}, ...schema };

    for (const [propertyKey, value] of Object.entries(properties)) {
      if (typeof value === 'object') {
        for (const asyncKey of customAsyncValidationKeys) {
          if (JSON.stringify(value).includes(asyncKey)) {
            // https://ajv.js.org/guide/async-validation.html
            schemaWithAsyncKey.properties[propertyKey] = { $async: true, ...value };
            schemaWithAsyncKey.$async = true;
            break;
          }
        }
      }
    }
    return schemaWithAsyncKey;
  }

  return schema;
};

const program = TJS.getProgramFromFiles([path.resolve(typesPath)]);
const schemas = TJS.generateSchema(program, '*', settings);

if (schemas?.definitions) {
  fs.writeFile(filename, '', () => {
    console.log(`Create file: ${filename}`);

    Object.entries(schemas.definitions || {}).forEach(([typeName, schema]) => {
      if (typeof schema !== 'boolean') {
        const finalisedSchema = `export const ${typeName}Schema = ${JSON.stringify(
          addAsyncKey(schema),
          null,
          '\t',
        )} \n\n`;
        fs.appendFile(filename, finalisedSchema, 'utf8', () => {
          console.log(`Added schema: ${typeName}`);
        });
      }
    });
  });
}
