import React from 'react';

export const prettyJSON = (object, space = 2) => <pre>{JSON.stringify(object, null, space)}</pre>;
