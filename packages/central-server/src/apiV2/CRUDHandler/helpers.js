// if the path is /surveys/5a5d1c66ae07fb3fb025c3a3/answers, the resource is 'surveys'
export const extractResourceFromPath = path => path.split('/')[1];

// if the path is /surveys/5a5d1c66ae07fb3fb025c3a3/answers, the child resource is 'answers'
export const extractChildResourceFromPath = path => path.split('/')[3];
