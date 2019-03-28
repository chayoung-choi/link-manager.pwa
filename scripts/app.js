(function() {
  'use strict';

  var appStorage = {
    appPath: "/link-manager.pwa",
    appVer: {verName: "0.0.4", verCode:"20190328.01"},
    id : "",
    hostList  : [],
    // isLoading: true,
    // visibleCards: {},
    // selectedCities: [],
    // spinner: document.querySelector('.loader'),
    // cardTemplate: document.querySelector('.cardTemplate'),
    // container: document.querySelector('.main'),
    // addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
//------------------------------------------------------------------------------

  // $("#btn_login").click(function(){
  //   console.log("btnAdd");
  // });

  // document.getElementById('btnReset').addEventListener('click', function() {
  //  console.log("btnAdd");
  // });

  // angular.module('myApp', []).controller('namesCtrl', function($scope) {
  //   $scope.names = [
  //     {name:'Jani',country:'Norway'},
  //     {name:'Hege',country:'Sweden'},
  //     {name:'Kai',country:'Denmark'}
  //   ];
  // });

  var app = angular.module("myApp", ["ngRoute"]);
  app.config(function($routeProvider, $locationProvider) {
      var pathname = appStorage.appPath;
      $locationProvider.html5Mode(true);

console.log("index appStorage #0", appStorage);

      $routeProvider
      .when("/", {
          templateUrl : pathname+"/views/sign.html"
          // templateUrl : pathname+"/views/links.html"
        // , controller  : "loginModalCtrl"
      })
      .when("/main", {
          templateUrl : pathname+"/html/main.html"
      })
      .when("/links", {
          templateUrl : pathname+"/views/links.html"
      })
      .when("/deck", {
          templateUrl : pathname+"/views/deck.html"
      })
      .when("/last", {
          templateUrl : pathname+"/html/red.html"
      })
      .otherwise({redirectTo: pathname+"/views/sign.html"});


  });

  // #0. init
  app.controller("initCtrl", function($scope, $location){
console.log("[controller:initCtrl]");
    // $scope.pathname = $location.absUrl();
    // document.getElementsByTagName("base").href = $location.absUrl();
    var appVer = appStorage.appVer;
    $scope.appVer = appVer;

    // #0-1. [GET] 서버 Link List
    $scope.updateLinkList = function() {
console.log("[GET] 서버 Link List");
      appStorage.updateLinkList();
    };
  });

  app.controller("linksCtrl", function ($scope) {
console.log("[controller:linksCtrl]");
      $scope.names = [
        {name:'Jani',country:'Norway'},
        {name:'Hege',country:'Sweden'},
        {name:'Kai',country:'Denmark'}
      ];

      $scope.fn_decSha256 = function() {
        // console.log(CryptoJS.SHA256("mos1234!").toString());
        $scope.user.decSha256 = CryptoJS.SHA256($scope.user.pw).toString().toUpperCase();
      };
  });

  app.controller('httpCtrl', function($scope, $http, $location) {
console.log("signIn>init appStorage #1", appStorage);
    $scope.signIn = function(){

      $("#signIn-btn")[0].disabled = true;
      $("#signIn-spinner").removeClass("d-none");
      $("[name='username'")[0].disabled= true;

      /* 파라메터로 보낼 임의의 데이터 객체 */
      var sheet_name = "host";
      var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
      console.log($scope.username, id);

      $http({
        method: 'GET',
        // LM-url
        url: 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name='+sheet_name+'&id='+id
      }).then(function successCallback(response) {
        $scope.myData = response.data.list;

        appStorage.id = id;
        appStorage.hostList = response.data.list;
console.log("signIn>appStorage #2", appStorage);

        $location.path("links");

      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log(response.data);
        $("#signIn-btn")[0].disabled = false;
        $("#signIn-spinner").addClass("d-none");
        $("[name='username'")[0].disabled= false;
      });
    }
  });


  app.controller('commonCtrl', function($scope){
    $scope.getMsg = function(code){
      var msgObj = {
        prep  : "준비 중 입니다."
      }
    };
  });


//------------------------------------------------------------------------------
  appStorage.updateLinkList = function() {
console.log("appStorage.updateLinkList");
    // var keys = Object.keys(app.visibleCards);
    // keys.forEach(function(key) {
    var id = appStorage.id;
    appStorage.getLinkList(id);
    // });
  };


//------------------------------------------------------------------------------
  appStorage.getLinkList = function(id) {
console.log("[appStorage.getLinkList] id", id);
    id="smos"
    var url = 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name=links&id='+id;
console.log("[appStorage.getLinkList] url", url);
    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
console.log("[appStorage.getLinkList] #1 json", json);
//             var results = json.query.results;
// console.log("[appStorage.getLinkList] #2 results", results);
            // results.key = key;
            // results.label = label;
            // results.created = json.query.created;
            // app.updateForecastCard(results);
          });
        }
      });
    }
    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          // var results = response.query.results;
console.log("[appStorage.getLinkList] #3 response", response);
          // results.key = key;
          // results.label = label;
          // results.created = response.query.created;
          // app.updateForecastCard(results);
        }
      } else {
console.log("[appStorage.getLinkList] #4 err", response);
        // app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  };

//------------------------------------------------------------------------------
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
