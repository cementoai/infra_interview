const fs = require('fs');
const dotenv = require('dotenv');

async function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) reject();
      else resolve(data);
    });
  });
}

async function write(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject();
      else resolve();
    });
  });
}

async function makeDotEnv(configMap, overrides) {
  let dotEnvFile = '';
  const finalConfig = { ...configMap, ...overrides };
  Object.keys(finalConfig).forEach(k => {
    dotEnvFile += `${k}=${finalConfig[k]}\n`;
  });
  await write('.env', dotEnvFile);
  console.log('.env file created successfully!');
}

async function main() {
  try {
    const myArgs = process.argv.slice(2);

    let funcsDir = myArgs[2];
    let runningLocal = myArgs.some(arg => arg == '--runningLocal');

    let args = {
      action: myArgs[0],
      env: myArgs[1],
      cloudFunctionsProjectDir: funcsDir && funcsDir[funcsDir.length - 1] == '/' ? funcsDir.slice(0, funcsDir.length - 1) : funcsDir
    };

    //args.env = 'staging'

    let foldersMap = { prod: 'prod', staging: 'staging' };
    if (!args.env) {
      console.log("Coulden't find the environment folder");
      process.exit(1);
      return;
    }

    let validActions = { createDotEnv: true };
    if (!validActions[args.action]) {
      console.log('Action is not valid');
      return;
    }

    let configMap = {};
    let defaultConfigMap = { isRunningLocal: runningLocal };

    await Promise.all(
      Object.values(foldersMap).map(async currEnvName => {
        configMap[currEnvName] = { ...defaultConfigMap };

        let yamlNames = [
          {
            name: `./configs/${currEnvName}/yaml_services.yaml`,
            separator: ':',
            start: 'env_variables:'
          },
          {
            name: `./configs/${currEnvName}/yaml_api.yaml`,
            separator: ':',
            start: 'env_variables:'
          }
        ];
        if (args.action == 'createDotEnv') yamlNames.push({ name: './configs/.env', separator: '=' });

        for (let i = 0; i < yamlNames.length; i++) {
          let curr = yamlNames[i];
          try {
            let base = await read(curr.name);
            if (curr.start) base = base.slice(base.indexOf(curr.start) + curr.start.length, base.length);
            let vars = base.split('\n');
            if (curr.start) vars = vars.slice(1);
            vars.forEach(line => {
              let separatorIndex = line.indexOf(curr.separator);
              if (separatorIndex == -1) return;
              let key = line.slice(0, separatorIndex).trim();
              let val = line.slice(separatorIndex + 1, line.length).trim();
              if (key) {
                if (typeof val == 'string') val = val.trim();
                configMap[currEnvName][key] = val;
              }
            });
          } catch (e) {
            console.error(`error with file - ${curr.name}`);
          }
        }
      })
    );

    let overrides = {};
    if (runningLocal) {
      dotenv.config();
      overrides = {
        apiServer: '"http://127.0.0.1:8080"',
        servicesServer: '"http://127.0.0.1:8080"',
        microServicesServer: '"http://127.0.0.1:8080"',
        GCLOUD_PROJECT: args.env === 'prod' ? '"planme-1383"' : '"cemento-staging"',
        // eslint-disable-next-line no-undef
        ...(args.env === 'prod' && { mongo_db_user: `"${process.env.mongo_db_user}"`, mongo_db_pass: `"${process.env.mongo_db_pass}"` })
      };
    }

    if (args.action == 'createDotEnv') {
      await makeDotEnv(configMap[args.env], overrides);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  console.log('Finish!');
  return;
}

main();
