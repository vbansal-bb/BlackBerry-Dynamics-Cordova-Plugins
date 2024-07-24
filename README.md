# capacitor-plugin-bbd-base

BlackBerry Dynamics Capacitor Base plugin.

> Adds all needed configurations to be able to use `BlackBerry Dynamics` in your Ionic Capacitor application.
> It is similar to `cordova-plugin-bbd-base` that adds all needed configurations to be able to use `BlackBerry Dynamics` in Cordova-based or Ionic-Cordova-based projects.
> All the other BlackBerry Dynamics Cordova plugins require the Capacitor Base plugin to be installed as dependency.

## Supportability

#### Platforms

- Android
- iOS

#### Node.js

- We recommend to use the latest stable version of Node.js 18.x (LTS).

#### Ionic

- Ionic 6, 7
- `--type=ionic-angular`
- `--type=ionic-react`
- `--type=ionic-vue`
- `--capacitor` integration

#### Dynamics SDK for iOS and Android

BlackBerry Dynamics SDK for iOS

- BlackBerry Dynamics SDK for iOS v11.2, check environment requirements [here](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk-ios/11_2).
- BlackBerry Dynamics SDK for iOS v12.0, check environment requirements [here](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk-ios/12_0).
- BlackBerry Dynamics SDK for iOS v12.1, check environment requirements [here](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk-ios/12_1).

BlackBerry Dynamics SDK for Android:

- BlackBerry Dynamics SDK for Android v11.2, check environment requirements [here](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk-android/11_2).
- BlackBerry Dynamics SDK for Android v12.0, check environment requirements [here](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk-android/12_0).
- BlackBerry Dynamics SDK for Android v12.1, check environment requirements [here](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk-android/12_1).

## Preconditions

- Install `xcodeproj` and `plist` Ruby gems:
  `$ sudo gem install xcodeproj`
  `$ sudo gem install plist`
  NOTE: required Ruby version >= 2.0.0

## Dynamics SDK Dependancy

Dynamics SDK for iOS and Android are installed as part of the `capacitor-plugin-bbd-base` plugin using CocoaPods & Gradle.

### BlackBerry Dynamics SDK for iOS integration

The integration uses the iOS "Dynamic Framework" version of BlackBerry Dynamics as the static library is no longer supported.
There are a few options to integrate BlackBerry Dynamics SDK for iOS.

#### Using default (12.1) released version - default

By default, `capacitor-plugin-bbd-base` plugin will integrate **12.1** (12.1.1.43) version BlackBerry Dynamics SDK for iOS using following podspec: `https://software.download.blackberry.com/repository/framework/dynamics/ios/12.1.1.43/BlackBerryDynamics-12.1.1.43.podspec`.

> NOTE: If one of the below integration methods was used there is an option to reset **default** configuration by running following command:  
> `$ npx set-dynamics-podspec --default`  
> `$ ionic cap build ios`

#### Using other released version

There is possibility to integrate other released build of BlackBerry Dynamics SDK for iOS.  
Currently, the **other** supported versions are 11.2 and 12.0.  
Following command should be run to use BlackBerry Dynamics SDK for iOS v12.0:

```
$ npx set-dynamics-podspec --url "https://software.download.blackberry.com/repository/framework/dynamics/ios/12.0.1.79/BlackBerryDynamics-12.0.1.79.podspec"
$ ionic cap build ios
```

#### Using locally downloaded version

Also, it is possible to integrate manually downloaded BlackBerry Dynamics SDK for iOS from local place.
Following command should be run:

```
$ npx set-dynamics-podspec --path "/Users/<user>/Downloads/gdsdk-release-dylib-X.X.X.X/BlackBerry_Dynamics_SDK_for_iOS_vX.X.X.X_dylib"
$ ionic cap build ios
```

### BlackBerry Dynamics SDK for Android integration

By default, `capacitor-plugin-bbd-base` plugin will integrate **12.1** (12.1.1.43) version of BlackBerry Dynamics SDK for Android.

#### Using other released version

There is possibility to integrate other released build of BlackBerry Dynamics SDK for Android.  
Currently, the **other** supported versions are 11.2 and 12.0.  
Following steps should be done to use BlackBerry Dynamics SDK for Android v12.0:

- download `capacitor-plugin-bbd-base` from Github as ZIP
- unzip downloaded "BlackBerry-Dynamics-Cordova-Plugins-capacitor-base.zip" and move it to `<path>/BlackBerry_Dynamics_SDK_for_Cordova_vX.X.X.X/plugins/`
- update versions of Dynamics dependencies in `<path>/BlackBerry_Dynamics_SDK_for_Cordova_vX.X.X.X/plugins/capacitor-plugin-bbd-base/scripts/gradle/bbd.gradle`:
  ```
  implementation 'com.blackberry.blackberrydynamics:android_handheld_platform:12.0.1.79'
  implementation 'com.blackberry.blackberrydynamics:android_handheld_backup_support:12.0.1.79'
  implementation 'com.blackberry.blackberrydynamics:android_webview:12.0.1.79'
  ```
- run following commands:

```
$ cd <path_to_your_app>
// Remove Capacitor Base plugin only if it was previously added
$ npm run cleanup
$ npm uninstall capacitor-plugin-bbd-base
$ ionic cap sync
$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_vX.X.X.X/plugins/capacitor-plugin-bbd-base/scripts/gradle/bbd.gradle
```

## BBWebView integration on Android

`BBWebView` has been integrated into the BlackBerry Dynamics Capacitor Base plugin.
It becomes the default webview for Dynamics Ionic-Capacitor applications on Android. This enables the following features:

- Dynamics Ionic-Capacitor application on Android is loaded via `BBWebView`
- `XMLHttpRequest` and `fetch` ajax requests are intercepted and routed through Dynamics infrastructure
- HTML form submissions are intercepted and routed through Dynamics infrastructure
- `document.cookie` are stored in secure container

## Installation

`$ npm install git+https://github.com/blackberry/blackberry-dynamics-cordova-plugins#capacitor-base`

## Uninstallation

```
$ npm run cleanup
$ npm uninstall capacitor-plugin-bbd-base
```

## Supported Dynamics Cordova plugins

- **[cordova-plugin-bbd-file](https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins/tree/file)**
  _Installation_: `$ npm install git+https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins#file`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-file`
- **[cordova-plugin-bbd-file-transfer](https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins/tree/file-transfer)**
  _Installation_: `$ npm install git+https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins#file-transfer`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-file-transfer`
- **[cordova-plugin-bbd-sqlite-storage](https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins/tree/sqlite-storage)**
  _Installation_: `$ npm install git+https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins#sqlite-storage`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-sqlite-storage`
- **[cordova-plugin-bbd-inappbrowser](https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins/tree/inappbrowser)**
  _Installation_: `$ npm install git+https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins#inappbrowser`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-inappbrowser`
- **[cordova-plugin-bbd-media-capture](https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins/tree/media-capture)**
  _Installation_: `$ npm install git+https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Plugins#media-capture`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-media-capture`
- **cordova-plugin-bbd-appkinetics**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-appkinetics`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-appkinetics`
- **cordova-plugin-bbd-application**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-application`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-application`
- **cordova-plugin-bbd-httprequest**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-httprequest`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-httprequest`
- **cordova-plugin-bbd-interappcommunication**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-interappcommunication`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-interappcommunication`
- **cordova-plugin-bbd-launcher**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-launcher`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-launcher`
- **cordova-plugin-bbd-mailto**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-mailto`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-mailto`
- **cordova-plugin-bbd-push**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-push`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-push`
- **cordova-plugin-bbd-serversideservices**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-serversideservices`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-serversideservices`
- **cordova-plugin-bbd-socket**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-socket`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-socket`
- **cordova-plugin-bbd-specificpolicies**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-specificpolicies`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-specificpolicies`
- **cordova-plugin-bbd-storage**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-storage`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-storage`
- **cordova-plugin-bbd-tokenhelper**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-tokenhelper`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-tokenhelper`
- **cordova-plugin-bbd-websocket**
  _Installation_: `$ npm install <path>/BlackBerry_Dynamics_SDK_for_Cordova_<version>/plugins/cordova-plugin-bbd-websocket`
  _Uninstallation_: `$ npm uninstall cordova-plugin-bbd-websocket`

## Dynamics Ionic-Capacitor samples

- [Secure-ICC-Ionic-Capacitor-Angular](https://github.com/blackberry/BlackBerry-Dynamics-Cordova-Samples/tree/master/Secure-ICC-Ionic-Capacitor-Angular)

## Examples of usage

#### New Ionic-Capacitor project

Create project:
`$ ionic start DynamicsCapacitorApp <app-template> --capacitor --package-id=<app-id>`
`$ cd <path>/DynamicsCapacitorApp`
Add platforms:
`$ ionic cap add ios`
OR/AND
`$ ionic cap add android`
Sync project:
`$ ionic cap sync`
Add Capacitor Base plugin:
`$ npm install git+https://github.com/blackberry/blackberry-dynamics-cordova-plugins#capacitor-base`

**Add other supported Dynamics Cordova plugins here ...**

Build project:
`$ ionic cap build ios`
OR/AND
`$ ionic cap build android`
Run the app via IDE (Xcode or Android Studio) or use following command:
`$ ionic cap run ios`
OR/AND
`$ ionic cap run android`

> More details about Ionic CLI can be found [here](https://ionicframework.com/docs/cli/commands/start).

#### Existing Ionic-Capacitor project

`$ cd <app>`
Add platforms if applicable:
`$ ionic cap add ios`
OR/AND
`$ ionic cap add android`
Sync project:
`$ ionic cap sync`
Add Capacitor Base plugin:
`$ npm install git+https://github.com/blackberry/blackberry-dynamics-cordova-plugins#capacitor-base`

**Add other supported Dynamics Cordova plugins here ...**

Build project:
`$ ionic cap build ios`
OR/AND
`$ ionic cap build android`
Run the app via IDE (Xcode or Android Studio) or use following command:
`$ ionic cap run ios`
OR/AND
`$ ionic cap run android`

## License

Apache 2.0 License

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
