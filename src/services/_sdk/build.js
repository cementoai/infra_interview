const process = require('process');
const Arborist = require('@npmcli/arborist');
const packlist = require('npm-packlist');
const tar = require('tar');
const fs = require('fs');

const packageDir = '.';
const srcDir = './src/';
const packageTarball = `./server-sdk.tgz`;
const servicesDir = '../../services/';

const packServerSDK = async function () {
  const allServicesDirectoryPaths = await packlist(await new Arborist({ path: servicesDir }).loadActual());
  const allFinalSDKFiles = await packlist(await new Arborist({ path: '.' }).loadActual());
  const servicesSDKsDirectories = allServicesDirectoryPaths.filter(filePath => filePath.includes('/sdk/'));
  const finalSDKPackageFiles = allFinalSDKFiles.filter(filePath => !filePath.includes('build.js') && !filePath.includes('SDK.js'));

  await createSDKIndexFile();
  await createEventsIndexFile(servicesSDKsDirectories);
};

const createSDKIndexFile = async function () {
  let apiClientCode = fs.readFileSync('SDK.js', { encoding: 'utf8' });
  fs.writeFileSync('index.js', apiClientCode);
};

function upperFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const createEventsIndexFile = async function (servicesSDKsDirectories) {
  let allEventsPaths = servicesSDKsDirectories.filter(filePath => filePath.includes('/events/'));
  let eventsFileCode = '';
  let eventsNames = allEventsPaths  .map(path => {
    const className = upperFirstLetter(path.split('/').pop().replace('.js', ''));
    eventsFileCode += `const ${className} = require('${servicesDir + path}');\n`;
    return className;
  });
  eventsFileCode += `\n\nmodule.exports = {\n ${eventsNames.join(',\n')}\n};`;
  fs.writeFileSync('events.js', eventsFileCode);
};

const copyFile = async function (from, to) {
  return new Promise((resolve, reject) => {
    fs.cp(from, to, { recursive: true }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

packServerSDK()
  .then(() => {
    console.error('success');
    process.exit(0);
  })
  .catch(error => {
    console.error('error:', error);
    process.exit(1);
  });
