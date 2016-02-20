# Props Apps Test Enviroment

This project is useful for building and testing apps built to run on Propsboard.com

## Setup and Usage

Pull this project down to your local machine (only tested on OSX at this time).  You will need to have NodeJS and [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) installed.  To setup the project run the following:

```bash
   $ npm install
```

To run the app test enviroment run the following 

```bash
   $ gulp
```

The test enviroment will read the contents of `config.json` in the project root.  Ensure that the property `bundle` points to the full path of your app directory.  The app directory should contain the `app.json` file.  The contents of the config file are detailed below

|Property Name|description|
|:-----:|:----------|
|bundle|The full path to the application your would like the test enviroment to load|
|port|The port to run the test enviroment on|
|app|The app object that will be passed into the app.  This will contain any unencrypted params supplied by the user as well as basic information managed by the Props enviroment (e.g. name of the team, how long the app will show)|
|params|The params to simulate in the test enviroment|

The test enviroment will also simulate the polling of data as will be done by the Props Application Framework.  Making a GET request `http://localhost:8667/refresh` (assuming you don't change the port) will cause the test enviroment to refresh the requests as specified in your loaded `app.json` file.  The value of the data requests are cached so you do not need to refresh the data each time.

## Props App Development

Propsboard apps follow a very simple pattern originating with an `app.json` file.  The `app.json` file defines where view, style, and js content exists as well as general information about the app.  The various attributes of the format are detailed below.

### Configuration (app.json)

In this documentation a sample weather app is referenced.  Below is the `app.json` for that app which is currently live in the Props Application Framework.  The full source of the app is available here.
 
 ```json
 {
 	"name" : "Super Weather",
 	"author" : "Justin Furniss",
 	"description" : "Weather like it has never been done before.",
     "longDescription" : "When it rains it pours but how will you know if its going to rain?  Don' your raincoats.  Its a classic chicken and the egger and here comes the first solution known to mankind.  Weather, on yer TVs.",
 	"icon_128" : "img/icon_128.png",
 	"icon_512" : "img/icon_128.png",
 	"screenshots" : [ "img/ss1.png", "img/ss2.png"],
     "license" : "Creative Commons Zero",
     "source" : "https://github.com/propsboard/props-client-js",
 	"version" : "2",
 	"allowedDomains" : [ "media.superweather.com" ],
     "minDisplayInterval" : 3660,
     "params" : [{
       "name" : "zip",
       "type" : "string",
       "title" : "Zip Code",
       "placeholder": "e.g. 08215",
       "description": "Enter the 5 digit zip code for the location you would the forcast to show.",
       "verify" : "^\\d{5}$",
       "required" : true,
       "position" : 0
     }],
     "requests" : [{
       "type" : "polling",
       "name" : "weatherData",
       "ttl" : 3660,
       "url" : "http://api.wunderground.com/api/a38415465d1e1971/forecast/q/{zip}.json",
       "headers" : {
         "Accept-Type" : "text/json"
       }
     }],
 	"bundles" : [
       {
         "name" : "default",
         "html" : "views/app.html",
         "css" : "style/app.css",
         "js" : "js/app.js",
         "loadImage" : "img/superlogo2.png",
         "defaultPreroll": "img/preroll.gif",
         "loadBackgroundColor" : "#236B8E"
       }
     ],
     "images" : "img/",
 	"includes" : [
       {"name" : "angular" , "path" : "lib/angular-1.5.0.min.js", "type" : "js"},
       {"name" : "moment" , "path" : "lib/moment.min.js", "type" : "js"},
       {"name" : "bootstrap", "path" : "lib/bootstrap.min.css", "type" : "css"}
     ]
 
 }
 ```

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
|params|[]|An array of parameter objects that users will supply to configure your app.
|requests|[]|An array of requests that your app will use to pull data.|
|bundles||An array of app bundles your app uses.|
|images||A relative path to the images in your application package.  Normally something like `img/`|
|includes||An array of files that contain CSS/JS that should be included in the page for each of your apps|

#### Params (User Input)
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

#### Requests (Proxied and Scheduled Data Access)
PAF will collect data on your user's behalf and 'compile' it into the your app so it is ready to roll whenever it comes up on the TVs

There are two core reasons we take this approach in PAF.

* **Security** - In general, apps should not be making requests out to untrusted domains (no offense) from behind company firewalls.
* **Performance** - We do everything possible to ensure your apps is up and running by the time it comes up on TVs.  In our opinion, the TV is no place for a loading spinner.

At this time there are two types of requests for app developers.

Type|Description|
|:-----:|:----------|
|polling|Data is requested from a specified URL at a given interval, each time that data is retreived, a new version of that app instance is complied|
|webhook|Your services can push to a given webhook which will be used to compile a new version of the affected app instances.  This hook can also be used as a trigged to show your app on the TV. *(Coming Soon)*

Below are the property available when specififying app requests

|Property Name|default|description|
|:-----:|:-----:|:----------|
|type||The type of the parameter (e.g. `polling` or `webhook` )|
|name||The name of the variable which will contain the data from your request|
|url||The url to be used when polling for data.  Strings matching `{PARAM_NAME}` will be replace with that param's value.  For example, in a weather app which has a param of named `zip`, you might have a URL like this: `http://wackyweather.com/api/forecast?zip={zip}&days=3`  |
|ttl|3600|Time to live or Preferred interval between polling ( `polling` only )|
|headers|{}|Key/Values of the headers to include when making the request.  Good to specify authorization credentials or the requested data format|

#### Bundles
You can think of bundles as seperate views inside your app.  All apps must have at least one bundle named 'default'.  Bundles point to the files needed to host your app.  The PAF will use the information you provide to compile your application into one file containing CSS, JS, and HTML.  It will also handle efficent hosting of your image and video files.  

To understand the need for bundles, you could imagine a weather app that shows the local forcast every hour on the TVs but in the event of a severe weather warning, a seperate view is displayed.

You are free to use a single bundle to handle scenarios like this but utilizing seperate bundles will result is quicker load times.  Webhooks can also optionally trigger a specific bundle.  *At this time, only a default bundle is supported*
  
|Property Name|default|description|
|:-----:|:-----:|:----------|
|name||The name of this bundle.  A bundle with the name of 'default' must be supplied|
|html||The realative path to the HTML file your app uses|
|css||The realative path to the CSS file your app needs|
|js||The relative path to your application's JS file|
|loadImage||The image that will be used when animating your app into view on the boards.  This image must be a PNG of 512px by 512px.  The icon should be only utilize white and alpha channels.|
|loadBackgroundColor||The background color of the TVs when your application is loading (when the loadImage is being animated in and out)|
|defaultPreroll||The relative path to the preroll that your app will use by default.  Users can change this but it is a good idea to have a default.|

#### Includes
Includes specifiy local files which you would like to have compiled into your app's HTML file at runtime.  This is done to streamline the loading process and alleviate the need to work with huge HTML files during app development.

Includes will be loaded into the HTML file in the order specified.

|Property Name|default|description|
|:-----:|:-----:|:----------|
|name||The name of the include. Just for readability.|
|path||The realative path to the file which will be included|
|type||The type of the include... Currently supports `js` or `css`|


