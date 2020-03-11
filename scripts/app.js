(function() {
  'use strict';

  var app = {
    appName  : 'Link Manager',
    appPath  : '/link-manager.pwa',
    appVer   : {verName: '0.4.3', verCode:'20200311.01'},
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

  document.getElementById('btnNewRegReset').addEventListener('click', function() {
    var formControlEl = document.querySelectorAll('#menuNewRegLink .form-control');
      Array.from(formControlEl).forEach((el) => {
        el.value = '';
      });
  });

  document.getElementById('btnNewRegLink').addEventListener('click', function() {
    if (!confirm("등록하시겠습니까?")){
      return;
    }

    var emptyValue = false;
    if (!emptyValue){
      app.setServerData('LINKS');
    }
  });

  document.getElementById('btnSyncStart').addEventListener('click', function() {
    app.startSyncFromServer();
  });

  document.getElementById('btnReset').addEventListener('click', function() {
    if (confirm('캐시 데이터를 초기화합니다.')){
      localStorage.clear();
      location.reload();
    }
  });

  document.getElementById('btnReset').addEventListener('click', function() {
    if (confirm('캐시 데이터를 초기화합니다.')){
      localStorage.clear();
      location.reload();
    }
  });

  document.getElementById('btnSettingServer').addEventListener('click', function() {
    document.getElementById('modalSettingServer').style.display = "block";
  });




  $("button.add-param-list").click(function(){
    var item = $(this).parents('li.list-group-item').clone(true);
    item.find('.form-control').each(function(idx, el){
      el.value = '';
    });
    item.appendTo($(this).parents('ul.list-group'));
  })

  $('[name="form-params"] [aria-label="param-name"]').change(function(){
    if ( $(this).parents('li.list-group-item').next().length > 0 ){
      return;
    }
    var item = $(this).parents('li.list-group-item').clone(true);
    item.find('.form-control').each(function(idx, el){
      el.value = '';
      el.readOnly = false;
    });
    item.appendTo($(this).parents('ul.list-group'));
  });

  $('[name="form-params"] .form-control[readonly]').dblclick(function(){
    $(this).prop('readonly', false);
  });

  $('[name="form-params"] button.del-param-list').click(function(){
    if ( $(this).parents('li.list-group-item').siblings().length < 1 ){
      var item = $(this).parents('li.list-group-item').clone(true);
      item.find('.form-control').each(function(idx, el){
        el.value = '';
        el.readOnly = false;
      });
      item.appendTo($(this).parents('ul.list-group'));
    }
    $(this).parents('li.list-group-item').remove();
  });

  $('#menuNewRegLink .form-control.change-check').change(function(){
    console.log('change');
    if ( this.name == 'fullpath' ){
      fn_setFullpath();
    } else {
      fn_getFullpath();
    }
  });

  $('#menuNewRegLink .form-control.change-check').keyup(function(){
    console.log('keypress');
    if ( this.name == 'fullpath' ){
      fn_setFullpath();
    } else {
      fn_getFullpath();
    }
  });
  function fn_setFullpath(){
    var fullpath = $('input[name="fullpath"]').val().trim();
    var url = fn_parserUrl(fullpath);
  }

  function fn_getFullpath(){
    var form_host = $('#menuNewRegLink .form-control[name="host"]').val();
    var form_menu = $('#menuNewRegLink .form-control[name="menu"]').val();
    var form_pathname = $('#menuNewRegLink .form-control[name="pathname"]').val();

    try {
      var fullpath = app.hostData[form_host][0].ORIGIN + '/' + form_pathname + '?';
      $('#menuNewRegLink .form-control[name="param_name"]').each(function(idx, el){
        console.log(el.value);
        if (gfn.nvl(el.value.trim()) != ""){
          var param_value = $('#menuNewRegLink .form-control[name="param_value"]').eq(idx).val();
          fullpath  += el.value + '=' + gfn.nvl(param_value) + "&";
        }
      });
      fullpath = fullpath.substr(0, fullpath.length-1);
      $('#menuNewRegLink .form-control[name="fullpath"]').val(fullpath);
    } catch(err) {
      console.log(err);
    }
  }

  function fn_parserUrl(url){
    var data = {url: url, attr: {}};
    // var prop = ["fullpath", "protocol", "username", "password", "host", "port", "pathname", "querystring", "fragment"].map(v => {
    //   return { key: v, value: '' }
    // });
    var prop = ["fullpath", "protocol", "username", "password", "host", "port", "pathname", "querystring", "fragment"];

    const regex = /^((\w+):)?\/\/((\w+)?(:(\w+))?@)?([^\/\?:]+)(:(\d+))?(\/?([^\/\?#][^\?#]*)?)?(\?([^#]+))?(#(\w*))?/;
    var res = data.url.match(regex);
    if (res.length) {
        const position = [0, 2, 4, 6, 7, 9, 11, 13];
        const arr = [];
        for (let i = 0, len = position.length; i < len; i++) {
          data.attr[prop[i]] = res[position[i]];
          // arr.push(res[position[i]]);
        }
        // prop.map((v,i)=>{
        // 	v.value = arr[i];
        //   return v;
        // });
    }
    return data;
  }
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

  $(function(){
    // console.log('바로');
    // app.getServerDate('HOST');
    // app.getServerDate('MENU');
    // alert(app.appVer.verCode);
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

// #신규등록 Box의 Server정보 업데이트
app.updateServerListInForm = function(data){
  var selectBox = document.querySelector('#menuNewRegLink [name="host"]');
  $('#menuNewRegLink [name="host"] option:gt(0)').remove();
  $('#menuNewRegLink [name="host"]').val('');
  for (var key in data){
    var op = new Option(key, key);
    selectBox.options.add(op);
  }
  selectBox.options.add(new Option("미등록", " "));
}

// #신규등록 Box의 메뉴정보 업데이트
app.updateMenuListInForm = function(data){
  var selectBox = document.querySelector('#menuNewRegLink [name="menu"]');
  $('#menuNewRegLink [name="menu"] option:gt(0)').remove();
  $('#menuNewRegLink [name="menu"]').val('');
  for (var i=0; i<data.length; i++){
    var op = new Option(data[i].MENU_NAME, data[i].MENU_CODE);
    selectBox.options.add(op);
  }
}
// #전체 동기화 진행
app.startSyncFromServer = function(){
  document.getElementById('btnSyncStart').children[0].classList.add('w3-spin');
  document.getElementById('loading').classList.add('w3-show');

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
      document.getElementById('btnSyncStart').children[0].classList.remove('w3-spin');
      document.getElementById('loading').classList.remove('w3-show');
      alert('동기화를 실패하였습니다.');
      clearInterval(timerSync);
      clearInterval(timer1);
    }
    curTime += 500;
  }, 500);

  var timerSync = setInterval(function(){
    if (app.syncConfig.hostSync && app.syncConfig.menuSync && app.syncConfig.linksSync){
      var date = new Date();
      app.saveToStorage('lastSyncDt', date);
      document.getElementById('lastSyncDt').textContent = gfn.formatDate(date);
      document.getElementById('btnSyncStart').children[0].classList.remove('w3-spin');
      document.getElementById('loading').classList.remove('w3-show');
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

// 서버 result data Json으로 parser
function fn_makeJsonData(data){
  var result = [];
  var header = data[0];
  for (var i=1; i<data.length; i++){
    var json = {};
    var row = data[i];
    for (var j=0; j<header.length; j++){
      json[header[j]] = row[j];
    }
    result.push(json);
  }
  return result;
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

// 등록화면에서 param key와 value 가져오기
function fn_getParamList(){
  var params = "";
  var nameList = document.formNewRegLink.param_name;
  var valueList = document.formNewRegLink.param_value;
  for (var i=0; i<nameList.length; i++){
    var name = nameList[i].value;
    if (gfn.nvl(name) != ""){
      params += name + "=" + valueList[i].value + "&";
    }
  }
  // return encodeURIComponent(params);
  params = params.substr(0, params.length-1);
  return params;
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
    var url = 'https://script.google.com/macros/s/AKfycbzGO-mgwC6G79z6eK1EsKYz-nsMH_HQYNZsy-qQxuHIHud4sAQ/exec?'
        + 'id=' + id + '&'
        + 'sheet_name=' + sheetName + '&'
        + 'q=SELECT * WHERE 1=1';

    // 캐싱 데이터 매핑
    if (onlyServer != true && 'caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var list = json.result.list;
            var results = fn_makeJsonData(list);
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
          var list = response.result.list;
          var results = fn_makeJsonData(list);
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
        app.updateMenuListInForm(app.menuData);
        break;
      case 'LINKS':
        app.updateViewLinkCardSection(data);
        app.saveToStorage('linksData', data);
        break;
      case 'HOST':
        app.saveToStorage('hostData', fn_hostParser(data));
        app.updateServerListInForm(app.hostData);
        break;
      default:
    }
    app.syncConfig[sheetName.toLowerCase()+'Sync'] = true;
  }

  // POST 통신
  app.setServerData = function(sheetName){
    console.log(sheetName);
    var id = app.userInfo.userKey;
    var url = 'https://script.google.com/macros/s/AKfycbzGO-mgwC6G79z6eK1EsKYz-nsMH_HQYNZsy-qQxuHIHud4sAQ/exec?';
        // + 'id=' + id + '&'
        // + 'sheet_name=' + sheetName;
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('sheet_name', 'LINKS');
    formData.append('id', id);
    formData.append('KEY', id);

    switch (sheetName) {
      case 'MENU':
        break;
      case 'LINKS':
        var link = {};
        link['TITLE'] = document.formNewRegLink.linktitle.value;
        link['SERVER'] = document.formNewRegLink.host.value;
        link['MENU_CODE'] = document.formNewRegLink.menu.value;
        link['PATHNAME'] = document.formNewRegLink.pathname.value;
        link['PARAMS'] = fn_getParamList();
        link['SEQ'] = " ";
        link['CREATED'] = new Date();

        formData.append('TITLE', link.TITLE);
        formData.append('SERVER', link.SERVER);
        formData.append('MENU_CODE', link.MENU_CODE);
        formData.append('PATHNAME', link.PATHNAME);
        formData.append('PARAMS', link.PARAMS);
        formData.append('SEQ', " ");

        app.updateLinkCard(link);
        app.linksData.push(link);
        localStorage["linksData"] = JSON.stringify(app.linksData);
        break;
      case 'HOST':
        break;
      default:
    }

    xhr.onload = function() {
      if (xhr.status === 200 || xhr.status === 201) {
        console.log(xhr.responseText);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open('POST', url);
    xhr.send(formData); // 폼 데이터 객체 전송
  }

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
      app.updateServerListInForm(app.hostData);
    }

    // 3. Menu 정보
    if (localStorage.menuData){
      app.menuData = JSON.parse(localStorage.menuData);
      app.updateSidebar(app.menuData);
      app.updateMenuListInForm(app.menuData);
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
