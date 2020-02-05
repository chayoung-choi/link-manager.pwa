(function() {
  'use strict';

  var app = {
    appName  : 'Link Manager',
    appPath  : '/link-manager.pwa',
    appVer   : {verName: '0.2.6', verCode:'20200205.03'},
    userInfo : {id: '', userKey: ''},
    lastSyncDt : '0',
    syncConfig : {hostSync: false, menuSync: false, linksSync: false},
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
  document.getElementById('navFooterAppVer').textContent = 'APP VER '+app.appVer.verName;

  // #사이드바 > userKey button 클릭 시
  document.getElementById('btnUserKey').addEventListener('click', function() {
    document.getElementById('boxUserKey').classList.remove('w3-hide');
    document.getElementById('btnUserKey').classList.add('w3-hide');
  });

  // #사이드바 > userKey 수정 시
  document.getElementById('userKey').addEventListener('change', function(){
    changeUserKey();
  });
  document.querySelector('#boxUserKey .icon').addEventListener('click', function(){
    changeUserKey();
  });
  function changeUserKey(){
    var elBtnUserKey = document.getElementById('btnUserKey');
    var elBoxUserKey = document.getElementById('boxUserKey');
    var elUserKey = document.getElementById('userKey');

    if ( elUserKey.value != elBtnUserKey.textContent ){
      if (confirm('user-key 변경 시 동기화를 진행합니다.')){
        elBtnUserKey.textContent = elUserKey.value;
        elBtnUserKey.classList.add('w3-hide');
        app.startSyncFromServer();
      } else {
        elUserKey.value = elBtnUserKey.textContent;
      }
    }
    elBoxUserKey.classList.add('w3-hide');
    elBtnUserKey.classList.remove('w3-hide');
  }

  document.getElementById('btnSyncStart').addEventListener('click', function() {
    app.startSyncFromServer();
  });

  async function processLogin(){
    gfn.console('processLogin', 'processLogin');
    $('#loading').show();
    var id = document.getElementById('userId').value;
    var pw = document.getElementById('userPw').value;

    if (id == 'smos' && pw == '1234'){
      fn_availableBody(true);
      var autoLogin = document.getElementById('autoLogin').checked;
      var userInfo = {'id': id, 'userKey': id, 'autoLogin': autoLogin};
      app.saveToStorage('userInfo', userInfo);
      await app.getServerDate('HOST');
      await app.getServerDate('MENU');
    } else {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
    $('#loading').hide();
  }
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

// #Link Card List Update
app.updateLinkCardList = function(data){
  Array.from(data).forEach((el) => {
    app.updateLinkCard(el);
  });
}

// #Link Card Update
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

// #전체 동기화 진행
app.startSyncFromServer = function(){
  document.getElementById('btnSyncStart').children[0].classList.add('w3-spin');
  for (var key in app.syncConfig) {
    app.syncConfig[key] = false;
  }

  var id = document.getElementById('userKey').value;
  var userInfo = {'id': id, 'userKey': id};
  app.saveToStorage('userInfo', userInfo);

  app.getServerDate('MENU', true);
  app.getServerDate('HOST', true);

  var LIMIT_TIME = 30000;
  var curTime = 0;
  var timer1 = setInterval(function(){
    if (app.syncConfig.hostSync && app.syncConfig.menuSync){
      clearInterval(timer1);
      app.getServerDate('LINKS', true);
    } else if (curTime >= LIMIT_TIME){
      clearInterval(timer1);
      clearInterval(timerSync);
      alert('동기화를 실패하였습니다.');
    }
    curTime += 500;
  }, 500);

  var timerSync = setInterval(function(){
    if (app.syncConfig.hostSync && app.syncConfig.menuSync && app.syncConfig.linksSync){
      var date = new Date();
      app.saveToStorage('lastSyncDt', date);
      document.getElementById('lastSyncDt').textContent = gfn.formatDate(date);
      document.getElementById('btnSyncStart').children[0].classList.remove('w3-spin');
      clearInterval(timerSync);
    }
  }, 1000);
}

function asyncFunction1() {
  return new Promise(function (resolve) {
    setTimeout(function() {
      console.log(1)
      resolve()
    }, 1000)
  })
}
function asyncFunction2() {
  return new Promise(function (resolve) {
    setTimeout(function() {
      console.log(2)
      resolve()
    }, 1000)
  })
}
function asyncFunction3() {
  return new Promise(function (resolve) {
    setTimeout(function() {
      console.log(3)
      resolve()
    }, 2000)
  })
}
function asyncFunction4() {
  return new Promise(function (resolve) {
    setTimeout(function() {
      resolve('AAA')
    }, 3000)
  })
}
function asyncFunction5() {
  return new Promise(function (resolve) {
    while (!app.syncDate.hostData) {
      sleep(1000);
    }
    resolve();
  })
}
async function async1() {
  const result = await asyncFunction4()
  // await 키워드로 다른 promise를 반환하는 함수의 실행 결과값을 변수에 담을 수 있습니다.
  console.log(result) // 111
}

async function async2() {
  let result;
  try {
    result = await asyncFunction4();
  } catch (error) { // await에서 발생한 에러는 모두 아래 catch 블록에 걸립니다.
    console.log(error);
  }
  if (result === 'AAA') { // if문 분기도 일반 동기함수처럼 작성 가능합니다.
      alert(result);
    }
  console.log(result);
  return result;
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
  return hostData;
}

function fn_updateCard() {
  alert("app.card upd");
}
function fn_deleteCard() {
  alert("app.card del");
}

// 로그인 화면 활성화
function fn_availableBody(b){
  if (b){
    document.getElementById('loading').style.display = 'none';
    document.getElementById('body').style.display = 'block';
    document.getElementById('modalLogin').style.display = 'none';
  } else {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('body').style.display = 'none';
    document.getElementById('modalLogin').style.display = 'block';
  }
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
  localStorageParserJson : function(data){
    if (gfn.nvl(data) != ''){
      return JSON.parse(localStorage.hostData);
    }
  },
  lpadZero : function(val, len, separator){
    var result = new String(val);
    var valLen = result.length;
    for (var i=valLen; i<len; i++){
      result = separator + '' + result;
    }
    return result;
  },
  zero2 : function(val){
    return gfn.lpadZero(val, 2, '0');
  },
  formatDate : function(date, format){
    if (format == null){
      var hh = date.getHours();
      if (hh > 12){ hh = '오후 ' + (hh-12);
      } else if (hh == 12){ hh = '오후 ' + hh;
      } else { hh = '오전 ' + hh; }

      return (date.getMonth()+1)+'월 '+ date.getDate()+'일 '
              + hh+':'+gfn.zero2(date.getMinutes());
    } else if (format.toLowerCase() == 'yyyymmdd24hhmiss'){
      return date.getFullYear()+gfn.zero2((date.getMonth()+1))+gfn.zero2(date.getDate())
              +gfn.zero2(date.getHours())+gfn.zero2(date.getMinutes())+gfn.zero2(date.getSeconds());
    } else if (format.toLowerCase() == 'yyyy.mm.dd 24hh:mi:ss'){
      return date.getFullYear()+'.'+gfn.zero2((date.getMonth()+1))+'.'+gfn.zero2(date.getDate())
              +' '+gfn.zero2(date.getHours())+':'+gfn.zero2(date.getMinutes())+':'+gfn.zero2(date.getSeconds());
    } else if (format.toLowerCase() == 'yyyy.mm.dd 24hh:mi'){
      return date.getFullYear()+'.'+gfn.zero2((date.getMonth()+1))+'.'+gfn.zero2(date.getDate())
              +' '+gfn.zero2(date.getHours())+':'+gfn.zero2(date.getMinutes());
    }
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
  app.getServerDate = function(sheetName, onlyServer) {
    // var id = app.userInfo.id;
    var id = app.userInfo.userKey;
    var url = 'https://script.google.com/macros/s/AKfycbzblyyKhXtgiWvkQaWRMObrq1BrazFJ1Bae2DEH5GQqg3VwMVM/exec?'
        + 'id=' + id + '&'
        + 'sheet_name=' + sheetName;

    // 캐싱 데이터 매핑
    if (onlyServer != true && 'caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.list;
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
      // } else {
        // Return the initial weather forecast since no data is available.
        // gfn.console('[app.getServerDate.'+sheetName+'] 서버 통신 실패');
        // app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  }

  // #서버(캐시) 데이터 매핑 프로세스
  app.processMappingData = function(sheetName, data){
    if (data.length <= 0) {
      app.syncConfig[sheetName.toLowerCase()+'Sync'] = true;
      return;
    }
    switch (sheetName) {
      case 'MENU':
        app.updateSidebar(data);
        app.saveToStorage('menuData', data);
        break;
      case 'LINKS':
        app.updateViewLinkCardSection(data);
        app.saveToStorage('linksData', data);
        break;
      case 'HOST':
        app.saveToStorage('hostData', fn_hostParser(data));
        break;
      default:
    }
    app.syncConfig[sheetName.toLowerCase()+'Sync'] = true;
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
  gfn.console('init', app.appVer.verCode);
  if (app.userInfo) {
    // 1. User 정보
    app.userInfo = JSON.parse(localStorage.userInfo);
    if (!app.userInfo.id) {
      gfn.console('init', 'no id');
      return;
    }
    gfn.console('init', localStorage.userInfo);

    // 2. Host 정보
    if (localStorage.hostData){
      app.hostData = JSON.parse(localStorage.hostData);
    }

    // 3. Menu 정보
    if (localStorage.menuData){
      app.menuData = JSON.parse(localStorage.menuData);
      app.updateSidebar(app.menuData);
    }

    // 4. Link 정보
    if (localStorage.linksData){
      app.linksData = JSON.parse(localStorage.linksData);
      app.updateViewLinkCardSection(app.linksData);
    }

    // 5. 동기화 시간
    app.lastSyncDt = JSON.parse(localStorage.lastSyncDt);
    console.log('lastSyncDt', new Date(app.lastSyncDt));
    document.getElementById('lastSyncDt').textContent = gfn.formatDate(new Date(app.lastSyncDt));
  } else {
    console.log("localStorage not available");
    // fn_availableBody(false);
    // app.lastSyncDt = JSON.parse(localStorage.lastSyncDt);
    // document.getElementById('lastSyncDt').textContent = gfn.formatDate(new Date(app.lastSyncDt));
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
