(function() {
  'use strict';

  var app = {
    appName  : 'Link Manager',
    appPath  : '/link-manager.pwa',
    appVer   : {verName: "0.1.6", verCode:"20200130.01"},
    userInfo : {id: ''},
    daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cardTemplate: document.getElementById('cardTemplate'),
    sidebarTemplate: document.getElementById('sidebarTemplate'),
    mainSectionTemplate: document.getElementById('mainSectionTemplate')
  };
  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('btnRefresh').addEventListener('click', function() {
    // console.log(this.children[0].classList.add('w3-spin')) = 'w3-spin';
    // console.log($(this));
    this.children[0].classList.add('w3-spin');
    app.getServerDate('HOST');
    app.getServerDate('MENU');
  });

  document.getElementById('navFooterAppVer').textContent = 'APP VER '+app.appVer.verName;
  document.getElementById('btnReset').addEventListener('click', function() {
    if (confirm('캐시 데이터를 초기화하시겠습니까?')){
      localStorage.clear();
      alert('초기화 완료');
      location.reload();
    }
  });

  var linkCards = document.querySelectorAll(".link-card");
  var btnDelete = document.querySelectorAll(".btn-delete");
  var btnUpdate = document.querySelectorAll(".btn-update");

// // [Card -> update btn]
//   Array.from(btnUpdate).forEach((el) => {
//     el.addEventListener('click', function(){
//       alert("수정");
//     });
//   });
//
// // [Card -> delete btn]
//   Array.from(btnDelete).forEach((el) => {
//     el.addEventListener('click', function(){
//       alert("삭제");
//     });
//   });

  $(function(){
    // console.log('바로');
    // app.getServerDate('HOST');
    // app.getServerDate('MENU');
  });

/*****************************************************************************
 *
 * Methods to update/refresh the UI
 *
 ****************************************************************************/

// #사이드바 메뉴 리스트 설정
app.updateSidebar = function(data) {
  data = data.sort(fn_menuSort);

  var viewSidebar = document.getElementById('viewSidebar');
  viewSidebar.innerHTML = '';

  var sidebarTemplate = app.sidebarTemplate.content.cloneNode(true);
  var item = sidebarTemplate.querySelector('.sidebar-item');
  var line = sidebarTemplate.querySelector('.sidebar-line');
  var depth = 0;
  for (var i=0; i<data.length; i++){

    var menu = data[i];
    if (depth != menu.DEPTH){
      viewSidebar.appendChild(line);
      depth = menu.DEPTH;
    }

    var sideMenu = item.cloneNode(true);
    sideMenu.href = '#'+menu.MENU_CODE;
    sideMenu.textContent = menu.MENU_NAME;
    viewSidebar.appendChild(sideMenu);
  }
}

// #View Link Card Section
app.updateViewLinkCardSection = function(data){
  document.getElementById('viewLinkCardSection').innerHTML = '';
  var menuList = app.menuData;

  for (var i=0; i<menuList.length; i++){
    var clonContent = app.mainSectionTemplate.content.cloneNode(true);
    var section = clonContent.querySelector('.section-box');
    var hr = document.createElement('hr');
    var menuCode = menuList[i].MENU_CODE;

    section.id = menuCode;
    section.querySelector('.section-title b').textContent = menuList[i].MENU_NAME+'.';
    document.getElementById('viewLinkCardSection').appendChild(section);
    document.getElementById('viewLinkCardSection').appendChild(hr);
  }

  app.updateLinkCardList(data);
}

// Link Card List Update
app.updateLinkCardList = function(data){
  Array.from(data).forEach((el) => {
    app.updateLinkCard(el);
  });
}

// Link Card Update
app.updateLinkCard = function(data){
  if (document.getElementById(data.MENU_CODE) == null) { return; }

  var card = app.mainSectionTemplate.content.querySelector('.link-card').cloneNode(true);
  card.querySelector('.card-title').textContent = data.TITLE;
  card.dataset.linkId = data.SEQ;
  card.dataset.updated = data.UPDATED;
  card.querySelector('.btn-update').addEventListener('click', function(){
    fn_updateCard();
  });
  card.querySelector('.btn-delete').addEventListener('click', function(){
    fn_deleteCard();
  });

  // param hashtag icon
  var clonParamTagIcon = app.mainSectionTemplate.content.querySelector('.param-tag');
  var paramJson = gfn.stringParserJson(data.PARAMS, '&', '=');
  for (var key in paramJson){
    var paramTagIcon = clonParamTagIcon.cloneNode(true);
    paramTagIcon.textContent = '#' + key;
    paramTagIcon.dataset[key] = paramJson[key];
    card.querySelector('.card-params').appendChild(paramTagIcon);
  }

  // link url L,Q,O,W~
  Array.from(app.hostData[data.SERVER]).forEach((host) => {
    var hostType = host.TYPE.toLowerCase();
    var fullUrl = host.ORIGIN + data.PATHNAME + '?' + data.PARAMS;
    card.querySelector('.host-type-' + hostType).href = fullUrl;
  });


  document.getElementById(data.MENU_CODE).querySelector('.link-content').appendChild(card);
}

/*****************************************************************************
 *
 * app sub function
 *
 ****************************************************************************/
// 사이드메뉴 리스트 정렬
function fn_menuSort(a, b) {
  if (a.DEPTH < b.DEPTTH) { return -1; }
  if (a.DEPTH > b.DEPTTH) { return 1; }
  if (a.DEPTH == b.DEPTTH) {
    if (a.SUB_DEPTH < b.SUB_DEPTH) { return -1; }
    if (a.SUB_DEPTH > b.SUB_DEPTH) { return 1; }
  }
  return 0;
}

// HOST 정보 Data Parser
function fn_hostParser(hostList) {
  var hostData = {};
  for (var i=0; i<hostList.length; i++){
    var server = hostList[i].SERVER;

    var arr = new Array();
    for (var j=0; j<hostList.length; j++){
    if (server == hostList[j].SERVER){
        arr.push(hostList[j]);
      }
    }
    hostData[server] = arr;
  }
  console.log('hostData', hostData);
  return hostData;
}

function fn_updateCard() {
  alert("app.card upd");
}
function fn_deleteCard() {
  alert("app.card del");
}

var gfn = {
  nvl : function(str){
    if (typeof str == "undefined" || str == null || str == "") {
      str = "";
    }
    return str;
  },
  nvl2 : function(str, defaultVal){
    if (gfn.nvl2(str) == "") {
      str = defaultVal;
    }
    return str;
  },
  stringParserJson : function(str, separator, keySeparator) {
    if (gfn.nvl(str) == ''){ return; }
    var map = str.split(separator);
    var result = [];
    Array.from(map).forEach((el) => {
      var key = el.split(keySeparator)[0];
      var val = el.split(keySeparator)[1];
      result[key] = val;
    });
    return result;
  },
  console : function(msg, data) {
    console.log('['+app.appVer.verName+']', msg, data);
  }
};

/*****************************************************************************
 *
 * Methods for dealing with the model
 *
 ****************************************************************************/
  // #서버 GET 통신
  app.getServerDate = function(sheetName) {
    // var id = app.userInfo.id;
    var id = document.getElementById('userKey').value;
    var url = 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?'
        + 'id=' + id + '&'
        + 'sheet_name=' + sheetName;

    // 캐싱 데이터 매핑
    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.list;
            // console.log('[app.getServerDate] 캐시 매핑', results);
            gfn.console('[app.getServerDate.'+sheetName+'] 캐시 매핑', results);
            app.processMappingData(sheetName, results);
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
          gfn.console('[app.getServerDate.'+sheetName+'] 서버 통신', results);
          app.processMappingData(sheetName, results);
        }
      } else {
        // Return the initial weather forecast since no data is available.
        gfn.console('[app.getServerDate.'+sheetName+'] 서버 통신 실패');
        // app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  }

  // #서버(캐시) 데이터 매핑 프로세스
  app.processMappingData = function(sheetName, data){
    if (data.length <= 0) {
      return;
    }
    switch (sheetName) {
      case 'MENU':
        app.updateSidebar(data);
        app.getServerDate('LINKS');
        app.saveToStorage('menuData', data);
        break;
      case 'LINKS':
        app.updateViewLinkCardSection(data);
        app.saveToStorage('linksData', data);
        app.saveToStorage('userInfo', {'id': document.getElementById('userKey').value});
        document.getElementById('btnRefresh').children[0].classList.remove('w3-spin');
        break;
      case 'HOST':
        app.saveToStorage('hostData', fn_hostParser(data));
        break;
      default:
    }
  }

  // POST 통신
  // var xhr = new XMLHttpRequest();
  // var formData = new FormData();
  // formData.append('name', 'zerocho');
  // formData.append('birth', 1994);
  // xhr.onload = function() {
  //   if (xhr.status === 200 || xhr.status === 201) {
  //     console.log(xhr.responseText);
  //   } else {
  //     console.error(xhr.responseText);
  //   }
  // };
  // xhr.open('POST', 'https://www.zerocho.com/api/post/formdata');
  // xhr.send(formData); // 폼 데이터 객체 전송

  app.saveToStorage = function(key, val){
    app[key] = val;
    localStorage[key] = JSON.stringify(val);
  }
/************************************************************************
 * Code required to start the app
 ************************************************************************/
  app.userInfo = localStorage.userInfo;
  gfn.console('init', localStorage.userInfo)
  if (app.userInfo) {
    // 1. User 정보
    app.userInfo = JSON.parse(localStorage.userInfo);
    document.getElementById('userKey').value = app.userInfo.id;

    // 2. Host 정보
    app.hostData = JSON.parse(localStorage.hostData);

    // 3. Menu 정보
    app.menuData = JSON.parse(localStorage.menuData);
    app.updateSidebar(app.menuData);

    // 4. Link 정보
    app.linksData = JSON.parse(localStorage.linksData);
    app.updateViewLinkCardSection(app.linksData);
  } else {
    console.log("localStorage not available");
  // app.updateForecastCard(initialWeatherForecast);
  // app.selectedCities = [
  //   {key: initialWeatherForecast.key, label: initialWeatherForecast.label}
  // ];
  // app.saveSelectedCities();

  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
