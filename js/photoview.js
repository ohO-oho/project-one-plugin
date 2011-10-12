/**
 * User: ohO_oho
 * Date: 07.10.11
 * Time: 12:13
 */

var Photoview = {
  blank: '/images/blank.gif',
  blankf: function() {},
  cacheSize: 3,
  allSizes: ['x', 'y', 'z'],

  updateArrows: function() {
    var sbw = sbWidth() + 2;
    cur.pvLeft.style.left = '20px';//(Math.floor((lastWindowWidth - sbw - cur.pvActualWidth - 52) / 2) - 39) + 'px';
    cur.pvLeftNav.style.width = Math.floor((lastWindowWidth - sbw - cur.pvActualWidth - 52) / 2) + 'px';
    cur.pvRightNav.style.left = Math.floor((lastWindowWidth - sbw + cur.pvActualWidth + 52) / 2) + 'px';
    cur.pvRightNav.style.width = Math.floor((lastWindowWidth - sbw - cur.pvActualWidth - 52) / 2) + 'px';
    cur.pvClose.style.left = (lastWindowWidth - sbw - 2 - 37) + 'px';//(Math.floor((lastWindowWidth - sbw + cur.pvActualWidth + 52) / 2) + 22) + 'px';
  },
  updateHeight: function() {
    var h = cur.pvBox.offsetHeight + 110, sbw = Math.floor(sbWidth() / 2);
    cur.pvLeftNav.style.height = cur.pvRightNav.style.height = (h - 110) + 'px';
    window.updateWndVScroll && updateWndVScroll();
    if (!browser.mobile) return;
    var skipTop = 10 + cur.pvYOffset;
    cur.pvLeft.style.top = cur.pvClose.style.top = (cur.pvYOffset + 25) + 'px';
    if (lastWindowHeight < cur.pvYOffset + h) {
      setTimeout(function() {
        var f = ge('footer');
        f.style.height = (intval(getStyle(f, 'height')) + (cur.pvYOffset + h - lastWindowHeight)) + 'px';
        onBodyResize();
        Photoview.onResize();
      }, 1);
    }
  },
  actionInfo: function() {
    return ge('pv_action_info') || cur.pvWide.insertBefore(ce('div', {id: 'pv_action_info'}), cur.pvTags);
  },

  locNav: function(ch, old, nw, opts) {
    if ((cur.pvListId == 'newtag' + vk.id + (nw.rev ? '/rev' : '')) && (nw[0] == 'albums' + vk.id) && (nw.act == 'added')) {
      Photoview.hide(opts.hist);
      return false;
    }
    nw = nav.toStr(nw);
    if (nw.replace('?rev=1', '/rev') == cur.pvListId && cur.pvShown) {
      Photoview.hide(opts.hist);
      return false;
    }
    var m = nw.match(/^photo(-?\d+_\d+)\??((all=1|newtag=\d+)(&rev=1)?|(rev=1&)?tag=\d+|rev=1)?$/);
    if (!m) return;

    var listId = cur.pvListId;
    if (!listId || !cur.pvShown) {
      if (nav.objLoc.act == 'added') {
        listId = 'newtag' + vk.id + (nav.objLoc.rev ? '/rev' : '');
      } else {
        listId = nav.strLoc.replace('?rev=1', '/rev');
      }
    }
    var data = cur.pvData[listId];
    if (!data) return;

    for (var i = 0, l = data.length; i < l; ++i) {
      if (data[i] && data[i].id == m[1]) {
        Photoview.show(listId, i, false, cur.pvRoot);
        return false;
      }
    }
  },
  updateLocNav: function() {
    if (cur.pvRoot) {
      for (var i = 0, l = cur.nav.length; i < l; ++i) {
        if (cur.nav[i] == Photoview.locNav) return;
      }
      cur.nav.push(Photoview.locNav);
    } else {
      for (var i = 0, l = cur.nav.length; i < l; ++i) {
        if (cur.nav[i] == Photoview.locNav) {
          cur.nav.splice(i, 1);
          --i; --l;
        }
      }
    }
  },
  show: function(listId, index, ev, root) {
    if (ev && (ev.button == 2 || ev.which == 3)) return;

    clearTimeout(window.__pvhideTimer);

    if (listId == 'temp' && cur.pvShown && cur.pvListId != 'temp') return;
    if (__afterFocus) {
      return ev ? cancelEvent(ev) : false;
    }
    if (cur.pvTagger) {
      Photoview.stopTag();
      if (ev !== false) {
        return ev ? cancelEvent(ev) : false;
      }
    }
    if (listId === false) listId = cur.pvListId;
    var count = ((cur.pvData || {})[listId] || {}).length, otherList = (listId != cur.pvListId);

    if (!count) return;

    var vis = isVisible(layerWrap) || isVisible(ge('mv_layer_wrap'));
    if (vis && !cur.pvShown) {
      if (layers.fullhide) {
        layers.fullhide(false, true);
      }
      vis = false;
    }
    if (!vis) {
      otherList = true;
      addEvent(window, 'resize', Photoview.onResize);
      addEvent(document, 'keydown', Photoview.onKeyDown);
      addEvent(layerWrap, 'click', Photoview.onClick);
      boxQueue.hideAll();
      setStyle(layerBG, {opacity: ''});
      layers.show();
      layers.fullhide = Photoview.hide;
    } else if (count == 1 && !otherList && index != cur.pvIndex && listId != 'temp') {
      Photoview.hide();
      return ev ? cancelEvent(ev) : false;
    }

    if (otherList && listId != 'temp') {
      cur.pvRoot = root;
      Photoview.updateLocNav();
    }

    if (ev && ev.pageX && ev.pageY) {
      extend(cur, {pvOldX: ev.pageX, pvOldY: ev.pageY, pvOldT: vkNow()});
    }

    var direction = otherList ? 1 : (cur.pvIndex > index ? -1 : 1);

    index += (index < 0 ? count : (index >= count ? (-count) : 0));

    var ph = cur.pvData[listId][index];

    if (!ph || !ph.x_src) return;

    cur.pvIndex = index;
    cur.pvShown = true;
    cur.pvListId = listId;
    if (!cur.pvFixed) {
      var colorClass = cur.pvDark ? 'pv_dark' : 'pv_light';

      cur.pvFixed = bodyNode.appendChild(ce('div', {className: 'pv_fixed fixed ' + colorClass, innerHTML: '\
<div class="pv_left no_select" onmousedown="Photoview.show(false, cur.pvIndex - 1 + vk.rtl * 2, event);" onmouseover="Photoview.activate(this)" onmouseout="Photoview.deactivate(this)"><div></div></div>\
<div class="pv_close no_select" onmouseover="Photoview.activate(this)" onmouseout="Photoview.deactivate(this)" onmousedown="Photoview.onClick(event);cur.pvClicked=true;"><div></div></div>\
      '}));

      cur.pvLeft = cur.pvFixed.firstChild;
      cur.pvClose = cur.pvLeft.nextSibling;

      addClass(layerWrap, colorClass);
      addClass(layerBG, colorClass);
      vkImage().src = '/images/upload.gif';

      layer.innerHTML = '\
<div class="pv_cont">\
\
<table cellspacing="0" cellpadding="0">\
<tr><td class="sidesh s1"><div></div></td><td>\
<table cellspacing="0" cellpadding="0">\
<tr><td class="sidesh s2"><div></div></td><td>\
<table cellspacing="0" cellpadding="0">\
<tr><td colspan="3" class="bottomsh s3"><div></div></td></tr>\
<tr><td class="sidesh s3"><div></div></td><td>\
\
<div id="pv_box" onclick="cur.pvClicked = true;">\
  <form method="POST" target="pv_to_profile_frame" name="pv_to_profile_form" id="pv_to_profile_form"></form>\
  <a class="fl_r pv_close_link" onclick="Photoview.hide()">' + getLang('global_close') + '</a>\
  <div id="pv_summary"><span class="summary"></span></div>\
  <div id="pv_tag_info" class="clear_fix"></div>\
  <div class="no_select pv_data">\
    <div id="pv_tag_frame"></div>\
    <div id="pv_tag_faded"></div>\
    <div id="pv_tag_person" onmouseout="Photoview.hideTag()"></div>\
    <div id="pv_loader"></div>\
    <a onmouseout="Photoview.hideTag()" onmousedown="if (!cur.pvTagger && checkEvent(event) === false) return Photoview.show(false, cur.pvIndex + 1, event);" onselectstart="return cancelEvent(event);" onclick="return checkEvent(event)" href="" id="pv_photo"></a>\
  </div>\
  <div class="clear_fix select_fix" id="pv_comments_data">\
    <div class="fl_l wide_column">\
      <div id="pv_wide"></div>\
      <div id="pv_your_comment" class="clear clear_fix" onclick="return cancelEvent(event);">\
        <div id="pv_comment_header">' + getLang('photos_yourcomment') + '</div>\
        <textarea id="pv_comment" onkeyup="checkTextLength(cur.pvCommLimit, this, ge(\'pv_comment_warn\'))" onkeypress="onCtrlEnter(event, Photoview.sendComment);"></textarea>\
        <div id="pv_comment_submit">\
          <div class="button_blue fl_l"><button id="pv_comment_send">' + getLang('box_send') + '</button></div>\
          <div class="progress fl_l" id="pv_comment_progress"></div>\
          <div id="pv_comment_warn" class="fl_l"></div>\
        </div>\
      </div>\
    </div>\
    <div class="fl_r narrow_column" id="pv_narrow"></div>\
  </div>\
</div>\
\
</td><td class="sidesh s3"><div></div></td></tr>\
<tr><td colspan="3" class="bottomsh s3"><div></div></td></tr></table>\
</td><td class="sidesh s2"><div></div></td></tr>\
<tr><td colspan="3" class="bottomsh s2"><div></div></td></tr></table>\
</td><td class="sidesh s1"><div></div></td></tr>\
<tr><td colspan="3" class="bottomsh s1"><div></div></td></tr></table>\
</div>\
<div class="no_select" id="pv_left_nav" '+'onmouseover="Photoview.activate(cur.pvLeft)" onmouseout="Photoview.deactivate(cur.pvLeft)" onmousedown="Photoview.show(false, cur.pvIndex - 1 + vk.rtl * 2, event); cur.pvClicked = true;" onselectstart="return cancelEvent(event);"></div>\
<div class="no_select" id="pv_right_nav" '+'onmouseover="Photoview.activate(cur.pvClose)" onmouseout="Photoview.deactivate(cur.pvClose)" onmousedown="Photoview.onClick(event);cur.pvClicked=true;"></div>\
<div class="pv_switch no_select" id="pv_switch" onmouseover="if (!browser.msie6) Photoview.activate(this)" onmouseout="if (!browser.msie6) Photoview.deactivate(this)" onmousedown="Photoview.switchColor(this); cur.pvClicked = true;"><div class="pv_switch_wrap"><img class="pv_switch_img" src="/images/photoswitch.png" /></div></div>\
      ';

      extend(cur, {
        pvCont: layer.firstChild,
        pvBox: ge('pv_box'),

        pvLeftNav: ge('pv_left_nav'),
        pvRightNav: ge('pv_right_nav'),

        pvSummary: ge('pv_summary').firstChild,
        pvTagInfo: ge('pv_tag_info'),
        pvLoader: ge('pv_loader'),
        pvTagFrame: ge('pv_tag_frame'),
        pvTagFaded: ge('pv_tag_faded'),
        pvTagPerson: ge('pv_tag_person'),
        pvPhoto: ge('pv_photo'),
        pvCommentsData: ge('pv_comments_data'),

        pvNarrow: ge('pv_narrow'),
        pvWide: ge('pv_wide'),

        pvCommentWrap: ge('pv_your_comment'),
        pvCommentSend: ge('pv_comment_send'),
        pvComment: ge('pv_comment'),

        pvSwitch: ge('pv_switch')
      });
      addEvent(cur.pvPhoto, 'mousemove', Photoview.onMouseMove);
      if (browser.mobile) {
        cur.pvYOffset = intval(window.pageYOffset);

        cur.pvCont.style.paddingTop = cur.pvLeftNav.style.top =
        cur.pvRightNav.style.top = (cur.pvYOffset + 10) + 'px';

        cur.pvSwitch.style.top = cur.pvYOffset + 'px';
      }
      addEvent(layerBG, 'mouseover', Photoview.activate.pbind(cur.pvClose));
      addEvent(layerBG, 'mouseout', Photoview.deactivate.pbind(cur.pvClose));
      Photoview.updateSize();
    }
    if (cur.pvCurrent) {
      cur.pvCurrent.onload = Photoview.blankf;
      cur.pvCurrent.src = Photoview.blank;
    }
    delete cur.pvCurrent;
    cur.pvCurrent = vkImage();
    cur.pvCurrent.onload = Photoview.preload.pbind(index, direction);
    cur.pvCurrent.src = cur.pvBig ? ((cur.pvVeryBig && ph.z_src) ? ph.z_src : (ph.y_src ? ph.y_src : ph.x_src)) : ph.x_src;
    alert('ЙАААААЗЬЬЬЬ!!!');

    if (otherList) {
      (count > 1 ? show : hide)(cur.pvLeft, cur.pvLeftNav, cur.pvRightNav, cur.pvClose);
    }
    cur.pvSummary.innerHTML = (listId == 'temp') ? '<img src="/images/upload.gif" />' : ((count > 1) ? getLang('photos_photo_num_of_N').replace('%s', cur.pvIndex + 1).replace('%s', count) : getLang('photos_view_one_photo'));

    cur.pvTimerPassed = 0;
    clearTimeout(cur.pvTimer);
    cur.pvCurPhoto = ph;
    cur.pvTimer = setTimeout(Photoview.doShow, 0);

    return ev ? cancelEvent(ev) : false;
  },
  doShow: function() {
    var img = cur.pvCurrent;
    if ((!img.width || !img.height) && cur.pvTimerPassed < 5000) {
      clearTimeout(cur.pvTimer);
      cur.pvTimerPassed += 100;
      cur.pvTimer = setTimeout(Photoview.doShow, 100);
      return;
    }
    if (!cur.pvShown) return;

    var lnk = cur.pvPhoto, c = 1, marginTop = 0, w = img.width || 604, h = img.height || 453;
    if (cur.pvBig) {
      if (w > cur.pvWidth) {
        c = cur.pvWidth / w;
      }
      if (h * c > cur.pvHeight) {
        c = cur.pvHeight / h;
      }
    }
    if (h * c >= 453) {
      lnk.style.height = Math.floor(h * c) + 'px';
    } else {
      lnk.style.height = '453px';
    }
    marginTop = positive(Math.floor((453 - h * c) / 2));
    cur.pvPhWidth = Math.floor(w * c);
    cur.pvPhHeight = Math.floor(h * c);
    cur.pvActualWidth = Math.max(cur.pvPhWidth, 604);

    if (cur.pvBig) {
      cur.pvCont.style.width = (cur.pvActualWidth + 154) + 'px';
      cur.pvSummary.parentNode.style.width = (cur.pvActualWidth - 4) + 'px';
    }

    Photoview.stopTag();
    Photoview.hideTag();

    if (cur.pvLoader) {
      hide(cur.pvLoader);
      delete(cur.pvLoader);
    }

    lnk.innerHTML = '<img onmouseout="Photoview.hideTag()" style="width: ' + cur.pvPhWidth + 'px; height: ' + cur.pvPhHeight + 'px; margin-top: ' + marginTop + 'px;" src="' + img.src + '" />';
    layerWrap.scrollTop = 0;
    if (cur.pvListId == 'temp') return;

    var ph = cur.pvCurPhoto, notAvail = (ph.commshown >= 0) ? false : (-ph.commshown);

    if (window.tooltips) {
      if (cur.pvLikeIcon) {
        tooltips.destroy(cur.pvLikeIcon.parentNode);
      }
      if (cur.pvTags) {
        each(geByClass('delete', cur.pvTags), function() {
          tooltips.destroy(this);
        });
      }
    }

    var taglnkst = (!ph.taginfo && ph.actions.tag && ph.tags[0] < cur.pvMaxTags) ? '' : ' style="display: none"';
    var shareacts = [];
    if (vk.id) shareacts.push(['pvs_send', getLang('photos_send_to_fr'), 'onclick="Photoview.sendPhoto()"']);
    if (ph.actions.save) shareacts.push(['pvs_save', getLang('photos_save_to_alb'), 'onclick="Photoview.savePhoto()"']);
    shareacts.push(['pvs_down', getLang('photos_download_hq'), 'target="_blank" href="' + (ph.w_src || ph.z_src || ph.y_src || ph.x_src) + /* '?dl=1' + */'"']);

    var share = '', l = shareacts.length, sprg = '<div id="pv_share_prg" class="progress fl_r"></div>';
    if (l < 1) {
      share = '';
    } else if (l == 1) {
      share = '<a ' + shareacts[0][2] + '>' + sprg + shareacts[0][1] + '</a>';
    } else {
      for (var i = 0; i < l; ++i) {
        share += '<a class="pvs_act" ' + shareacts[i][2] + '><span class="fl_l ' + shareacts[i][0] + '"></span><span class="pvs_act_text">' + shareacts[i][1] + '</span></a>';
      }
      share = '<a id="pv_share" onclick="Photoview.showShare()">' + sprg + '<span id="pv_share_text">' + getLang('photos_share_from_view') + '</span></a>\
<div onmouseover="Photoview.showShare()" onmouseout="Photoview.hideShare(500)" onclick="Photoview.hideShare(-1)" id="pvs_dd" class="fixed"><table cellspacing="0" cellpadding="0"><tr>\
  <td class="pvs_side_sh"><div class="pvs_side_sh_el"></div></td>\
  <td>\
    <div class="pvs_header_wrap"><div class="pvs_header"><span class="pvs_header_text">' + getLang('photos_share_from_view') + '</span></div></div>\
    <div class="pvs_acts">' + share + '</div>\
    <div class="pvs_sh1"></div><div class="pvs_sh2"></div>\
  </td>\
  <td class="pvs_side_sh"><div class="pvs_side_sh_el"></div></td>\
</tr></table></div>';
    }

    cur.pvNarrow.innerHTML = (notAvail == 2 ? '' : '\
<div class="info">' + getLang('photos_album_name') + '</div>\
<div class="info" id="pv_album">' + ph.album + '</div>') + '\
<div class="info">' + getLang('photos_author') + '</div>\
<div id="pv_author">' + ph.author + '</div>\
<div id="pv_actions">\
  <a id="pv_tag_link" onclick="Photoview.startTag()"' + taglnkst + '>' + getLang('photos_tagperson') + '</a>\
' + (ph.actions.prof ? ('<a id="pv_to_profile" onmouseover="Photoview.toProfileTag()" onmouseout="Photoview.hideTag()" onclick="Photoview.startTag(true)">' + getLang('photos_load_to_profile') + '</a>') : '') + '\
' + ((ph.actions.edit & 2) ? ('<a id="pv_edit_link" onclick="showBox(\'al_photos.php\', {act: \'edit_desc\', photo: cur.pvData[cur.pvListId][cur.pvIndex].id}, {stat: [\'ui_controls.css\', \'ui_controls.js\']})">' + getLang('photos_edit') + '</a>') : '') + '\
' + (ph.y_src ? ('<a id="pv_large_link" onclick="Photoview.switchSize()">' + getLang(cur.pvBig ? 'photos_smaller' : 'photos_larger') + '</a>') : '') + '\
' + share + '\
' + (ph.actions.del ? ('<a id="pv_delete_link" onclick="Photoview.deletePhoto()"><div class="progress fl_r" id="pv_delete_progress"></div>' + getLang('global_delete') + '</a>') : '') + '\
' + (ph.actions.spam ? ('<a id="pv_spam_link" onclick="Photoview.spamPhoto(this.firstChild)"><div class="progress fl_r"></div>' + getLang('its_spam') + '</a>') : '') + '\
' + (ph.actions.rot ? ('<div id="pv_rotate"><div id="pv_rotate_progress" class="progress fl_r"></div>' + getLang('photos_rotate') + '\
    <span onclick="Photoview.rotatePhoto(1)" class="right"></span>\
    <span onclick="Photoview.rotatePhoto(-1)" class="left"></span>\
    <form method="POST" target="pv_rotate_frame" name="pv_rotate_form" id="pv_rotate_form"></form>\
  </div>') : '') + '\
</div>';

    var likeop = (ph.liked ? 1 : 0.4), likest = browser.msie ? ('filter: alpha(opacity=' + Math.floor(likeop * 100) + ')') : ('opacity: ' + likeop);

    var commstyle = '', commshown = '', commlink = '', commclass = '';
    if (ph.commcount > ph.commshown) {
      commshown = getLang('photos_show_prev_comments', ph.commcount - ph.commshown);
    } else {
      commstyle = ' style="display: none"';
    }

    var additional = notAvail ? '<div class="clear">' + getLang('photos_in_closed_album') + '</div>' : '\
<div id="pv_comments_header" class="clear ' + commclass + '"' + commstyle + ' onclick="Photoview.comments()">\
  <div>' + commshown + '</div><div id="pv_comments_progress" class="progress"></div>\
</div>\
<div id="pv_comments" class="clear">' + ph.comments + '</div>';

    var tagsst = ph.tagshtml ? '' : ' style="display: none"',
        descText = '<span' + (ph.actions.edit & 1 ? (' style="cursor: pointer" onclick="Photoview.editInline(event)"' + (ph.desc ? (' onmouseover="showTooltip(this, {text: getLang(\'photos_edit_desc\')})"') : ' class="pv_desc_edit"')) : '') + '>' + (ph.desc || getLang('photos_edit_desc')) + '</span>';

    cur.pvWide.innerHTML = '\
<div id="pv_desc" style="' + ((ph.actions.edit || ph.desc) ? '' : 'display: none') + '">' + descText + '</div>\
<div id="pv_tags"' + tagsst + '>' + getLang('photos_onthisphoto') + ': ' + ph.tagshtml + '</div>\
<div id="pv_inlineedit_prg" class="fl_r progress"></div>\
<div id="pv_date_wrap" class="fl_l">' + getLang('photos_added') + ' <span id="pv_date">' + ph.date + '</span></div>\
<span class="divider fl_l">|</span>\
<div id="pv_like_wrap" class="fl_l" onmouseover="Photoview.likeOver()" onmouseout="Photoview.likeOut()" onclick="Photoview.like()">\
  <span class="fl_l">' + getLang('photos_i_like') + '</span>\
  <div class="fl_l' + (ph.likes ? '' : ' nolikes') + '" id="pv_like_icon" style="' + likest + '"></div>\
  <span id="pv_like_count" class="fl_l">' + (ph.likes || '') + '</span>\
</div>' + (notAvail == 2 ? '' : additional);

    extend(cur, {
      pvTagLink: ge('pv_tag_link'),
      pvLikeIcon: ge('pv_like_icon'),
      pvDesc: ge('pv_desc'),
      pvTags: ge('pv_tags')
    });

    if (ph.deleted) {
      cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
      cur.pvTagInfo.innerHTML = ph.deleted;
      show(cur.pvTagInfo);
      hide(cur.pvCommentsData);
    } else if (ph.taginfo) {
      cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
      cur.pvTagInfo.innerHTML = '\
<table cellspacing="0" cellpadding="0"><tr>\
<td class="info">' + ph.taginfo + '</td>\
<td><nobr><div class="button_blue"><button id="pv_confirm_tag">' + getLang('photos_confirm_tag') + '</button></div></td>\
<td><nobr><div class="button_gray"><button id="pv_delete_tag">' + getLang('photos_delete_tag') + '</button></div></td>\
<td><div id="pv_tag_handling" class="progress"></div></td>\
</tr></table>';
      show(cur.pvTagInfo, cur.pvCommentsData);
      ge('pv_confirm_tag').onclick = Photoview.confirmTag.pbind(ph.tagid);
      ge('pv_delete_tag').onclick = Photoview.deleteTag.pbind(ph.tagid);
    } else {
      hide(cur.pvTagInfo);
      show(cur.pvCommentsData);
    }

    if (notAvail || !ph.actions.comm) {
      hide(cur.pvCommentWrap);
    } else {
      show(cur.pvCommentWrap);
      cur.pvCommentSend.onclick = Photoview.sendComment;
      if (!cur.pvComment.phevents) {
        cur.pvComment.placeholder = getLang('reply_to_post');
        placeholderSetup(cur.pvComment);
      }
      if (!cur.pvComment.autosize) {
        autosizeSetup(cur.pvComment, {minHeight: 65, onResize: Photoview.updateHeight});
      }
    }

    Photoview.updateArrows();

    setTimeout(Photoview.afterShow, 2);
  },
  afterShow: function() {
    Photoview.updateHeight();

    cur.pvPhoto.href = '/photo' + cur.pvCurPhoto.id;
    cur.pvPhoto.focus();

    if ((cur.pvCurPhoto.actions.edit & 4) && !cur.pvCurPhoto.desc) {
      Photoview.editInline();
    }

    var x = cur.pvPhoto.firstChild.offsetLeft, y = cur.pvPhoto.firstChild.offsetTop;
    cur.pvTagFrame.innerHTML = '<img style="width: ' + cur.pvPhWidth + 'px; height: ' + cur.pvPhHeight + 'px;" src="' + cur.pvCurrent.src + '" />';
    setStyle(cur.pvTagFaded, {
      width: cur.pvPhWidth + 'px',
      height: cur.pvPhHeight + 'px',
      left: x + 'px',
      top: y + 'px'
    });
    var deltaX = browser.mozilla && ((lastWindowWidth - cur.pvActualWidth) % 2) && ((cur.pvActualWidth - cur.pvPhWidth) % 2) ? 4 : 3;
    setStyle(cur.pvTagFrame, {
      left: (x - deltaX) + 'px', // 3 - tag frame border, mozilla buggy
      top: (y - 3) + 'px'
    });
    setStyle(cur.pvTagPerson, {
      left: x + 'px',
      top: y + 'px'
    });

    var nl, listId = cur.pvListId;
    if (cur.pvRoot) {
      nl = {0: 'photo' + cur.pvCurPhoto.id};
      if (listId.substr(0, 6) == 'photos') {
        nl.all = 1;
      } else if (listId.substr(0, 3) == 'tag') {
        nl.tag = intval(listId.substr(3));
      } else if (listId.substr(0, 6) == 'newtag') {
        nl.newtag = intval(listId.substr(6));
      }
      if (listId.indexOf('/rev') != -1) {
        nl.rev = 1;
      }
    } else {
      nl = extend(nav.objLoc, {z: 'photo' + cur.pvCurPhoto.id + '/' + cur.pvListId});
    }

    if (nav.strLoc != nav.toStr(nl)) {
      if (!cur.pvNoHistory) {
        ++cur.pvHistoryLength;
      }
      nav.setLoc(nl);
    }
  },

  showShare: function() {
    clearTimeout(cur.hideShareTimer);
    var dd = ge('pvs_dd');
    ge('pv_share').blur();
    if (isVisible(dd)) {
      return fadeIn(dd, 0);
    }
    setTimeout(addEvent.pbind(document, 'click', Photoview.hideShare), 1);
    show(dd);
  },
  hideShare: function(timeout) {
    if (timeout > 0) {
      cur.hideShareTimer = setTimeout(Photoview.hideShare.pbind(0), timeout);
      return;
    }
    var dd = ge('pvs_dd');
    if (!dd) return;
    if (timeout == -1) {
      hide(dd);
    } else {
      fadeOut(dd, 200);
    }
    removeEvent(document, 'click', Photoview.hideShare);
  },
  savePhoto: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    ajax.post('al_photos.php', {act: 'save_me', photo: ph.id, list: listId, hash: ph.hash}, {progress: 'pv_share_prg', onDone: showDoneBox});
  },
  sendPhoto: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    showBox('al_mail.php', {act: 'send_photo', photo: ph.id, list: listId}, {params: {width: 450}, stat: ['ui_controls.js', 'ui_controls.css', 'mail.css']});
  },

  setTags: function(tags) {
    Photoview.hideTag();
    if (!tags) {
      hide(cur.pvTags);
      return;
    }
    show(cur.pvTags);
    if (window.tooltips) {
      each(geByClass('delete', cur.pvTags), function() {
        tooltips.destroy(this);
      });
    }
    cur.pvTags.innerHTML = getLang('photos_onthisphoto') + ': ' + tags;
  },
  preload: function(from, direction) {
    window.updateWndVScroll && updateWndVScroll(); // Because called on photo load
    var listId = cur.pvListId, count = ((cur.pvData || {})[listId] || {}).length;
    if (!count) return;

    var s1 = cur.pvBig ? (cur.pvVeryBig > 1 ? 'w' : (cur.pvVeryBig ? 'z' : 'y')) : 'x';
    var s2 = cur.pvBig ? (cur.pvVeryBig > 1 ? 'z' : (cur.pvVeryBig ? 'y' : 'x')) : 0;
    var s3 = cur.pvBig ? (cur.pvVeryBig > 1 ? 'y' : (cur.pvVeryBig ? 'x' : 0)) : 0;

    cur.pvLastFrom = from;
    cur.pvLastDirection = direction;

    // remove preloaded ones without touching preloading ones
    for (var i = 0; i < Math.min(Photoview.cacheSize, count - Photoview.cacheSize); ++i) {
      var ind = from + (i + 1) * (-direction);
      while (ind >= count) ind -= count;
      while (ind < 0) ind += count;

      var p = cur.pvData[listId][ind];
      if (!p) continue;
      for (var j = 0, l = Photoview.allSizes.length; j < l; ++j) {
        var s = Photoview.allSizes[j];
        if (p[s] && p[s].src) {
          p[s].src = Photoview.blank;
          delete(p[s]);
        }
      }
    }
    for (var i = 0; i < Photoview.cacheSize; ++i) {
      var ind = from + (i + 1) * direction;
      while (ind >= count) ind -= count;
      while (ind < 0) ind += count;

      var p = cur.pvData[listId][ind];
      if (!p || !p.id) {
        if (!p || (vkNow() - p > 3000)) {
          cur.pvData[listId][ind] = vkNow();
          setTimeout(function() {
            ajax.post('al_photos.php', {act: 'show', list: listId, offset: ind, direction: direction}, {onDone: Photoview.loaded});
          }, 10);
        }
        break;
      }

      if (p[s1]) continue;
      if (p[s1 + '_src']) {
        p[s1] = vkImage();
        p[s1].src = p[s1 + '_src'];
        continue;
      } else {
        p[s1] = 1;
      }

      if (p[s2]) continue;
      if (p[s2 + '_src']) {
        p[s2] = vkImage();
        p[s2].src = p[s2 + '_src'];
        continue;
      } else {
        p[s2] = 1;
      }

      if (p[s3]) continue;
      if (p[s3 + '_src']) {
        p[s3] = vkImage();
        p[s3].src = p[s3 + '_src'];
        continue;
      } else {
        p[s3] = 1;
      }

      if (p.x) continue;
      p.x = vkImage();
      p.x.src = p.x_src;
    }
  },
  hide: function(noLoc) {
    if (!cur.pvShown || __afterFocus) return;
    if (cur.pvListId == 'temp') {
      cur.pvCancelLoad();
    } else if (!cur.pvNoHistory && !noLoc && cur.pvHistoryLength < 10) {
      cur.pvNoHistory = true;
      __adsLoaded = 0;
      return history.go(-cur.pvHistoryLength);
    }

    if (noLoc !== true) {
      var newLoc;
      if (cur.pvRoot) {
        if (cur.pvListId.substr(0, 6) == 'newtag') {
          newLoc = 'albums' + vk.id + '?act=added';
          if (cur.pvListId.indexOf('/rev') != -1) {
            newLoc += '&rev=1';
          }
        } else {
          newLoc = cur.pvListId.replace('/rev', '?rev=1');
        }
        nav.setLoc(newLoc);
      } else {
        newLoc = clone(nav.objLoc);
        delete(newLoc.z);
      }
      nav.setLoc(newLoc);
      __adsLoaded = 0;
    }

    window.__pvhideTimer = setTimeout(Photoview.doHide, 0);
    setTimeout(updAds.pbind(false), 0);
  },
  doHide: function() {
    cur.pvHistoryLength = 0;
    Photoview.stopTag();
    cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
    if (cur.pvFriends) {
      cleanElems('pv_add_tag', 'pv_cancel_tag', cur.pvFriends.firstChild.firstChild, cur.pvFriends);
      re(cur.pvFriends);
      cur.pvFriends = cur.pvFriendName = false;
    }

    removeEvent(cur.pvPhoto, 'mousemove', Photoview.onMouseMove);

    // remove preloaded
    var listId = cur.pvListId, count = ((cur.pvData || {})[listId] || {}).length;
    if (cur.pvLastDirection && count) {
      for (var i = 0; i < Photoview.cacheSize; ++i) {
        var ind = cur.pvLastFrom + (i + 1) * cur.pvLastDirection;
        while (ind >= count) ind -= count;
        while (ind < 0) ind += count;

        var p = cur.pvData[listId][ind];
        if (!p) continue;
        for (var j = 0, l = Photoview.allSizes.length; j < l; ++j) {
          var s = Photoview.allSizes[j];
          if (p[s] && p[s].src) {
            p[s].src = Photoview.blank;
            delete(p[s]);
          }
        }
      }
      cur.pvLastDirection = cur.pvLastFrom = false;
    }
    layers.hide();
    layers.fullhide = false;

    Photoview.hideTag(true);
    each(['pvLeft', 'pvClose', 'pvSwitch', 'pvFixed'], function() {
      var n = this + '';
      re(cur[n]);
      cur[n] = false;
    });
    if (window.tooltips) {
      each(geByClass('delete', cur.pvTags), function() {
        tooltips.destroy(this);
      });
    }

    if (browser.mobile) {
      ge('footer').style.height = '';
    }

    var colorClass = cur.pvDark ? 'pv_dark' : 'pv_light';
    removeClass(layerWrap, colorClass);
    removeClass(layerBG, colorClass);
    layerBG.style.opacity = '';

    cur.pvShown = cur.pvListId = cur.pvClicked = false;
    removeEvent(window, 'resize', Photoview.onResize);
    removeEvent(document, 'keydown', Photoview.onKeyDown);
    removeEvent(layerWrap, 'click', Photoview.onClick);

    if (cur.pvPreloaded) {
      var cont = ge('photos_container'), d = ce('div', {innerHTML: cur.pvPreloaded});
      while (d.firstChild) {
        cont.appendChild(d.firstChild);
      }
      if (cont.qsorter) {
        setTimeout(qsorter.added.pbind(cont), 0);
      }
      cur.pvPreloaded = false;
    }
  },
  editPhoto: function() {
  },
  editInline: function(ev, noreq) {
    if (((ev || window.event || {}).target || {}).tagName == 'A') return;

    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index], noreq = !ph.desc;
    var onDone = function(text) {
      if (!cur.pvShown || cur.pvListId != listId || cur.pvIndex != index) return;

      cur.pvEditing = [listId, index];
      var mrg = '0px 0px 0px', taStyle = '';
      if (browser.chrome) {
        mrg = '0px 0px -5px';
        taStyle = ' style="padding-bottom: 0px"';
      } else if (browser.mozilla) {
        mrg = '0px -1px 0px';
      } else if (browser.msie) {
        mrg = '0px 0px -6px';
      }
      var el = cur.pvDesc.appendChild(ce('div', {innerHTML: '\
<div style="margin: ' + mrg + '">\
  <textarea id="pv_edit_text"' + taStyle + ' onkeydown="onCtrlEnter(event, Photoview.saveInline)" placeholder="' + getLang('photos_edit_desc_intro') + '">' + text + '</textarea>\
</div>'}, {display: 'none'})), txt = ge('pv_edit_text');
      placeholderSetup(txt, {back: 1});
      autosizeSetup(txt, {minHeight: 13});
      setTimeout(function() {
        show(el);
        elfocus(txt);
        addEvent(txt, 'blur', Photoview.saveInline);
        hide(cur.pvDesc.firstChild);
      }, 1);
    };
    if (!noreq) {
      ajax.post('al_photos.php', {act: 'edit_desc', photo: ph.id, inline: 1}, {onDone: onDone, progress: 'pv_inlineedit_prg'});
    } else {
      onDone('');
    }
  },
  cancelInline: function() {
    cur.pvEditing = false;
    removeEvent(ge('pv_edit_text'), 'blur');
    show(cur.pvDesc.firstChild);
    re(cur.pvDesc.firstChild.nextSibling);
  },
  saveInline: function() {
    if (!cur.pvEditing) return;
    removeEvent(ge('pv_edit_text'), 'blur');

    var listId = cur.pvEditing[0], index = cur.pvEditing[1], ph = cur.pvData[listId][index];
    ajax.post('al_photos.php', {act: 'save_desc', photo: ph.id, hash: ph.hash, text: val('pv_edit_text')}, {onDone: function(text) {
      ph.desc = text;

      var shown = cur.pvShown && listId == cur.pvListId && index == cur.pvIndex;
      if (!shown) return;

      cur.pvEditing = false;
      var d = cur.pvDesc.firstChild;
      d.innerHTML = text || getLang('photos_edit_desc');
      d.className = text ? '' : 'pv_desc_edit';
      d.onmouseover = text ? function() { showTooltip(this, {text: getLang('photos_edit_desc')}); } : function() {};
      show(d);
      re(d.nextSibling);
    }, progress: 'pv_inlineedit_prg'});
  },

  cmp: function(id1, id2) {
    var l1 = id1.length, l2 = id2.length;
    if (l1 < l2) {
      return -1;
    } else if (l1 > l2) {
      return 1;
    } else if (id1 < id2) {
      return -1;
    } else if (id1 > id2) {
      return 1;
    }
    return 0;
  },
  receiveComms: function(listId, index, text, noOld) {
    if (listId != cur.pvListId || index != cur.pvIndex) return;

    var n = ce('div', {innerHTML: text}), comms = ge('pv_comments'), current = comms.lastChild, ph = cur.pvData[listId][index];
    for (var el = n.lastChild; el; el = n.lastChild) {
      while (current && Photoview.cmp(current.id, el.id) > 0) {
        current = current.previousSibling;
      }
      if (current && !Photoview.cmp(current.id, el.id)) {
        comms.replaceChild(el, current);
        current = el;
      } else {
        if (current && current.nextSibling) {
          comms.insertBefore(el, current.nextSibling);
        } else if (!current && ph.commshown) {
          if (noOld === true) {
            --ph.commshown;
            n.removeChild(el);
          } else {
            comms.insertBefore(el, comms.firstChild);
          }
        } else {
          comms.appendChild(el);
        }
        ++ph.commshown;
      }
    }
    ph.comments = comms.innerHTML;
    Photoview.updateComms();
  },
  comments: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    var prg = ge('pv_comments_progress');
    ajax.post('al_photos.php', {act: 'photo_comments', offset: ph.commshown, photo: ph.id}, {
      onDone: Photoview.receiveComms.pbind(listId, index),
      showProgress: function() {
        hide(prg.previousSibling);
        show(prg);
      }, hideProgress: function() {
        hide(prg);
        show(prg.previousSibling);
      }
    });
  },
  updateComms: function() {
    setTimeout(Photoview.updateHeight, 2);

    var ph = cur.pvData[cur.pvListId][cur.pvIndex];
    var commshown = '', commprg = ge('pv_comments_progress'), commheader = ge('pv_comments_header');
    if (ph.commcount > ph.commshown) {
      commshown = getLang('photos_show_prev_comments', ph.commcount - ph.commshown);
    }
    (commshown ? show : hide)(commheader);
    commprg.previousSibling.innerHTML = commshown;
  },
  sendComment: function() {
    var comm = cur.pvComment;
    if (!comm.value) {
      elfocus(comm);
      return;
    }
    hide('pv_comment_warn');
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    ajax.post('al_photos.php', {act: 'post_comment', photo: ph.id, comment: comm.value, hash: ph.hash, fromview: 1}, {onDone: function(text) {
      ++ph.commcount;
      Photoview.receiveComms(listId, index, text, true);
      comm.value = '';
      comm.blur();
    }, progress: 'pv_comment_progress'});
  },
  commDone: function(comm, text, del) {
    var node = ge('pv_comment' + comm);
    if (!node) return;

    var msg = node.firstChild.nextSibling, ph = cur.pvShown ? cur.pvData[cur.pvListId][cur.pvIndex] : false;
    if (!text) {
      show(node.firstChild);
      hide(msg);
      if (cur.pvShown) {
        ++ph.commcount;
        ++ph.commshown;
        Photoview.updateComms();
      } else if (window.photos && cur.offset) {
        photos.recache(cur.offset, 1);
      }
      return;
    }
    if (msg) {
      msg.innerHTML = text;
      show(msg);
    } else {
      node.appendChild(ce('div', {innerHTML: text}));
    }
    hide(node.firstChild);
    if (del) {
      if (cur.pvShown) {
        --ph.commshown;
        --ph.commcount;
        Photoview.updateComms();
      } else if (window.photos && cur.offset) {
        photos.recache(cur.offset, -1);
      }
    } else {
      Photoview.updateHeight();
    }
  },
  commProgress: function(comm, sh) {
    var acts = ge('pv_actions' + comm);
    if (!acts) return;

    var prg = acts.firstChild.nextSibling;
    if (sh !== true) {
      hide(prg);
      show(acts.firstChild);
      return;
    }
    hide(acts.firstChild);
    if (!prg) {
      prg = acts.appendChild(ce('div', {className: 'progress'}));
    }
    show(prg);
  },
  commParams: function(comm) {
    return {
      onDone: Photoview.commDone.pbind(comm),
      progress: 'pv_progress' + comm
    }
  },
  commAction: function(act, comm, hash) {
    if (isVisible('pv_progress' + comm)) return;
    ajax.post('al_photos.php', {act: act + '_comment', comment: comm, hash: hash}, Photoview.commParams(comm));
  },

  onClick: function(e) {
    if (cur.pvClicked || __afterFocus) {
      cur.pvClicked = false;
      return;
    }
    if (e && (e.button == 2 || e.which == 3)) return;
    var dx = Math.abs(e.pageX - intval(cur.pvOldX));
    var dy = Math.abs(e.pageY - intval(cur.pvOldY));
    if (dx > 3 || dy > 3) {
      if (vkNow() - intval(cur.pvOldT) > 300) {
        if (cur.pvTagger) {
          Photoview.stopTag();
        } else {
          Photoview.hide();
        }
      }
    }
  },
  onMouseMove: function(ev) {
    var el = cur.pvPhoto.firstChild;
    if (cur.pvTagger || !el) return;

    var elemXY = getXY(el), ph = cur.pvData[cur.pvListId][cur.pvIndex];
    var x = (ev.pageX - elemXY[0]) * 100 / cur.pvPhWidth, y = (ev.pageY - elemXY[1]) * 100 / cur.pvPhHeight;
    for (var i in ph.tags) {
      var coords = ph.tags[i];
      if (x > coords[0] && x < coords[2] && y > coords[1] && y < coords[3]) {
        Photoview.showDynTag(i);
        return;
      }
    }
    Photoview.hideTag();
  },
  onKeyDown: function(e) {
    if (e.returnValue === false) return false;
    if (e.keyCode == KEY.ESC && cur.pvEditing) {
      Photoview.cancelInline();
      return cancelEvent(e);
    }
    if (e.target && (e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA')) {
      return true;
    }
    if (e.keyCode == KEY.ESC) {
      if (cur.pvTagger) {
        Photoview.stopTag();
      } else {
        Photoview.hide();
      }
      return cancelEvent(e);
    } else if (!cur.pvTagger && !boxQueue.count() && (!cur.pvComment || !cur.pvComment.focused)) {
      if (e.keyCode == KEY.RIGHT) {
        Photoview.show(cur.pvListId, cur.pvIndex + 1);
      } else if (e.keyCode == KEY.LEFT) {
        Photoview.show(cur.pvListId, cur.pvIndex - 1);
      }
    }
  },
  onResize: function() {
    if (!cur.pvPhoto) return;
    var dwidth = lastWindowWidth, dheight = lastWindowHeight, sbw = sbWidth();
    if (cur.pvBig) {
      var w = dwidth - sbw - 2 - 120 - 34 - 50, h = dheight - 31 - 28 - 72;
      if (w > 1280) { // less than full hd - not size > 2
        w = 1280;
      } else if (w > 807 && w < 907) { // 1024x768 - not size > 1
        w = 807;
      } else if (w < 604) {
        w = 604;
      }
      if (h < 453) {
        h = 453;
      }
      cur.pvWidth = w;
      cur.pvHeight = h;

      var sizeChanged = false, oldverybig = cur.pvVeryBig;
      cur.pvVeryBig = (w > 1280) ? 2 : (w > 807 ? 1 : false);
      sizeChanged = (oldverybig != cur.pvVeryBig);

      var lnk = cur.pvPhoto;
      if (lnk.firstChild && cur.pvCurrent.src == lnk.firstChild.src && cur.pvCurrent.width) {
        var c = (cur.pvCurrent.width > cur.pvWidth) ? (cur.pvWidth / cur.pvCurrent.width) : 1;
        if (cur.pvCurrent.height * c > cur.pvHeight) {
          c = cur.pvHeight / cur.pvCurrent.height;
        }
        var w = cur.pvPhWidth = Math.floor(cur.pvCurrent.width * c);
        var h = cur.pvPhHeight = Math.floor(cur.pvCurrent.height * c);
        cur.pvActualWidth = Math.max(604, w);

        if (cur.pvBig) {
          cur.pvCont.style.width = (cur.pvActualWidth + 154) + 'px';
          cur.pvSummary.parentNode.style.width = (cur.pvActualWidth - 4) + 'px';
        }

        lnk.style.height = Math.max(453, h) + 'px';
        lnk.firstChild.style.width = w + 'px';
        lnk.firstChild.style.height = h + 'px';
        if (cur.pvTagger && cur.pvTagger != 'loading') {
          cur.pvTagger.resize(w, h);
        }

        var x = lnk.firstChild.offsetLeft, y = lnk.firstChild.offsetTop;
        if (browser.msie7 || browser.msie6) {
          x += lnk.offsetLeft;
          y += lnk.offsetTop;
        }
        setStyle(cur.pvTagFrame.firstChild, {
          width: w + 'px',
          height: h + 'px'
        });
        setStyle(cur.pvTagFaded, {
          width: w + 'px',
          height: h + 'px',
          left: x + 'px',
          top: y + 'px'
        });
        setStyle(cur.pvTagFrame, {
          left: (x - 3) + 'px', // 3 - tag frame border
          top: (y - 3) + 'px'
        });
        setStyle(cur.pvTagPerson, {
          left: x + 'px',
          top: y + 'px'
        });

        if (sizeChanged) {
          setTimeout(Photoview.preload.pbind(cur.pvIndex, cur.pvLastDirection || 1), 10);
        }
      } else {
        cur.pvActualWidth = intval(getStyle(cur.pvBox, 'width'));
      }
    }
    if (browser.mozilla && cur.pvPhoto.firstChild) {
      var x = cur.pvPhoto.firstChild.offsetLeft, deltaX = ((lastWindowWidth - cur.pvActualWidth) % 2) && ((cur.pvActualWidth - cur.pvPhWidth) % 2) ? 4 : 3;
      setStyle(cur.pvTagFrame, {
        left: (x - deltaX) + 'px' // 3 - tag frame border, mozilla buggy
      });
    }
    Photoview.updateArrows();
    Photoview.updateHeight();
//    if (ge('pv_date')) { // debug
//      ge('pv_date').innerHTML = lastWindowWidth + ' ' + cur.pvActualWidth + ' ' + cur.pvPhWidth;
//    }
  },
  updateSize: function() {
    if (!cur.pvBig) {
      cur.pvActualWidth = 604;
      cur.pvSummary.parentNode.style.width = '600px';
      cur.pvCont.style.width = '758px';
      cur.pvPhoto.innerHTML = '';
    }
    onBodyResize();
    Photoview.onResize();
  },

  switchSize: function() {
    cur.pvBig = !cur.pvBig;

    ge('pv_large_link').innerHTML = getLang(cur.pvBig ? 'photos_smaller' : 'photos_larger');
    Photoview.stopTag();
    Photoview.updateSize();
    Photoview.show(cur.pvListId, cur.pvIndex);
    if (vk.id) {
      clearTimeout(cur.pvSaveBig);
      cur.pvSaveBig = setTimeout(ajax.post.pbind('al_photos.php', {act: 'viewer_big', big: (cur.pvBig ? 1 : ''), hash: cur.pvHash}), 1000);
    }
  },
  switchColor: function(el) {
    var old = cur.pvDark ? 'pv_dark' : 'pv_light';
    cur.pvDark = !cur.pvDark;
    var cl = cur.pvDark ? 'pv_dark' : 'pv_light';

    setStyle(el, 'opacity', cur.pvDark ? 1 : 0.7);

    layerBG.className = layerBG.className.replace(old, cl);
    layerWrap.className = layerWrap.className.replace(old, cl);
    cur.pvFixed.className = cur.pvFixed.className.replace(old, cl);
    if (vk.id) {
      clearTimeout(cur.pvSaveColor);
      cur.pvSaveColor = setTimeout(ajax.post.pbind('al_photos.php', {act: 'viewer_color', dark: (cur.pvDark ? 1 : ''), hash: cur.pvHash}), 1000);
    }
  },

  activate: function(arrow) {
    if (arrow.timeout) {
      clearTimeout(arrow.timeout);
      removeAttr(arrow, 'timeout');
    } else {
      fadeTo(arrow, 200, cur.pvDark ? 1 : 0.7);
    }
  },
  deactivate: function(arrow) {
    if (arrow.timeout) {
      return;
    }
    arrow.timeout = setTimeout(function() {
      removeAttr(arrow, 'timeout');
      fadeTo(arrow, 200, 0.4);
    }, 1);
  },

  deletePhoto: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    if (isVisible('pv_delete_progress')) return;

    if (cur.pvTagger && ev !== false) {
      Photoview.stopTag();
      return;
    }

    ajax.post('al_photos.php', {act: 'delete_photo', photo: ph.id, hash: ph.hash}, {onDone: function(text) {
      ph.deleted = text;
      if (listId == cur.pvListId && index == cur.pvIndex) {
        cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
        cur.pvTagInfo.innerHTML = ph.deleted;
        show(cur.pvTagInfo);
        hide(cur.pvCommentsData);
        Photoview.updateHeight();
      }
    }, progress: 'pv_delete_progress'});
  },
  restorePhoto: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    if (isVisible('pv_restore_progress')) return;

    ajax.post('al_photos.php', {act: 'restore_photo', photo: ph.id, hash: ph.hash}, {onDone: function(text) {
      ph.deleted = false;
      if (listId == cur.pvListId && index == cur.pvIndex) {
        cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
        if (ph.taginfo) {
          cur.pvTagInfo.innerHTML = '\
<table cellspacing="0" cellpadding="0"><tr>\
  <td class="info">' + ph.taginfo + '</td>\
  <td><nobr><div class="button_blue"><button id="pv_confirm_tag">' + getLang('photos_confirm_tag') + '</button></div></td>\
  <td><nobr><div class="button_gray"><button id="pv_delete_tag">' + getLang('photos_delete_tag') + '</button></div></td>\
  <td><div id="pv_tag_handling" class="progress"></div></td>\
</tr></table>';
          show(cur.pvTagInfo);
          ge('pv_confirm_tag').onclick = Photoview.confirmTag.pbind(ph.tagid);
          ge('pv_delete_tag').onclick = Photoview.deleteTag.pbind(ph.tagid);
        } else {
          cur.pvTagInfo.innerHTML = '';
          hide(cur.pvTagInfo);
        }
        show(cur.pvCommentsData);
        Photoview.updateHeight();
      }
    }, progress: 'pv_restore_progress'});
  },
  spamPhoto: function(prg, spamHash) {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    if (isVisible(prg)) return;

    if (cur.pvTagger && ev !== false) {
      Photoview.stopTag();
      return;
    }

    ajax.post('al_photos.php', {act: 'spam_photo', photo: ph.id, hash: ph.hash, spam_hash: spamHash}, {onDone: function(text, del) {
      if (del) ph.deleted = text;
      if (listId == cur.pvListId && index == cur.pvIndex) {
        cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
        cur.pvTagInfo.innerHTML = text;
        show(cur.pvTagInfo);
        if (del) hide(cur.pvCommentsData);
        Photoview.updateHeight();
      }
    }, progress: prg});
  },
  rotatePhoto: function(to) {
    var prg = ge('pv_rotate_progress');
    if (isVisible(prg)) return;

    show(prg);
    ge('pv_rotate').appendChild(ce('div', {id: 'pv_rotate_frame', className: 'upload_frame', innerHTML: '<iframe name="pv_rotate_frame"></iframe>'}));
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index], form = ge('pv_rotate_form');
    form.innerHTML = '';
    form.action = ph.rotate[0];
    var data = extend({act: 'do_rotate', to: to, list_id: listId, index: index, from_host: locHost, fid: ph.id}, ph.rotate);
    for (var i in data) {
      if (i != 0) {
        form.appendChild(ce('input', {type: 'hidden', name: i, value: data[i]}));
      }
    }
    form.submit();
  },
  rotateDone: function(data) {
    hide('pv_rotate_progress');
    var el = ge('pv_rotate_frame');

    if (!el) return;
    re(el);

    if (!data) return;
    var listId = data.list_id, index = data.index, ph = cur.pvData[listId][index];
    extend(ph, {x_src: data.x_src, y_src: data.y_src, z_src: data.z_src, w_src: data.w_src, x: 0, y: 0, z: 0, w: 0, tags: data.tags, tagged: data.tagged, tagshtml: data.html})
    extend(ph.rotate, {photo: data.photo, hash: data.hash, rhash: data.rhash});
    if (listId == cur.pvListId && index == cur.pvIndex) {
      Photoview.show(listId, index);
    }
  },

  likeUpdate: function(my, count, title) {
    count = intval(count);

    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    var countInput = ge('like_real_count_photo' + ph.id) || {}, rows = ge('like_table_photo' + ph.id);
    var titleNode = ge('like_title_photo' + ph.id), countNode = ge('pv_like_count');
    var icon = cur.pvLikeIcon;
    var tt = icon.parentNode.tt || {}, opts = clone(tt.opts || {}), newleft = (my ? 0 : -31);

    if (title && titleNode) {
      titleNode.innerHTML = title;
    }
    ph.likes = countInput.value = count;
    countNode.innerHTML = count ? count : '';

    ph.liked = my;
    if (!my) {
      var cb = ge('like_share_photo' + ph.id);
      if (cb) checkbox(cb, false);
    } else {
      setStyle(icon, {opacity: 1});
    }
    if (count) {
      var styleName = vk.rtl ? 'right' : 'left';
      if (tt.el && !isVisible(tt.container) && !title) {
        rows.style[styleName] = newleft + 'px';
        tooltips.show(tt.el, extend(opts, {showdt: 0}));
      } else if (rows) {
        var params = {};
        params[styleName] = newleft;
        animate(rows, params, 200);
      }
      removeClass(icon, 'no_likes');
    } else {
      if (tt.el) tt.hide();
      addClass(icon, 'no_likes');
    }
  },
  like: function() {
    if (!vk.id) return;
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    ajax.post('like.php', {act: 'a_do_' + (ph.liked ? 'un' : '') + 'like', object: 'photo' + ph.id, hash: ph.hash}, {
      onDone: Photoview.likeUpdate.pbind(!ph.liked)
    });
    Photoview.likeUpdate(!ph.liked, ph.likes + (ph.liked ? -1 : 1));
  },
  likeShare: function(hash) {
    if (!vk.id) return;
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    var el = ge('like_share_photo' + ph.id), was = isChecked(el);
    checkbox(el);
    ajax.post('like.php', {act: 'a_do_' + (was ? 'un' : '') + 'publish', object: 'photo' + ph.id, list: listId, hash: hash}, {
      onDone: Photoview.likeUpdate.pbind(true)
    });
    Photoview.likeUpdate(true, ph.likes + (ph.liked ? 0 : 1));
  },
  likeOver: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    var icon = cur.pvLikeIcon;
    if (!ph.liked) {
      setTimeout(animate.pbind(icon, {opacity: 1}, 200, false), 1);
    } else {
      setStyle(icon, {opacity: 1});
    }
    var leftShift = vk.id ? 35 : 55;
    showTooltip(icon.parentNode, {
      url: 'like.php',
      params: {act: 'a_get_stats', object: 'photo' + ph.id, list: listId},
      slide: 15,
      shift: [leftShift, -3, 0],
      ajaxdt: 100,
      showdt: 400,
      hidedt: 200,
      className: 'rich like_tt'
    });
  },
  likeOut: function() {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    if (!ph.liked) {
      setTimeout(animate.pbind(cur.pvLikeIcon, {opacity: 0.4}, 200, false), 1);
    }
  },

  tagOver: function(el) {
    animate(el, {backgroundColor: '#6B8DB1'}, 200);
    showTooltip(el, {text: getLang('photos_delete_tag'), shift: [0, -2, 0]});
  },
  tagOut: function(el) {
    if (!el.parentNode || !el.parentNode.parentNode) return;
    animate(el, {backgroundColor: '#C4D2E1'}, 200);
  },
  deleteTag: function(tagId) {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    if (ph.tagid) {
      if (isVisible('pv_tag_handling')) return;
    } else {
      if (ge('pv_action_progress')) return;
    }

    ajax.post('al_photos.php', {act: 'delete_tag', photo: ph.id, tag: tagId, hash: ph.hash}, {onDone: function(text, tags, tagged, html) {
      if (ph.tagid) {
        ph.taginfo = ph.tagid = false;
        cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
        cur.pvTagInfo.innerHTML = '<div class="progress fl_r" id="pv_spam_progress"></div><div class="info">' + text + '</div>';
      } else {
        Photoview.actionInfo().innerHTML = text;
      }
      Photoview.updateHeight();
      if (tags !== undefined) {
        ph.tags = tags;
        ph.tagged = tagged;
        ph.tagshtml = html;
        if (cur.pvListId == listId && cur.pvIndex == index) {
          Photoview.setTags(html);

          ((!ph.taginfo && ph.actions.tag && tags[0] < cur.pvMaxTags) ? show : hide)(cur.pvTagLink);
        }
      }
    }, onFail: function(text) {
      if (!text) return;
      Photoview.actionInfo().innerHTML = text;
      return true;
    }, showProgress: function() {
      if (ph.tagid) {
        hide(ge('pv_confirm_tag').parentNode, ge('pv_delete_tag').parentNode);
        show('pv_tag_handling');
      } else {
        Photoview.actionInfo().innerHTML = '<div id="pv_action_progress" class="progress" style="display: block"></div>';
      }
    }, hideProgress: function() {
      if (ph.tagid) {
        hide('pv_tag_handling');
        show(ge('pv_confirm_tag').parentNode, ge('pv_delete_tag').parentNode);
      } else {
        re(Photoview.actionInfo());
      }
    }});
  },
  restoreTag: function(tagId) {
    if (ge('pv_action_progress')) return;

    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    ajax.post('al_photos.php', {act: 'restore_tag', photo: ph.id, tag: tagId, hash: ph.hash}, {onDone: function(text, tags, tagged, html) {
      if (tags !== undefined) {
        ph.tags = tags;
        ph.tagged = tagged;
        ph.tagshtml = html;
        if (cur.pvListId == listId && cur.pvIndex == index) {
          Photoview.setTags(html);
          ((!ph.taginfo && ph.actions.tag && tags[0] < cur.pvMaxTags) ? show : hide)(cur.pvTagLink);
        }
      }
      Photoview.actionInfo().innerHTML = text;
    }, onFail: function(text) {
      if (!text) return;
      Photoview.actionInfo().innerHTML = text;
      return true;
    }, showProgress: function() {
      Photoview.actionInfo().innerHTML = '<div id="pv_action_progress" class="progress" style="display: block"></div>';
    }, hideProgress: function() {
      re(Photoview.actionInfo());
    }});
  },
  stopTag: function() {
    if (!cur.pvTagger || cur.pvTagger == 'loading') {
      cur.pvTagger = false;
      return;
    }
    hide(cur.pvFriends, cur.pvTagInfo);
    if (cur.pvData[cur.pvListId].length > 1) {
      show(cur.pvLeft, cur.pvClose, cur.pvLeftNav, cur.pvRightNav);
    }
    Photoview.updateHeight();
    if (cur.pvFriendName) {
      cur.pvFriendName.value = '';
      cur.pvFriendsQ = false;
      Photoview.updateFriends();
    }
    cur.pvTagger.destroy();
    cur.pvTagger = false;
  },
  startTag: function(toProfile) {
    if (cur.pvTagger || !cur.pvPhoto.firstChild) return;

    cur.pvTagToProfile = toProfile = (toProfile === true);
    if (!cur.pvFriends && !toProfile) {
      cur.pvFriends = layer.appendChild(ce('div', {id: 'pv_friends', innerHTML: '\
<div class="box_title_wrap"><div class="box_x_button"></div>\
  <div class="box_title">' + getLang('photos_typename') + '</div>\
</div>\
<div class="name_input"><input onkeyup="Photoview.updateFriends()" onkeypress="if (event.keyCode == 10 || event.keyCode == 13) Photoview.addTag()" type="text" id="pv_friend_name" class="text" /></div>\
<div class="list_wrap"><a href="/" onclick="return Photoview.addTag(' + vk.id + ', event)">' + getLang('photos_tags_me') + '</a>\
  <div id="pv_friends_cont"><div class="progress"></div></div>\
</div>\
<div class="box_controls_wrap">\
  <div class="box_controls">\
    <table id="pv_tag_buttons" cellspacing="0" cellpadding="0">\
      <tr>\
        <td><div class="button_blue button_wide"><button id="pv_add_tag">' + getLang('global_add') + '</button></div></td>\
        <td><div class="button_gray button_wide"><button id="pv_cancel_tag">' + getLang('global_cancel') + '</button></div></td>\
      </tr>\
    </table>\
    <div id="pv_tag_progress" class="progress"></div>\
  </div>\
</div>\
      '}));
      extend(cur, {
        pvFriendName: ge('pv_friend_name'),
        pvFriendsCont: ge('pv_friends_cont')
      });
      addEvent(cur.pvFriends, 'click', function() {
        cur.pvClicked = true;
      });
      var xbtn = cur.pvFriends.firstChild.firstChild;
      addEvent(xbtn, 'mouseover', function() { animate(this, {backgroundColor: '#FFFFFF'}, 200); });
      addEvent(xbtn, 'mouseout', function() { animate(this, {backgroundColor: '#9CB8D4'}, 200); });
      addEvent(xbtn, 'click', Photoview.stopTag);

      ge('pv_add_tag').onclick = Photoview.addTag;
      ge('pv_cancel_tag').onclick = Photoview.stopTag;
    }
    if (!cur.pvFriendsList && !toProfile) {
      ajax.post('al_friends.php', {act: 'pv_friends'}, {onDone: function(list) {
        cur.pvFriendsList = list;
        Photoview.cacheFriends();
        Photoview.updateFriends();
      }});
    } else {
      cur.pvFriendsQ = false;
      Photoview.updateFriends();
    }
    cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
    if (!toProfile) {
      cur.pvTagInfo.innerHTML = '<div class="msg"><a class="fl_r" onclick="Photoview.stopTag()">' + getLang('global_done') + '</a>' + getLang('photos_select_tag_area') + '</div>';
      show(cur.pvTagInfo);
    }
    hide(cur.pvLeft, cur.pvLeftNav, cur.pvRightNav, cur.pvClose);
    Photoview.updateHeight();

    layerWrap.scrollTop = 0;
    cur.pvTagger = 'loading';
    stManager.add(['tagger.css', 'tagger.js'], function() {
      if (!cur.pvTagger) return;
      var options = toProfile ? {
        minw: 50,
        minh: 50
      } : {
        minw: 30,
        minh: 30,
        onStart: (browser.msie || browser.mozilla) ? hide.pbind(cur.pvFriends) : fadeOut.pbind(cur.pvFriends, 200),
        onFinish: Photoview.showFriends
      }, ph = cur.pvData[cur.pvListId][cur.pvIndex];
      if (toProfile) {
        if (ph.tagged[vk.id]) {
          var coords = clone(ph.tags[ph.tagged[vk.id]]);
          each(coords, function(i, v) {
            var wh = cur[(i % 2) ? 'pvPhHeight' : 'pvPhWidth'];
            coords[i] = positive(v * wh / 100);
          });
          options.rect = {left: coords[0], top: coords[1], width: (coords[2] - coords[0]), height: (coords[3] - coords[1])};
          Photoview.hideTag(true);
        } else {
          var l = Math.min(Math.max(Math.floor((cur.pvPhWidth - 50) / 2), 0), 20);
          var t = Math.min(Math.max(Math.floor((cur.pvPhHeight - 50) / 2), 0), 20);
          options.rect = {left: l, top: t, width: cur.pvPhWidth - l * 2, height: cur.pvPhHeight - t * 2};
        }
        cur.pvTagInfo.innerHTML = '\
<div class="fl_r button_gray"><button id="pv_prof_cancel">' + getLang('global_cancel') + '</button></div>\
<div class="fl_r button_blue"><button id="pv_prof_done">' + getLang('global_done') + '</button></div>\
<div class="progress fl_r" id="pv_prof_progress"></div>\
<div class="pv_to_profile_desc">' + getLang('photos_crop_info') + '</div>';
        show(cur.pvTagInfo);
        ge('pv_prof_cancel').onclick = Photoview.stopTag;
        ge('pv_prof_done').onclick = Photoview.toProfile;
      }



      cur.pvTagger = photoTagger(cur.pvPhoto.firstChild, extend(options, {
        zstart: 600
      }));
    });
  },
  cacheFriends: function(q) {
    if (q) {
      if (!cur.pvFriendsCache[q]) cur.pvFriendsCache[q] = {};

      var t = parseLatin(q);
      var queries = t ? [q, t] : [q];
      for (var i in queries) {
        query = queries[i];
        var searchIn = cur.pvFriendsCache[query.substr(0, 1).toLowerCase()];
        if (searchIn) {
          query = escapeRE(query);
          for (var i in searchIn) {
            var name = cur.pvFriendsList[i][1].replace(/[ёЁ]/, 'е');
            if ((new RegExp('^' + query + '|\\s' + query + '|\\(' + query, 'gi')).test(name)) {
              cur.pvFriendsCache[q][i] = 1;
            }
          }
        }
      }
      return;
    }
    cur.pvFriendsCache = {};
    for (var i in cur.pvFriendsList) {
      var name = cur.pvFriendsList[i][1].replace(/[ёЁ]/, 'е');
      var cursor = 0, letter;
      while (1) {
        letter = name.charAt(cursor).toLowerCase();
        if (!cur.pvFriendsCache[letter]) {
          cur.pvFriendsCache[letter] = {};
        }
        cur.pvFriendsCache[letter][i] = 1;
        cursor = name.indexOf(' ', cursor + 1);
        if (cursor == -1) break;
        ++cursor;
      }
    }
  },
  updateFriends: function() {
    if (!cur.pvFriendsList || !cur.pvFriends) return;

    var q = trim(cur.pvFriendName.value).toLowerCase().replace(/[ё]/, 'е'), frs = [];
    if (q === cur.pvFriendsQ) return;

    cur.pvFriendsQ = q;
    var lat = parseLatin(q);
    var toMatch = lat ? [escapeRE(q), escapeRE(lat)] : (q ? [escapeRE(q)] : false);

    if (q.length > 1 && !cur.pvFriendsCache[q] || q.length == 1 && lat) {
      Photoview.cacheFriends(q);
    }
    var friends = q ? cur.pvFriendsCache[q] : cur.pvFriendsList, tagged = cur.pvData[cur.pvListId][cur.pvIndex].tagged;

    for (var i in friends) {
      var fr = cur.pvFriendsList[i], mid = positive(i), name = fr[1];
      if (tagged[mid]) continue;
      if (toMatch) {
        each(toMatch, function() {
          var re = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + this + ')(?![^<>]*>)(?![^&;]+;)', 'gi');
          name = name.replace(re, '<em>$1</em>');
        });
      }
      frs.push('<a mid="' + mid + '" href="' + fr[0] + '" onclick="return Photoview.addTag(' + mid + ', event)">' + name + '</a>');
    }
    var st = (frs.length > 8) ? {height: '184px', overflow: 'auto'} : {height: '', overflow: ''};
    setStyle(cur.pvFriendsCont.parentNode, st);
    cur.pvFriendsCont.innerHTML = frs.join('');
    (q && !frs.length ? hide : show)(cur.pvFriendsCont.parentNode);
    (q || tagged[vk.id] ? hide : show)(cur.pvFriendsCont.parentNode.firstChild);
  },
  toProfile: function() {
    var prg = ge('pv_prof_progress');
    if (isVisible(prg)) return;

    hide(ge('pv_prof_cancel').parentNode, ge('pv_prof_done').parentNode);
    show(prg);
    cur.pvTagInfo.appendChild(ce('div', {id: 'pv_to_profile_frame', className: 'upload_frame', innerHTML: '<iframe name="pv_to_profile_frame"></iframe>'}));

    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index], form = ge('pv_to_profile_form');
    var xy = getSize(cur.pvPhoto.firstChild), rect = clone(cur.pvTagger.result());
    each(rect, function(i) {
      rect[i] = intval(rect[i] / xy[i % 2] * 10000);
    });

    form.innerHTML = '';
    form.action = ph.toprof[0];
    var data = extend({act: 'to_profile', crop: rect.join(','), list_id: listId, index: index, from_host: locHost, fid: ph.id}, ph.toprof);
    for (var i in data) {
      if (i != 0) {
        form.appendChild(ce('input', {type: 'hidden', name: i, value: data[i]}));
      }
    }
    form.submit();
  },
  toProfileFail: function() {
    hide('pv_prof_progress');
    show(ge('pv_prof_cancel').parentNode, ge('pv_prof_done').parentNode);
  },
  confirmTag: function(tagId) {
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    if (isVisible('pv_tag_handling')) return;

    ajax.post('al_photos.php', {act: 'confirm_tag', tag: tagId, photo: ph.id, hash: ph.hash}, {onDone: function(tags, tagged, html) {
      ph.tags = tags;
      ph.tagged = tagged;
      ph.tagshtml = html;
      ph.taginfo = ph.tagid = false;
      if (listId == cur.pvListId && index == cur.pvIndex) {
        Photoview.setTags(html);
        ((!ph.taginfo && ph.actions.tag && tags[0] < cur.pvMaxTags) ? show : hide)(cur.pvTagLink);
        cleanElems('pv_confirm_tag', 'pv_delete_tag', 'pv_prof_cancel', 'pv_prof_done');
        cur.pvTagInfo.innerHTML = '';
        hide(cur.pvTagInfo);
      }
      Photoview.updateHeight();
    }, showProgress: function() {
      hide(ge('pv_confirm_tag').parentNode, ge('pv_delete_tag').parentNode);
      show('pv_tag_handling');
    }, hideProgress: function() {
      hide('pv_tag_handling');
      show(ge('pv_confirm_tag').parentNode, ge('pv_delete_tag').parentNode);
    }});
  },
  addTag: function(mid, ev) {
    if (checkEvent(ev)) return true;
    if (!cur.pvTagger || cur.pvTagger == 'loading') return false;
    if (isVisible('pv_tag_progress')) return false;

    var name = trim(cur.pvFriendName.value), rect = cur.pvTagger.result();
    if (!mid) {
      var list = cur.pvFriendsCont;
      if (name && list.firstChild && list.firstChild == list.lastChild && list.firstChild.tagName.toLowerCase() == 'a') {
        mid = list.firstChild.getAttribute('mid');
      }
    }
    if (!mid && !name || !rect[2]) {
      elfocus(cur.pvFriendName);
      return false;
    }
    var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
    var xy = getSize(cur.pvPhoto.firstChild);
    var x = (rect[0] / xy[0] * 100), y = (rect[1] / xy[1] * 100);
    var x2 = ((rect[0] + rect[2]) / xy[0] * 100), y2 = ((rect[1] + rect[3]) / xy[1] * 100);
    ajax.post('al_photos.php', {act: 'add_tag', mid: mid, photo: ph.id, name: name, hash: ph.hash, x: x, y: y, x2: x2, y2: y2}, {onDone: function(tags, tagged, html) {
      ph.tags = tags;
      ph.tagged = tagged;
      ph.tagshtml = html;
      if (cur.pvListId == listId && cur.pvIndex == index) {
        re(Photoview.actionInfo());
        Photoview.setTags(html);
        ((!ph.taginfo && ph.actions.tag && tags[0] < cur.pvMaxTags) ? show : hide)(cur.pvTagLink);
        var resetFr = function() {
          cur.pvFriendName.value = '';
          Photoview.updateFriends();
        }
        if (browser.msie || browser.mozilla) {
          hide(cur.pvFriends);
          resetFr();
        } else {
          fadeOut(cur.pvFriends, 200, resetFr);
        }
        cur.pvTagger.reset();
      }
    }, showProgress: function() {
      hide('pv_tag_buttons');
      show('pv_tag_progress');
    }, hideProgress: function() {
      hide('pv_tag_progress');
      show('pv_tag_buttons');
    }});
    return false;
  },
  showFriends: function() {
    if (!cur.pvTagger || cur.pvTagger == 'loading') return;

    var r = cur.pvTagger.result();
    var xy = getXY(cur.pvPhoto.firstChild), x = xy[0] + r[0] + r[2] + 20;
    if (lastWindowWidth <= x + 190 + sbWidth() + 5) {
      if (xy[0] + r[0] <= 190 + 25) {
        x = lastWindowWidth - 190 - sbWidth() - 5;
      } else {
        x = xy[0] + r[0] - 190 - 20;
      }
    }
    var h = getSize(cur.pvFriends)[1], y = xy[1] + layerWrap.scrollTop + r[1] - ((layerWrap.offsetParent || {}).scrollTop || bodyNode.scrollTop || htmlNode.scrollTop);
    if (layerWrap.scrollTop + lastWindowHeight <= y + h + 5) {
      y = layerWrap.scrollTop + lastWindowHeight - h - 5;
    }
    cur.pvFriends.style.left = x + 'px';
    cur.pvFriends.style.top = y + 'px';
    if (!isVisible(cur.pvFriends)) {
      if (browser.msie || browser.mozilla) {
        show(cur.pvFriends);
      } else {
        fadeIn(cur.pvFriends, 200, function() {
          setTimeout(elfocus.pbind(cur.pvFriendName, false, false), 1);
        });
      }
    } else {
      animate(cur.pvFriends, {opacity: 1}, 200, function() {
        setTimeout(elfocus.pbind(cur.pvFriendName, false, false), 1);
      });
    }
  },
  toProfileTag: function() {
    var tag = cur.pvData[cur.pvListId][cur.pvIndex].tagged[vk.id];
    if (tag && !cur.pvTagger) {
      Photoview.showTag(tag);
    }
  },
  showTag: function(tagId) {
    clearTimeout(cur.pvHidingTag);
    if (cur.pvShowingTag == tagId) return;

    var coords = clone(cur.pvData[cur.pvListId][cur.pvIndex].tags[tagId]);
    each(coords, function(i, v) {
      var wh = cur[(i % 2) ? 'pvPhHeight' : 'pvPhWidth'];
      coords[i] = Math.max(3, Math.min(wh - 3, positive(v * wh / 100)));
    });
    setStyle(cur.pvTagFrame, {
      marginLeft: coords[0] + 'px',
      marginTop: coords[1] + 'px',
      width: (coords[2] - coords[0]) + 'px',
      height: (coords[3] - coords[1]) + 'px'
    });
    setStyle(cur.pvTagFrame.firstChild, {
      marginLeft: -coords[0] + 'px',
      marginTop: -coords[1] + 'px'
    });
    cur.pvShowingTag = tagId;
    if (browser.msie) {
      show(cur.pvTagFrame, cur.pvTagFaded);
    } else {
      fadeIn(cur.pvTagFrame, 200);
      fadeIn(cur.pvTagFaded, 200);
    }
  },
  showDynTag: function(tagId) {
    clearTimeout(cur.pvHidingTag);
    if (cur.pvShowingTag == tagId) return;

    var coords = clone(cur.pvData[cur.pvListId][cur.pvIndex].tags[tagId]), el = ge('pv_tag' + tagId);
    if (!el) return;

    each(coords, function(i, v) {
      coords[i] = positive(v * cur[(i % 2) ? 'pvPhHeight' : 'pvPhWidth'] / 100);
    });
    setStyle(cur.pvTagPerson, {
      marginLeft: coords[0] + 'px',
      marginTop: coords[3] + 'px',
      minWidth: (coords[2] - coords[0]) + 'px'
    });
    cur.pvTagPerson.innerHTML = el.firstChild.innerHTML;
    var s = getSize(cur.pvTagPerson);
    if (coords[3] + s[1] > cur.pvPhHeight) {
      setStyle(cur.pvTagPerson, {marginTop: (cur.pvPhHeight - s[1]) + 'px'});
    }
    cur.pvTagPerson.onmouseover = Photoview.showDynTag.pbind(tagId);
    cur.pvShowingTag = tagId;
    if (browser.msie){
      show(cur.pvTagPerson);
    } else {
      fadeIn(cur.pvTagPerson, 200);
    }
  },
  hideTag: function(quick) {
    if (!cur.pvShowingTag) return;

    clearTimeout(cur.pvHidingTag);
    cur.pvHidingTag = setTimeout(function() {
      if (quick === true || browser.msie) {
        hide(cur.pvTagFaded, cur.pvTagFrame, cur.pvTagPerson);
      } else if (cur.pvShowingTag) {
        fadeOut(cur.pvTagFaded, 200);
        fadeOut(cur.pvTagFrame, 200);
        fadeOut(cur.pvTagPerson, 200);
      }
      cur.pvShowingTag = false;
    }, 0);
  },

  list: function(photoId, listId, realList) {
    if (!cur.pvList) cur.pvList = {};
    cur.pvList[photoId + '_' + listId] = realList;
  },
  loaded: function(listId, count, offset, data, opts) {
    if (opts) {
      extend(cur, {
        lang: extend(cur.lang || {}, opts.lang),
        pvHash: opts.hash,
        pvCommLimit: opts.commlimit,
        pvMaxTags: opts.maxtags,
        pvBig: opts.big,
        pvDark: opts.dark
      });
      var h = ge('pv_comment_header');
      if (h) h.innerHTML = getLang('photos_yourcomment');
    }
    if (!cur.pvData) cur.pvData = {};
    if (!cur.pvData[listId]) {
      cur.pvData[listId] = new Array(count);
    } else if (cur.pvData[listId].length < count) {
      for (var i = cur.pvData[listId].length; i < count; ++i) {
        cur.pvData[listId].push(undefined);
      }
    } else if (cur.pvData[listId].length > count) {
      cur.pvData[listId] = cur.pvData[listId].slice(0, count);
    }
    for (var i = 0, len = data.length; i < len; ++i) {
      var index = (offset + i);
      while (index >= count) index -= count;
      cur.pvData[listId][index] = data[i];
    }
  },
  showPhoto: function(photoId, listId, options, just) {
    cur.pvNoHistory = options.noHistory;
    cur.pvHistoryLength = 0;
    listId = cur.pvList && cur.pvList[photoId + '_' + listId] || listId;
    if (!cur.pvData || !cur.pvData[listId]) {
      return;
    }
    var data = cur.pvData[listId], whole = true;
    for (var i = 0, len = data.length; i < len; ++i) {
      if (data[i]) {
        if (data[i].id === photoId) {
          Photoview.show(listId, i, false, options.root);
          return false;
        }
      } else {
        whole = false;
      }
    }
    if (whole && just) {
      return false;
    }
  }
}, photoview = Photoview;

try{stManager.done('photoview.js');}catch(e){}
