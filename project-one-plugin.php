<?php
/*
Plugin Name: project one plugin
Plugin URI: http://localhost
Description: description
Version: 0.1.0038
Author: ohO_oho
Author URI: http://localhost
License: GPL2
*/

/*  Copyright 2011  ohO_oho  (email: paul.bs@gmail.com) */

add_action('admin_head', 'my_plugin_css');
add_action('admin_head', 'my_plugin_action_javascript');
add_action('admin_menu', 'my_plugin_menu');
add_action('wp_ajax_my_action', 'my_plugin_action_callback');

function cp1251_to_utf8 ($txt)  {
    $in_arr = array (
        chr(208), chr(192), chr(193), chr(194),
        chr(195), chr(196), chr(197), chr(168),
        chr(198), chr(199), chr(200), chr(201),
        chr(202), chr(203), chr(204), chr(205),
        chr(206), chr(207), chr(209), chr(210),
        chr(211), chr(212), chr(213), chr(214),
        chr(215), chr(216), chr(217), chr(218),
        chr(219), chr(220), chr(221), chr(222),
        chr(223), chr(224), chr(225), chr(226),
        chr(227), chr(228), chr(229), chr(184),
        chr(230), chr(231), chr(232), chr(233),
        chr(234), chr(235), chr(236), chr(237),
        chr(238), chr(239), chr(240), chr(241),
        chr(242), chr(243), chr(244), chr(245),
        chr(246), chr(247), chr(248), chr(249),
        chr(250), chr(251), chr(252), chr(253),
        chr(254), chr(255)
    );

    $out_arr = array (
        chr(208).chr(160), chr(208).chr(144), chr(208).chr(145),
        chr(208).chr(146), chr(208).chr(147), chr(208).chr(148),
        chr(208).chr(149), chr(208).chr(129), chr(208).chr(150),
        chr(208).chr(151), chr(208).chr(152), chr(208).chr(153),
        chr(208).chr(154), chr(208).chr(155), chr(208).chr(156),
        chr(208).chr(157), chr(208).chr(158), chr(208).chr(159),
        chr(208).chr(161), chr(208).chr(162), chr(208).chr(163),
        chr(208).chr(164), chr(208).chr(165), chr(208).chr(166),
        chr(208).chr(167), chr(208).chr(168), chr(208).chr(169),
        chr(208).chr(170), chr(208).chr(171), chr(208).chr(172),
        chr(208).chr(173), chr(208).chr(174), chr(208).chr(175),
        chr(208).chr(176), chr(208).chr(177), chr(208).chr(178),
        chr(208).chr(179), chr(208).chr(180), chr(208).chr(181),
        chr(209).chr(145), chr(208).chr(182), chr(208).chr(183),
        chr(208).chr(184), chr(208).chr(185), chr(208).chr(186),
        chr(208).chr(187), chr(208).chr(188), chr(208).chr(189),
        chr(208).chr(190), chr(208).chr(191), chr(209).chr(128),
        chr(209).chr(129), chr(209).chr(130), chr(209).chr(131),
        chr(209).chr(132), chr(209).chr(133), chr(209).chr(134),
        chr(209).chr(135), chr(209).chr(136), chr(209).chr(137),
        chr(209).chr(138), chr(209).chr(139), chr(209).chr(140),
        chr(209).chr(141), chr(209).chr(142), chr(209).chr(143)
    );

    $txt = str_replace($in_arr,$out_arr,$txt);
    return $txt;
}

function my_plugin_menu() {
//	add_options_page('ProjectOne Options', 'ProjectOne', 'manage_options', 'project-one', 'my_plugin_options');
    add_menu_page('ProjectOne Plugin', 'ProjectOne', 'manage_options', 'project-one', 'my_plugin_options');
//    add_submenu_page('project-one', 'ProjectOne Help', 'Help', 'manage_options', 'project-one-help', 'my_plugin_help');
}

function my_plugin_css() {
?>
    <style type="text/css">
        #listIdForm label {
            padding-right: 10px;
        }
    </style>
<?php
}

function my_plugin_action_javascript() {
?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            var data = {
                action: 'my_action'
            };
            $("#listIdForm").submit(function() {
                data.listId = $("#listId").val();
                data.offset = $("#offset").val();
                $("#go-btn").val('Пошло-поехало! Ждём...');
                jQuery.post(ajaxurl, data, function(json) {
                    try{
                        var response = jQuery.parseJSON(json);
                    } catch(e) {
                        $("#go-btn").val('JSON не парсится :(');
                        alert('Parsing error: ' + e.name)
                        alert(json);
                    }

                    if (response['listId'] == 0) {
                        $("#go-btn").val('Хм, сам траблез :/');
                        $("#ajax-container").empty();
                        $("#ajax-container").html('<pre style="color: #ff6347;">' + response['listData'] + '</pre>');
                    } else {
                        var listData = jQuery.parseJSON(response['listData']);
                        $("#go-btn").val('Ура! Пришло!');
                        $("#listSize").html(response['listSize']);
                        $("#ajax-container").empty();
                        $("#ajax-container").append('<table class="widefat"></table>');
                        $("#ajax-container table").append('<thead><tr><th>#</th><th>Id</th><th>x_src</th><th>Album</th></tr></thead>');
                        $("#ajax-container table").append('<tfoot><tr><th>#</th><th>Id</th><th>x_src</th><th>Album</th></tr></tfoot>');
                        $("#ajax-container table").append('<tbody></tbody>');
                        for (var i = 0; i < 10; i++) {
                            $("#ajax-container table tbody").append('<tr><th>'+(i+parseInt($("#offset").val())+1)+'</th><th>'+listData[i].id+'</th><th>'+listData[i].x_src+'</th><th>'+listData[i].album+'</th></tr>');
                        };
                    };
                });
                return false;
            });
        });
    </script>
<?php
}

function my_plugin_options() {
	if (!current_user_can('manage_options'))  {
		wp_die( __('You do not have sufficient permissions to access this page.') );
	}
	echo '<div class="wrap">';
	echo '<p style="float: right;">Ещё чуть-чуть и прямо в рай, и жизнь удалась.</p>';
	echo '<p>';
?>
        <form id="listIdForm">
            <ul>
                <li><label for="listId">Идентификатор альбома<span>*</span>: </label>
                <input id="listId" size="30" name="listId" value="album-2281699_140017490" /></li>
                <li><label for="offset">Смещение: </label>
                <input id="offset" name="offset" value="0" /> (всего <span id="listSize">хз</span> фото)</li>
                <li><input type="submit" value="Го!" id="go-btn" class="button-secondary" style="width: 150px;" /></li>
            </ul>
        </form>

    <a href="/photo-283_264913672" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_264913672', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs5284.vkontakte.ru/u73680281/97127417/m_e5d61e73.jpg">
</a>

    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<script type="text/javascript" src="/al_loader.php?act=nav&amp;v=5362"></script>

<link rel="shortcut icon" href="/images/faviconnew.ico">

<meta http-equiv="content-type" content="text/html; charset=windows-1251">
<meta name="description" content=" ">

<title>Гитаристы в окружении своих палок | 65 фотографий</title>

<noscript>&lt;meta http-equiv="refresh" content="0; URL=/badbrowser.php"&gt;</noscript>

<link rel="stylesheet" type="text/css" href="/css/al/common.css?194">
<!--[if lte IE 6]><style type="text/css" media="screen">/* <![CDATA[ */ @import url(/css/al/ie6.css?19); /* ]]> */</style><![endif]-->
<!--[if IE 7]><style type="text/css" media="screen">/* <![CDATA[ */ @import url(/css/al/ie7.css?13); /* ]]> */</style><![endif]-->

<script type="text/javascript">
var vk = {
  ad: 1,
  adupd: 120000, // 2 min
  al: parseInt('3') || 4,
  id: 3454157,
  intnat: '' ? true : false,
  host: 'vkontakte.ru',
  lang: 0,
  rtl: parseInt('') || 0,
  version: 5362,
  zero: false,
  contlen: 20642,
  loginscheme: 'https',
  ip_h: 'c63b5ae4194d5bda74',
  navPrefix: '/'
}

window.locDomain = vk.host.match(/[a-zA-Z]+\.[a-zA-Z]+\.?$/)[0];
var _ua = navigator.userAgent.toLowerCase();
if (/opera/i.test(_ua) || !/msie 6/i.test(_ua) || document.domain != locDomain) document.domain = locDomain;
var ___htest = (location.toString().match(/#(.*)/) || {})[1] || '';
if (vk.al != 1 && ___htest.length && ___htest.substr(0, 1) == vk.navPrefix) {
  if (vk.al != 3 || vk.navPrefix != '!') {
    location.replace(location.protocol + '//' + location.host + '/' + ___htest.replace(/^(\/|!)/, ''));
  }
}

var StaticFiles = {
  'common.js' : {v: 544},
  'common.css': {v: 194},
  'ie6.css'   : {v: 19},
  'ie7.css'   : {v: 13}
  ,'lang0_0.js':{v:4671},'photos.js':{v:41},'photos.css':{v:37},'upload.js':{v:30},'sorter.js':{v:15},'photos_add.js':{v:10},'photos_add.css':{v:9},'ui_controls.js':{v:104},'ui_controls.css':{v:24},'privacy.js':{v:48},'privacy.css':{v:28},'notifier.js':{v:104},'notifier.css':{v:34}
}

</script>
<link type="text/css" rel="stylesheet" href="/css/al/photos.css?37"><link type="text/css" rel="stylesheet" href="/css/al/photos_add.css?9"><link type="text/css" rel="stylesheet" href="/css/ui_controls.css?24"><link type="text/css" rel="stylesheet" href="/css/al/privacy.css?28"><link type="text/css" rel="stylesheet" href="/css/al/notifier.css?34"><script type="text/javascript" src="/js/al/common.js?544"></script><script type="text/javascript" src="/js/lang0_0.js?4671"></script><script type="text/javascript" src="/js/al/photos.js?41"></script><script type="text/javascript" src="/js/al/upload.js?30"></script><script type="text/javascript" src="/js/al/sorter.js?15"></script><script type="text/javascript" src="/js/al/photos_add.js?10"></script><script type="text/javascript" src="/js/lib/ui_controls.js?104"></script><script type="text/javascript" src="/js/al/privacy.js?48"></script><script type="text/javascript" src="/js/al/notifier.js?104"></script>

<link type="text/css" rel="stylesheet" href="chrome-extension://cpngackimfmofbokmjmljamhdncknpmg/style.css"><script type="text/javascript" charset="utf-8" src="chrome-extension://cpngackimfmofbokmjmljamhdncknpmg/page_context.js"></script><meta name="chromesniffer" id="chromesniffer_meta" content=""><script type="text/javascript" src="chrome-extension://homgcnaoacgigpkkljjjekpignblkeae/detector.js"></script></head>

<body onresize="onBodyResize()" class="is_rtl" screen_capture_injected="true">
  <div id="system_msg" class="fixed"></div>
  <div id="utils"><div id="common_css"></div><div id="photos_css"></div><div id="photos_add_css"></div><div id="ui_controls_css"></div><div id="privacy_css"></div><div id="notifier_css"></div><div id="queue_transport_wrap"><iframe id="queue_storage_frame" name="queue_storage_frame" src="/notifier.php?act=storage_frame&amp;2#queue_connection_events_queue3454157"></iframe></div></div>

  <div id="layer_bg" class="fixed" style="height: 162px; "></div><div id="layer_wrap" class="scroll_fix_wrap fixed" style="width: 1280px; height: 162px; "><div id="layer" style="width: 1262px; "></div></div>
  <div id="box_layer_bg" class="fixed" style="height: 162px; "></div><div id="box_layer_wrap" class="scroll_fix_wrap fixed" style="width: 1280px; height: 162px; "><div id="box_layer" style="width: 1262px; "><div id="box_loader"><div class="loader"></div><div class="back"></div></div></div></div>

  <div id="stl_left" class="fixed" style="left: 0px; width: 235px; height: 162px; cursor: pointer; "><nobr id="stl_text" style="opacity: 1; ">Наверх</nobr></div><div id="stl_side" class="fixed" style="left: 235px; width: 140px; top: 0px; height: 162px; cursor: pointer; "></div>

  <script type="text/javascript">domStarted();</script>

  <div id="notifiers_wrap" class="fixed"></div><div id="rb_box_fc_clist" class="rb_box_wrap fixed rb_inactive" style="top: 55.733944954176px; left: 14.6206589491971px; "><div id="fc_clist" style="width: 220px; "><div class="fc_clist_inner"><div class="fc_tab_head"><a class="fc_tab_close_wrap fl_r"><div class="fc_tab_close"></div></a><div class="fc_tab_title noselect">58 друзей онлайн</div></div><div class="fc_clist_filter"><div class="input_back_wrap no_select"><div class="input_back" style="margin-top: 1px; padding-top: 0px; margin-bottom: 1px; padding-bottom: 0px; margin-left: 1px; padding-left: 0px; margin-right: 1px; padding-right: 0px; "><div class="input_back_content">Начните вводить имя..</div></div>  </div><input class="text" id="fc_clist_filter" placeholder=""></div><div class="fc_contacts_wrap"><div class="fc_scrollbar_cont" style="height: 0px; right: 10px; "><div class="fc_scrollbar_inner" style="height: 40px; margin-top: 0px; "></div></div><div id="fc_contacts" class="fc_contacts" style="height: 300px; overflow-x: hidden; overflow-y: hidden; "></div></div></div></div></div><div class="scroll_fix_wrap" id="page_wrap"><div id="top_info_wrap"></div>
<div><div class="scroll_fix" style="width: 1262px; ">
  <div id="page_layout" style="width: 791px; ">
    <div id="page_header" class="p_head p_head_l0">
      <div class="back"></div>
      <div class="left"></div>
      <div class="right"></div>
      <div class="content">

<div id="top_nav" class="head_nav">
  <form method="POST" class="upload_frame" id="logout_form" action="https://login.vk.com/" target="logout_frame">
    <input type="hidden" name="act" value="logout">
    <input type="hidden" name="al_frame" value="1">
    <input type="hidden" name="from_host" value="vkontakte.ru">
    <input type="hidden" name="hash" value="c9175e248881e54ddf">
  </form>
  <iframe class="upload_frame" id="logout_frame" name="logout_frame"></iframe>
  <a id="top_home_link" class="top_home_link fl_l" href="/" onclick="return nav.go(this, event)" style="display: none"></a>
  <table cellspacing="0" cellpadding="0" id="top_links" style="">
    <tbody><tr>
      <td class="top_home_link_td">
        <a class="top_home_link" href="/" onclick="return nav.go(this, event)"></a>
      </td>
      <td class="top_back_link_td">
        <a class="top_nav_link fl_l" href="/club283" id="top_back_link" onclick="if (nav.go(this, event, {back: true}) === false) { hide(this); return false; }" style="display: block; ">Гитаромания</a>
      </td><td><nobr><a class="top_nav_link" id="top_fc_link" href="/im">58 друзей онлайн</a></nobr></td>

      <td><nobr>
        <a class="top_nav_link" id="top_search" href="/search" onclick="return nav.go(this, event, {search: true, noframe: true});" onmouseover="gSearch.preload();">поиск</a>
      </nobr></td>
      <td><nobr>
        <a class="top_nav_link" id="top_invite_link" href="/invite" onclick="return nav.go(this, event);">пригласить</a>
      </nobr></td>
      <td><nobr>
        <a class=" top_nav_link" id="logout_link" href="https://login.vk.com/?act=logout&amp;hash=c9175e248881e54ddf&amp;from_host=vkontakte.ru" onclick="if (!checkEvent(event)) { ge('logout_form').submit(); return false; }">выйти</a>
      </nobr></td>
    </tr>
  </tbody></table>
<span style="display: none" id="top_new_msg"></span>
</div>
      </div>
    </div>

    <div id="side_bar" class="fl_l" style="">
      <ol>
  <li id="myprofile" class="clear_fix"><a href="/edit" onclick="return nav.go(this, event);" class="edit fl_r">ред.</a> <a href="/id3454157" onclick="return nav.go(this, event, {noback: true})" class="hasedit fl_l">Моя Страница</a> </li><li id="l_fr"><a href="/friends" onclick="return nav.go(this, event, {noback: true});">Мои Друзья <span></span></a></li><li id="l_ph"><a href="/albums3454157?act=added" onclick="return nav.go(this, event, {noback: true});">Мои Фотографии <span>(<b>1</b>)</span></a></li><li id="l_vid"><a href="/video" onclick="return nav.go(this, event, {noback: true});">Мои Видеозаписи <span></span></a></li><li><a href="/audio" onclick="return nav.go(this, event, {noback: true});">Мои Аудиозаписи <span></span></a></li><li id="l_msg"><a href="/im" onclick="return nav.go(this, event, {noback: true});">Мои Сообщения <span></span></a></li><li id="l_nts"><a href="/notes" onclick="return nav.go(this, event, {noback: true});">Мои Заметки <span></span></a></li><li id="l_gr"><a href="/groups" onclick="return nav.go(this, event, {noback: true});">Мои Группы <span></span></a></li><li id="l_ev"><a href="/events" onclick="return nav.go(this, event, {noback: true});">Мои Встречи <span></span></a></li><li id="l_nws"><a href="/feed" onclick="return nav.go(this, event, {noback: true});">Мои Новости <span></span></a></li><li><a href="/fave" onclick="return nav.go(this, event, {noback: true});">Мои Закладки <span></span></a></li><li id="l_set"><a href="/settings" onclick="return nav.go(this, event, {noback: true});">Мои Настройки <span></span></a></li><div class="more_div"></div><li id="l_ap"><a href="/apps" onclick="return nav.go(this, event, {noback: true});">Приложения <span></span></a></li><li><a href="/docs" onclick="return nav.go(this, event, {noback: true});">Документы <span></span></a></li><li><a href="/market.php?act=list">Объявления <span></span></a></li><li id="l_ads" style="display: none"><a>Реклама <span></span></a></li><div class="more_div"></div><li id="l_app545941"><a href="/app545941_3454157?ref=1" onclick="return nav.go(this, event, {noback: true});">Музыкальный Плеер <span></span></a></li>
</ol>
<div id="left_blocks"></div><div id="left_ads"><div id="ad_hide_mask_ad_0" class="ad_hide_mask_new" style="display: none; "><div class="ad_info_new">Данное объявление больше не будет Вам показываться.</div></div>
<a href="/away.php?to=QxscBkBxC1VwdAlWXXFWBhFBXUBJdgpDTgUxQ0hVb1VCfAAnX2ZtBjspCyAiCw0LXy5XRXJfThVFE0FXAidjNFwaA10OG2kQC2RucyoGVSsJagsaCgVWV2o8WEoeFl53VxVnJQAiKmMxeGMTPAdhAQV1YQsPDnpJAxcMVV8hVToYMF4dMA4/Ok0ECHsAegI3OAJdfj4UC094EgoJJiYjdglUUyseM2l/NAYIQ0wHHXE6Knt3MW1rZjEXdBd3MWouJy8pVRQPCDpBDH5QAgkWHgc-" class="ad_box_new" style="" id="ad_box_ad_0" onmouseover="leftBlockOver('_ad_0')" onmouseout="leftBlockOut('_ad_0')" target="_blank">
<div id="left_hide_ad_0" class="left_hide_new" onmouseover="leftBlockOver(this)" onmouseout="leftBlockOut(this)" onclick="cancelEvent(event); return leftAdBlockHide('_ad_0', '/away.php?to=QRscBkBxC1VwdAlWXXFWBhFBCBFFdQccT1ZiFRkObAEUKQkiX2ZtBjspCyAiCw0LXy5XRXJfThVFE0FXAidjNFwaA10OG2kQC2RucyoGVSsJagsaCgVWV2o8WEoeFl53VxVnJQAiKmMxeGMTPAdhAQV1YQsPDnpJAxcMVV8hVToYMF4dMA4/Ok0ECHsAegI3OAJdfj4UC094EgoJJiYjdglUUyseM2l/NAYIQ0wHHXE6Knt3MW1rZjEXdBd3MWouJy8pVRQPCDpBDH5QAgkWHgc-');"></div>
<div id="ad_title" class="ad_title_new">Лучшая стратегия 2011!</div>
<div class="ad_domain_new">Приложение</div>
<span>
  <div id="pr_image" style="position: relative;">
    <img src="http://cs10271.vkontakte.ru/u42137217/75628422/s_5f56606f59x:001.jpg" style="">
    <div id="ads_play_btn" style="display: none;"></div>
  </div>
</span>
<div id="ad_desc" class="ad_desc_new" style="">-" Чуть школу не проспал, играл с друзьями всю ночь!"</div>
</a>
<div id="ad_hide_mask_ad_1" class="ad_hide_mask_new" style="display: none; "><div class="ad_info_new">Данное объявление больше не будет Вам показываться.</div><div class="ad_complain_new">
  <span class="ad_complain_info_new">Если Вы считаете содержание данного объявления оскорбительным,</span>
  <span class="ad_complain_link_new" onclick="reportAd(1476553, this); return false;">сообщите нам.</span>
</div></div>
<a href="/away.php?to=QxscBkBxC1VwdAlXXnRTBhVBBkJAdlYdSlU2Q0hebVJCKFAlX1JgZzFxUAYnElpRJxJSR1YJCQBGC0FBLVU0KUklb3wVIAArAG5KVBobCTYaLlkTOG0wAmEDS0ccMXR8MSsTAB80FkcNIgI7AkJWZhs5fQA6LkIsLQteYGVUbgVJDkRHKxJnE0RUPEMkYnckC0Z8cicjDAMibHQZXxAgemI8URwWFGoVOQ0eGFgqGHAVBmcKJ0BqRzsWSSYDMQwTLmgWZBY5ZxQELAJ9D1kHAgc-" class="ad_box_new" style="" id="ad_box_ad_1" onmouseover="leftBlockOver('_ad_1')" onmouseout="leftBlockOut('_ad_1')" target="_blank">
<div id="left_hide_ad_1" class="left_hide_new" onmouseover="leftBlockOver(this)" onmouseout="leftBlockOut(this)" onclick="cancelEvent(event); return leftAdBlockHide('_ad_1', '/away.php?to=QRscBkBxC1VwdAlXXnRTBhVBC0dCIlJDS1lkQRINPlJAfANyX1JgZzFxUAYnElpRJxJSR1YJCQBGC0FBLVU0KUklb3wVIAArAG5KVBobCTYaLlkTOG0wAmEDS0ccMXR8MSsTAB80FkcNIgI7AkJWZhs5fQA6LkIsLQteYGVUbgVJDkRHKxJnE0RUPEMkYnckC0Z8cicjDAMibHQZXxAgemI8URwWFGoVOQ0eGFgqGHAVBmcKJ0BqRzsWSSYDMQwTLmgWZBY5ZxQELAJ9D1kHAgc-');"></div>
<div id="ad_title" class="ad_title_new">Коллекционная модель</div>
<div class="ad_domain_new">rozetka.ua</div>
<span>
  <div id="pr_image" style="position: relative;">
    <img src="http://cs9649.vkontakte.ru/u137834942/75628422/s_e5c1093fddx:001.jpg" style="">
    <div id="ads_play_btn" style="display: none;"></div>
  </div>
</span>
<div id="ad_desc" class="ad_desc_new" style="">Точная копия автомобиля. Цена: 113 грн.</div>
</a>
<div class="ad_help_link" id="ad_help_link">
  <a href="/ads.php?section=target">Что это?</a>
</div></div>
    </div>

    <div id="page_body" class="fl_r" style="width: 631px; ">
      <div id="header_wrap2">
        <div id="header_wrap1">
          <div id="header" style="display: none">
            <h1 id="title"></h1>
          </div>
        </div>
      </div>
      <div id="wrap_between"></div>
      <div id="wrap3"><div id="wrap2">
  <div id="wrap1">
    <div id="content"><div class="t_bar clear_fix">
  <ul class="t0"><li class="">
  <a href="/albums-283" onclick="return checkEvent(event);" onmousedown="if (nav.go(this, event) === false) (window.PhotosAdd || window.photos || window.friendsphotos).activeTab(this);">
    <b class="tl1"><b></b></b>
    <b class="tl2"></b>
    <b class="tab_word"><nobr>Альбомы группы</nobr></b>
  </a>
</li><li class="active_link">
  <a href="/album-283_97127417" onclick="return checkEvent(event);" onmousedown="if (nav.go(this, event) === false) (window.PhotosAdd || window.photos || window.friendsphotos).activeTab(this);">
    <b class="tl1"><b></b></b>
    <b class="tl2"></b>
    <b class="tab_word"><nobr>Гитаристы в окружении своих палок</nobr></b>
  </a>
</li></ul>
</div><div class="photos_album_page">
  <div class="summary_wrap">
    <div class="summary"><a class="fl_r sort_rev_icon" onmouseover="showTooltip(this, {text: 'Показать в обратном порядке'})" href="/album-283_97127417?rev=1" onclick="return nav.go(this, event)"></a>65 фотографий<span class="divide">|</span><span><a href="/album-283_97127417?act=edit" onclick="return nav.go(this, event)">Редактировать фотографии</a></span><span class="divide">|</span><span><a href="/album-283_97127417?act=comments" onclick="return nav.go(this, event)">Комментарии к альбому</a></span><span class="divide">|</span><span><a href="/club283" onclick="return nav.go(this, event, {back: true})">Вернуться к группе</a></span></div>
  </div><div id="photos_upload_area_wrap" style="position: relative;">
<a id="photos_upload_area" title="Вы можете перетащить файлы прямо на эту страницу." href="/album-283_97127417?act=add" onclick="return photos.upload(this, event);">
  <div class="photos_upload_area_upload">
    <span class="photos_upload_area_img" src="/images/icons/photos_add.png">
      Добавить новые фотографии
    </span>
  </div>
  <div class="photos_upload_area_drop">
    Отпустите, чтобы начать загрузку.
  </div>
</a>
<input id="photos_upload_input" class="file" type="file" size="28" onchange="photos.onUploadSelect(this.files);" multiple="true" name="photo" style="visibility: hidden; position: absolute;">
</div>
  <div id="photos_container" class="clear_fix"><div class="photo_row" id="photo_row-283_140635061"><a href="/photo-283_140635061" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140635061', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_54270166.jpg">
</a></div><div class="photo_row" id="photo_row-283_140635062"><a href="/photo-283_140635062" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140635062', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_1c89b8dc.jpg">
</a></div><div class="photo_row" id="photo_row-283_140635147"><a href="/photo-283_140635147" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140635147', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_c45c1a9b.jpg">
</a></div><div class="photo_row" id="photo_row-283_140635148"><a href="/photo-283_140635148" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140635148', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_2de34dbe.jpg">
</a></div><div class="photo_row" id="photo_row-283_140635149"><a href="/photo-283_140635149" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140635149', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_99e33086.jpg">
</a></div><div class="photo_row" id="photo_row-283_140635381"><a href="/photo-283_140635381" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140635381', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_2d9d9370.jpg">
</a></div><div class="photo_row" id="photo_row-283_140818028"><a href="/photo-283_140818028" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140818028', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_e243f1b3.jpg">
</a></div><div class="photo_row" id="photo_row-283_140818029"><a href="/photo-283_140818029" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_140818029', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs1617.vkontakte.ru/u249650/97127417/m_ac548330.jpg">
</a></div><div class="photo_row" id="photo_row-283_143104498"><a href="/photo-283_143104498" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_143104498', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4172.vkontakte.ru/u19590981/97127417/m_839478f3.jpg">
</a></div><div class="photo_row" id="photo_row-283_143331677"><a href="/photo-283_143331677" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_143331677', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4156.vkontakte.ru/u10185718/97127417/m_f7ae6082.jpg">
</a></div><div class="photo_row" id="photo_row-283_144698041"><a href="/photo-283_144698041" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_144698041', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4300.vkontakte.ru/u4536161/97127417/m_ade11fad.jpg">
</a></div><div class="photo_row" id="photo_row-283_144698403"><a href="/photo-283_144698403" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_144698403', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4300.vkontakte.ru/u4536161/97127417/m_029be410.jpg">
</a></div><div class="photo_row" id="photo_row-283_144700924"><a href="/photo-283_144700924" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_144700924', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4300.vkontakte.ru/u4536161/97127417/m_c332f79e.jpg">
</a></div><div class="photo_row" id="photo_row-283_144702064"><a href="/photo-283_144702064" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_144702064', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4300.vkontakte.ru/u4536161/97127417/m_36bd5593.jpg">
</a></div><div class="photo_row" id="photo_row-283_144702065"><a href="/photo-283_144702065" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_144702065', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4300.vkontakte.ru/u4536161/97127417/m_f2c8f57b.jpg">
</a></div><div class="photo_row" id="photo_row-283_144867274"><a href="/photo-283_144867274" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_144867274', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4581.vkontakte.ru/u249650/97127417/m_fd6ec124.jpg">
</a></div><div class="photo_row" id="photo_row-283_145383309"><a href="/photo-283_145383309" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_145383309', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs900.vkontakte.ru/u3009638/97127417/m_760a310e.jpg">
</a></div><div class="photo_row" id="photo_row-283_145383310"><a href="/photo-283_145383310" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_145383310', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs900.vkontakte.ru/u3009638/97127417/m_42ff1caa.jpg">
</a></div><div class="photo_row" id="photo_row-283_145409392"><a href="/photo-283_145409392" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_145409392', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs900.vkontakte.ru/u3009638/97127417/m_7822f6a7.jpg">
</a></div><div class="photo_row" id="photo_row-283_145409393"><a href="/photo-283_145409393" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_145409393', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs900.vkontakte.ru/u3009638/97127417/m_7a53a9fd.jpg">
</a></div><div class="photo_row" id="photo_row-283_147240311"><a href="/photo-283_147240311" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_147240311', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4549.vkontakte.ru/u249650/97127417/m_82497a04.jpg">
</a></div><div class="photo_row" id="photo_row-283_147238779"><a href="/photo-283_147238779" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_147238779', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4549.vkontakte.ru/u249650/97127417/m_256c0f79.jpg">
</a></div><div class="photo_row" id="photo_row-283_154674176"><a href="/photo-283_154674176" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_154674176', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs578.vkontakte.ru/u56175237/97127417/m_b57ac678.jpg">
</a></div><div class="photo_row" id="photo_row-283_154852899"><a href="/photo-283_154852899" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_154852899', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4452.vkontakte.ru/u249650/97127417/m_66b0e0d5.jpg">
</a></div><div class="photo_row" id="photo_row-283_156935577"><a href="/photo-283_156935577" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_156935577', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4570.vkontakte.ru/u36544620/97127417/m_94fb2cc3.jpg">
</a></div><div class="photo_row" id="photo_row-283_157580440"><a href="/photo-283_157580440" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_157580440', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4453.vkontakte.ru/u249650/97127417/m_b743e34d.jpg">
</a></div><div class="photo_row" id="photo_row-283_159093273"><a href="/photo-283_159093273" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_159093273', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4453.vkontakte.ru/u249650/97127417/m_e6ab64ac.jpg">
</a></div><div class="photo_row" id="photo_row-283_159738009"><a href="/photo-283_159738009" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_159738009', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10080.vkontakte.ru/u64923417/97127417/m_41f765e7.jpg">
</a></div><div class="photo_row" id="photo_row-283_159738010"><a href="/photo-283_159738010" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_159738010', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10080.vkontakte.ru/u64923417/97127417/m_4a330665.jpg">
</a></div><div class="photo_row" id="photo_row-283_162374932"><a href="/photo-283_162374932" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_162374932', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4791.vkontakte.ru/u249650/97127417/m_64ec881d.jpg">
</a></div><div class="photo_row" id="photo_row-283_162374933"><a href="/photo-283_162374933" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_162374933', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4791.vkontakte.ru/u249650/97127417/m_d8549a78.jpg">
</a></div><div class="photo_row" id="photo_row-283_162976109"><a href="/photo-283_162976109" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_162976109', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4791.vkontakte.ru/u249650/97127417/m_6d1d5960.jpg">
</a></div><div class="photo_row" id="photo_row-283_164062493"><a href="/photo-283_164062493" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_164062493', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs591.vkontakte.ru/u6895040/97127417/m_b6bbc460.jpg">
</a></div><div class="photo_row" id="photo_row-283_164432287"><a href="/photo-283_164432287" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_164432287', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10365.vkontakte.ru/u249650/97127417/m_9aa98922.jpg">
</a></div><div class="photo_row" id="photo_row-283_164997498"><a href="/photo-283_164997498" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_164997498', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10365.vkontakte.ru/u249650/97127417/m_06076dc8.jpg">
</a></div><div class="photo_row" id="photo_row-283_165117303"><a href="/photo-283_165117303" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_165117303', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4301.vkontakte.ru/u249650/97127417/m_6a2b9487.jpg">
</a></div><div class="photo_row" id="photo_row-283_165142880"><a href="/photo-283_165142880" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_165142880', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4301.vkontakte.ru/u249650/97127417/m_66e0ad7e.jpg">
</a></div><div class="photo_row" id="photo_row-283_166170765"><a href="/photo-283_166170765" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166170765', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4301.vkontakte.ru/u249650/97127417/m_fc3960ac.jpg">
</a></div><div class="photo_row" id="photo_row-283_166357740"><a href="/photo-283_166357740" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166357740', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4301.vkontakte.ru/u249650/97127417/m_8f94e31b.jpg">
</a></div><div class="photo_row" id="photo_row-283_166438791"><a href="/photo-283_166438791" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166438791', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs244.vkontakte.ru/u74147884/97127417/m_5043c997.jpg">
</a></div><div class="photo_row" id="photo_row-283_166550563"><a href="/photo-283_166550563" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166550563', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4556.vkontakte.ru/u249650/97127417/m_1a3e636d.jpg">
</a></div><div class="photo_row" id="photo_row-283_166907103"><a href="/photo-283_166907103" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166907103', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4556.vkontakte.ru/u249650/97127417/m_58719d86.jpg">
</a></div><div class="photo_row" id="photo_row-283_166977904"><a href="/photo-283_166977904" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166977904', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4556.vkontakte.ru/u249650/97127417/m_a48bb433.jpg">
</a></div><div class="photo_row" id="photo_row-283_168050269"><a href="/photo-283_168050269" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_168050269', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4868.vkontakte.ru/u15172292/97127417/m_4139ae7c.jpg">
</a></div><div class="photo_row" id="photo_row-283_168106069"><a href="/photo-283_168106069" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_168106069', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4868.vkontakte.ru/u15172292/97127417/m_a3589454.jpg">
</a></div><div class="photo_row" id="photo_row-283_168588599"><a href="/photo-283_168588599" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_168588599', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10341.vkontakte.ru/u37436714/97127417/m_2e9e0db0.jpg">
</a></div><div class="photo_row" id="photo_row-283_170030479"><a href="/photo-283_170030479" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_170030479', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs409.vkontakte.ru/u3009638/97127417/m_a2e38527.jpg">
</a></div><div class="photo_row" id="photo_row-283_172081514"><a href="/photo-283_172081514" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_172081514', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4134.vkontakte.ru/u39705956/97127417/m_fe4c9f40.jpg">
</a></div><div class="photo_row" id="photo_row-283_174079158"><a href="/photo-283_174079158" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_174079158', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs406.vkontakte.ru/u39705956/97127417/m_5d12ba47.jpg">
</a></div><div class="photo_row" id="photo_row-283_176180225"><a href="/photo-283_176180225" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_176180225', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs9371.vkontakte.ru/u39705956/97127417/m_5d2fc3fb.jpg">
</a></div><div class="photo_row" id="photo_row-283_185144201"><a href="/photo-283_185144201" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185144201', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10376.vkontakte.ru/u249650/97127417/m_88921024.jpg">
</a></div><div class="photo_row" id="photo_row-283_185144893"><a href="/photo-283_185144893" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185144893', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs709.vkontakte.ru/u81705079/97127417/m_68cdeb32.jpg">
</a></div><div class="photo_row" id="photo_row-283_185145358"><a href="/photo-283_185145358" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185145358', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs709.vkontakte.ru/u81705079/97127417/m_948c30d7.jpg">
</a></div><div class="photo_row" id="photo_row-283_185145359"><a href="/photo-283_185145359" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185145359', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs709.vkontakte.ru/u81705079/97127417/m_69697159.jpg">
</a></div><div class="photo_row" id="photo_row-283_190168265"><a href="/photo-283_190168265" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_190168265', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10644.vkontakte.ru/u249650/97127417/m_9375bb10.jpg">
</a></div><div class="photo_row" id="photo_row-283_216405674"><a href="/photo-283_216405674" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_216405674', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs9979.vkontakte.ru/u12312987/97127417/m_fadc6cf6.jpg">
</a></div><div class="photo_row" id="photo_row-283_225240448"><a href="/photo-283_225240448" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_225240448', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10854.vkontakte.ru/u249650/97127417/m_4dd609fd.jpg">
</a></div><div class="photo_row" id="photo_row-283_229216297"><a href="/photo-283_229216297" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_229216297', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs11133.vkontakte.ru/u249650/97127417/m_c3bd40e9.jpg">
</a></div><div class="photo_row" id="photo_row-283_229405295"><a href="/photo-283_229405295" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_229405295', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs11133.vkontakte.ru/u249650/97127417/m_5b770da9.jpg">
</a></div><div class="photo_row" id="photo_row-283_259343789"><a href="/photo-283_259343789" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_259343789', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10958.vkontakte.ru/u249650/97127417/m_1801a8d8.jpg">
</a></div><div class="photo_row" id="photo_row-283_264913672"><a href="/photo-283_264913672" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_264913672', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs5284.vkontakte.ru/u73680281/97127417/m_e5d61e73.jpg">
</a></div><div class="photo_row" id="photo_row-283_264945526"><a href="/photo-283_264945526" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_264945526', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs9699.vkontakte.ru/u286956/97127417/m_888cb919.jpg">
</a></div><div class="photo_row" id="photo_row-283_265740000"><a href="/photo-283_265740000" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_265740000', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs5826.vkontakte.ru/u249650/97127417/m_04daaf72.jpg">
</a></div><div class="photo_row" id="photo_row-283_266126121"><a href="/photo-283_266126121" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_266126121', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs10979.vkontakte.ru/u249650/97127417/m_bc39077b.jpg">
</a></div><div class="photo_row" id="photo_row-283_267976577"><a href="/photo-283_267976577" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_267976577', 'album-283_97127417', {img: this, root: 1}, event)">
  <img src="http://cs4172.vkontakte.ru/u249650/97127417/m_5f3b330a.jpg">
</a></div></div>
  <a id="photos_load_more" onclick="photos.load()" style="display: none; "><span style="display: inline; ">Показать больше фотографий</span>
    <div id="photos_more_progress" class="progress" style="display: none; "></div>
  </a>
</div></div>
  </div>
</div></div>
    </div>

    <div id="footer_wrap" class="fl_r" style="width: 661px; ">
      <div id="bottom_nav">
  <a href="/help.php?page=about">о сайте</a>
  <a href="/support">техподдержка</a>
  <a href="/blog.php">блог</a>
  <a href="/help.php?page=terms">правила</a>
  <a href="/ads.php">реклама</a>
  <a href="/developers.php">разработчикам</a>
  <a href="/jobs.php">вакансии</a>
</div>
<div id="footer" class="clear">
  <div class="copy_lang">ВКонтакте © 2006-2011 <a onclick="showBox('lang.php', {act: 'lang_dialog'}, {noreload: true})">Русский</a></div>
  <div>
    <small><a href="/durov" onclick="return nav.go(this, event)">Павел Дуров</a></small>

  </div>
</div>
    </div>
    <div class="clear"></div>
  </div>
</div></div></div>
  <div class="progress" id="global_prg"></div>

  <script type="text/javascript">
    if (parent && parent != window && (browser.msie || browser.opera || browser.mozilla || browser.chrome || browser.safari || browser.iphone)) {
      document.getElementsByTagName('body')[0].innerHTML = '';
    } else {
      domReady();
      updateMoney(0);
gSearch.init();
if (window.qArr && qArr[5]) qArr[5] = [5, "по товарам", "", "goods", 0x00000100];if (!photos.checkHtml5Uploader() && browser.flash > 9 && !(browser.msie && !browser.msie8 && !browser.msie9)) {
//if (browser.flash > 9) {
  var area = ge('photos_upload_area'),
      el = ce('div', {innerHTML: '<div id="lite_photo_uploader" style="position: absolute; height: 100%; width: 100%; cursor: pointer;"></div>'}).firstChild;
  area.parentNode.insertBefore(el, area);
  cur.initFlashLite = function() {
    cur = extend(cur, {
      uplCont: ge('photos_add_cont'),
      uplBox: ge('photos_add_cont')
    });

    cur.uploaderLang = {"button_browse":"Выберите файл","photos_save_X_photos":["","Сохранить <b>%s<\/b> выбранную фотографию","Сохранить <b>%s<\/b> выбранных фотографий","Сохранить <b>%s<\/b> выбранных фотографий"],"photos_add_uploading":"Фотография загружается","photos_add_uploading_X":"Загружается 1 фотография из %s","photos_add_uploaded_X":["","Загружена %s фотография из {count}","Загружено %s фотографии из {count}","Загружено %s фотографий из {count}"],"photos_add_upload_finish":"Завершение загрузки..","photos_add_error":"Не удалось загрузить изображение","photos_add_saved":["","Фотография успешно загружена.","Фотографии успешно загружены.","Фотографии успешно загружены."]};
    cur.flashLiteUrl = 'http://cs9278.vkontakte.ru/upload.php';
    cur.flashLiteVars = {"oid":-283,"aid":97127417,"gid":283,"mid":3454157,"hash":"e78887ff801c33221afd9d43f7ba2bd6","rhash":"c4e039ba7cd1d35cfda08a0afde46f6e","act":"do_add"};
    cur.flashLiteOptions = {
      file_name: 'photo',

      file_size_limit: 1024*1024*25, // 5Mb
      file_types_description: 'Image files (*.jpg, *.png, *.gif)',
      file_types: '*.jpg;*.JPG;*.png;*.PNG;*.gif;*.GIF;*.bmp;*.BMP',

      lang: cur.uploaderLang,

      onUploadStart: PhotosAdd.onUploadStart,
      onUploadProgress: PhotosAdd.onUploadProgress,
      onUploadComplete: PhotosAdd.onUploadComplete,
      onUploadCompleteAll: PhotosAdd.onUploadCompleteAll,

      clear: 1,
      type: 'photo',
      max_attempts: 3,
      server: 9278,
      error: 1,
      error_hash: '623ca4a1fd9174c7299176f3247da1ca',
      dropbox: bodyNode,
      dragEl: bodyNode,
      visibleDropbox: true,
      //photoBox: ge('photos_add_box'),
      multiple: true,
      multi_progress: true,
      multi_sequence: true,
      max_files: 500,
      file_match: '\.(gif|jpg|png|bmp|jpeg)$',
      flash_lite: 1
    }

    cur.uplId = Upload.init('lite_photo_uploader', cur.flashLiteUrl, cur.flashLiteVars, cur.flashLiteOptions);
  };

  cur.flash_lite = true;
  cur.initFlashLite();

  cur.flashAddBar = '<div class="photos_add_bar_cont">\
    <div id="photos_add_bar">\
      <div class="photos_add_bar_shadow"></div>\
      <div class="photos_add_bar_wrap photos_add_area_drop"><div>\
        Отпустите, чтобы начать загрузку.\
      </div></div>\
      <div id="photos_add_bar_progress" class="photos_add_bar_wrap">\
        <div id="photos_add_p_line"><div id="photos_add_p_inner"></div></div>\
        <div id="photos_add_p_text"></div>\
      </div>\
      <div id="photos_add_bar_form" class="photos_add_bar_wrap">\
        <div id="photos_add_select_button" class="button_blue" style="position: relative;"><button id="photos_flash_add_button">Загрузить ещё фотографии</button></div>\
        <div id="photos_add_more_info">Вы можете выбрать <b>несколько</b> фотографий.</div>\
        <div id="photos_movedd_container" class="fl_l"><input id="photos_move_dd" name="photos_move_dd" type="hidden" /><span id="privacy_edit_photos_move"></span></div>\
      </div>\
    </div>\
  </div>';
  cur.flashAddWrap = '<div id="photos_add_wrap" class="photos_add_wrap">\
    <div id="photos_add_cont" class="photos_add_cont">\
      <div id="photos_add_error"></div>\
        <div id="photos_add_list"></div>\
        <div class="photos_go_to_album">\
          <a href="/album-283_97127417"><div class="button_blue"><button>Перейти к альбому</button></div></a>\
        </div>\
      </div>\
    </div>\
  </div>';
  cur.flashAddSummary = 'Гитаристы в окружении своих палок<span class="divide">|</span><span><a href="/album-283_97127417" onclick="return nav.go(this, event)">Вернуться к альбому</a></span>';

  cur.photoData = {};

  var albums = [[0," - Альбом фотографии - "],[102431933,"Doubleneck мания"],[68975168,"mini )"],[110107322,"Афиши и Анонсы концерто.."],[34561945,"Гитаристки и девушки с .."],[97127417,"Гитаристы в окружении с.."],[92111649,"Конкурс на логотип =)"],[106144999,"Куплю , ищу."],[1295,"Мир Гитар #1"],[40264779,"Мир Гитар #2"],[139752468,"Мир гитар №3"],[57868510,"Мы c гитарами&#33;&#33;&#33;"],[136453301,"Продажа. Открытая цена №3"],[92418231,"гитары с одним датчиком"]];
  extend(cur, {
    album: '-283_97127417',
    albums: albums,
    onPrivacyChanged: photos.privacy
  });

  if (albums.length < 15) {
    cur.privacyPhotoMove = true;
    var albumsArr = {};
    for (var i in albums) {
      if (albums[i][0] && albums[i][0] != "0") {
        albumsArr[albums[i][0]] = albums[i][1];
      }
    }
    cur.privacy = {
      'photos_move': [97127417, 1],
      'photos_move_types': albumsArr
    };
  }

  cur.lang = extend(cur.lang || {}, {
    photos_privacy_description: 'Описание'
  });
}extend(cur, {
  offset: 40,
  count: 65,
  moreFrom: 'album-283_97127417',
  moreOpts: undefined
});

cur.lang = extend(cur.lang || {}, {
  photos_deleting_album: 'Удаление альбома',
  photos_sure_del_album: 'Вы уверены, что хотите удалить альбом?'
});

if (vk.version) {
  addEvent(window, 'load', photos.initScroll);
} else {
  photos.initScroll();
}
var preload = [80,"<div class=\"photo_row\" id=\"photo_row-283_166550563\"><a href=\"\/photo-283_166550563\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166550563', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4556.vkontakte.ru\/u249650\/97127417\/m_1a3e636d.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_166907103\"><a href=\"\/photo-283_166907103\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166907103', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4556.vkontakte.ru\/u249650\/97127417\/m_58719d86.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_166977904\"><a href=\"\/photo-283_166977904\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_166977904', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4556.vkontakte.ru\/u249650\/97127417\/m_a48bb433.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_168050269\"><a href=\"\/photo-283_168050269\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_168050269', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4868.vkontakte.ru\/u15172292\/97127417\/m_4139ae7c.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_168106069\"><a href=\"\/photo-283_168106069\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_168106069', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4868.vkontakte.ru\/u15172292\/97127417\/m_a3589454.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_168588599\"><a href=\"\/photo-283_168588599\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_168588599', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs10341.vkontakte.ru\/u37436714\/97127417\/m_2e9e0db0.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_170030479\"><a href=\"\/photo-283_170030479\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_170030479', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs409.vkontakte.ru\/u3009638\/97127417\/m_a2e38527.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_172081514\"><a href=\"\/photo-283_172081514\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_172081514', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4134.vkontakte.ru\/u39705956\/97127417\/m_fe4c9f40.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_174079158\"><a href=\"\/photo-283_174079158\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_174079158', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs406.vkontakte.ru\/u39705956\/97127417\/m_5d12ba47.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_176180225\"><a href=\"\/photo-283_176180225\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_176180225', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs9371.vkontakte.ru\/u39705956\/97127417\/m_5d2fc3fb.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_185144201\"><a href=\"\/photo-283_185144201\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185144201', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs10376.vkontakte.ru\/u249650\/97127417\/m_88921024.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_185144893\"><a href=\"\/photo-283_185144893\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185144893', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs709.vkontakte.ru\/u81705079\/97127417\/m_68cdeb32.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_185145358\"><a href=\"\/photo-283_185145358\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185145358', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs709.vkontakte.ru\/u81705079\/97127417\/m_948c30d7.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_185145359\"><a href=\"\/photo-283_185145359\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_185145359', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs709.vkontakte.ru\/u81705079\/97127417\/m_69697159.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_190168265\"><a href=\"\/photo-283_190168265\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_190168265', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs10644.vkontakte.ru\/u249650\/97127417\/m_9375bb10.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_216405674\"><a href=\"\/photo-283_216405674\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_216405674', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs9979.vkontakte.ru\/u12312987\/97127417\/m_fadc6cf6.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_225240448\"><a href=\"\/photo-283_225240448\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_225240448', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs10854.vkontakte.ru\/u249650\/97127417\/m_4dd609fd.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_229216297\"><a href=\"\/photo-283_229216297\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_229216297', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs11133.vkontakte.ru\/u249650\/97127417\/m_c3bd40e9.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_229405295\"><a href=\"\/photo-283_229405295\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_229405295', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs11133.vkontakte.ru\/u249650\/97127417\/m_5b770da9.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_259343789\"><a href=\"\/photo-283_259343789\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_259343789', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs10958.vkontakte.ru\/u249650\/97127417\/m_1801a8d8.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_264913672\"><a href=\"\/photo-283_264913672\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_264913672', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs5284.vkontakte.ru\/u73680281\/97127417\/m_e5d61e73.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_264945526\"><a href=\"\/photo-283_264945526\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_264945526', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs9699.vkontakte.ru\/u286956\/97127417\/m_888cb919.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_265740000\"><a href=\"\/photo-283_265740000\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_265740000', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs5826.vkontakte.ru\/u249650\/97127417\/m_04daaf72.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_266126121\"><a href=\"\/photo-283_266126121\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_266126121', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs10979.vkontakte.ru\/u249650\/97127417\/m_bc39077b.jpg\" \/>\n<\/a><\/div><div class=\"photo_row\" id=\"photo_row-283_267976577\"><a href=\"\/photo-283_267976577\" onclick=\"if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto('-283_267976577', 'album-283_97127417', {img: this, root: 1}, event)\">\n  <img src=\"http:\/\/cs4172.vkontakte.ru\/u249650\/97127417\/m_5f3b330a.jpg\" \/>\n<\/a><\/div>"];

ajax.preload(cur.moreFrom, extend({offset: cur.offset, part: 1}, cur.moreOpts || {}), preload);

photos.registerDragZone({
  on: function() {
    addClass(ge('photos_upload_area'), 'photos_upload_area_enter');
  },
  un: function() {
    removeClass(ge('photos_upload_area'), 'photos_upload_area_enter');
  },
  drop: function(files) {
    photos.onUploadSelect(files);
  }
});
handlePageParams({"id":3454157,"leftblocks":"","leftads":"<div id=\"ad_hide_mask_ad_0\" class=\"ad_hide_mask_new\" style=\"display: none; \"><div class=\"ad_info_new\">Данное объявление больше не будет Вам показываться.<\/div><\/div>\n<a href=\"\/away.php?to=QxscBkBxC1VwdAlWXXFWBhFBXUBJdgpDTgUxQ0hVb1VCfAAnX2ZtBjspCyAiCw0LXy5XRXJfThVFE0FXAidjNFwaA10OG2kQC2RucyoGVSsJagsaCgVWV2o8WEoeFl53VxVnJQAiKmMxeGMTPAdhAQV1YQsPDnpJAxcMVV8hVToYMF4dMA4\/Ok0ECHsAegI3OAJdfj4UC094EgoJJiYjdglUUyseM2l\/NAYIQ0wHHXE6Knt3MW1rZjEXdBd3MWouJy8pVRQPCDpBDH5QAgkWHgc-\" class=\"ad_box_new\" style=\"\" id=\"ad_box_ad_0\" onmouseover=\"leftBlockOver('_ad_0')\" onmouseout=\"leftBlockOut('_ad_0')\" target=\"_blank\">\n<div id=\"left_hide_ad_0\" class=\"left_hide_new\" onmouseover=\"leftBlockOver(this)\" onmouseout=\"leftBlockOut(this)\" onclick=\"cancelEvent(event); return leftAdBlockHide('_ad_0', '\/away.php?to=QRscBkBxC1VwdAlWXXFWBhFBCBFFdQccT1ZiFRkObAEUKQkiX2ZtBjspCyAiCw0LXy5XRXJfThVFE0FXAidjNFwaA10OG2kQC2RucyoGVSsJagsaCgVWV2o8WEoeFl53VxVnJQAiKmMxeGMTPAdhAQV1YQsPDnpJAxcMVV8hVToYMF4dMA4\/Ok0ECHsAegI3OAJdfj4UC094EgoJJiYjdglUUyseM2l\/NAYIQ0wHHXE6Knt3MW1rZjEXdBd3MWouJy8pVRQPCDpBDH5QAgkWHgc-');\"><\/div>\n<div id=\"ad_title\" class=\"ad_title_new\">Лучшая стратегия 2011&#33;<\/div>\n<div class=\"ad_domain_new\">Приложение<\/div>\n<span>\n  <div id=\"pr_image\" style=\"position: relative;\">\n    <img src=\"http:\/\/cs10271.vkontakte.ru\/u42137217\/75628422\/s_5f56606f59x:001.jpg\" style=\"\" \/>\n    <div id=\"ads_play_btn\" style=\"display: none;\"><\/div>\n  <\/div>\n<\/span>\n<div id=\"ad_desc\" class=\"ad_desc_new\" style=\"\">-&quot; Чуть школу не проспал, играл с друзьями всю ночь&#33;&quot;<\/div>\n<\/a>\n<div id=\"ad_hide_mask_ad_1\" class=\"ad_hide_mask_new\" style=\"display: none; \"><div class=\"ad_info_new\">Данное объявление больше не будет Вам показываться.<\/div><div class=\"ad_complain_new\">\n  <span class=\"ad_complain_info_new\">Если Вы считаете содержание данного объявления оскорбительным,<\/span>\n  <span class=\"ad_complain_link_new\" onclick=\"reportAd(1476553, this); return false;\">сообщите нам.<\/span>\n<\/div><\/div>\n<a href=\"\/away.php?to=QxscBkBxC1VwdAlXXnRTBhVBBkJAdlYdSlU2Q0hebVJCKFAlX1JgZzFxUAYnElpRJxJSR1YJCQBGC0FBLVU0KUklb3wVIAArAG5KVBobCTYaLlkTOG0wAmEDS0ccMXR8MSsTAB80FkcNIgI7AkJWZhs5fQA6LkIsLQteYGVUbgVJDkRHKxJnE0RUPEMkYnckC0Z8cicjDAMibHQZXxAgemI8URwWFGoVOQ0eGFgqGHAVBmcKJ0BqRzsWSSYDMQwTLmgWZBY5ZxQELAJ9D1kHAgc-\" class=\"ad_box_new\" style=\"\" id=\"ad_box_ad_1\" onmouseover=\"leftBlockOver('_ad_1')\" onmouseout=\"leftBlockOut('_ad_1')\" target=\"_blank\">\n<div id=\"left_hide_ad_1\" class=\"left_hide_new\" onmouseover=\"leftBlockOver(this)\" onmouseout=\"leftBlockOut(this)\" onclick=\"cancelEvent(event); return leftAdBlockHide('_ad_1', '\/away.php?to=QRscBkBxC1VwdAlXXnRTBhVBC0dCIlJDS1lkQRINPlJAfANyX1JgZzFxUAYnElpRJxJSR1YJCQBGC0FBLVU0KUklb3wVIAArAG5KVBobCTYaLlkTOG0wAmEDS0ccMXR8MSsTAB80FkcNIgI7AkJWZhs5fQA6LkIsLQteYGVUbgVJDkRHKxJnE0RUPEMkYnckC0Z8cicjDAMibHQZXxAgemI8URwWFGoVOQ0eGFgqGHAVBmcKJ0BqRzsWSSYDMQwTLmgWZBY5ZxQELAJ9D1kHAgc-');\"><\/div>\n<div id=\"ad_title\" class=\"ad_title_new\">Коллекционная модель<\/div>\n<div class=\"ad_domain_new\">rozetka.ua<\/div>\n<span>\n  <div id=\"pr_image\" style=\"position: relative;\">\n    <img src=\"http:\/\/cs9649.vkontakte.ru\/u137834942\/75628422\/s_e5c1093fddx:001.jpg\" style=\"\" \/>\n    <div id=\"ads_play_btn\" style=\"display: none;\"><\/div>\n  <\/div>\n<\/span>\n<div id=\"ad_desc\" class=\"ad_desc_new\" style=\"\">Точная копия автомобиля. Цена: 113 грн.<\/div>\n<\/a>\n<div class=\"ad_help_link\" id=\"ad_help_link\">\n  <a href=\"\/ads.php?section=target\">Что это?<\/a>\n<\/div>","loc":"album-283_97127417"});showBackLink('/club283', 'Гитаромания');addEvent(window, 'load', function () {Notifier.init({"queue_id":"events_queue3454157","timestamp":"138167994","key":"_PO1SiRfDQaGSuIAcK36PN_O9modAQQPDhYGbf903W3YZd1pJIoJjprZ","uid":3454157,"version":6,"flash_url":"\/swf\/queue_transport.swf","debug":false,"instance_id":"NDg5MTIy","server_url":"http:\/\/q45.queue.vkontakte.ru\/im157","frame_path":"http:\/\/q45.queue.vkontakte.ru\/q_frame.php?4","frame_url":"im157","refresh_url":"http:\/\/vkontakte.ru\/notifier.php","fc":{"version":16,"state":{"clist":{"min":true,"x":0.0115761353517,"y":0.344036697248},"tabs":[],"version":16}}});});addEvent(document, 'click', onDocumentClick);
    }
  </script>


</body></html>
<?php
    echo '</p>';
    echo '<div id="ajax-container"></div>';
    echo '</div>';
}

function my_plugin_action_callback() {
    $absinthe = absinthe($_POST['listId'], $_POST['offset']);

    preg_match_all('/\<![a-z]*\>(.*?)\<!\>/', $absinthe, $matches);

    if (!empty($matches[1][0])) {
        $jsonResponse = array('listId' => $matches[1][2],
                              'listSize' => $matches[1][3],
                              'listData' => cp1251_to_utf8($matches[1][5]));
    } else {
        $jsonResponse = array('listId' => 0,
                              'listData' => 'We`ve got some troubles');
    }

    echo json_encode($jsonResponse);
	die();
}

function absinthe($listId, $offset) {
    $postvars = array(
      "act" => "show",
      "al"  => "1",
      "list" => $listId,
      "offset" => $offset,
      "direction" => null
    );

    $postdata = "";
    foreach ( $postvars as $key => $value )
        $postdata .= "&".rawurlencode($key)."=".rawurlencode($value);
    $postdata = substr( $postdata, 1 );

    $ch = curl_init();
    curl_setopt ($ch, CURLOPT_URL, "http://vk.com/al_photos.php");
    curl_setopt ($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6");
    curl_setopt ($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt ($ch, CURLOPT_POSTFIELDS, $postdata);
//    curl_setopt ($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec ($ch);
    curl_close($ch);

    return $result;
}

//function my_plugin_help() {
//	if (!current_user_can('manage_options'))  {
//		wp_die( __('You do not have sufficient permissions to access this page.') );
//	}
//
//    echo 'AAAAAAAAAAA!!!';
//}
?>