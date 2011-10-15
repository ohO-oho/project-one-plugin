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

//album-283_92418231#offset=40&part=1
//"/album-283_92418231#offset=40&part=1"
//"/al_photos.php#act=show&list=album-283_92418231&photo=-283_127988404"
//
//
//        q: Object
//al: 1
//offset: 40
//part: 1

add_action('admin_head', 'my_plugin_css');
add_action('admin_menu', 'my_plugin_menu');
add_action('wp_ajax_my_action', 'my_plugin_action_callback');
add_action('wp_ajax_serverside_action', 'my_plugin_serverside_action_callback');

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
    add_menu_page('ProjectOne Plugin', 'ProjectOne', 'manage_options', 'project-one', 'my_plugin_options');
    $home_page = add_submenu_page('project-one', 'ProjectOne Home', 'Home', 'manage_options', 'project-one', 'my_plugin_options');
    $serverside_page = add_submenu_page('project-one', 'ProjectOne Server-side', 'Server-side', 'manage_options', 'project-one-server', 'my_plugin_serverside');
    add_action( "admin_head-$home_page", 'my_plugin_home_javascript' );
    add_action( "admin_head-$serverside_page", 'my_plugin_serverside_javascript' );
}

function my_plugin_css() {
?>
    <style type="text/css">
        #ajax-container {
            margin-top: 10px;
        }
        #listIdForm label {
            padding-right: 10px;
        }
        .ajax-loading-gif {
            width: 16px;
            height: 23px;
            background: white url(images/loading.gif) no-repeat center;
            display: none;
        }
    </style>
<?php
}

function my_plugin_home_javascript() {
?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            var data = {
                action: 'my_action'
            };
            $("#listIdForm").submit(function() {
                data.listId = $("#listId").val();
                data.offset = $("#offset").val();
                $("#listIdFormLoader").fadeIn();
                $("#go-btn").val('Пошло-поехало! Ждём...');
                jQuery.post(ajaxurl, data, function(json) {
                    try{
                        var response = jQuery.parseJSON(json);
                    } catch(e) {
                        $("#go-btn").val('JSON не парсится :(');
                        $("#listIdFormLoader").fadeOut();
                        alert('Parsing error: ' + e.name)
                        alert(json);
                    }

                    if (response['listId'] == 0) {
                        $("#go-btn").val('Хм, сам траблез :/');
                        $("#listIdFormLoader").fadeOut();
                        $("#ajax-container").empty();
                        $("#ajax-container").html('<pre style="color: #ff6347;">' + response['listData'] + '</pre>');
                    } else {
                        var listData = jQuery.parseJSON(response['listData']);
                        $("#go-btn").val('Ура! Пришло!');
                        $("#listIdFormLoader").fadeOut();
                        $("#listSize").html(response['listSize']);
                        $("#offset").removeAttr('disabled');
                        $("#ajax-container").empty();
                        $("#ajax-container").append('<table class="widefat"></table>');
                        $("#ajax-container table").append('<thead><tr><th>#</th><th>Id</th><th>x_src</th></tr></thead>');
                        $("#ajax-container table").append('<tfoot><tr><th>#</th><th>Id</th><th>x_src</th></tr></tfoot>');
                        $("#ajax-container table").append('<tbody></tbody>');
                        if (response['listSize'] < 10) {
                            var listSize = response['listSize'];
                        } else {
                            var listSize = 10;
                        }
                        for (var i = 0; i < listSize; i++) {
                            $("#ajax-container table tbody").append('<tr><th>'+(i+parseInt($("#offset").val())+1)+'</th><th>'+listData[i].id+'</th><th>'+listData[i].x_src+'</th></tr>');
                        }
                    };
                });
                return false;
            });
        });
    </script>
<?php
}

function my_plugin_serverside_javascript() {
?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            var data = {
                action: 'serverside_action'
            };
            $("#listIdForm").submit(function() {
                data.listId = $("#listId").val();
                data.offset = $("#offset").val();
                $("#listIdFormLoader").fadeIn();
                $("#go-btn").val('Вжжж! Ждём...');
                jQuery.post(ajaxurl, data, function(json) {
                    try{
                        var response = jQuery.parseJSON(json);
                    } catch(e) {
                        $("#go-btn").val('JSON не парсится :(');
                        $("#listIdFormLoader").fadeOut();
                        alert('Parsing error: ' + e.name)
                        alert(json);
                    }

                    $("#go-btn").val('Ура! Сервер справился!');
                    $("#listIdFormLoader").fadeOut();
                    $("#ajax-container").empty();
                    $("#ajax-container").append('<table class="widefat"></table>');
                    $("#ajax-container table").append('<thead><tr><th>#</th><th>Id</th><th>x_src</th></tr></thead>');
                    $("#ajax-container table").append('<tfoot><tr><th>#</th><th>Id</th><th>x_src</th></tr></tfoot>');
                    $("#ajax-container table").append('<tbody></tbody>');

                    for (var i = 0; i < response.length; i++) {
                        $("#ajax-container table tbody").append('<tr><th>'+(i+parseInt($("#offset").val())+1)+'</th><th>'+response[i].id+'</th><th>'+response[i].x_src+'</th></tr>');
                    }
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
	echo '<div>';
?>
        <form id="listIdForm">
            <ul>
                <li><label for="listId">Идентификатор альбома<span>*</span>: </label>
                <input id="listId" size="30" name="listId" value="album-2281699_140017490" /></li>
                <li><label for="offset">Смещение: </label>
                <input id="offset" disabled="disabled" name="offset" value="0" /> (всего <span id="listSize">хз</span> фото)</li>
                <li><div><input type="submit" value="Го!" id="go-btn" class="button-secondary" style="float: left; width: 150px;" />
                <div class="ajax-loading-gif" id="listIdFormLoader" style="float: left; padding-left: 3px"></div></div></li>
            </ul>
        </form>
<?php
    echo '</div><br><br>';
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

function my_plugin_serverside_action_callback() {
    $absinthe = absinthe($_POST['listId'], $_POST['offset']);

    preg_match_all('/\<![a-z]*\>(.*?)\<!\>/', $absinthe, $matches);

    if (!empty($matches[1][0])) {
        $test = preg_replace('/\"comments\":(.*?)\",\"date\"/', '"comments":0,"date"', $matches[1][5]);
        $listData = json_decode(cp1251_to_utf8($test));
        $photos = array();
        foreach ($listData as $key => $photo) {
            $photos[$key]['id']    = $photo->id;
            $photos[$key]['x_src'] = $photo->x_src;
            $photos[$key]['y_src'] = $photo->y_src;
            $photos[$key]['z_src'] = $photo->z_src;
            $photos[$key]['date']  = $photo->date;
        }
    } else {
        $jsonResponse = 'We`ve got some troubles';
    }

    echo json_encode($photos);
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

function my_plugin_serverside() {

if (!current_user_can('manage_options'))  {
		wp_die( __('You do not have sufficient permissions to access this page.') );
	}

    echo '<div class="wrap">';
	echo '<h2>Server-side parsing</h2>';
	echo '<p>';
?>
        <form id="listIdForm">
            <ul>
                <li><label for="listId">Идентификатор альбома<span>*</span>: </label>
                <input id="listId" size="30" name="listId" value="album-2281699_140017490" /></li>
                <li><label for="offset">Смещение: </label>
                <input id="offset" disabled="disabled" name="offset" value="0" /> (всего <span id="listSize">хз</span> фото)</li>
                <li><div><input type="submit" value="Го!" id="go-btn" class="button-secondary" style="float: left; width: 150px;" />
                <div class="ajax-loading-gif" id="listIdFormLoader" style="float: left; padding-left: 3px"></div></div></li>
            </ul>
        </form>
<?php
    echo '</p>';
    echo '<div id="ajax-container"></div>';
    echo '</div>';
}
?>