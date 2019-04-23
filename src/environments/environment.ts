// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyD3g3DBx29xePdb4t12mF0avxQcm1QCMGU',
    authDomain: 'zachs-portfolio.firebaseapp.com',
    databaseURL: 'https://zachs-portfolio.firebaseio.com',
    projectId: 'zachs-portfolio',
    storageBucket: 'zachs-portfolio.appspot.com',
    messagingSenderId: '12771110601'
  }
};
