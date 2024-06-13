/**
 * Copyright (c) 2024 BlackBerry Limited. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(context) {

    const fs = require('fs'),
        path = require('path'),
        cmdPlatforms = context.opts.platforms,
        projectRoot = context.opts.projectRoot,
        platformiOSRoot = path.join(projectRoot, 'platforms', 'ios'),
        configXmlPath = path.join(projectRoot, 'config.xml'),
        ConfigParser = require('cordova-common').ConfigParser,
        projectName = new ConfigParser(configXmlPath).name(),
        podsReleaseXcconfigPath = path.join(
            platformiOSRoot,
            'Pods',
            'Target\ Support\ Files',
            'Pods-' + projectName,
            'Pods-' + projectName + '.release.xcconfig'
        ),
        podsDebugXcconfigPath = path.join(
            platformiOSRoot,
            'Pods',
            'Target\ Support\ Files',
            'Pods-' + projectName,
            'Pods-' + projectName + '.debug.xcconfig'
        );

    if (cmdPlatforms.includes('ios') && fs.existsSync(platformiOSRoot)) {
        removeOtherLDFlags();
    }

    function removeOtherLDFlags() {
        if (fs.existsSync(podsReleaseXcconfigPath) && fs.existsSync(podsDebugXcconfigPath)) {
            let releaseXcconfigContent = fs.readFileSync(podsReleaseXcconfigPath, 'utf-8'),
                debugXcconfigContent = fs.readFileSync(podsDebugXcconfigPath, 'utf-8');

            // Remove -sqlite3 to fix compatibility with Firebase modules
            releaseXcconfigContent = releaseXcconfigContent.replace(' -l"sqlite3"', '');
            debugXcconfigContent = debugXcconfigContent.replace(' -l"sqlite3"', '');

            fs.writeFileSync(podsReleaseXcconfigPath, releaseXcconfigContent, 'utf-8');
            fs.writeFileSync(podsDebugXcconfigPath, debugXcconfigContent, 'utf-8');
        }
    }

};
