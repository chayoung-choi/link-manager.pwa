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

var dataCacheName = 'linksData-v7';
var cacheName = 'linkManagerPWA-7';
var filesToCache = [
  '/link-manager.pwa/',
  '/link-manager.pwa/index.html',
  // ----------- include
  '/link-manager.pwa/include/navigation.html',
  // ----------- views
  '/link-manager.pwa/views/deck.html',
  '/link-manager.pwa/views/links.html',
  '/link-manager.pwa/views/sign.html',
  // ----------- resource - img
  '/link-manager.pwa/favicon.ico',
  '/link-manager.pwa/resource/img/icons/verified_user.png',
  '/link-manager.pwa/resource/img/logo/logo_ccy_128-128.png',
  '/link-manager.pwa/resource/img/logo/logo_ccy_144-144.png',
  '/link-manager.pwa/resource/img/logo/logo_ccy_152-152.png',
  '/link-manager.pwa/resource/img/logo/logo_ccy_192-192.png',
  '/link-manager.pwa/resource/img/logo/logo_ccy_256-256.png',
  // ----------- resource - js
  '/link-manager.pwa/resource/js/core.min.js',
  '/link-manager.pwa/resource/js/sha256.min.js',
  // ----------- app.js
  '/link-manager.pwa/scripts/app.js'
];


self.addEventListener('install', function(e) {
  // caches['appVer'] = '1.1.1';
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
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
    console.log('service #1', e.request.url);
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
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
