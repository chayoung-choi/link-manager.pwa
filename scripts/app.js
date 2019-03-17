(function() {
  'use strict';

  // var app = {
  //   // isLoading: true,
  //   // visibleCards: {},
  //   // selectedCities: [],
  //   // spinner: document.querySelector('.loader'),
  //   // cardTemplate: document.querySelector('.cardTemplate'),
  //   // container: document.querySelector('.main'),
  //   // addDialog: document.querySelector('.dialog-container'),
  //   daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  // };
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
  app.config(function($routeProvider) {
      $routeProvider
      .when("/main", {
          templateUrl : "html/main.html"
      })
      .when("/links", {
          templateUrl : "views/links.html"
      })
      .when("/deck", {
          templateUrl : "views/deck.html"
      })
      .when("/last", {
          templateUrl : "html/red.html"
      });
  });
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
  app.controller('httpCtrl', function($scope, $http) {
    $scope.getHttp = function(){
      /* 파라메터로 보낼 임의의 데이터 객체 */
      var sheet_name = "host";
      var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
      console.log($scope.username, id);
      $http({
        method: 'GET',
        // LM-url
        // https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec
        url: 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name='+sheet_name+'&id='+id
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        console.log(response.data.list);
        $scope.myData = response.data.list;
        console.log($scope.myData);
        location.href = "#!links";
        $("#loginForm").modal('toggle');
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log(response.data);
      });
    }
  });
  app.controller("loginModalCtrl", function ($scope) {
    $("#loginForm").modal('toggle');
    $('#loginForm').on('hidden.bs.modal', function (e) {
      $("#loginForm").modal('toggle');
    })
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
