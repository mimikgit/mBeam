# mBeam
## Environment variables:
  Environment variables are only accessible through the MCM containers API, which requires an access token matching the associated account, and are thus considered secure.
  * signatureKey: String key used to sign jwt tokens
    Suggested value: a generated UUID string
  * ownerCode: String key used to verify ownership of files for bypassing file link expiration
    Suggested value: a generated UUID string

## Use of Git submodule
```
git submodule update --init
```

## Bitbucket NPM Module Repository
NPM uspports Bitbucket as an npm module repository.  However, You will require to setup Bitbucket SSH Key if it is not done previously.  
Please follow the instruction below to setup the BitBucket SSH Key.
https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html

## Building
1. Install dependencies:
    ```
    npm install
    ```
2. Run the build script:
    ```
    npm run-script build
    ```
3. Package the microservice
   ```
   npm run-script package
   ```

## Deploying
1. Make sure that you have downloaded the [latest edgeSDK](https://github.com/mimikgit/edgeSDK/releases) and it is [running correctly](https://github.com/mimikgit/edgeSDK/wiki) on your targeted development platform.

2. Verify that you have performed all the following prerequisite steps to setup you edgeSDK on your targeted platform:

    i. Register yourself on mimik's [developer portal](https://developer.mimik.com/docs/getting-started/developeraccount) and add your application information to the portal to get authorization of edgeSDK access. For information about Redirect URL, [read about OAuth 2.0](https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type).

    **Note: Please safe keep your App-ID and Redirect URL for OAuth authorization later on.**

    ii. Get your **edgeSDK access token** from following OAuth tool of your targeted platform:<br/>
      *Please read this on how to use the OAuth tool: [Instruction on How to use the OAuth tool](https://github.com/mimikgit/edgeSDK/tree/master/tools/oauthtool).*
      * [OAuthtool application for Windows](https://github.com/mimikgit/oauthtool/releases/download/v1.1.0/mimik.OAuth.tool.Setup.1.1.0.exe)
      * [OAuthtool application for MacOS](https://github.com/mimikgit/oauthtool/releases/download/v1.1.0/mimik.OAuth.tool-1.1.0.dmg)
      * [OAuthtool application for Linux](https://github.com/mimikgit/oauthtool/releases/download/v1.1.0/mimik-oauth-tool-1.1.0-x86_64.AppImage)

    **Note: Please safe keep your edgeSDK access token for later deployment use.**

3. Now you are ready to deploy this microservice on the edgeSDK, please run the following command on the bash terminal: 

    **Note: For Windows user, please download [Cygwin](https://cygwin.com/install.html) or [Git Bash](https://git-scm.com/downloads) to perform this.**

    Run the following commands under the same directory of your microservice file.
    i. The following curl command is for deploying this microservice to the edgeSDK:

        curl -i -H 'Authorization: Bearer **Replace withYourToken**' -F "image=@beam-v1.tar" http://localhost:8083/mcm/v1/images

    ii. The following curl command is for specifying the environment variable:

        curl -i -H 'Authorization: Bearer **ReplacewithYourToken**' -d '{"name": "beam-v1", "image": "beam-v1", "env": {"MCM.BASE_API_PATH": "/beam/v1", "MCM.WEBSOCKET_SUPPORT": "true", "ownerCode": **ReplacewithYourOwnerCode**, "signatureKey": **ReplacewithYourSignatureKey**} }' http://localhost:8083/mcm/v1/containers

4. The output of the above command will return status code of 200 after the deployment is successful.

5. See [SwaggerHub](https://app.swaggerhub.com/apis-docs/mimik/mBeam) for API usage and documentation.