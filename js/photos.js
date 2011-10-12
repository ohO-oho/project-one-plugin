var photos = {
  scrollResize: function() {
    if (browser.mobile || cur.pvShown) return;

    var docEl = document.documentElement;
    var ch = window.innerHeight || docEl.clientHeight || bodyNode.clientHeight;
    var st = scrollGetY();
    var lnk = ge('photos_load_more');

    if (!isVisible(lnk)) return;
    if (st + ch > lnk.offsetTop) {
      photos.load();
    }
  },
  initScroll: function() {
    cur.module = 'photos';

    photos.scrollnode = browser.msie6 ? pageNode : window;

    addEvent(photos.scrollnode, 'scroll', photos.scrollResize);
    addEvent(window, 'resize', photos.scrollResize);
    removeEvent(window, 'load', photos.initScroll);
    cur.destroy.push(function() {
      removeEvent(photos.scrollnode, 'scroll', photos.scrollResize);
      removeEvent(window, 'resize', photos.scrollResize);
    });
  },
  recache: function(from, delta) {
    if (cur.loading) {
      cur.loading = 1;
      setTimeout(photos.recache.pbind(from, delta), 100);
      return;
    }
    for (var i = cur.offset; ajaxCache['/' + nav.objLoc[0] + '#act=' + nav.objLoc.act + '&offset=' + i + '&part=1']; i += 20) {
      var a = ajaxCache['/' + nav.objLoc[0] + '#act=' + nav.objLoc.act + '&offset=' + i + '&part=1'];
      a[0] += delta;
      ajaxCache['/' + nav.objLoc[0] + '#act=' + nav.objLoc.act + '&offset=' + (i + delta) + '&part=1'] = a;
      delete(ajaxCache['/' + nav.objLoc[0] + '#act=' + nav.objLoc.act + '&offset=' + i + '&part=1']);
    }
    cur.offset += delta;
  },
  loaded: function(off, rows, privacy) {
    cur.offset = off;

    var cont = ge('photos_container'), d = ce('div', {innerHTML: rows});
    each(geByTag('textarea', d), function() {
      autosizeSetup(this, {minHeight: 40});
    });
    while (d.firstChild) {
      cont.appendChild(d.firstChild);
    }
    if (privacy) {
      extend(cur.privacy, privacy);
    }
    if (cont.sorter) {
      setTimeout(sorter.added.pbind(cont), 0);
    } else if (cont.qsorter) {
      setTimeout(qsorter.added.pbind(cont), 0);
    }

    if (off >= cur.count || !rows) {
      hide('photos_load_more');
      return;
    }
    cur.loading = 1;
    ajax.post(cur.moreFrom, extend({offset: cur.offset, part: 1}, cur.moreOpts || {}), {cache: 1, onDone: function() {
      if (cur.loading == 2) {
        photos.loaded.apply(window, arguments);
      } else {
        cur.loading = false;
      }
    }, onFail: function() {
      cur.loading = 0;
      return true;
    }});
  },
  load: function() {
    if (!isVisible('photos_load_more') || isVisible('photos_more_progress')) return;
    if (cur.loading) {
      cur.loading = 2;
      return;
    }

    ajax.post(cur.moreFrom, extend({offset: cur.offset, part: 1}, cur.moreOpts || {}), {onDone: photos.loaded, onFail: function() {
      cur.loading = 0;
      return true;
    }, showProgress: function() {
      show('photos_more_progress');
      hide(ge('photos_load_more').firstChild);
    }, hideProgress: function() {
      show(ge('photos_load_more').firstChild);
      hide('photos_more_progress');
    }, cache: 1});
  },

  reorderAlbums: function(album, before, after) {
    var album_id = album.id.replace('album', '');
    var before_id = (before && before.id || '').replace('album', '');
    var after_id = (after && after.id || '').replace('album', '');
    ajax.post('al_photos.php', {act: 'reorder_albums', album: album_id, before: before_id, after: after_id});
  },
  reorderPhotos: function(photo, before, after) {
    var photo_id = photo.id.replace('photo_row', '');
    var before_id = (before && before.id || '').replace('photo_row', '');
    var after_id = (after && after.id || '').replace('photo_row', '');
    ajax.post('al_photos.php', {act: 'reorder_photos', photo: photo_id, before: before_id, after: after_id, rev: nav.objLoc.rev});
  },
  privacy: function(key) {
    if (key == 'photos_move') {
      var val = Privacy.getValue(key);
      val = val.split('_');
      val = val[2];
      if (val != cur.album.split('_')[1]) {
        photos.movePhoto(val);
      }
      return true;
    }

    var m = key.match(/^album(\d+)/);
    if (!m) return;

    var el = ge('album' + vk.id + '_' + m[1]);
    if (!el) return;

    if (el.helper) {
      var sz = getSize(el);
      if (sz[0] != el.w || sz[1] != el.h) {
        setStyle(el.helper, {
          width: sz[0],
          height: sz[1] - ge('photos_container').sorter.dh
        });
        extend(el, {
          x: el.x - el.w / 2 + sz[0] / 2, w: sz[0],
          y: el.y - el.h / 2 + sz[1] / 2, h: sz[1]
        });
        for (var e = el.nextSibling; e && e.nextSibling; e = e.nextSibling.nextSibling) {
          setStyle(e.nextSibling, {left: e.offsetLeft, top: e.offsetTop});
        }
      }
    }

    clearTimeout(cur['privacy_timer_' + key]);
    cur['privacy_timer_' + key] = setTimeout(ajax.post.pbind('al_friends.php', {
      act: 'save_privacy',
      key: key,
      val: Privacy.getValue(key),
      hash: cur.privacyHash
    }), 500);
  },

  deleteAlbum: function(album, hash) {
    showFastBox(
      getLang('photos_deleting_album'),
      getLang('photos_sure_del_album'),
      getLang('global_delete'),
      ajax.post.pbind('al_photos.php', {act: 'delete_album', album: album, hash: hash}),
      getLang('global_cancel')
    );
  },
  showSaved: function(id, color) {
    var msg = ge(id), anim = function() {
      setTimeout(animate.pbind(msg, {
        backgroundColor: color,
        borderLeftColor: '#D8DFEA',
        borderRightColor: '#D8DFEA',
        borderTopColor: '#D8DFEA',
        borderBottomColor: '#D8DFEA'
      }, 1000), 1000);
    };
    if (isVisible(msg)) {
      animate(msg, {
        backgroundColor: '#E7F1F9',
        borderLeftColor: '#4C96D4',
        borderRightColor: '#4C96D4',
        borderTopColor: '#4C96D4',
        borderBottomColor: '#4C96D4'
      }, 200, anim);
    } else {
      show(msg);
      anim();
    }
  },
  saveAlbum: function() {
    var params = {
      act: 'save_album',
      album: cur.album,
      hash: cur.albumhash,
      title: ge('album_title').value,
      desc: ge('album_description').value
    };
    var album_id = cur.album.replace(vk.id + '_', '');
    if (cur.privacy['album' + album_id]) {
      extend(params, {
        view: Privacy.getValue('album' + album_id),
        comm: Privacy.getValue('albumcomm' + album_id)
      });
    } else if (ge('album_only_check')) {
      extend(params, {
        main: isChecked('album_main_check'),
        only: isChecked('album_only_check')
      });
    }
    ajax.post('al_photos.php', params, {onDone: function() {
      var main = ge('album_main_check');
      if (main && isChecked(main)) {
        addClass(main, 'on');
        addClass(main, 'disabled');
        hide('album_delete_action');
      }
      photos.showSaved('album_saved_msg', '#FFFFFF');
    }, progress: 'album_save_progress'});
  },
  savePhotos: function() {
    var params = {
      act: 'save_photos',
      album: cur.album,
      hash: cur.albumhash
    }, cont = ge('photos_container'), i = 0;
    for (var el = cont.firstChild; el; el = el.nextSibling) {
      if (!el.firstChild || !isVisible(el.firstChild)) continue;

      var id = el.id.replace('photo_edit_row', '');
      params['photo_id' + i] = id;
      params['photo_desc' + i] = ge('photo_caption' + id).value;
      ++i;
    }
    ajax.post('al_photos.php', params, {onDone: function() {
      for (var el = cont.firstChild; el; el = el.nextSibling) {
        if (!el.firstChild || !isVisible(el.firstChild)) continue;

        var id = el.id.replace('photo_edit_row', '');
        ge('photo_save_result' + id).innerHTML = getLang('photos_privacy_description');
      }
      cur.descs = false;
      scrollToTop(200);
      photos.showSaved('photos_saved_msg', '#F3F8FC');
    }, progress: 'photos_save_progress'});
  },
  deletePhoto: function(photo, hash) {
    ajax.post('al_photos.php', {act: 'delete_photo', photo: photo, hash: hash, edit: 1}, {onDone: function(text) {
      var el = ge('photo_edit_row' + photo);
      if (!el || !el.firstChild || !isVisible(el.firstChild)) return;

      hide(el.firstChild);
      el.appendChild(ce('div', {innerHTML: text}));

      photos.recache(cur.offset, -1);
      --cur.count;
      if (cur.count < 2) {
        hide('album_thumb_action');
      }
      if (cur.photoAddUpdate) {
        cur.photoAddUpdate(el);
      }
    }, showProgress: function() {
      hide('photo_delete_link' + photo);
      show('photo_edit_progress' + photo);
    }, hideProgress: function() {
      hide('photo_edit_progress' + photo);
      show('photo_delete_link' + photo);
    }});
  },
  restorePhoto: function(photo, hash) {
    if (isVisible('photo_restore_progress' + photo)) return;

    ajax.post('al_photos.php', {act: 'restore_photo', photo: photo, hash: hash, edit: 1}, {onDone: function(text) {
      var el = ge('photo_edit_row' + photo);
      if (!el || !el.firstChild || isVisible(el.firstChild)) return;

      el.removeChild(el.firstChild.nextSibling);
      show(el.firstChild);

      photos.recache(cur.offset, 1);
      ++cur.count;
      if (cur.count > 1) {
        show('album_thumb_action');
      }
      if (cur.photoAddUpdate) {
        cur.photoAddUpdate(el);
      }
    }, progress: 'photo_restore_progress' + photo});
  },
  showMove: function(photo, hash, ev) {
    var dd = cur.moveddc, lnk = ge('photos_move_link' + photo);
    if (cur.privacyPhotoMove) {
      Privacy.show(lnk, ev, 'photos_move');
    } else {
      photos.hideMove();
    }
    extend(cur, {
      movelnk: lnk,
      moveph: photo,
      movehash: hash
    });
    if (cur.privacyPhotoMove) return;
    lnk.parentNode.replaceChild(dd, lnk);
    cur.movedd.focus();
    cur.movedd.showDefaultList();
    addEvent(document, 'click', photos.hideMove);
  },
  hideMove: function() {
    if (cur.privacyPhotoMove) return;
    if (cur.movelnk) {
      cur.moveddc.parentNode.replaceChild(cur.movelnk, cur.moveddc);
      cur.movelnk = false;
      cur.movedd.clear();
    }
    removeEvent(document, 'click', photos.hideMove);
  },
  movePhoto: function(album, photo, hash) {
    album = intval(album);
    var showPrg = show.pbind('photo_return_progress' + photo), hidePrg = hide.pbind('photo_return_progress' + photo);
    if (!photo) {
      if (!album || album == cur.album.split('_')[1]) {
        return photos.hideMove();
      }
      photo = cur.moveph;
      hash = cur.movehash;
      showPrg = function() {
        hide('photo_delete_link' + photo);
        show('photo_edit_progress' + photo);
      };
      hidePrg = function() {
        hide('photo_edit_progress' + photo);
        show('photo_delete_link' + photo);
      };
    }
    ajax.post('al_photos.php', {act: 'move_photo', album: album, photo: photo, hash: hash}, {onDone: function(text) {
      var el = ge('photo_edit_row' + photo);
      if (!el || !el.firstChild) return;

      if (album == cur.album.split('_')[1]) {
        if (isVisible(el.firstChild)) return;

        el.removeChild(el.firstChild.nextSibling);
        show(el.firstChild);

        photos.recache(cur.offset, 1);
        ++cur.count;
        if (cur.count > 1) {
          show('album_thumb_action');
        }
      } else {
        if (!isVisible(el.firstChild)) return;

        photos.hideMove();

        hide(el.firstChild);
        el.appendChild(ce('div', {innerHTML: text}));

        photos.recache(cur.offset, -1);
        --cur.count;
        if (cur.count < 2) {
          hide('album_thumb_action');
        }
      }
      if (cur.photoAddUpdate) {
        cur.photoAddUpdate(el);
      }
    }, onFail: function(text) {
      photos.hideMove();
      if (text) {
        setTimeout(showFastBox(getLang('global_error'), text).hide, 2000);
        return true;
      }
    }, showProgress: showPrg, hideProgress: hidePrg});
  },
  backupDesc: function(photo) {
    if (!cur.descs) cur.descs = {};
    cur.descs[photo] = trim(ge('photo_caption' + photo).value);
  },
  saveDesc: function(photo, hash) {
    var dsc = ge('photo_caption' + photo).value, old = cur.descs[photo];
    delete cur.descs[photo];
    if (trim(dsc) == old) return;

    ajax.post('al_photos.php', {act: 'save_desc', photo: photo, hash: hash, text: dsc, edit: 1}, {onDone: function(text) {
      ge('photo_save_result' + photo).innerHTML = text;
    }, onFail: function(text) {
      ge('photo_save_result' + photo).innerHTML = '<div class="photo_save_error">' + text + '</div>';
      return true;
    }, showProgress: function() {
      ge('photo_save_result' + photo).innerHTML = getLang('photos_privacy_description');
      show('photo_save_progress' + photo);
    }, hideProgress: function() {
      hide('photo_save_progress' + photo);
    }});
  },

  genFile: function(i, oncancel, cancel) {
    return ce('div', {innerHTML: '\
<a class="photo_file_cancel" id="photo_cancel' + i + '" onclick="' + oncancel + '">' + cancel + '</a>\
<div class="photo_file_button">\
  <div class="file_button_gray">\
    <div class="file_button" id="photo_file_button' + i + '">' + getLang('photos_choose_file') + '</div>\
  </div>\
</div>\
    '});
  },
  initFile: function(i) {
    FileButton.init('photo_file_button' + i, {
      name: 'photo',
      id: 'photo_file' + i,
      accept: 'image/*',
      onchange: photos.fileSelected
    });
  },
  addFile: function() {
    var i = cur.files.length, el = photos.genFile(i, 'photos.fileCancel(' + i + ')', getLang('global_cancel'));
    extend(el, {className: 'photo_upload_file', id: 'photo_upload_row' + i});
    ge('photo_upload_files').appendChild(el);
    photos.initFile(i);
    cur.files.push({});
  },
  filesLoad: function() { // for opera mini
    var i = 0, j = 0;
    for (; i < cur.files.length; ++i) {
      var val = ge('photo_file' + i).value;
      if (val) break;
    }
    if (i == cur.files.length) return;

    cur.allcont = utilsNode.appendChild(ce('div', {innerHTML: '\
<iframe name="photo_frame_all"></iframe>\
<form target="photo_frame_all" id="photo_form_all" method="POST" action="' + cur.url + '" enctype="multipart/form-data"></form>\
    '})), form = ge('photo_form_all');
    var fields = extend(cur.fields, {
      act: 'do_add',
      al: 1,
      from_host: locHost,
      ondone: 'photos.filesDone',
      onfail: 'photos.filesFail'
    });
    for (j in fields) {
      form.appendChild(ce('input', {name: j, value: fields[j]}));
    }
    for (i = 0, j = 0; i < cur.files.length; ++i) {
      var f = ge('photo_file' + i);
      if (f.value) {
        f.name = 'file' + j;
        form.appendChild(f);
        ++j;
      }
    }
    form.submit();
  },
  fileSelected: function() {
    var i = intval(this.id.replace('photo_file', ''));
    if (!cur.files[i].deleting && (cur.files[i].cont || cur.files[i].id)) return;

    cur['fileDone' + i] = photos.fileDone.pbind(i);
    cur['fileFail' + i] = photos.fileFail.pbind(i);

    cur.files[i].cont = utilsNode.appendChild(ce('div', {innerHTML: '\
<iframe name="photo_frame' + i + '"></iframe>\
<form target="photo_frame' + i + '" id="photo_form' + i + '" method="POST" action="' + cur.url + '" enctype="multipart/form-data"></form>\
    '})), form = ge('photo_form' + i);
    var fields = extend(cur.fields, {
      act: 'do_add',
      al: 1,
      from_host: locHost,
      ondone: 'cur.fileDone' + i,
      onfail: 'cur.fileFail' + i
    });
    for (var j in fields) {
      form.appendChild(ce('input', {name: j, value: fields[j]}));
    }
    form.appendChild(this);
    form.submit();

    var btn = ge('photo_file_button' + i);
    lockButton(btn);
    setTimeout(function() {
      btn.innerHTML = btn.innerHTML; // opera hack for redraw
    }, 0);
    show('photo_cancel' + i);
    ge('photo_cancel' + i).innerHTML = getLang('global_cancel');
    if (i == cur.files.length - 1) photos.addFile();
  },
  fileDone: function(i, res) {
    hide('photo_cancel' + i);
    var before = '';
    for (var j = i + 1; j < cur.files.length; ++j) {
      if (cur.files[j].id && !cur.files[j].deleting) {
        before = cur.files[j].id;
        break;
      }
    }
    setTimeout(ajax.post.pbind('al_photos.php', extend({act: 'done_add', before: before, context: 1}, q2ajx(res)), {onDone: function(id, html) {
      if (!id) return photos.fileFail(i, 0);

      cur.files[i].cont.innerHTML = '';
      utilsNode.removeChild(cur.files[i].cont);
      extend(cur.files[i], {
        id: id,
        deleting: false,
        cont: false
      });

      ge('photo_upload_row' + i).innerHTML = html;
      autosizeSetup('photo_caption' + id, {minHeight: 30});
      show('photo_delete' + id);
    }, onFail: function(text) {
      if (text) {
        setTimeout(showFastBox(getLang('global_error'), text).hide, 3000);
        photos.fileCancel(i);
        return true;
      }
    }}), 0);
  },
  fileCancel: function(i, cleaning) {
    if (cur.files[i].cont) {
      cur.files[i].cont.innerHTML = '';
      utilsNode.removeChild(cur.files[i].cont);
    }
    if (cleaning) return;

    var btn = ge('photo_file_button' + i);
    unlockButton(btn);
    btn.innerHTML = getLang('photos_choose_file');
    cur.files[i] = {};
    photos.initFile(i);
    hide('photo_cancel' + i);
  },
  fileFail: function(i, code) {
    photos.fileCancel(i);
  },
  fileDelete: function(id, hash) {
    var i = 0;
    for (; i < cur.files.length && cur.files[i].id != id;) {
      ++i;
    }
    if (i == cur.files.length || cur.files[i].deleting) return;
    cur.files[i].deleting = true;
    ajax.post('al_photos.php', {act: 'delete_photo', photo: id, hash: hash, edit: 2}, {onFail: function() {
      cur.files[i].deleting = false;
    }});
    var er = ge('photo_edit_row' + id);
    er.parentNode.insertBefore(photos.genFile(i, 'photos.fileRestore(\'' + id + '\', \'' + hash + '\')', getLang('global_restore')), er);
    hide(er);
    photos.initFile(i);
    show('photo_cancel' + i);
  },
  fileRestore: function(id, hash) {
    var i = 0, before = '';
    for (; i < cur.files.length && cur.files[i].id != id;) {
      ++i;
    }
    if (i == cur.files.length || !cur.files[i].deleting || cur.files[i].deleting === -1) return;
    if (cur.files[i].cont) {
      return photos.fileCancel(i);
    }
    for (var j = i + 1; j < cur.files.length; ++j) {
      if (cur.files[j].id && !cur.files[j].deleting) {
        before = cur.files[j].id;
        break;
      }
    }
    cur.files[i].deleting = -1;
    ajax.post('al_photos.php', {act: 'restore_photo', photo: id, hash: hash, before: before, edit: 2}, {onDone: function() {
      cur.files[i].deleting = false;
    }});
    var er = ge('photo_edit_row' + id);
    show(er);
    re(er.previousSibling);
  },
  filesDone: function(res) {
    setTimeout(ajax.post.pbind('al_photos.php', extend({act: 'done_add', context: 2}, q2ajx(res))), 0);
  },
  filesFail: function() {
    for (var i = 0; i < cur.files.length; ++i) {
      photos.fileCancel(i);
    }
    cur.allcont.innerHTML = '';
    utilsNode.removeChild(cur.allcont);
    cur.allcont = false;
  },

  chooseFlash: function() {
    if (browser.flash < 10) {
      return animate(ge('photo_flash_needed'), {backgroundColor: '#FFEFE8', borderBottomColor: '#E89B88', borderLeftColor: '#E89B88', borderRightColor: '#E89B88', borderTopColor: '#E89B88'}, 100, function() {
        animate(ge('photo_flash_needed'), {backgroundColor: '#FFFFFF', borderBottomColor: '#CCCCCC', borderLeftColor: '#CCCCCC', borderRightColor: '#CCCCCC', borderTopColor: '#CCCCCC'}, 500);
      });
    }
    cur.photoCheckFails = 0;
    show('photo_flash_upload');
    hide('photo_default_upload');
    hide('photo_upload_unavailable');
  },
  chooseDefault: function() {
    cur.photoCheckFails = 0;
    show('photo_default_upload');
    hide('photo_flash_upload');
    if (cur.serverChecked) {
      show('photo_upload_files');
      hide('photo_default_check');
    } else {
      hide('photo_upload_files');
      show('photo_default_check');
      cur.checkUpload();
    }
  },
  flashWidth: function() {
    if (_ua.indexOf('Mac') != -1 && (_ua.indexOf('Opera') != -1 || _ua.indexOf('Firefox') != -1)) return '601';
    return '600';
  },

  activeTab: function(el) {
    var p = el.parentNode.parentNode;
    for (var i = p.firstChild; i; i = i.nextSibling) {
      if (i.className == 'active_link') {
        i.className = '';
      }
    }
    el.parentNode.className = 'active_link';
  },

  checkHtml5Uploader: function() {
    return (window.XMLHttpRequest || window.XDomainRequest) && (window.FormData || window.FileReader && (window.XMLHttpRequest && XMLHttpRequest.sendAsBinary ||  window.ArrayBuffer && window.Uint8Array && (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder)));
  },

  upload: function(obj, ev) {
    if (ev && (ev.button == 2 || ev.ctrlKey)) {
      if (photos.checkHtml5Uploader()) {
        obj.href += '&html5=1';
      }
      return true;
    }
    if (photos.checkHtml5Uploader()) {
      ge('photos_upload_input').click();
      return false;
    }
    return true;
  },

  uploadLink: function(obj, ev) {
    if (photos.checkHtml5Uploader()) {
      obj.href += '&html5=1';
    }
    return nav.go(obj, ev);
  },

  onUploadSelect: function(files) {
    window.filesToUpload = files;
    var back = ge('photos_upload_area').innerHTML;
    ge('photos_upload_area').innerHTML = '<img src="/images/upload.gif">';
    nav.go(ge('photos_upload_area').href + '&html5=1', false, {
      onFail: function(text) {
        ge('photos_upload_area').innerHTML = back;
        setTimeout(showFastBox(getLang('global_error'), text).hide, 3000);
        return true;
      }
    });
  },

  registerDragZone: function(opts) {
    addEvent(document, "dragenter dragover", function(ev) {
      if (photos.checkHtml5Uploader()) {
        setTimeout(function() {
          clearTimeout(cur.dragTimer);
          delete cur.dragTimer;
        }, 0);
        opts.on(ev);
        return cancelEvent(ev);
      }
    });
    addEvent(document, "dragleave", function(ev) {
      if (cur.dragTimer) {
        clearTimeout(cur.dragTimer);
        delete cur.dragTimer;
      }
      cur.dragTimer = setTimeout(function() {
        opts.un(ev);
      }, 100);
      cancelEvent(ev);
    });
    addEvent(document, "drop", function(ev) {
      opts.un(ev, true);
      opts.drop(ev.dataTransfer.files);
      return cancelEvent(ev);
    });
    cur.destroy.push(function() {
      removeEvent(document, "dragenter dragover");
      removeEvent(document, "dragleave");
      removeEvent(document, "drop");
    });
  }
}

try{stManager.done('photos.js');}catch(e){}