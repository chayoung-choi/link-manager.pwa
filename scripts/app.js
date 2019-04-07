(function() {
  'use strict';

  var appStorage = {
    appPath  : "/link-manager.pwa",
    appVer   : {verName: "0.1.7", verCode:"20190405.01"},
    user     : {id : "", name: "", pw: ""},
    autoSignIn : "",
    hostList : [],
    // isLoading: true,
    visibleCards: {},
    linksContainer: null,
    cardTemplate: null,
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

console.log("init appStorage", appStorage);
      // $locationProvider.html5Mode(true);
      $routeProvider
        .when("/", {
            templateUrl : pathname+"/views/sign.html"
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
        .otherwise({redirectTo : "/"});

  });

  // app.all('/*', function (req, res) {
  //   res.sendFile('index.html', { root:"/link-manager.pwa/views" });
  // });

  // app.use(function (req, res) {
  //   res.sendFile('./link-manager.pwa/index.html');
  // });

  // app.run(function($rootScope){
  //   $rootScope.$on('$routeChangeStart', function(e, curr, prev){
  //     $rootScope.IsLoading = true;
  //   });
  //   $rootScope.$on('$routeChangeSuccess', function(e, curr, prev){
  //     $rootScope.IsLoading = false;
  //   });
  // });

  // [Ctrl:initCtrl]
  app.controller("initCtrl", function($scope, $location, $timeout){

    var appVer = appStorage.appVer;
    $scope.appVer = appVer;
    // $scope.autoSignInSwitch = appStorage.autoSignIn;

    // [Fn:initCtrl.signIn() - 로그인]
    $scope.signIn = function() {
      console.log("[Fn:initCtrl.signIn()]");
      if ($scope.autoSignInSwitch != true){
         $scope.autoSignInSwitch = "";
      }
      appStorage.signIn($scope, $location);
    };

    // [Fn:initCtrl.autoSignIn() - 자동로그인]
    $scope.autoSignIn = function() {
      console.log("[Fn:initCtrl.autoSignIn()]", $scope.autoSignInSwitch, localStorage.autoSignIn);

      if ( appStorage.autoSignIn == true ){
        // 로그인버튼 클릭 시 id input disabled
        $("#signIn-btn")[0].disabled = true;
        $("#signIn-spinner").removeClass("d-none");
        $("[name='username'")[0].disabled = true;

        $scope.autoSignInSwitch = true;
        $scope.username = appStorage.user.name;

        $timeout(function () {
          console.log("2초 auto 로그인");
          // $scope.theTime = new Date().toLocaleTimeString();
          if ( $scope.autoSignInSwitch ){
            appStorage.signIn($scope, $location);
          } else {
            $("#signIn-btn")[0].disabled = false;
            $("#signIn-spinner").addClass("d-none");
            $("[name='username'")[0].disabled= false;
          }
        }, 2000);
      }

    };

    // [Fn:initCtrl.signOut()
    $scope.signOut = function() {
      console.log("[Fn:initCtrl.signOut()]");
      appStorage.clearStorage();
    };

    // [Fn:initCtrl.getLinkCardList() - Links 카드 가져오기]
    $scope.getLinkCardList = function() {
      console.log("[Fn:initCtrl.getLinkCardList()]");
      appStorage.getLinkCardList($scope);
    };
  });


  // [Ctrl:signOutCtrl]
  app.controller("signOutCtrl", function ($scope) {
    console.log("[Ctrl:signOutCtrl]");
    appStorage.clearStorage();
  });

  // [Fn:appStorage.clearStorage] - localStorage 초기화 _190403
  appStorage.clearStorage = function(){
    localStorage.clear();
  }
//------------------------------------------------------------------------------
/*
  * appStorage *
  getLinkCardList() - 서버 통신
  updateLinkList(dataList)
  updateLinkCard(data)
*/

  // [Fn:appStorage.getLinkCardList()] - Card List 가져오기 _190402
  appStorage.getLinkCardList = function($scope){
    // console.log("[Fn:appStorage.updateLinkCardList()]");
    $scope.id = appStorage.user.id;
    $scope.sheetName = "links";
    appStorage.getHttp($scope, null);
  }


  // [Fn:appStorage.updateLinkCardList()] - link Card 업데이트  _190402
  appStorage.updateLinkCardList = function(dataList) {
    // console.log("[Fn:appStorage.updateLinkCardList>dataList]", dataList);

    // document.querySelector('.card-columns').remove(); // container 초기화
    for (var i=0; i<dataList.length; i++){
      // console.log("[Fn:appStorage.updateLinkCardList>dataList["+i+"]", dataList[i]);
      var seq = dataList[i].seq;
      appStorage.updateLinkCard(dataList[i]);
    }

  };

  // [Fn:appStorage.updateLinkCard()] - Card 업데이트
  appStorage.updateLinkCard = function(data) {
console.log("[Fn:appStorage.updateLinkCard()]", data);
console.log("#0 appStorage", appStorage);
    var dataLastUpdated = new Date(data.updated);

    if (!appStorage.linksContainer){
console.log("#1-1 container 추가", data.seq+"-"+data.sub_seq);
      appStorage.linksContainer = document.querySelector('.card-columns');
      appStorage.cardTemplate = document.querySelector('template').content;
    }

console.log("------------- "+ data.seq +"-" +data.sub_seq + " -------------");
    var card = appStorage.visibleCards[data.seq];
    if (!card){
console.log("#2-1 카드 신규 추가", data.seq+"-"+data.sub_seq);
      // var cardTemplate = document.querySelector('template').content;
      card = appStorage.cardTemplate.cloneNode(true);

      card.querySelector('.card-seq').textContent = data.seq;
      card.querySelector('.card-header').textContent = data.category;
      card.querySelector('.list-group').innerHTML = '';

console.log("card seq", card.querySelector('.card-seq').textContent);
    } else {

console.log("----------------------x " + card.querySelector('.card-seq'));
      // card =  card[0];

      // card.querySelector('.card-header').textContent = 'xxxxxxxxxxxxxx';
      // console.log(card.innerHTML);
    }

    var subCard = card.querySelector('.card-sub-seq-'+data.sub_seq);
// console.log(card.querySelector('.card-sub-seq-'+data.sub_seq));
    if (!subCard){
console.log("#3-1 카드 서브 신규 추가", data.seq+"-"+data.sub_seq);

      var subTemplate = appStorage.cardTemplate.querySelector('.sub-template');
      subCard = subTemplate.cloneNode(true);
      subCard.classList.remove('sub-template');
      subCard.removeAttribute('hidden');
      subCard.classList.add('card-sub-seq-'+data.sub_seq);
      subCard.querySelector('.card-text').textContent = data.label;

console.log("card",card);
console.log("querySelector",card.querySelector('.list-group'));
console.log("subCard",subCard);
      // card.querySelector('.list-group').appendChild(subCard);
      appStorage.linksContainer.appendChild(card);
      console.log("");
      appStorage.visibleCards[data.seq] = data;
    } else {
      console.log("서브 추가");
      // var a = subCard.querySelector('.card-text').textContent;
      // subCard.querySelector('.card-text').textContent = a +" / "+ data.label;
    }





return;

    // 신규 Card
    var card = appStorage.visibleCards[data.seq];
    if (!card) {
      var cardTemplate = document.querySelector('template').content;
      card = cardTemplate.cloneNode(true);

      card.querySelector('.card-seq').textContent = data.seq;
      card.querySelector('.card-sub-seq').textContent = data.sub_seq;
      card.querySelector('.card-header').textContent = data.category;

      card.querySelector('.card-last-updated').textContent = dataLastUpdated;
      card.querySelector('.last-updated-dt').textContent   = formatDate(dataLastUpdated);

console.log("card add", card);
      appStorage.linksContainer.appendChild(card);
      appStorage.visibleCards[data.seq] = card;
    }

    var subTemp = card.querySelector('.sub-template');
    var subCard = card.querySelector('.card-sub-seq-'+data.sub_seq);
    if (!subCard){
      var cardSubTemplate = document.querySelector('.sub-template');
      subCard = cardSubTemplate.cloneNode(true);
      subCard.classList.remove('sub-template');
      subCard.removeAttribute('hidden');
      subCard.classList.add('card-sub-seq-'+data.sub_seq);
      subCard.querySelector('.card-text').textContent = data.label;
      console.log(subCard);
      console.log("card", card);
      var card1_li = appStorage.visibleCards[data.seq].querySelector('.list-group');
      var li = card.querySelector('.list-group');
      console.log("card1", card1_li);
      console.log("li", li);
      // li.appendChild(subCard);
    }



    // var subCard = appStorage.visibleCards[data.seq];
    console.log('appStorage', appStorage);
    console.log('card', appStorage.visibleCards['1']);


// console.log("[Fn:appStorage.updateLinkCard()>#1]", appStorage.visibleCards);
// console.log("[Fn:appStorage.updateLinkCard()>Card]", card);
    // 기존 Card
    var cardLastUpdatedElem = card.querySelector('.card-last-updated');
    // console.log(cardLastUpdatedElem);
    // var cardLastUpdated = cardLastUpdatedElem.textContent;
    // if (cardLastUpdated) {
    //   cardLastUpdated = new Date(cardLastUpdated);
    //   // Bail if the card has more recent data then the data
    //   if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
    //     return;
    //   }
    // }
    // cardLastUpdatedElem.textContent = data.updated;
    // card.querySelector('.card-last-updated').textContent = dataLastUpdated;
    // card.querySelector('.last-updated-dt').textContent   = formatDate(dataLastUpdated);
    // card.querySelector('.card-header').textContent = data.category;
    // card.querySelector('.card-text').textContent   = data.label;
  }

//------------------------------------------------------------------------------
//  backend method
//------------------------------------------------------------------------------
  // [Fn:appStorage.signIn] - 로그인 _190402
  appStorage.signIn = function($scope, $location) {
    console.log("[Fn:appStorage.signIn]");

    $("#signIn-btn")[0].disabled = true;
    $("#signIn-spinner").removeClass("d-none");
    $("[name='username'")[0].disabled = true;

    // 파라메터로 보낼 임의의 데이터 객체
    $scope.id = CryptoJS.SHA256($scope.username).toString().toUpperCase();
    $scope.pw = CryptoJS.SHA256("").toString().toUpperCase();
    $scope.sheetName = "host";

    appStorage.getHttp($scope, $location);
  }

  // [Fn:appStorage.getHttp] - 서버에서 Http Get 통신 _190402
  appStorage.getHttp = function($scope, $location) {
    console.log("[Fn:appStorage.getHttp]");

    var sheetName = $scope.sheetName;
    var url = "https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?"
            + "sheet_name=" + sheetName + "&"
            + "id=" + $scope.id;
    console.log("[Fn:appStorage.getHttp] #0 url", url);

    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          console.log("[Fn:appStorage.getHttp] #1 caches response", response);
          response.json().then(function updateFromCache(json) {
            var results = json.list;
            console.log("[Fn:appStorage.getHttp] #1 caches results", results);

            switch (sheetName){
              case "host" :
                if ( results.length > 0 ){
                // if ( $scope.id == appStorage.user.id && $scope.pw == appStorage.user.pw ){
                  console.log("캐시 로그인", $scope.autoSignInSwitch);
                  appStorage.saveToStorage("autoSignIn", $scope.autoSignInSwitch);
                  $location.path("links");
                  $scope.$apply();
                } else {

                }
                break;

              case "links" :
                appStorage.updateLinkCardList(results);
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
              if ( results.length > 0 ){
                console.log("통신 로그인");
                var user = {"name":$scope.username, "id":$scope.id, "pw":$scope.pw};
                appStorage.saveToStorage("user", user);
                appStorage.saveToStorage("hostList", results);
                appStorage.saveToStorage("autoSignIn", $scope.autoSignInSwitch);
                console.log("$scope.autoSignInSwitch", $scope.autoSignInSwitch);

                $location.path("links");
                $scope.$apply();
              } else {
                $("#signIn-btn")[0].disabled = false;
                $("#signIn-spinner").addClass("d-none");
                $("[name='username'")[0].disabled= false;
              }
              break;

            case "links" :
              appStorage.updateLinkCardList(results);
              break;
          }

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
  appStorage.saveToStorage = function(key, val) {
    console.log("[appStorage.saveToStorage>key:val]",key,val);
    appStorage[key] = val;
    localStorage[key] = JSON.stringify(val);
  };

  // 업데이트 시간 포맷 함수
  function formatDate(curDate) {
  	var today, resultDate, timegap;
  	today = new Date();
  	resultDate = new Date(curDate);
  	timegap = (today - resultDate)/(60*60*1000);

  	var curYear = resultDate.getFullYear();
  	var curMonth = (resultDate.getMonth() + 1);
  	var curDay = resultDate.getDate();

  	// Time (minutes * seconds * millisecond)
  	if (timegap <= 24) {
  		if (Math.floor(timegap) == 0) {
  			resultDate = 'Last updated ' + Math.floor(timegap * 24) + ' mins ago';
  		} else {
  			resultDate = 'Last updated ' + Math.floor(timegap) + ' hour ago';
  		}
  	} else {
  		resultDate = curYear + '-' + curMonth + '-' + curDay;
  	}
  	return resultDate;
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
  if (appStorage.user){
    console.log("appStorage set");
    appStorage.user = JSON.parse(appStorage.user);
    appStorage.hostList = JSON.parse(localStorage.hostList);
    appStorage.autoSignIn = JSON.parse(localStorage.autoSignIn);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
