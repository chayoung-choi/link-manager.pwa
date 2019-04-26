(function() {
  'use strict';

  var appStorage = {
    appPath  : "/link-manager.pwa",
    appVer   : {verName: "0.1.19", verCode:"20190426.01"},
    user     : {id : "", name: "", pw: ""},
    autoSignIn : "",
    hostList : {},
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

      console.log("[00]app.config>appStorage", appStorage);
      // $locationProvider.html5Mode(true);
      $routeProvider
        .when("/", {
            templateUrl : pathname+"/views/sign.html"
        })
        .when("/links", {
            templateUrl : pathname+"/views/links.html"
        })
        .when("/setting", {
            templateUrl : pathname+"/views/setting.html"
        })
        .when("/deck", {
            templateUrl : pathname+"/views/deck.html"
        })
        .when("/last", {
            templateUrl : pathname+"/html/red.html"
        })
        .otherwise({redirectTo : "/"});

  });

  // [Ctrl:initCtrl]
  app.controller("initCtrl", function($scope, $location, $timeout){

    var appVer = appStorage.appVer;
    $scope.appVer = appVer;

    // [Fn:initCtrl.signIn() - 로그인]
    $scope.signIn = function() {
      console.log("[01]app.initCtrl>로그인 시도");
      if ($scope.autoSignInSwitch != true){
         $scope.autoSignInSwitch = "";
      }
      appStorage.signIn($scope, $location);
    };

    // [Fn:initCtrl.autoSignIn() - 자동로그인]
    $scope.autoSignIn = function() {
      console.log("[02]app.initCtrl>자동로그인 시도");

      if ( appStorage.autoSignIn == true ){
        // 로그인버튼 클릭 시 id input disabled
        $("#signIn-btn")[0].disabled = true;
        $("#signIn-spinner").removeClass("d-none");
        $("[name='username'")[0].disabled = true;

        $scope.autoSignInSwitch = true;
        $scope.username = appStorage.user.name;

        $timeout(function () {
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
      console.log("[03] app.initCtrl>로그아웃");
      appStorage.clearStorage();
    };

    // [Fn:initCtrl.getLinkCardList() - Links 카드 가져오기]
    $scope.getLinkCardList = function() {
      console.log("[04] app.initCtrl.getLinkCardList>카드 가져오기");
      appStorage.getLinkCardList($scope);
    };



  });

  // [Ctrl:linkCardCtrl]
  app.controller("linkCardCtrl", function ($scope) {
    // [Fn:linkCardCtrl.insertLinkCard() - Link 카드 등록
    $scope.insertLinkCard = function() {
      $('#addLinkModal').modal('hide');
      var newLink = {};
      newLink.category = $scope.category;
      newLink.label = $scope.label;
      newLink.server = $scope.server;
      newLink.pathname = $scope.pathname;
      newLink.search = $scope.search;
      console.log(newLink);
    };
  })

  // [Ctrl:signOutCtrl]
  app.controller("signOutCtrl", function ($scope) {
    appStorage.clearStorage();
  });

  // [Fn:appStorage.clearStorage] - localStorage 초기화 _190403
  appStorage.clearStorage = function(){
    console.log("[03-1] appStorage.clearStorage");
    localStorage.clear();
  }
//------------------------------------------------------------------------------

  // [Fn:appStorage.getLinkCardList()] - Card List 가져오기 _190402
  appStorage.getLinkCardList = function($scope){
    $scope.id = appStorage.user.id;
    $scope.sheetName = "links";
    appStorage.getHttp($scope, null);
  }


  // [Fn:appStorage.updateLinkCardList()] - link Card 업데이트  _190402
  appStorage.updateLinkCardList = function(dataList) {
    if (!appStorage.linksContainer){
      appStorage.linksContainer = document.querySelector('.card-columns');
      appStorage.cardTemplate = document.querySelector('template').content;
    } else {
      document.querySelector('.card-columns').replaceWith(appStorage.linksContainer);
    }

    for (var i=0; i<dataList.length; i++){
      var seq = dataList[i].seq;
      appStorage.updateLinkCard(dataList[i]);
    }
  };

  // [Fn:appStorage.updateLinkCard()] - Card 업데이트
  appStorage.updateLinkCard = function(data) {
    console.log("-------------------- "+ data.seq +"-" +data.sub_seq + " -------------------- start");
    console.log("[04-0] appStorage.updateLinkCard>data", data);

    var card = appStorage.linksContainer.querySelector('.card-seq-'+data.seq);
    if (!card){
      console.log("[04-1] 카드 신규 추가");
      card = appStorage.cardTemplate.cloneNode(true);
      card.querySelector('.card').classList.add('card-seq-'+data.seq);
      card.querySelector('.card-seq').textContent = data.seq;
      card.querySelector('.card-header-text').textContent = data.category;
      card.querySelector('.list-group').innerHTML = '';
      card.querySelector('.last-updated-dt').textContent = formatDate(data.updated);
      card.querySelector('.card-footer .badge').textContent = data.server;
      appStorage.linksContainer.appendChild(card);
    }

    var subCard = appStorage.linksContainer.querySelector('.card-seq-'+data.seq+' .card-sub-seq-'+data.sub_seq);
    if (!subCard){
      console.log("[04-2] 서브카드 신규 추가");
      var subTemplate = appStorage.cardTemplate.querySelector('.sub-template');
      subCard = subTemplate.cloneNode(true);
      subCard.classList.remove('sub-template');
      subCard.removeAttribute('hidden');
      subCard.classList.add('card-sub-seq-'+data.sub_seq);
      subCard.querySelector('.card-text').textContent = data.label;
      subCard.querySelector('.card-last-updated').textContent = data.updated;

      var hostList = appStorage.hostList[data.server];

      var server = new Object();
      var dropdown = subCard.querySelector('.dropdown-menu');
      for (var i=0; i<hostList.length; i++){
        var type = hostList[i].type;
        server[type] = hostList[i];

        if ( type!='L' && type!='Q' && type!='O' ){
          var item = $("<a class='dropdown-item btn-cstm-link' "
                    + "data-type='"+type+"' href='javascript:'>"+hostList[i].name+"</a>");
          dropdown.appendChild(item[0]);
        }
      }

      // click event 등록
      var buttons = subCard.querySelectorAll(".btn-cstm-link");
      for (var b=0; b<buttons.length; b++){
        buttons[b].addEventListener('click', function(){
            var type = $(this).data('type');
            if (type){
              var url = server[type].origin + data.pathname + data.search;
              window.open(url, '_blank');
            }
        });
      }

      card = appStorage.linksContainer.querySelector('.card-seq-'+data.seq);
      card.querySelector('.list-group').appendChild(subCard);

      var sub_seq = data.sub_seq;
      var subJSON = {sub_seq: data};
      appStorage.visibleCards[data.seq] = subJSON;
    }

    console.log("-------------------- "+ data.seq +"-" +data.sub_seq + " -------------------- end");

    // 동기화
    // var cardCreated = new Date();
    // var dataLastUpdated = new Date(data.updated);
    // if (cardData){
    //   var cardCreated = new Date(cardData.created);
    //   if (dataLastUpdated.getTime() < cardCreated.getTime()){
    //     return;
    //   }
    // }
    // card.querySelector('.last-updated-dt').textContent = formatDate(dataLastUpdated);

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

                var hostList = {};
                for (var i=0; i<results.length; i++){
                  var server = results[i].server;

                  var arr = new Array();
                  for (var j=0; j<results.length; j++){
                    if (server == results[j].server){
                      	arr.push(results[j]);
                      }
                  }
                  hostList[server] = arr;
                }
                appStorage.saveToStorage("user", user);
                appStorage.saveToStorage("hostList", hostList);
                appStorage.saveToStorage("autoSignIn", $scope.autoSignInSwitch);
                //console.log("$scope.autoSignInSwitch", $scope.autoSignInSwitch);

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

        switch (sheetName){
          case "host" :

            break;
          case "links" :
            // appStorage.updateLinkCardList(initLinkData);
            break;
        }
      }
    };
    request.open('GET', url);
    request.send();
  }

  // [Fn:appStorage.saveToServer] - 서버에서 Http Post 통신 _190424
  appStorage.saveToServer = function($scope, $location) {
    console.log("통신;");
  }
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
  			resultDate = Math.floor(timegap * 24) + '분 전 업데이트';
  		} else {
  			resultDate = Math.floor(timegap) + '시간 전 업데이트';
  		}
    } else if (timegap > 24 && timegap <= 48){
      resultDate = "어제 업데이트"
    } else {
      if (curYear == today.getFullYear()) {
        resultDate = curMonth + '월 ' + curDay + '일 업데이트';
      } else {
        resultDate = resultDate;
      }
  	}
  	return resultDate;
  };
//------------------------------------------------------------------------------
  var initLinkData = [{
    seq: 'init',
    category: '네이버',
    sub_seq: 1,
    label: '네이버 초기 카드',
    pathname: 'www.naver.com',
    search: '',
    created: '2019-04-01T09:00:00.000Z',
    updated: '2019-04-01T09:00:00.000Z'
  }]
//------------------------------------------------------------------------------

  appStorage.user = localStorage.user;
  if (appStorage.user){
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
