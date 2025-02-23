Hi there!


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

# Lets play with it:

This repository is a "single-repo" for multiple (2) microservices 
that being deployed separately and have common infrastructure. (issues & comments)

a. run the server and try to get the list of issues: `http://127.0.0.1:8080/issues`<br/>
b. create the following issue:<br/>

```
{
  "description": "this issue is very important",
  "assignTo": {
    "id": "or@cemento.ai"
  }, 
  "data": {
    "status": 200
  }
}
```
c. why the description field was not created?<br/>
d. get all issues with comments and describe the flow<br/>
e. design and implement a route for exporting PDF file with all existing issues<br/>
   (generally we have thousands of issues during a project lifetime).

