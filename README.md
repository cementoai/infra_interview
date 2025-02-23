Hi again!


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

And that's it!

Run `npm run start` to run the server

# Scripts
`npm run start` - Starts node server

`npm run sdk-build` - Starts nodemon server in dev mode

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
