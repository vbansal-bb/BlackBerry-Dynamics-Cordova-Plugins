/**
 * Copyright (c) 2024 BlackBerry Limited. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import {
  registerGDStateChangeHandler,
  notificationCenter,
  requireHelperPhrase,
  capacitorPodsHelperPhrase,
  postInstallPhrase,
  assertDeploymentTargetReplacePhrase,
  headers,
  linkerFlags,
  loadWebView,
  blackBerryLauncherPodPhrase,
} from "./constants.js";

const projectRoot = process.env.INIT_CWD,
  packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
  );

const cAPBridgeViewControllerPath = path.join(
  projectRoot,
  "node_modules",
  "@capacitor",
  "ios",
  "Capacitor",
  "Capacitor",
  "CAPBridgeViewController.swift"
);

const podsPhrases = {
  BlackBerryLauncher: blackBerryLauncherPodPhrase,
};

export const checkAndExitOrContinueOnInstall = () => {
  const processArgv = process.argv;
  if (
    !(
      processArgv[1] &&
      processArgv[1].indexOf("capacitor-plugin-bbd-base") > -1 &&
      process.env.npm_command === "install"
    )
  ) {
    process.exit(0);
  }
};
export const checkAndExitOrContinueOnUninstall = () => {
  const processArgv = process.argv;
  if (
    !(
      processArgv[1] &&
      processArgv[1].indexOf("capacitor-plugin-bbd-base") > -1 &&
      process.env.npm_command === "uninstall"
    )
  ) {
    process.exit(0);
  }
};

export const getPackageNameFromAndroidManifest = (pathToAndroidManifest) => {
  const androidManifestContent = fs.readFileSync(
      pathToAndroidManifest,
      "utf-8"
    ),
    startIndexOfPackageString =
      androidManifestContent.indexOf(
        '"',
        androidManifestContent.indexOf("package=")
      ) + 1,
    endIndexOfPackageString = androidManifestContent.indexOf(
      '"',
      startIndexOfPackageString
    );

  return androidManifestContent.substring(
    startIndexOfPackageString,
    endIndexOfPackageString
  );
};

export const addAttributeToXmlElement = (element, attributeToAdd, xml) => {
  if (!xml.includes(attributeToAdd)) {
    const startIndexOfElementTag = xml.indexOf("<" + element),
      endIndexOfElementStartLine = xml.indexOf("\n", startIndexOfElementTag),
      nextInlineAttribute = xml.substring(
        startIndexOfElementTag + 1 + element.length,
        endIndexOfElementStartLine
      ),
      elementIdentationsNumber =
        (startIndexOfElementTag -
          xml.lastIndexOf("\n", startIndexOfElementTag)) /
        4,
      attributeIndentation = "\t\t".repeat(elementIdentationsNumber + 1);

    xml = xml.replace(
      element,
      element + "\n" + attributeIndentation + attributeToAdd
    );

    if (nextInlineAttribute.trim()) {
      xml = xml.replace(
        nextInlineAttribute,
        "\n" + attributeIndentation + nextInlineAttribute.trim()
      );
    }

    return xml;
  }

  return xml;
};

export const updateLinkerFlags = () => {
  for (const [key, value] of Object.entries(linkerFlags)) {
    if ("cordova-plugin-bbd-" + key in packageJson.dependencies) {
      addLinkerForBuildType("debug", value);
      addLinkerForBuildType("release", value);
    }
  }
};

export const updateLauncher = () => {
  const podFilePath = path.join(projectRoot, "ios", "App", "Podfile");

  if ("cordova-plugin-bbd-launcher" in packageJson.dependencies) {
    let fileContent = fs.readFileSync(podFilePath, "utf-8");
    if (fileContent.includes(podsPhrases.BlackBerryLauncher)) {
      return;
    }

    podsPhrases.BlackBerryDynamics =
      getBlackBerryDynamicsPodPhrase(fileContent);

    replaceAndSave(podFilePath, [
      [
        podsPhrases.BlackBerryDynamics,
        addAfter(
          podsPhrases.BlackBerryDynamics,
          podsPhrases.BlackBerryLauncher
        ),
      ],
    ]);
  } else {
    replaceAndSave(podFilePath, [[podsPhrases.BlackBerryLauncher, ""]]);
  }
};

export const patchCAPBridgeViewController = () => {
  replaceAndSave(cAPBridgeViewControllerPath, [
    [headers.Cordova, `${headers.Cordova}\n${headers.BlackBerry}`],
    [loadWebView, notificationCenter],
    [
      `// MARK: - Initialization`,
      `${registerGDStateChangeHandler.join("\n")}\n\t// MARK: - Initialization`,
    ],
  ]);
};

export const cleanUpCAPBridgeViewController = () => {
  replaceAndSave(cAPBridgeViewControllerPath, [
    [`${headers.Cordova}\n${headers.BlackBerry}`, headers.Cordova],
    [notificationCenter, loadWebView],
    [registerGDStateChangeHandler.join("\n"), ""],
  ]);
};

export const addAssertDeploymentTarget = (capacitorPodFile) => {
  let podFileContent = fs
    .readFileSync(capacitorPodFile, { encoding: "utf-8" })
    .toString();

  if (podFileContent.includes("assertDeploymentTarget(installer)")) {
    podFileContent = podFileContent.replace(
      assertDeploymentTargetReplacePhrase,
      ""
    );
  }

  if (
    !podFileContent.includes(requireHelperPhrase) &&
    !podFileContent.includes(postInstallPhrase)
  ) {
    podFileContent = podFileContent + postInstallPhrase;
    podFileContent = podFileContent.replace(
      capacitorPodsHelperPhrase,
      `${capacitorPodsHelperPhrase}\n${requireHelperPhrase}`
    );
    fs.writeFileSync(capacitorPodFile, podFileContent, "utf-8");
  }
};

export const removeAssertDeploymentTarget = (capacitorPodFile) => {
  replaceAndSave(capacitorPodFile, [
    [requireHelperPhrase, ""],
    [postInstallPhrase, assertDeploymentTargetReplacePhrase],
  ]);
};

export const replaceAndSave = (
  filePath,
  collection,
  { replacementTextToCheck = "", revert = false } = {}
) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not exists at path ${filePath}`);
  }
  const encoding = { encoding: "utf8" };

  let fileContent = fs.readFileSync(filePath, encoding);

  if (
    !replacementTextToCheck ||
    (replacementTextToCheck && !fileContent.includes(replacementTextToCheck)) ||
    revert
  ) {
    for (const [target, replacement] of collection) {
      fileContent = revert
        ? fileContent.replace(replacement, target)
        : fileContent.replace(target, replacement);
    }

    fs.writeFileSync(filePath, fileContent, encoding);
  }
};

function addLinkerForBuildType(buildType, linker) {
  const xcconfigPath = path.join(
    projectRoot,
    "ios",
    "App",
    "Pods",
    "Target Support Files",
    "Pods-App",
    "Pods-App." + buildType + ".xcconfig"
  );

  if (fs.existsSync(xcconfigPath)) {
    replaceAndSave(xcconfigPath, [
      [
        '-framework "BlackBerryDynamics" ',
        '-framework "BlackBerryDynamics" ' + linker,
      ],
    ]);
  }
}

function getBlackBerryDynamicsPodPhrase(context) {
  const [match] = context.match(
    /pod 'BlackBerryDynamics', (:podspec|:path) => '(.+)'/
  );
  return match;
}

function addAfter(phrase, newPhrase) {
  return `${phrase}\n\t${newPhrase}`;
}

export const updateDevelopmentInfoJson = () => {
  const cordovaInfoJsonPath = path.join(
      projectRoot,
      "node_modules",
      "capacitor-plugin-bbd-base",
      "assets",
      "development-tools-info.json"
    ),
    cordovaInfoJson = JSON.parse(fs.readFileSync(cordovaInfoJsonPath, "utf8")),
    updatedCordovaInfo = getCordovaFrameworkInfo();

  // DEVNOTE: add constant value of bbdSdkForCordovaVersion, that was already set on Jenkins job during building 'Base' plugin
  updatedCordovaInfo.framework.bbdSdkForCordovaVersion =
    cordovaInfoJson.framework.bbdSdkForCordovaVersion;

  //create development-tools-info.json for android if platform is added
  if (fs.existsSync(path.join(projectRoot, "android"))) {
    const targetAndroidDirectory = path.join(
      projectRoot,
      "android",
      "app",
      "src",
      "main",
      "assets"
    );
    if (!fs.existsSync(targetAndroidDirectory)) {
      fs.mkdirSync(targetAndroidDirectory);
    }
    const androidCordovaInfoJsonPath = path.join(
      projectRoot,
      "android",
      "app",
      "src",
      "main",
      "assets",
      "development-tools-info.json"
    );
    fs.cpSync(
      cordovaInfoJsonPath,
      path.join(targetAndroidDirectory, "development-tools-info.json")
    );
    if (fs.existsSync(androidCordovaInfoJsonPath)) {
      storeCordovaFrameworkInfoInJson(
        updatedCordovaInfo,
        androidCordovaInfoJsonPath
      );
    }
  }

  //create development-tools-info.json for ios if platform is added
  if (fs.existsSync(path.join(projectRoot, "ios"))) {
    const targetiOSDirectory = path.join(
      projectRoot,
      "ios",
      "App",
      "App",
      "Resources"
    );
    if (!fs.existsSync(targetiOSDirectory)) {
      fs.mkdirSync(targetiOSDirectory);
    }
    fs.cpSync(
      cordovaInfoJsonPath,
      path.join(targetiOSDirectory, "development-tools-info.json")
    );
    const iosCordovaInfoJsonPath = path.join(
      projectRoot,
      "ios",
      "App",
      "App",
      "Resources",
      "development-tools-info.json"
    );
    if (fs.existsSync(iosCordovaInfoJsonPath)) {
      storeCordovaFrameworkInfoInJson(
        updatedCordovaInfo,
        iosCordovaInfoJsonPath
      );
    }
  }
};

const getCordovaVersion = () => {
  const cordovaCmd = process.env.CORDOVA_BIN || "cordova";
  const osEol = "\n";
  return execSync(cordovaCmd + " -v")
    .toString()
    .split(osEol)[0]
    .trim();
};

const getIonicInfo = () => {
  var IONIC_INFO_KEYS = {
    ionicCli: "Ionic CLI",
    capCli: "Capacitor CLI",
    framework: "Ionic Framework",
  };

  try {
    const projectPath = projectRoot;
    var ionicInfoJson = execSync("ionic info --json ", {
        stdio: "pipe",
        cwd: projectPath,
      }).toString(),
      ionicInfoList = JSON.parse(ionicInfoJson),
      ionicFramework = ionicInfoList.find(function (paramsObj) {
        return (
          paramsObj.key === IONIC_INFO_KEYS.framework ||
          paramsObj.name === IONIC_INFO_KEYS.framework
        );
      });

    if (ionicFramework) {
      var ionicCliValue,
        capCliValue,
        ionicFrameworkValue,
        ionicProjectTypeValue = execSync("ionic config get type --no-color", {
          cwd: projectPath,
        })
          .toString()
          .trim()
          .replace(/[/'"]+/g, "")
          .replace("\u001b[32m", "")
          .replace("\u001b[39m", "");

      ionicInfoList.forEach(function (ionicInfo) {
        Object.keys(ionicInfo).forEach(function (key) {
          switch (ionicInfo[key]) {
            case IONIC_INFO_KEYS.ionicCli:
              ionicCliValue = ionicInfo.value;
              break;
            case IONIC_INFO_KEYS.framework:
              ionicFrameworkValue = ionicInfo.value;
              break;
            case IONIC_INFO_KEYS.capCli:
              capCliValue = ionicInfo.value;
              break;
            default:
              break;
          }
        });
      });
    }
  } catch (e) {
    // Ionic is not installed.
    // It is optional so we shouldn't do any actions here
  }
  return {
    cli: ionicCliValue || "not installed",
    framework: ionicFrameworkValue || "not installed",
    capacitor: capCliValue || "not installed",
    type: ionicProjectTypeValue || "not installed",
  };
};

const getCordovaFrameworkInfo = () => {
  return {
    framework: {
      name: "Cordova",
      bbdSdkForCordovaVersion: "",
      version: getCordovaVersion(),
      ionic: getIonicInfo(),
    },
  };
};

const storeCordovaFrameworkInfoInJson = (
  cordovaInfoObj,
  cordovaInfoJsonPath
) => {
  fs.writeFileSync(
    cordovaInfoJsonPath,
    JSON.stringify(cordovaInfoObj, null, 2),
    "utf8"
  );
};
