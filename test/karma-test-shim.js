/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// /*global jasmine, __karma__, window*/
Error.stackTraceLimit = 0; // "No stacktrace"" is usually best for app testing.

// Uncomment to get full stacktrace output. Sometimes helpful, usually not.
// Error.stackTraceLimit = Infinity; //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

// builtPaths: root paths for output ("built") files
// get from karma.config.js, then prefix with '/base/'
var builtPaths = (__karma__.config.builtPaths)
    .map(function (p) {
        return '/base/' + p;
    });

__karma__.loaded = function () {
};

function isJsFile(path) {
    return path.slice(-3) == '.js';
}

function isSpecFile(path) {
    return /\.spec\.(.*\.)?js$/.test(path);
}

// Is a "built" file if is JavaScript file in one of the "built" folders
function isBuiltFile(path) {
    return isJsFile(path) &&
        builtPaths.reduce(function (keep, bp) {
            return keep || (path.substr(0, bp.length) === bp);
        }, false);
}

var allSpecFiles = Object.keys(window.__karma__.files)
    .filter(isSpecFile)
    .filter(isBuiltFile);

System.config({
    // Base URL for System.js calls. 'base/' is where Karma serves files from.
    baseURL: 'base',

    // Map the angular testing umd bundles
    map: {
        '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
        '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
        '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
        '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
        '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
        '@angular/http/testing': 'npm:@angular/http/bundles/http-testing.umd.js',
        '@angular/router/testing': 'npm:@angular/router/bundles/router-testing.umd.js',
        '@angular/forms/testing': 'npm:@angular/forms/bundles/forms-testing.umd.js'
    }
});

System.import('platform/systemjs.spec.config.js')
    .then(initTestBed)
    .then(initTesting);

/** Optional SystemJS configuration extras. Keep going w/o it */
function importSystemJsExtras() {
    return System.import('platform/systemjs.config.extras.js')
        .catch(function (reason) {
            console.log(
                'Warning: System.import could not load the optional "systemjs.config.extras.js". Did you omit it by accident? Continuing without it.'
            );
            console.log(reason);
        });
}

function initTestBed() {
    return Promise.all([
        System.import('@angular/core/testing'),
        System.import('@angular/platform-browser-dynamic/testing')
    ])

        .then(function (providers) {
            var coreTesting = providers[0];
            var browserTesting = providers[1];

            coreTesting.TestBed.initTestEnvironment(
                browserTesting.BrowserDynamicTestingModule,
                browserTesting.platformBrowserDynamicTesting());
        })
}

// Import all spec files and start karma
function initTesting() {
    return Promise.all(
        allSpecFiles.map(function (moduleName) {
            return System.import(moduleName);
        })
    )
        .then(__karma__.start, __karma__.error);
}
