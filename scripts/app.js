(function() {
  'use strict';

  var app = {
    appName  : 'Link Manager',
    appPath  : '/link-manager.pwa',
    appVer   : {verName: '1.0.2', verCode:'20200527.01'},
    userInfo : {id: '', userKey: ''},
    lastSyncDt : '0',
    menuData : {},
    hostData : {},
    linksData : {},
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

  // [Link 등록 > '취소' 버튼]
  document.getElementById('btnLinkMgmtReset').addEventListener('click', function() {
    $("#modalLinkMgmt").hide();
  });

  // [Link 등록 > '등록' 버튼]
  // document.getElementById('btnLinkMgmtSave').addEventListener('click', function() {
  //   if (!confirm("등록하시겠습니까?")){ return; }
  //
  //   var emptyValue = false;
  //   if (!emptyValue){
  //     app.insertServerLinkCard()
  //     $('#modalLinkMgmt').hide();
  //   }
  // });

  document.getElementById('btnSyncStart').addEventListener('click', function() {
    app.startSyncFromServer();
  });

  document.getElementById('btnReset').addEventListener('click', function() {
    if (confirm('캐시 데이터를 초기화합니다.')){
      localStorage.clear();
      location.reload();
    }
  });

  // [Sidebar Menu 클릭 이벤트 적용]
  Array.prototype.forEach.call(document.querySelectorAll('nav .nav-sidebar a'), (el, index) => {
    el.addEventListener('click', function(){
      app.clickNavSidebarMenu(el.id);
    });
  });

  document.getElementById('btnSettingServer').addEventListener('click', function() {
    fn_getServerInfo();
    document.getElementById('modalSettingServer').style.display = "block";
  });

  document.getElementById('modalServerSelectBox').addEventListener('change', function() {
    fn_getServerList(this.value);
  });
  document.getElementById('btnModalAddServer').addEventListener('click', function() {

  });
  document.getElementById('btnSaveServer').addEventListener('click', function() {

  });

  // [Link 관리 > Server Change 이벤트]
  document.querySelector("#modalLinkMgmt [name='host']").addEventListener('change', function(){
    if ( this.value == ' ' ){
      $('#txtPathname').text('URL');
      $('#modalLinkMgmt #slash').hide();
    } else {
      $('#txtPathname').text('Pathname');
      $('#modalLinkMgmt #slash').show();
    }
  });

  // [Link 관리 > Param Name 변경 시 Param Row 추가]
  document.querySelector("#modalLinkMgmt [name='param_name']").addEventListener('change', function(){
    console.log("appendParamItem");
    var item = $(this).parents('li.list-group-item');
    if ( item.nextAll().length < 1 ){
      appendParamItem();
    }
  });

  // [Link 관리 > Param 삭제 버튼 클릭]
  document.querySelector("#modalLinkMgmt .btn.del-param-list").addEventListener('click', function(){
    console.log("clickParamDelBtn", $(this),  $(this).parents('li.list-group-item').siblings().length);
    var item = $(this).parents('li.list-group-item');
    if ( item.siblings().length < 1 ){
      item.find('.form-control').each(function(idx, el){
        el.value = '';
      });
    } else {
      item.remove();
    }
    fn_getFullpath();
  });

  // [Link 관리 > Param value 변경시]
  const modalLinkMamtChangeCheckList = document.querySelectorAll("#modalLinkMgmt .form-control.change-check");
  modalLinkMamtChangeCheckList.forEach(function(changeInput){
    changeInput.addEventListener("change", fn_getFullpath);
    changeInput.addEventListener("keyup", fn_getFullpath);
  });

  // [Link 관리 > param list 초기화]
  function initParamItem(){
    var group = document.querySelector("#modalLinkMgmt [name='form-params'] .list-group");
    group.querySelectorAll(".list-group-item:not(:first-child)").forEach(function(li){
      li.remove();
    })
    var item = group.querySelector(".list-group-item");
    item.getElementsByClassName("form-control")[0].value = '';
    item.getElementsByClassName("form-control")[1].value = '';
  }

  // [Link 관리 > param list element 추가]
  function appendParamItem(){
    var group = document.querySelector("#modalLinkMgmt [name='form-params'] .list-group");
    var item = group.querySelector(".list-group-item:first-child").cloneNode(true);
    item.getElementsByClassName("form-control")[0].value = '';
    item.getElementsByClassName("form-control")[1].value = '';

    var inputList = item.querySelectorAll(".form-control.change-check");
    for (var i=0; i<inputList.length; i++){
      inputList[i].addEventListener("change", fn_getFullpath);
      inputList[i].addEventListener("keyup", fn_getFullpath);
    }

    item.querySelector(".form-control[name='param_name']").addEventListener('change', function(){
      if ( this.parentElement.parentElement.nextElementSibling == null ){ // li.list-group-item
        appendParamItem();
      }
    });

    item.querySelector("button.del-param-list").addEventListener("click", function(){
      clickParamDelBtn();
    });
    group.appendChild(item);
  }

  // [Link 관리 > param list의 Delete 버튼 클릭]
  function clickParamDelBtn(){
    var targetRow = event.target.parentElement.parentElement.parentElement; // li.list-group-item
    if ( event.target.nodeName == "B" ){
      targetRow = targetRow.parentElement;
    }

    if ( targetRow.parentNode.querySelectorAll(".list-group-item").length > 1 ){
      targetRow.remove();
    } else {
      targetRow.getElementsByClassName("form-control")[0].value = '';
      targetRow.getElementsByClassName("form-control")[1].value = '';
    }
    fn_getFullpath();
  }

  // [Link 관리 > Server Change 이벤트]
  // $('#modalLinkMgmt .form-control.change-check').change(fn_getFullpath);
  // $('#modalLinkMgmt .form-control.change-check').on('keyup', function(){ fn_getFullpath(); });
  // $('#modalLinkMgmt .form-control.change-check').change(function(){
  //   fn_getFullpath();
  // });
  // $('#modalLinkMgmt .form-control.change-check').keyup(function(){
  //   fn_getFullpath();
  // });


  function fn_getFullpath(){
    var form_menu = $('#modalLinkMgmt .form-control[name="menu"]').val();
    var form_host = $('#modalLinkMgmt .form-control[name="host"]').val();
    var form_pathname = $('#modalLinkMgmt .form-control[name="pathname"]').val();

    try {
      var fullpath = "";
      if ( gfn.nvl(app.hostData[form_host]) != "" ){
        fullpath = app.hostData[form_host][0].ORIGIN + "/";
      }

      $('#modalLinkMgmt .form-control[name="param_name"]').each(function(idx, el){
        if (idx == 0){ fullpath += form_pathname + '?'; }
        if (gfn.nvl(el.value.trim()) != ""){
          var param_value = $('#modalLinkMgmt .form-control[name="param_value"]').eq(idx).val();
          fullpath  += el.value + '=' + gfn.nvl(param_value) + "&";
        }
      });
      fullpath = fullpath.substr(0, fullpath.length-1);
      $('#modalLinkMgmt .form-control[name="fullpath"]').val(fullpath);
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

  // 서버 정보 팝업
  function fn_getServerInfo(){
    var hostData = app.hostData;
    $('#modalSettingServer select[name="host"] option:not(:first-child)').remove();
    var selectBox = document.querySelector('#modalSettingServer select[name="host"]');

    for (var key in hostData){
      var op = new Option(key, key);
      selectBox.options.add(op);
    }
  }

  // 서버 정보 팝업에서 서버 변경시
  function fn_getServerList(server){
    var data = app.hostData[server];
    var list = document.querySelector('#modalSettingServer .list-group-item:last-child');
    $('#modalSettingServer .list-group-item:not(:first-child)').remove();
    for (var i=0; i<data.length; i++){
      var el = data[i];
      var temp = list.cloneNode(true);
      temp.querySelectorAll('.form-control')[0].value = el.TYPE;
      temp.querySelectorAll('.form-control')[1].value = el.NAME;
      temp.querySelectorAll('.form-control')[2].value = el.ORIGIN;
      document.querySelector('#modalSettingServer .list-group').appendChild(temp);
    }
  }

  // [Link 관리창 서버 SelectBox 설정]
  function getHostBoxOnLinkMgmt(val){
    var selectBox = document.querySelector('#modalLinkMgmt [name="host"]');
    $('#modalLinkMgmt [name="host"] option:gt(0)').remove();
    for (var key in app.hostData){
      var op = new Option(key, key);
      selectBox.options.add(op);
    }
    selectBox.options.add(new Option("직접입력", " "));
    $('#modalLinkMgmt [name="host"]').val(val);
  }

  // [Link 관리창 메뉴 SelectBox 설정]
  function getMenuBoxOnLinkMgmt(val){
    var data = app.menuData;
    var selectBox = document.querySelector('#modalLinkMgmt [name="menu"]');
    $('#modalLinkMgmt [name="menu"] option:gt(0)').remove();
    for (var i=0; i<data.length; i++){
      var op = new Option(data[i].MENU_NAME, data[i].MENU_CODE);
      selectBox.options.add(op);
    }
    $('#modalLinkMgmt [name="menu"]').val(val);
  }



  // async function processLogin(){
  //   gfn.console('processLogin', 'processLogin');
  //   $('#loading').show();
  //   var id = document.getElementById('userId').value;
  //   var pw = document.getElementById('userPw').value;
  //
  //   if (id == 'smos' && pw == '1234'){
  //     fn_availableBody(true);
  //     var autoLogin = document.getElementById('autoLogin').checked;
  //     var userInfo = {'id': id, 'userKey': id, 'autoLogin': autoLogin};
  //     app.saveToStorage('userInfo', userInfo);
  //     await app.getServerDate('HOST');
  //     await app.getServerDate('MENU');
  //   } else {
  //     alert("아이디 또는 비밀번호가 일치하지 않습니다.");
  //   }
  //   $('#loading').hide();
  // }
  var linkCards = document.querySelectorAll(".link-card");
  var btnDelete = document.querySelectorAll(".btn-delete");
  var btnUpdate = document.querySelectorAll(".btn-update");

  // [Toast 띄우기]
  let removeToast;
  function toast(string) {
    const toast = document.getElementById("toast");
    toast.classList.contains("reveal") ?
      (clearTimeout(removeToast), removeToast = setTimeout(function () {
          document.getElementById("toast").classList.remove("reveal")
      }, 1000)) :
      removeToast = setTimeout(function () {
          document.getElementById("toast").classList.remove("reveal")
      }, 3000)
    toast.classList.add("reveal"),
      toast.innerText = string;
  }

  $(function(){
    // console.log('바로');
    // app.getServerDate('HOST');
    // app.getServerDate('MENU');
    // alert(app.appVer.verCode);
    // toast('안녕?');
  });

  // [Top Scroll 이동 버튼]
  window.onscroll = function() {scrollFunction()};
  document.getElementById('btnTopScroll').addEventListener('click', function (){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
  function scrollFunction() {
    if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
      document.getElementById('btnTopScroll').style.display = "block";
    } else {
      document.getElementById('btnTopScroll').style.display = "none";
    }
  }
/*****************************************************************************
 *
 * Methods to update/refresh the UI
 *
 ****************************************************************************/
// [사이드바 메뉴 리스트 설정]
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
    sideMenu.id = menu.MENU_CODE;
    // sideMenu.href = '#'+menu.MENU_CODE;
    sideMenu.textContent = menu.MENU_NAME;
    sideMenu.addEventListener('click', function(){
      app.clickNavSidebarMenu(this.id);
    });
    viewSidebar.appendChild(sideMenu);
  }
}

// [Main Link Card Section 업데이트]
app.updateViewLinkCardSection = function(){
  document.getElementById('viewLinkCardSection').innerHTML = '';
  var menuList = app.menuData;

  for (var i=0; i<menuList.length; i++){
    var clonContent = app.mainSectionTemplate.content.cloneNode(true);
    var section = clonContent.querySelector('.section-box');
    var hr = document.createElement('hr');
    var menuCode = menuList[i].MENU_CODE;

    section.id = menuCode + 'Section';
    section.querySelector('.section-title b').textContent = menuList[i].MENU_NAME+'.';
    document.getElementById('viewLinkCardSection').appendChild(section);
    document.getElementById('viewLinkCardSection').appendChild(hr);
  }
  // app.updateLinkCardList(data);
}

// [Link Card List 업데이트]
app.updateLinkCardList = function(data){
  Array.from(data).forEach((el) => {
    app.updateLinkCard(el);
  });
}

// [단일 Link Card 업데이트]
app.updateLinkCard = function(data){
  if (document.getElementById(data.MENU_CODE) == null) { return; }

  var linkId = data.SERVER + "-" + data.SEQ;
  var card = document.querySelector("[data-link-id='"+ linkId +"']");
  if (card == null){
    card = app.mainSectionTemplate.content.querySelector('.link-card').cloneNode(true);
    card.dataset.linkId =  data.SERVER + '-' + data.SEQ;
    card.querySelector('.btn-update').addEventListener('click', function(){
      app.showLinkUpdateModal(data);
    });
    card.querySelector('.btn-delete').addEventListener('click', function(){
      if (!confirm('삭제하시겠습니까?')){ return; }
      app.deleteLinkCard(data);
    });
    document.getElementById(data.MENU_CODE+'Section').querySelector('.link-content').appendChild(card);
  }

  var updateDt = gfn.formatDate(new Date(data.UPDATED), 'yyyymmdd24hhmiss');
  if ( card.dataset.updated >= updateDt ){
    return;
  }
  card.querySelector('.card-title').textContent = data.TITLE;
  card.dataset.updated = updateDt;

  // param hashtag icon
  card.querySelector('.card-params').innerHTML = '';
  var clonParamTagIcon = app.mainSectionTemplate.content.querySelector('.param-tag');
  var paramJson = gfn.stringParserJson(data.PARAMS, '&', '=');
  for (var key in paramJson){
    var paramTagIcon = clonParamTagIcon.cloneNode(true);
    paramTagIcon.textContent = '#' + key;
    paramTagIcon.dataset[key] = paramJson[key];
    paramTagIcon.title = paramJson[key];
    paramTagIcon.addEventListener('click', function(){
      toast(this.title);
    });
    card.querySelector('.card-params').appendChild(paramTagIcon);
  }

  if (data.SERVER == " "){
    var fullUrl = data.PATHNAME + '?' + data.PARAMS;
    card.querySelector('.host-type-l').href = fullUrl;
  } else {
    // link url L,Q,O,W~
    Array.from(app.hostData[data.SERVER]).forEach((host) => {
      var hostType = host.TYPE.toLowerCase();
      var fullUrl = host.ORIGIN + data.PATHNAME + '?' + data.PARAMS;
      card.querySelector('.host-type-' + hostType).href = fullUrl;
    });
  }

}

// [Link Card 신규 등록 modal Show]
app.showLinkNewRegModal = function(){
  var modalLinkMgmt = document.getElementById('modalLinkMgmt');
  modalLinkMgmt.querySelector(".modal-title").textContent = "신규 등록";
  modalLinkMgmt.querySelector("#btnLinkMgmtSave").textContent = "등록";
  modalLinkMgmt.querySelector(".modal-link-data").dataset.action = "I";
  modalLinkMgmt.querySelector(".modal-link-data").dataset.seq = "temp-" + (new Date()).getTime();

  var formControlEl = document.querySelectorAll('#modalLinkMgmt .form-control');
  Array.from(formControlEl).forEach((el) => { el.value = ''; });

  var btnSave = modalLinkMgmt.querySelector("#btnLinkMgmtSave").cloneNode(true);
  btnSave.addEventListener('click', function(){
    if (!confirm("저장하시겠습니까?")){ return; }
    app.saveLinkMgmt();
    $('#modalLinkMgmt').hide();
  });
  modalLinkMgmt.querySelector("footer").replaceChild(btnSave, modalLinkMgmt.querySelector("#btnLinkMgmtSave"));

  getHostBoxOnLinkMgmt();
  getMenuBoxOnLinkMgmt();
  initParamItem();
  $("#modalLinkMgmt").show();
}

// [Link Card 수정 modal Show]
app.showLinkUpdateModal = function(data){
  var modalLinkMgmt = document.getElementById('modalLinkMgmt');
  modalLinkMgmt.querySelector(".modal-title").textContent = "Link 수정";
  modalLinkMgmt.querySelector("#btnLinkMgmtSave").textContent = "저장";
  modalLinkMgmt.querySelector(".modal-link-data").dataset.action = 'U';
  modalLinkMgmt.querySelector(".modal-link-data").dataset.seq = data.SEQ;
  modalLinkMgmt.querySelector("form [name='linktitle']").value = data.TITLE;
  modalLinkMgmt.querySelector("form [name='pathname']").value = data.PATHNAME.replace(/^\//, "");

  getMenuBoxOnLinkMgmt(data.MENU_CODE);
  getHostBoxOnLinkMgmt(data.SERVER);

  var btnSave = modalLinkMgmt.querySelector("#btnLinkMgmtSave").cloneNode(true);
  btnSave.addEventListener('click', function(){
    if (!confirm("저장하시겠습니까?")){ return; }
    app.saveLinkMgmt();
    $('#modalLinkMgmt').hide();
  });
  modalLinkMgmt.querySelector("footer").replaceChild(btnSave, modalLinkMgmt.querySelector("#btnLinkMgmtSave"));

  initParamItem();
  setParamList(data.PARAMS);
  fn_getFullpath();
  $("#modalLinkMgmt").show();
}

app.deleteLinkCard = function(data){
  for (var i=0; i<app.linksData.length; i++) {
    if ( app.linksData[i].SERVER == data.SERVER && app.linksData[i].SEQ == data.SEQ ){
      app.linksData.splice(i, 1);
      break;
    }
  }
  $("[data-link-id='"+ data.SERVER +"-"+ data.SEQ +"']").remove();
  app.deleteServerLinkCard(data);
}

app.updateLinkDataInStorage = function(link){
  var getIndexLinksData = (el) => el.SERVER == link.SERVER && el.SEQ == link.SEQ;
  console.log();
  var idx = app.linksData.findIndex(getIndexLinksData);
  if (idx > -1){
    app.linksData[idx] = link;
  }
}

app.saveLinkMgmt = function(){
  var link = {};
  link['action'] = document.formLinkMgmt.querySelector(".modal-link-data").dataset.action;
  link['SEQ'] = document.formLinkMgmt.querySelector(".modal-link-data").dataset.seq;
  link['TITLE'] = document.formLinkMgmt.linktitle.value;
  link['SERVER'] = $("#modalLinkMgmt [name='host']").val();
  link['MENU_CODE'] = document.formLinkMgmt.menu.value;
  link['PATHNAME'] = document.formLinkMgmt.pathname.value;
  link['PARAMS'] = fn_getParamList();
  link['CREATED'] = new Date();
  link['UPDATED'] = new Date();

  app.updateLinkCard(link);
  app.postServerData('LINKS', link);
}

app.insertServerLinkCard = function(){
  var link = {};
  link['action'] = "I";
  link['TITLE'] = document.formLinkMgmt.linktitle.value;
  link['SERVER'] = $("#modalLinkMgmt [name='host']").val();
  link['MENU_CODE'] = document.formLinkMgmt.menu.value;
  link['PATHNAME'] = document.formLinkMgmt.pathname.value;
  link['PARAMS'] = fn_getParamList();

  link['CREATED'] = new Date();
  link['UPDATED'] = new Date();
  app.updateLinkCard(link);
  app.postServerData('LINKS', link);
}

app.updateServerLinkCard = function(data){
  data.action = 'U';
  app.updateLinkCard(link);
  // app.postServerData('LINKS', data);
}

app.deleteServerLinkCard = function(data){
  data.action = 'D';
  app.postServerData('LINKS', data);
}

// [Sidebar Menu 클릭]
app.clickNavSidebarMenu = function(id){
  if ( id == 'menuSetting' ){
    return;
  }
  if ( id == 'menuNewRegLink' ){
    app.showLinkNewRegModal();
    return;
  }

  var topMenuHeight = document.querySelector(".fix-header").offsetHeight;
  var location = document.querySelector("#"+ id +"Section").offsetTop;
  window.scrollTo({top:location - topMenuHeight - 10, behavior:'smooth'});
}

// [전체 동기화 진행]
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

function fn_updateLinkCard(data) {

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

// [Link 관리 > param name & value 할당하기]
function setParamList(data){
  var params = data.split("&");

  if ( gfn.nvl(params) == "" ){ return; }

  for (var i=0; i<params.length; i++){
    var param = params[i].split("=");
    document.querySelectorAll("#modalLinkMgmt form [name='param_name']")[i].value = gfn.nvl(param[0]);
    document.querySelectorAll("#modalLinkMgmt form [name='param_value']")[i].value = gfn.nvl(param[1]);
    appendParamItem();
  }
}

// 등록화면에서 param key와 value 가져오기
function fn_getParamList(){
  var params = "";
  var nameList = document.formLinkMgmt.param_name;
  var valueList = document.formLinkMgmt.param_value;
  for (var i=0; i<nameList.length; i++){
    var name = nameList[i].value;
    if (gfn.nvl(name) != ""){
      params += name + "=" + valueList[i].value + "&";
    }
  }

  params = params.substr(0, params.length-1);
  return params;
}

function fn_jsonToFormdata(json){
  var formData = new FormData();
  for (var key in json){
    formData.append(key, json[key]);
  }
  return formData;
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
        app.updateViewLinkCardSection();
        break;
      case 'LINKS':
        app.updateLinkCardList(data);
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
  app.postServerData = function(sheetName, data){
    var id = app.userInfo.userKey;
    var url = 'https://script.google.com/macros/s/AKfycbzGO-mgwC6G79z6eK1EsKYz-nsMH_HQYNZsy-qQxuHIHud4sAQ/exec?';

    var xhr = new XMLHttpRequest();
    var formData = fn_jsonToFormdata(data);
    formData.append('id', id);
    formData.append('KEY', id);
    formData.append('sheet_name', sheetName);

    xhr.onload = function() {
      if (xhr.status === 200 || xhr.status === 201) {
        console.log(xhr.responseText);
        var resultMessage = '저장되었습니다.';
        var res = JSON.parse(xhr.responseText);
        switch (data.action) {
          case 'I':
            var tempSeq = data['SEQ'];
            data['SEQ'] = res.result.seq;
            $("[data-link-id='"+ data['SERVER'] +"-"+ tempSeq +"']")[0].dataset.linkId = data['SERVER'] +"-"+ data['SEQ'];
            app.pushToStorage("linksData", data);
            break;
          case 'U':
            app.updateLinkDataInStorage(data);
            app.saveToStorage("linksData", app.linksData);
            break;
          case 'D':
            resultMessage = '삭제되었습니다.';
            app.saveToStorage("linksData", app.linksData);
            break;
          default:
        }

        toast(resultMessage);
      } else {
        console.error(xhr.responseText);
        toast('서버 저장 오류. 잠시 후 다시 시도해주세요.');
      }
    };
    xhr.open('POST', url);
    xhr.send(formData); // 폼 데이터 객체 전송
  }

  app.saveToStorage = function(key, val){
    app[key] = val;
    localStorage[key] = JSON.stringify(val);
  }
  app.pushToStorage = function(key, val){
    console.log("app.pushToStorage", key, val);
    app[key].push(val);
    localStorage[key] = JSON.stringify(app[key]);
  }
/************************************************************************
 * Code required to start the app
 ************************************************************************/
  app.userInfo = localStorage.userInfo;
  gfn.console('App Code:', app.appVer.verCode);
  if (app.userInfo) {
    // 1. User 정보
    app.userInfo = JSON.parse(localStorage.userInfo);
    if (!app.userInfo.id) {
      gfn.console('init', 'no id');
      return;
    }

    document.getElementById('btnUserKey').textContent = app.userInfo.id;
    document.getElementById('userKey').value = app.userInfo.id;

    // 2. Host 정보
    if (localStorage.hostData){
      app.hostData = JSON.parse(localStorage.hostData);
    }

    // 3. Menu 정보
    if (localStorage.menuData){
      app.menuData = JSON.parse(localStorage.menuData);
      app.updateSidebar(app.menuData);
      app.updateViewLinkCardSection();
    }

    // 4. Link 정보
    if (localStorage.linksData){
      app.linksData = JSON.parse(localStorage.linksData);
      app.updateLinkCardList(app.linksData);
    }

    // 5. 동기화 시간
    app.lastSyncDt = JSON.parse(localStorage.lastSyncDt);
    gfn.console('Last Sync Date:', gfn.formatDate(new Date(app.lastSyncDt), 'yyyy.mm.dd 24hh:mi:ss'));
    document.getElementById('lastSyncDt').textContent = gfn.formatDate(new Date(app.lastSyncDt));
  } else {
    console.log("localStorage not available");
    // fn_availableBody(false);
    // app.lastSyncDt = JSON.parse(localStorage.lastSyncDt);
    // document.getElementById('lastSyncDt').textContent = gfn.formatDate(new Date(app.lastSyncDt));
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker
  //            .register('./service-worker.js')
  //            .then(function() { console.log('Service Worker Registered'); });
  // }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(regist => {
      console.log('Service Worker Registered');

      regist.addEventListener('updatefound', () => {
        const newWorker = regist.installing;
        console.log('Service Worker update found!');

        newWorker.addEventListener('statechange', function(){
          console.log('Service Worker state changed', this.state);
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      alert('최신 업데이트 버전이 있습니다. 앱을 업데이트합니다.');
      window.location.reload();
      console.log('Controller changed');
    });
             // .then(function() { console.log('Service Worker Registered'); });
  }
})();
