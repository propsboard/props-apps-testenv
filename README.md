# Props Apps Test Enviroment

This project is useful for building and testing apps built to run on Propsboard.com

Propsboard apps follow a very simple pattern originating with an `app.json` file.  The `app.json` file defines where view, style, and js content exists as well as general information about the app.  The various attributes of the format are detailed below

## Configuration (app.json)
Below are the attributes that can be found in `app.json`

|Property Name|default|description|
|:-----:|:-----:|:----------|
|name||The name of the app as will be presented to the user in the Props UI during setup.  This can be changed in future versions of the app|
|author||The name of the author of this app.|
|description||short description (keep to around 200 characters).  This will be shown in search results and when browsing apps|
|longDescription||Its not just a clever name.|
|icon_128||realative path to a square PNG to be used as the app icon that will be displayed in the app directories and during search|
|icon_512||realative path to a square PNG to be used as the app icon that will be displayed in the app directories and during search|
|screenshots||Array of relative paths to screenshots for the app to be displayed when looking at the app details.|
|license||The type of license for your app|
|source||If open source, a public URL pointing to the source code|
|version||The version you use locally to specific the app version.  The props app server uses its own sequential versioning system but this value will be displayed to your users.|
|allowedDomains|[]|An array containing the domains your app will need access to.  It is preferred that no outside domain be needed so try to include all assets locally. 
|minDisplayInterval|3600|Number of seconds between display of your app on boards.  This number can be configured by the user installing your app.  It is generally a good idea to not be a hog here :)|
|params||An array of parameter objects that users will supply to configure your app.
|requests||An array of requests that your app will use to pull data.|
|bundles||An array of app bundles your app uses.|
|images||A relative path to the images in your application package.  Normally something like `img/`|
|includes||An array of files that contain CSS/JS that should be included in the page for each of your apps|

### Params (User Input)
Params are peices of information that your app needs to function.  In the example of building a weather app, you will probably need a zip code to show local weather on their board.  Params are how you define the information you need.

|Property Name|default|description|
|:-----:|:-----:|:----------|
|name||The name of the parameter.  This is how the value will be presented to you in code|
|type||The type of data that should be collected.  Currently only `string` is supported but others are coming.  Reach out if you have a need for another type of param!|
|title||The title that will be presented to the user.  In the example of property with name 'zip' you might want to have the title 'Zip Code'|
|placeholder||The placeholder text that will be shown when the user is configuring your app|
|description||A short description that will be shown as a caption below the input for this parameter|
|verify||Regex pattern used to verify the value being supplied.  If the regex matches the input then the value will be accepted|
|required||Boolean indicating if this field must be supplied to setup your app|
|position||The position of this field when collecting input|

### Requests (Proxied and Scheduled Data Access)
PAF will collect data on your user's behalf and 'compile' it into the your app so it is ready to roll whenever it comes up on the TVs

There are two core reasons we take this approach in PAF.

* **Security** - In general, apps should not be making requests out to untrusted domains (no offense) from behind company firewalls.
* **Performance** - We do everything possible to ensure your apps is up and running by the time it comes up on TVs.  In our opinion, the TV is no place for a loading spinner.

At this time there are two types of requests for app developers.

Type||Description|
|:-----:|:-----:|:----------|
|polling||Data is requested from a specified URL at a given interval, each time that data is retreived, a new version of that app instance is complied|
|webhook||Your services can push to a given webhook which will be used to compile a new version of the affected app instances.  This hook can also be used as a trigged to show your app on the TV. *(Coming Soon)*

Below are the property available when specififying app requests

|Property Name|default|description|
|:-----:|:-----:|:----------|
|type||The type of the parameter (e.g. `polling` or `webhook` )|
|name||The name of the variable which will contain the data from your request|
|url||The url to be used when polling for data.  Strings matching `{PARAM_NAME}` will be replace with that param's value.  For example, in a weather app which has a param of named `zip`, you might have a URL like this: `http://wackyweather.com/api/forecast?zip={zip}&days=3`  |
|ttl|3600|Time to live or Preferred interval between polling ( `polling` only )|
|headers|{}|Key/Values of the headers to include when making the request.  Good to specify authorization credentials or the requested data format|
