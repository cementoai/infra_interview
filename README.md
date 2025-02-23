Hi again!

you are in the infra world!:) 
make sure you have `gcloud` installed

1. `gcloud auth login`
2. `gcloud config set project planme-1383` (`gcloud projects list`)


# Installation

First let's make sure that we use correct Node version, we will use `nvm` for it

Install nvm from here: https://github.com/nvm-sh/nvm#installing-and-updating
Make sure to restart the terminal after this step and to check if source string was added to the `.zshrc` or `.bashrc`

Now let's install and set version that our API uses
`nvm install 20.11.0`
It will automatically use this version after installing but if not simply run
`nvm use 20.11.0`

Next step would be to install npm packages
`npm i`

Then set env vars
`npm run set-env:staging`

And that's it!

Run `npm run start` to run the server

# Dependencies installation

each time you want to update the packages with 
`npm i`

please make sure you are logged it to cemento gcp artifact:
`npm run artifactregistry-login`

# Scripts
`npm run start` - Starts node server

`npm run start-dev` - Starts nodemon server in dev mode

`npm run postinstall` - Patches packages

`npm run set-env:[prod|staging]` - Sets respective config for the received enviroment

`npm run prettier:all` - Runs Prettier on the /src

`npm run eslint` - Runs Linter on the /src

`npm run artifactregistry-login` - logging in into Cemento artifact registry

# Server client SDK:

create in your project a `.npmrc` file with the following lines:
```
@cemento-sdk:registry=https://us-central1-npm.pkg.dev/planme-1383/cemento-sdk/
//us-central1-npm.pkg.dev/planme-1383/cemento-sdk/:always-auth=true
@cemento:registry=https://us-central1-npm.pkg.dev/planme-1383/cemento/
//us-central1-npm.pkg.dev/planme-1383/cemento/:always-auth=true
```

after that run:
- `npx google-artifactregistry-auth`
- `npm install @cemento-sdk/server`

that's it! you can use the SDK now!
```
// Require server SDK
const serverSDK = require('@cemento-sdk/server');

// Init SDK and set projectId \ companyId
serverSDK.client.init('https://api.cemento.ai', 'xxx auth_token xxx');
serverSDK.client.setProjectAndCompany('project123', 'company123');

// Call an API to fetch a post
let post = await serverSDK.posts.getPost({ id: '-LJLFmJZJr65ak8CUmOS' });
console.log(post);
```

# SDK Release Notes
```

## Version 0.1.0 ##
- Breaking Changes
Update fields Method Signature: updatePostFields/updateFormFields/updateChecklistItemInstanceFields/updateCompany/updateProjectFields/updateInstanceFields

The method signature for these methods has been updated to improve clarity and flexibility.
Previously, all parameters were passed as a single object. Now, the parameters are split into two objects:
1. The first parameter specifies the unique keys of the object to update (e.g., the id).
2. The second parameter contains the fields to update.

Old Signature:
static async updatePostFields({ id, ...updatedFields })

New Signature:
static async updatePostFields({ id }, { ...updatedFields })


## Version 0.1.5 ##
- Enhancements
updated `getProjects` Method Signature: 
  The `getProjects` method now includes an additional parameter, `extraFields` in addition to `fields`:
  1.fields: Specifies the attributes that exist directly inside the project object. for example: 'id', 'address', 'title'
  2.extraFields: Allows to specify fields that do not exist directly on the project object but may be computed. for example :'projectManager', 'menus', 'features', 'checklists', 'isPinkasClaliMigrated', 'mobileUIParams', 'company', 'safetyGrades'
  
```