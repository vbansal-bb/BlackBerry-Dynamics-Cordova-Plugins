#!/usr/bin/env node

/* Copyright (c) 2024 BlackBerry Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

module.exports = (context) => {
  if (context.opts.plugins[0] !== "cordova-plugin-bbd-sqlite-storage") {
    return;
  }

  const fs = require("fs"),
    path = require("path"),
    projectRoot = context.opts.projectRoot,
    platformAndroidRoot = path.join(projectRoot, "platforms", "android"),
    platformiOSRoot = path.join(projectRoot, "platforms", "ios"),
    otherPluginsUsingBBDFile = [
      "cordova-plugin-bbd-media-capture",
      "cordova-plugin-bbd-file-transfer",
      "cordova-plugin-bbd-storage",
      "cordova-plugin-bbd-xmlhttprequest",
    ];
  // Don't continue as this plugin would not be uninstalled as it is used by cordova-plugin-bbd-storage
  if (context.opts.cordova.plugins.includes("cordova-plugin-bbd-storage")) {
    console.log(
      "cordova-plugin-bbd-sqlite-storage module cleanup hook can not run as cordova-plugin-bbd-storage plugin using it and hence can't be uninstalled"
    );
    return;
  }

  let deleteFilePluginRef = true;
  //No cleanup for cordova-plugin-bbd-file plugin if other plugins are installed who are dependent upon it
  for (const plugin of otherPluginsUsingBBDFile) {
    if (context.opts.cordova.plugins.includes(plugin)) {
      deleteFilePluginRef = false;
      break;
    }
  }

  const cleanupCordovaPlugins = (cordovaPluginsPath) => {
    try {
      if (fs.existsSync(cordovaPluginsPath)) {
        let cordovaPluginsContent = fs.readFileSync(
          cordovaPluginsPath,
          "utf-8"
        );
        const startString = "module.exports = ",
          endString = "];",
          startStringIndex = cordovaPluginsContent.indexOf(startString),
          endStringIndex = cordovaPluginsContent.indexOf(endString),
          pluginsListString = cordovaPluginsContent.substring(
            startStringIndex + startString.length,
            endStringIndex + endString.length - 1
          ),
          pluginsList = JSON.parse(pluginsListString),
          updatedPluginList = pluginsList.filter((plugin) => {
            if (deleteFilePluginRef)
              return (
                plugin.pluginId !== "cordova-plugin-bbd-sqlite-storage" &&
                plugin.pluginId !== "cordova-plugin-bbd-file"
              );
            else return plugin.pluginId !== "cordova-plugin-bbd-sqlite-storage";
          }),
          updatedPluginListString = JSON.stringify(updatedPluginList, null, 4),
          cordovaPluginsUpdatedContent = cordovaPluginsContent.replace(
            pluginsListString,
            updatedPluginListString
          );
        fs.writeFileSync(cordovaPluginsPath, cordovaPluginsUpdatedContent);
        const startString2 = "module.exports.metadata = ",
          endString2 = `;\n});`,
          startStringIndex2 =
            cordovaPluginsUpdatedContent.indexOf(startString2),
          endStringIndex2 = cordovaPluginsUpdatedContent.indexOf(endString2),
          metaDataString = cordovaPluginsUpdatedContent.substring(
            startStringIndex2 + startString2.length,
            endStringIndex2
          ),
          metaDataObj = JSON.parse(metaDataString);
        if ("cordova-plugin-bbd-sqlite-storage" in metaDataObj) {
          delete metaDataObj["cordova-plugin-bbd-sqlite-storage"];
          deleteFilePluginRef && delete metaDataObj["cordova-plugin-bbd-file"];
          const updatedMetaDataString = JSON.stringify(metaDataObj, null, 4);
          fs.writeFileSync(
            cordovaPluginsPath,
            cordovaPluginsUpdatedContent.replace(
              metaDataString,
              updatedMetaDataString
            )
          );
        }
      }
    } catch (error) {
      console.log(
        "cordova-plugin-bbd-sqlite-storage plugin's cleanup hook error = ",
        error.message
      );
    }
  };
  console.log(
    "cordova-plugin-bbd-sqlite-storage plugin cleanup hook execution started"
  );

  if (fs.existsSync(platformAndroidRoot)) {
    cleanupCordovaPlugins(
      path.join(platformAndroidRoot, "platform_www", "cordova_plugins.js")
    );
    cleanupCordovaPlugins(
      path.join(
        platformAndroidRoot,
        "app",
        "src",
        "main",
        "assets",
        "www",
        "cordova_plugins.js"
      )
    );
  }

  if (fs.existsSync(platformiOSRoot)) {
    cleanupCordovaPlugins(
      path.join(platformiOSRoot, "platform_www", "cordova_plugins.js")
    );
    cleanupCordovaPlugins(
      path.join(platformiOSRoot, "www", "cordova_plugins.js")
    );
  }
  console.log(
    "cordova-plugin-bbd-sqlite-storage plugin cleanup hook execution finished"
  );
};
