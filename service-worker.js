// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var _appVersion = 'LM_v053';
var _dataCache = 'LM_data-v053';
var filesToCache = [
  '/link-manager.pwa/',
  '/link-manager.pwa/index.html',
  '/link-manager.pwa/scripts/app.js',
  '/link-manager.pwa/images/logo/icon-outline.png',
  '/link-manager.pwa/images/logo/apple-icon-57x57.png',
  '/link-manager.pwa/images/logo/apple-icon-60x60.png',
  '/link-manager.pwa/images/logo/apple-icon-72x72.png',
  '/link-manager.pwa/images/logo/apple-icon-76x76.png',
  '/link-manager.pwa/images/logo/android-icon-192x192.png',
  '/link-manager.pwa/images/logo/ms-icon-144x144.png',
  '/link-manager.pwa/css/style.css'
];

const log = msg => {
  console.log(`[ServiceWorker ${_appVersion}] ${msg}`);
}

self.addEventListener('install', function(e) {
  // console.log('[ServiceWorker] Install');
  log('INSTALL');
  e.waitUntil(
    caches.open(_appVersion).then(function(cache) {
      log('Caching app shell');
      return cache.addAll(filesToCache);
    })
  );

  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== _appVersion) {
          log('Removing old cache ' + key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('activate', function(e) {
  // console.log('[ServiceWorker] Activate');
  log('Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== _appVersion) {
          log('Removing old cache ' + key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var dataUrl = 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec';
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(_dataCache).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
