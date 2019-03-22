(function() {
  'use strict';

  var appStorage = {
    appPath: "/link-manager.pwa",
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

// document.getElementById('btnAdd').addEventListener('click', function() {
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

      $routeProvider
      .when("/", {
          templateUrl : pathname+"/views/sign.html"
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
  // app.controller("initCtrl", function($scope, $location){
  //
  //   $scope.pathname = $location.absUrl();
  //   var pathname = $location.path();
  //   console.log("0", $location.path(), pathname);
  //   console.log("1", $location);
  //
  //   document.getElementsByTagName("base").href = $location.absUrl();
  //   console.log("2 absUrl", $location.absUrl());
  // });

  // // #1-1.
  // app.controller("loginModalCtrl", function ($scope, $location) {
  //   $("#loginForm").modal('toggle');
  //
  //   $('#loginForm').on('hidden.bs.modal', function (e) {
  //     console.log("2-1");
  //     if ( $scope.modalShow == 'true' ){
  //       console.log("2-2");
  //       $("#loginForm").modal('toggle');
  //     }
  //   });
  // });
  app.controller("linksCtrl", function ($scope) {
      $scope.names = [
        {name:'Jani',country:'Norway'},
        {name:'Hege',country:'Sweden'},
        {name:'Kai',country:'Denmark'}
      ];

      $scope.myFunction = function() {
        console.log("오예~");
      };

      $scope.fn_decSha256 = function() {
        // console.log(CryptoJS.SHA256("mos1234!").toString());
        $scope.user.decSha256 = CryptoJS.SHA256($scope.user.pw).toString().toUpperCase();
      };
  });
  app.controller('httpCtrl', function($scope, $http, $location) {
console.log("appStorage", appStorage);
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
        // this callback will be called asynchronously
        // when the response is available
        $scope.myData = response.data.list;
        console.log($scope.myData);

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

  app.getLinkList = function(id) {
    console.log("get");
    return;
    var url = 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name=links&id='+id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.query.results;
          // results.key = key;
          // results.label = label;
          // results.created = response.query.created;
          // app.updateForecastCard(results);
          console.log("#1-1");
        }
        console.log("#1-2");
      } else {
        // Return the initial weather forecast since no data is available.
        // app.updateForecastCard(initialWeatherForecast);
        console.log("err");
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
