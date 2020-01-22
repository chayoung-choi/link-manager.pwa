(function() {
  'use strict';

  var app = {
    appName  : 'Link Manager',
    appPath  : '/link-manager.pwa',
    appVer   : {verName: "0.1.2", verCode:"20200116.01"},
    userInfo : {id: 'smos'},
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
  // document.getElementById('butRefresh').addEventListener('click', function() {
  //
  // });
  var linkCards = document.querySelectorAll(".link-card");
  var btnDelete = document.querySelectorAll(".btn-delete");
  var btnUpdate = document.querySelectorAll(".btn-update");

// [Card -> update btn]
  Array.from(btnUpdate).forEach((el) => {
    el.addEventListener('click', function(){
      alert("수정");
    });
  });

// [Card -> delete btn]
  Array.from(btnDelete).forEach((el) => {
    el.addEventListener('click', function(){
      alert("삭제");
    });
  });

  // document.getElementById('menuHome').addEventListener('click', function(){
  //   app.getServerDate('MENU');
  // });
  $(function(){
    console.log('바로');
    app.getServerDate('HOST');
    app.getServerDate('MENU');
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

// #메인 lINKS CARD 설정
app.updateLinkCards = function(data) {
  document.getElementById('linksSection').innerHTML = '';
  var mainSectionTemplate = document.getElementById('mainSectionTemplate');

  // #1. section 설정
  var menuList = app.menuData;
  for (var i=0; i<menuList.length; i++){
    var clonContent = mainSectionTemplate.content.cloneNode(true);
    var section = clonContent.querySelector('.main-section');
    var hr = document.createElement('hr');
    var menuCode = menuList[i].MENU_CODE;

    section.id = menuCode;
    section.querySelector('.section-title b').textContent = menuList[i].MENU_NAME+'.';
    document.getElementById('linksSection').appendChild(section);
    document.getElementById('linksSection').appendChild(hr);

    // #2. card 설정
    for (var j=0; j<linkList.length; j++){
      var link = linkList[j];
      if ( menuCode == link.MENU_CODE ){
        var card = clonContent.querySelector('.link-card').cloneNode(true);
        card.querySelector('.card-title').textContent = link.TITLE;
        card.dataset.linkId = link.SEQ;
        card.dataset.updated = link.UPDATED;
        document.getElementById(link.MENU_CODE).querySelector('.link-content').appendChild(card);
      }
    }
  }
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
            console.log('[app.getServerDate] 캐시 매핑', results);
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
          console.log('[app.getServerDate.'+sheetName+'] 서버 통신 성공', results);

          switch (sheetName) {
            case 'MENU':
              app.updateSidebar(results);
              app.getServerDate('LINKS');
              app.menuData = results;
              break;
            case 'LINKS':
              app.updateLinkCards(results);
              break;
            case 'HOST':
              app.hostData = fn_hostParser(results);
              break;
            default:

          }
        }
      } else {
        // Return the initial weather forecast since no data is available.
        console.log('[app.getServerDate] 서버 통신 실패');
        // app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
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


  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker
  //            .register('./service-worker.js')
  //            .then(function() { console.log('Service Worker Registered'); });
  // }
})();
