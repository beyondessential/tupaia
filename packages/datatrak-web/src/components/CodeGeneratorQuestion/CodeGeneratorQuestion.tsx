/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import { SHORT_ID, generateShortId, generateMongoId } from './generateId';

// {"codeGenerator":{"type":"shortid","prefix":"CONTACT","length":"10"}}

export const CodeGeneratorQuestion = ({ id, name, label = 'Asset ID', config }) => {
  const [code, setCode] = useState('');
  useEffect(() => {
    console.log('mount', config);
    const newCode =
      config.codeGenerator.type === SHORT_ID ? generateShortId(config) : generateMongoId();
    setCode(newCode);
  }, [config, id]);

  return (
    <div>
      <div>{label}</div>
      <div>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet architecto culpa cumque
        deserunt dolorem excepturi facere impedit ipsum laborum laudantium maiores maxime molestiae
        neque, possimus praesentium quidem quisquam similique veniam.
      </div>
      <div>{code}</div>
      <input name={name} id={id} type="hidden" value={code} />
    </div>
  );
};
