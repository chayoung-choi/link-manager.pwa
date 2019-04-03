(function() {
  'use strict';

  var appStorage = {
    appPath  : "/link-manager.pwa",
    appVer   : {verName: "0.1.0", verCode:"20190401.01"},
    user     : {id : "", name: "", autoSignIn: ""},
    hostList : [],
    // isLoading: true,
    visibleCards: {},
    // selectedCities: [],
    // spinner: document.querySelector('.loader'),
    // cardTemplate: document.querySelector('template').content,
    // container: document.querySelector('.main'),
    // addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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

console.log("init appStorage", appStorage);

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
    console.log("[Ctrl:initCtrl]");

    // $scope.pathname = $location.absUrl();
    // document.getElementsByTagName("base").href = $location.absUrl();
    var appVer = appStorage.appVer;
    $scope.appVer = appVer;

    $scope.signIn3 = function() {
      console.log("[Fn:initCtrl.signIn()]");

      // 로그인버튼 클릭 시 id input disabled
      $("#signIn-btn")[0].disabled = true;
      $("#signIn-spinner").removeClass("d-none");
      $("[name='username'")[0].disabled = true;

      var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
      $scope.id = id;
      appStorage.signIn($scope);

      console.log("id", id);
      console.log("id", appStorage.user.id);
      if (id == appStorage.user.id){
        console.log("로그인");
        $location.path("links");
      }

    };

    // #0-1. [GET] 서버 Link List
    $scope.getLinkList = function() {
      console.log("[GET] 서버 Link List");
      appStorage.getLinkList();
    };

    $scope.updateLinkCard = function() {
      console.log("[GET] 서버 Link List");
      // appStorage.getLinkList();
       appStorage.updateLinkCard();
    };
  });

  // [Ctrl:linksCtrl]
  app.controller("signCtrl", function ($scope, $location) {
    console.log("[Ctrl:signCtrl]");

    $scope.signIn = function() {
      console.log("[Fn:signCtrl.signIn()]");

      // 로그인버튼 클릭 시 id input disabled
      // $("#signIn-btn")[0].disabled = true;
      // $("#signIn-spinner").removeClass("d-none");
      // $("[name='username'")[0].disabled = true;

      var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
      $scope.id = id;
      appStorage.signIn($scope, $location);

      console.log("id", id);
      console.log("id", appStorage.user.id);
      if (id == appStorage.user.id){
        console.log("로그인");

      }
    };
  });

  // [Ctrl:linksCtrl]
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

  // [Ctrl:httpCtrl]
  app.controller('httpCtrl', function($scope, $http, $location) {
    console.log("[Ctrl:httpCtrl>appStorage]", appStorage);

    // if (localStorage.user){
    //   var user = JSON.parse(localStorage.user);
    //   $scope.username = user.name;
    //   $scope.autoSignInSwitch = user.autoSignIn;
    //
    //
    //         // 로그인버튼 클릭 시 id input disabled
    //         $("#signIn-btn")[0].disabled = true;
    //         $("#signIn-spinner").removeClass("d-none");
    //         $("[name='username'")[0].disabled= true;
    //
    //         // 파라메터로 보낼 임의의 데이터 객체
    //         var sheet_name = "host";
    //         var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
    //
    //         $http({
    //           method: 'GET',
    //           // LM-url
    //           url: 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name='+sheet_name+'&id='+id
    //         }).then(function successCallback(response) {
    //           $scope.myData = response.data.list;
    //
    //           var user = {"name":$scope.username, "id":id, "autoSignIn":$scope.autoSignInSwitch};
    //           appStorage.user = user;
    //           appStorage.saveLocalStorage("user", user);
    //           appStorage.hostList = response.data.list;
    //           appStorage.saveLocalStorage("hostList", response.data.list);
    //
    //           // success시 links view로 이동
    //           $location.path("links");
    //
    //         }, function errorCallback(response) {
    //           // called asynchronously if an error occurs
    //           // or server returns response with an error status.
    //           console.log("[function:signIn>http-error>response.data]", response.data);
    //
    //           $("#signIn-btn")[0].disabled = false;
    //           $("#signIn-spinner").addClass("d-none");
    //           $("[name='username'")[0].disabled= false;
    //         });
    // }

    // $scope.signIn = function(){
    //
    //   // 로그인버튼 클릭 시 id input disabled
    //   $("#signIn-btn")[0].disabled = true;
    //   $("#signIn-spinner").removeClass("d-none");
    //   $("[name='username'")[0].disabled = true;
    //
    //   var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
    //   $scope.id = id;
    //   appStorage.signIn($scope, $location);
    //
    //   console.log("id", id);
    //   console.log("id", appStorage.user.id);
    //   if (id == appStorage.user.id){
    //     console.log("로그인");
    //     $location.path("links");
    //   }
    // }

    // [Fn:signIn]
  //   $scope.signIn2 = function(){
  //     console.log("[Fn:signIn]");
  //
  //     // 로그인버튼 클릭 시 id input disabled
  //     $("#signIn-btn")[0].disabled = true;
  //     $("#signIn-spinner").removeClass("d-none");
  //     $("[name='username'")[0].disabled= true;
  //
  //     // 파라메터로 보낼 임의의 데이터 객체
  //     var sheet_name = "host";
  //     var id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
  //
  //     $http({
  //       method: 'GET',
  //       // LM-url
  //       url: 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name='+sheet_name+'&id='+id
  //     }).then(function successCallback(response) {
  //       $scope.myData = response.data.list;
  //
  //       var user = {"name":$scope.username, "id":id, "autoSignIn":$scope.autoSignInSwitch};
  //       appStorage.user = user;
  //       appStorage.saveLocalStorage("user", user);
  //       appStorage.hostList = response.data.list;
  //       appStorage.saveLocalStorage("hostList", response.data.list);
  //
  //       // success시 links view로 이동
  //       $location.path("links");
  //
  //     }, function errorCallback(response) {
  //       // called asynchronously if an error occurs
  //       // or server returns response with an error status.
  //       console.log("[function:signIn>http-error>response.data]", response.data);
  //
  //       $("#signIn-btn")[0].disabled = false;
  //       $("#signIn-spinner").addClass("d-none");
  //       $("[name='username'")[0].disabled= false;
  //     });
  //   }
  });


  app.controller('commonCtrl', function($scope){
    $scope.getMsg = function(code){
      var msgObj = {
        prep  : "준비 중 입니다."
      }
    };
  });


//------------------------------------------------------------------------------
/*
  * appStorage *
  // reloadLinkList()
  updateLinkList(dataList)
  updateLinkCard(data)
  getLinkList() - 서버 통신
*/
// [fn:appStorage.updateLinkCard] - card 업데이트
  appStorage.reloadLinkList = function(data) {

  }

// [fn:appStorage.updateLinkCard] - card 업데이트
  appStorage.updateLinkCard = function(data) {
    console.log("[appStorage.fn:updateLinkCard]");

    var cardTemplate = document.querySelector('template').content;

    if (!data){
      data = initLinkData;
    }

    var seq      = data.seq;
    var category = data.category;
    var subSeq   = data.sub_seq;
    var label    = data.label;
    var pathname = data.pathname;
    var search   = data.search;
    var createdDate  = new Date(data.created);
    var updatedDate  = new Date(data.updated);

    console.log("[appStorage.fn:updateLinkCard>seq]", seq);
    console.log("[appStorage.fn:updateLinkCard>createdDate]", createdDate);

    // var card = appStorage.visibleCards[data.seq];
    var card = cardTemplate.cloneNode(true);
    card.querySelector('.card-header').textContent = data.category;
    card.querySelector('.card-text').textContent = data.label;

    var container = document.querySelector('.card-columns');
    container.appendChild(card);
    // if (!card) {
    //   card.classList.remove('cardTemplate');
    //   card.querySelector('.location').textContent = data.label;
    //   card.removeAttribute('hidden');
    //   app.container.appendChild(card);
    //   app.visibleCards[data.key] = card;
    // }

  }

  // [fn:appStorage.updateLinkList] - link data 업데이트
  appStorage.updateLinkList = function(dataList) {
    console.log("[appStorage.fn:updateLinkList>dataList]", dataList);

    for (var i=0; i<dataList.length; i++){
      console.log("[appStorage.fn:updateLinkList>dataList["+i+"]", dataList[i]);
      var seq = dataList[i].seq;
      appStorage.updateLinkCard(dataList[i]);
    }

  };


//------------------------------------------------------------------------------
//  backend method
//------------------------------------------------------------------------------
  // [Fn:appStorage.signIn] - 로그인
  appStorage.signIn = function($scope, $location) {
    console.log("[Fn:appStorage.signIn]");

    $location.path("links");
    // 파라메터로 보낼 임의의 데이터 객체
    $scope.sheetName = "host";

    // appStorage.user.id = id;
    appStorage.getHttp($scope);

  }

  // [Fn:appStorage.getHttp] - 서버에서 Http Get 통신
  appStorage.getHttp = function($scope) {
    console.log("[Fn:appStorage.getHttp]");

    var sheetName = $scope.sheetName;
    var id  =  $scope.id;
    var url = "https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?"
            + "sheet_name=" + sheetName + "&"
            + "id=" + id;

    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            console.log("[Fn:appStorage.getHttp>caches>json]", json);
//             var results = json.query.results;
// console.log("[appStorage.getLinkList] #2 results", results);
            // results.key = key;
            // results.label = label;
            // results.created = json.query.created;
            // app.updateForecastCard(results);
            switch (sheetName){
              case "host" :

                break;
            }
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
          var results = response.list;

          switch (sheetName){
            case "host" :
              var user = {"name":$scope.username, "id":id, "autoSignIn":$scope.autoSignInSwitch};
              appStorage.user = user;
              appStorage.saveLocalStorage("user", user);
              appStorage.hostList = results;
              appStorage.saveLocalStorage("hostList", results);

              console.log("[Fn:appStorage.getHttp>XMLHttpRequest>links>>>>>>>>]");
              // success시 links view로 이동
              // $location.path("links");
              break;
          }
          // appStorage.updateLinkList(results);

        }
      } else {
        // app.updateForecastCard(initialWeatherForecast);
        console.log("[Fn:appStorage.getHttp>XMLHttpRequest>err]");
        switch (sheetName){
          case "host" :
            // $("#signIn-btn")[0].disabled = false;
            // $("#signIn-spinner").addClass("d-none");
            // $("[name='username'")[0].disabled= false;
            break;
        }
      }
    };
    request.open('GET', url);
    request.send();
  }


  // [Fn:appStorage.getLinkList] - 서버에서 link data 가져오기
  appStorage.getLinkList = function() {
    console.log("[appStorage.fn:getLinkList]");

    var id = appStorage.user.id;
    var url = 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?sheet_name=links&id='+id;

    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            console.log("[appStorage.fn:getLinkList] #1 json", json);
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
          var results = response.list;
console.log("[appStorage.fn:getLinkList] #3 results", results);
          // console.log("[appStorage.fn:getLinkList]", response);
          appStorage.updateLinkList(results);
          // results.key = key;
          // results.label = label;
          // results.created = response.query.created;
          // app.updateForecastCard(results);
        }
      } else {
console.log("[appStorage.fn:getLinkList] #4 err", response);
        // app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  };

  // [Fn:appStorage.saveLocalStorage] - 로컬저장소에 저장
  appStorage.saveLocalStorage = function(key, val) {
    localStorage[key] = JSON.stringify(val);
  };
//------------------------------------------------------------------------------
  var initLinkData = {
    seq: 1,
    category: "관리시스템",
    sub_seq: 1,
    label: "SMOSMGR20",
    pathname: "SMOSMGR/",
    search: "",
    created: "2019-03-19T15:00:00.000Z",
    updated: "2019-03-20T15:00:00.000Z"
  }
//------------------------------------------------------------------------------

  appStorage.user = localStorage.user;
  appStorage.hostList = localStorage.hostList;
  if (appStorage.user){
    appStorage.user = JSON.parse(appStorage.user);
    appStorage.hostList = JSON.parse(appStorage.hostList);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();