# MagicCap Uploader API (Node/Browser)
This API handles the client/server-side elements of the MagicCap uploader API.

## Usage
For usage, you will need a uploader token and the name of your uploader slug. If you have an uploader in MagicCap, DM `JakeMakesStuff#0001` on Discord for this.

## Authorization
Authorization uses this library on both the client-side and server-side. Firstly, import the library on both your server-side Node/the browser. This can be done using imports:
```ts
import { UploadersAPIV1 } from "magiccap-uploader-api"
```
From here, you can go ahead and request a "swap token". A swap token is used to create a client token in MagicCap and also validate that the application requesting access is actually the uploader. To request a swap token, simply make a `UploadersAPIV1` instance and then request a swap token from it.
```ts
const client = UploadersAPIV1.client("uploader slug here")
let swapTokenInfo
try {
    swapTokenInfo = await client.requestSwapToken()
} catch (e) {
    // Something went wrong. Catch the error and inform the user with a error message.
}
```
`requestSwapToken` will return the expiry of the resulting token and the swap token itself as `swapToken`. This will need to get to the server in a manor which is XSRF safe. From here, you can get the client token using the server with the uploader token and return it:
```ts
const server = UploadersAPIV1.server("uploader slug here", "uploader token here")

const getClientTokenInfo = async (swapToken: string) => {
    let clientTokenInfo
    try {
        clientTokenInfo = await server.getClientToken(swapToken)
    } catch (e) {
        // Something went wrong. Catch the error and inform the user with a error message.
    }
    return clientTokenInfo
}
```
In this example, the function will return a object with `expires` (a UNIX timestamp of when the token expires) and `clientToken` (the client token) in.

Once you have the client token back on the client side, you can now set the client token in the client using `client.setClientToken("client token here")`. Additionally, if the user refreshes the page or walks away from their computer but still has a active token, you can initialise the client with it like this:
```ts
const client = UploadersAPIV1.client("uploader slug here", "client token here")
```

## Revoking A Client Token
To revoke a client token, run `client.revokeClientToken()`. This will kill the token and remove it from your client object.

## Check If Your Uploader Is Default
**NOTE:** Using this to display banner adverts on your site will **NOT** be tolerated and will result in your uploader token being revoked. This should only be used in a configuration workflow.

To check if your uploader is default, you can use `client.checkIfDefault()`. This will return a boolean which defines if your uploader is default.

## Prompt The User If They Want To Set Your Uploader As Default
**NOTE:** Using this to spam users with notifications from your site will **NOT** be tolerated and will result in your uploader token being revoked. This should only be used in a configuration workflow.

To prompt users to set your uploader as default, you can use `client.showDefaultPrompt()`.

## Set Configuration Values
Using this API, you have write-only access to set values that are defined in your uploaders configuration options. To do this, you can use `client.setConfigValues` like this:
```ts
// Using freethewump.us as a example.

// The configuration options should use the value set in the uploader file and should be the exact datatype you want it as.
const options = {
    ftw_token: "TOKEN HERE",
}

try {
    await client.setConfigValues(options)
} catch (e) {
    // Something went wrong. Catch the error and inform the user with a error message.
}
```
