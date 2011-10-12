/**
 * User: ohO_oho
 * Date: 07.10.11
 * Time: 13:34
 */


if (vk.al == 1) {
  if (location['search'] || location.pathname != '/') {
    location.replace('/');
  }
} else {
  if (!location['search'] && location.pathname == '/index.php') {
    location.replace('/');
  }
  vk.version = false;
}

window.__debugMode = true; // Don't turn it off

var cur = {destroy: [], nav: []}; // Current page variables and navigation map.
var browser = {
  version: (_ua.match( /.+(?:me|ox|on|rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
  opera: /opera/i.test(_ua),
  msie: (/msie/i.test(_ua) && !/opera/i.test(_ua)),
  msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
  msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
  msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
  msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
  mozilla: /firefox/i.test(_ua),
  chrome: /chrome/i.test(_ua),
  safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
  iphone: /iphone/i.test(_ua),
  ipod: /ipod/i.test(_ua),
  iphone4: /iphone.*OS 4/i.test(_ua),
  ipod4: /ipod.*OS 4/i.test(_ua),
  ipad: /ipad/i.test(_ua),
  safari_mobile: /iphone|ipod|ipad/i.test(_ua),
  opera_mobile: /opera mini|opera mobi/i.test(_ua),
  mobile: /iphone|ipod|ipad|opera mini|opera mobi/i.test(_ua),
  mac: /mac/i.test(_ua)
};

(function() {
  var flash = [0, 0, 0], axon = 'ShockwaveFlash.ShockwaveFlash';
  var wrapType = 'embed', wrapParam = 'type="application/x-shockwave-flash" ';
  var escapeAttr = function(v) {
    return v.toString().replace('&', '&amp;').replace('"', '&quot;');
  }
  if (navigator.plugins && navigator.mimeTypes.length) {
    var x = navigator.plugins['Shockwave Flash'];
    if (x && x.description) {
      var ver = x.description.replace(/([a-zA-Z]|\s)+/, '').replace(/(\s+r|\s+b[0-9]+)/, '.').split('.');
      for (var i = 0; i < 3; ++i) flash[i] = ver[i] || 0;
    }
  } else {
    if (_ua.indexOf('Windows CE') >= 0) {
      var axo = true, ver = 6;
      while (axo) {
        try {
          ++ver;
          axo = new ActiveXObject(axon + '.' + ver);
          flash[0] = ver;
        } catch(e) {}
      }
    } else {
      try {
        var axo = new ActiveXObject(axon + '.7');
        flash = axo.GetVariable('$version').split(' ')[1].split(',');
      } catch (e) {}
    }
    wrapType = 'object';
    wrapParam = 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';
  }
  browser.flashwrap = (wrapType == 'embed') ? function(opts, params) {
    params = extend({
      id: opts.id,
      name: opts.id,
      width: opts.width,
      height: opts.height,
      style: opts.style,
      preventhide: opts.preventhide
    }, params);
    if (browser.flash >= opts.version) {
      params.src = opts.url;
    } else {
      params.src = opts.express;
    }
    var paramsStr = [];
    for (var i in params) {
      var p = params[i];
      if (p !== undefined && p !== null) {
        paramsStr.push(i + '="' + escapeAttr(p) + '" ');
      }
    }
    return '<embed ' + wrapParam + paramsStr.join('') + '/>';
  } : function(opts, params) {
    if (browser.flash >= opts.version) {
      params.movie = opts.url;
    } else {
      params.movie = opts.express;
    }
    var attr = {
      id: opts.id,
      width: opts.width,
      height: opts.height,
      style: opts.style,
      preventhide: opts.preventhide
    }
    var attrStr = [];
    for (var i in attr) {
      var p = attr[i];
      if (p !== undefined && p !== null) {
        attrStr.push(i + '="' + escapeAttr(p) + '" ');
      }
    }
    var paramsStr = [];
    for (var i in params) {
      var p = params[i];
      if (p !== undefined && p !== null) {
        paramsStr.push('<param name="' + i + '" value="' + escapeAttr(p) + '" />');
      }
    }
    return '<object ' + wrapParam + attrStr.join('') +'>' + paramsStr.join('') + '</object>';
  }
  if (flash[0] < 7) flash = [0, 0, 0];
  browser.flash = intval(flash[0]);
  browser.flashfull = {
    major: browser.flash,
    minor: intval(flash[1]),
    rev: intval(flash[2])
  }
})();

if (!browser.msie6) {
  delete StaticFiles['ie6.css'];
}
if (!browser.msie7) {
  delete StaticFiles['ie7.css'];
}
for (var i in StaticFiles) {
  var f = StaticFiles[i];
  f.t = (i.indexOf('.css') != -1) ? 'css' : 'js';
  f.n = i.replace(/[\\/\\.]/g, '_');
  f.l = 0;
  f.c = 0;
}

window.locHost = location.host;
window.locProtocol = location.protocol;
window.__dev = /[a-z0-9_\-]+\.[a-z0-9_\-]+\.[a-z0-9_\-]+\.[a-z0-9_\-]+/i.test(locHost);
if (!__dev) __debugMode = false;
window.locHash = location.hash.replace('#/', '').replace('#!', '');
window.locBase = location.toString().replace(/#.+$/, '');

function topMsg(text, seconds, color) {
  if (!color) color = '#D6E5F7';
  if (!text) {
    hide('system_msg');
  } else {
    clearTimeout(window.topMsgTimer);
    var el = ge('system_msg');
    el.style.backgroundColor = color;
    el.innerHTML = text;
    show(el);
    if (seconds) {
      window.topMsgTimer = setTimeout(topMsg.pbind(false), seconds * 1000);
    }
  }
}
function topError(text, opts) {
  if (!opts) opts = {};
  if (text.message) {
    var e = text;
    text = '<b>JavaScript error:</b> ' + e.message;
    opts.stack = e.stack;
    if (e.stack && __debugMode) text += '<br/>' + e.stack.replace(/\n/g, '<br/>');
  } else try {
    eval('0 = 1');
  } catch(e) {
    opts.stack = e.stack;
  }
  if (opts.dt != -1) {
    topMsg(text, opts.dt, '#FFB4A3');
  }
  if (!__dev && !ge('debuglogwrap')) {
    delete(opts.dt);
    //ajax.plainpost('http://vkontakte.ru/errors.php&callback=?', extend(opts, {msg: opts.msg || text, module: (window.cur || {}).module, id: vk.id, host: locHost, lang: vk.lang, loc: (window.nav || {}).strLoc, realloc: location.toString()}));
  }
}

function langNumeric(count, vars, formatNum) {
  if (!vars || !window.langConfig) { return count; }
  var res;
  if (!isArray(vars)) {
    result = vars;
  } else {
    res = vars[1];
    if(count != Math.floor(count)) {
      res = vars[langConfig.numRules['float']];
    } else {
      each(langConfig.numRules['int'], function(i,v){
        if (v[0] == '*') { res = vars[v[2]]; return false; }
        var c = v[0] ? count % v[0] : count;
        if(indexOf(v[1], c) != -1) { res = vars[v[2]]; return false; }
      });
    }
  }
  if (formatNum) {
    var n = count.toString().split('.'), c = [];
    for(var i = n[0].length - 3; i > -3; i -= 3) {
      c.unshift(n[0].slice(i > 0 ? i : 0, i + 3));
    }
    n[0] = c.join(langConfig.numDel);
    count = n.join(langConfig.numDec);
  }
  res = (res || '%s').replace('%s', count);
  return res;
}

function langSex(sex, vars) {
  if (!isArray(vars)) return vars;
  var res = vars[1];
  if (!window.langConfig) return res;
  each(langConfig.sexRules, function(i,v){
    if (v[0] == '*') { res = vars[v[1]]; return false; }
    if (sex == v[0] && vars[v[1]]) { res = vars[v[1]]; return false; }
  });
  return res;
}

function getLang() {
  try {
    var args = Array.prototype.slice.call(arguments);
    var key = args.shift();
    if (!key) return '...';
    var val = (window.cur.lang && window.cur.lang[key]) || (window.lang && window.lang[key]) || (window.langpack && window.langpack[key]) || window[key];
    if (!val) {
      var res = key.split('_');
      res.shift();
      return res.join(' ');
    }
    if (isFunction(val)) {
      return val.apply(null, args);
    } else if (isArray(val)) {
      return langNumeric(args[0], val, args[1]);
    } else {
      return val;
    }
  } catch(e) {
    debugLog('lang error:' + e.message + '(' + Array.prototype.slice.call(arguments).join(', ') + ')');
  }
}

// Debug Log

var _logTimer = (new Date()).getTime();
var _debugLogHist = [];
var _debugLogHistOffset = 0;
var _debugLogHistShow = false;
function debugLog(msg){
  try {
    var t = '[' + (((new Date()).getTime() - _logTimer) / 1000) + '] ';
    if (ge('debuglog')) {
      if (msg === null) {
        msg = '[NULL]';
      } else if (msg === undefined) {
        msg = '[UNDEFINED]';
      }
      ge('debuglog').appendChild(ce('div', {innerHTML: t + msg.toString().replace('<', '&lt;').replace('>', '&gt;')}));
    }
    if (window.console && console.log) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(t);
      if (browser.msie || browser.mobile) {
        console.log(args.join(' '));
      } else {
        console.log.apply(console, args);
      }
    }
  } catch (e) {
  }
}
function debugLogHist(msg){
  try {
    var t = '[' + (((new Date()).getTime() - _logTimer) / 1000) + '] ', line = new Array(57).join('=');
    if (ge('debuglog')) {
      msg = t + msg.toString().replace('<', '&lt;').replace('>', '&gt;')+'<br/>';
      msg = line + '<br/>' + msg + line + '<br/>';
      _debugLogHistOffset++;
      if (_debugLogHistOffset >= 20) {
        _debugLogHist.splice(0, _debugLogHistOffset - 19);
        _debugLogHistOffset = 19;
      }
      if (!_debugLogHist[_debugLogHistOffset]) { _debugLogHist[_debugLogHistOffset] = ''; }
      _debugLogHist[_debugLogHistOffset] += msg;
    }
  } catch (e) {
  }
}

// DOM

function ge(el) {
  return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}
function geByTag(searchTag, node) {
  return (node || document).getElementsByTagName(searchTag);
}
function geByTag1(searchTag, node) {
  node = node || document;
  return node.querySelector && node.querySelector(searchTag) || geByTag(searchTag, node)[0];
}
function geByClass(searchClass, node, tag) {
  node = node || document;
  tag = tag || '*';
  var classElements = [];

  if (node.querySelectorAll && tag != '*') {
    return node.querySelectorAll(tag + '.' + searchClass);
  }
  if (node.getElementsByClassName) {
    var nodes = node.getElementsByClassName(searchClass);
    if (tag != '*') {
      tag = tag.toUpperCase();
      for (var i = 0, l = nodes.length; i < l; ++i) {
        if (nodes[i].tagName.toUpperCase() == tag) {
          classElements.push(nodes[i]);
        }
      }
    } else {
      classElements = Array.prototype.slice.call(nodes);
    }
    return classElements;
  }

  var els = geByTag(tag, node);
  var pattern = new RegExp('(^|\\s)' + searchClass + '(\\s|$)');
  for (var i = 0, l = els.length; i < l; ++i) {
    if (pattern.test(els[i].className)) {
      classElements.push(els[i]);
    }
  }
  return classElements;
}
function geByClass1(searchClass, node, tag) {
  node = node || document;
  tag = tag || '*';
  return node.querySelector && node.querySelector(tag + '.' + searchClass) || geByClass(searchClass, node, tag)[0];
}

function ce(tagName, attr, style) {
  var el = document.createElement(tagName);
  if (attr) extend(el, attr);
  if (style) setStyle(el, style);
  return el;
}

function re(el) {
  el = ge(el);
  if (el && el.parentNode) el.parentNode.removeChild(el);
  return el;
}

function se (html) {return ce('div', {innerHTML: html}).firstChild;}
function rs (html, repl) {
  each (repl, function (k, v) {
    html = html.replace(new RegExp('%' + k + '%', 'g'), v);
  });
  return html;
}

function show(elem) {
  if (arguments.length > 1) {
    for (var i = 0, l = arguments.length; i < l; ++i) {
      show(arguments[i]);
    }
    return;
  }
  elem = ge(elem);
  if (!elem || !elem.style) return;
  var old = elem.olddisplay, newStyle = 'block', tag = elem.tagName.toLowerCase();
  elem.style.display = old || '';


  if (getStyle(elem, 'display') == 'none') {
    if (hasClass(elem, 'inline')) {
      newStyle = 'inline';
    } else if (tag == 'tr' && !browser.msie) {
      newStyle = 'table-row';
    } else if (tag == 'table' && !browser.msie) {
      newStyle = 'table';
    } else {
      newStyle = 'block';
    }
    elem.style.display = elem.olddisplay = newStyle;
  }
}

function hide(elem) {
  var l = arguments.length;
  if (l > 1) {
    for (var i = 0; i < l; i++) {
      hide(arguments[i]);
    }
    return;
  }
  elem = ge(elem);
  if (!elem || !elem.style) return;
  var d = getStyle(elem, 'display');
  elem.olddisplay = (d != 'none') ? d : '';
  elem.style.display = 'none';
}

function isVisible(elem) {
  elem = ge(elem);
  if (!elem || !elem.style) return false;
  return getStyle(elem, 'display') != 'none';
}

function toggle(elem, val) {
  if (val === undefined) {
    val = !isVisible(elem);
  }
  if (val) {
    show(elem);
  } else {
    hide(elem);
  }
}

var hfTimeout = 0;
function toggleFlash(show, timeout) {
  //if (/mac/i.test(navigator.userAgent)) return;
  clearTimeout(hfTimeout);
  if (timeout > 0) {
    hfTimeout = setTimeout(function() {toggleFlash(show, 0)}, timeout);
    return;
  }

  var vis = show ? 'visible' : 'hidden';

  triggerEvent(document, show ? 'unblock' : 'block');

  var f = function() {
    if (this.getAttribute('preventhide')) {
      return;
    } else if (this.id == 'flash_app' && browser.msie) {

      show ? setStyle(this, {position: 'static', top: 0}) : setStyle(this, {position: 'absolute', top: '-5000px'});
    } else {
      this.style.visibility = vis;
    }
  };
  each(geByTag('embed'), f);
  each(geByTag('object'), f);
}

function getXY(obj, forFixed) {
  if (!obj || obj == undefined) return;
  var left = 0, top = 0, pos, lastLeft;
  if (obj.offsetParent) {
    do {
      left += (lastLeft = obj.offsetLeft);
      top += obj.offsetTop;
      pos = getStyle(obj, 'position');
      if (pos == 'fixed' || pos == 'absolute' || (pos == 'relative' && obj.id == 'page_wrap')) {
        left -= obj.scrollLeft;
        top -= obj.scrollTop;
        if (pos == 'fixed' && !forFixed) {
          left += ((obj.offsetParent || {}).scrollLeft || bodyNode.scrollLeft || htmlNode.scrollLeft);
          top += ((obj.offsetParent || {}).scrollTop || bodyNode.scrollTop || htmlNode.scrollTop);
        }
      }
    } while (obj = obj.offsetParent);
  }
  if (forFixed && browser.msie && !browser.msie9) {
    if (lastLeft) {
      left += ge('page_layout').offsetLeft;
    }
  }
  return [left,top];
}

function getSize(elem, withoutBounds) {
  var s = [0, 0], de = document.documentElement;
  if (elem == document) {
    s =  [Math.max(
        de.clientWidth,
        bodyNode.scrollWidth, de.scrollWidth,
        bodyNode.offsetWidth, de.offsetWidth
      ), Math.max(
        de.clientHeight,
        bodyNode.scrollHeight, de.scrollHeight,
        bodyNode.offsetHeight, de.offsetHeight
      )];
  } else if (elem){
    function getWH() {
      s = [elem.offsetWidth, elem.offsetHeight];
      if (!withoutBounds) return;
      var padding = 0, border = 0;
      each(s, function(i, v) {
        var which = i ? ['Top', 'Bottom'] : ['Left', 'Right'];
        each(which, function(){
          s[i] -= parseFloat(getStyle(elem, 'padding' + this)) || 0;
          s[i] -= parseFloat(getStyle(elem, 'border' + this + 'Width')) || 0;
        });
      });
      s = [Math.round(s[0]), Math.round(s[1])];
    }
    if (!isVisible(elem)) {
      var props = {position: 'absolute', visibility: 'hidden', display: 'block'};
      var old = {};
      each(props, function(i, val){
        old[i] = elem.style[i];
        elem.style[i] = val;
      });
      getWH();
      each(props, function(i, val){
        elem.style[i] = old[i];
      });
    } else getWH();

  }
  return s;
}

function getZoom() {
  var r1 = ge('zoom_test_1') || document.body.appendChild(ce('div', {id: 'zoom_test_1'}, {left: '10%', position: 'absolute', visibility: 'hidden'})),
      r2 = ge('zoom_test_2') || document.body.appendChild(ce('div', {id: 'zoom_test_2'}, {left: r1.offsetLeft + 'px', position: 'absolute', visibility: 'hidden'}));
  return r2.offsetLeft / r1.offsetLeft;
}

//
//  Useful utils
//

Function.prototype.pbind = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(window);
  return this.bind.apply(this, args);
};
Function.prototype.bind = function() {
  var func = this, args = Array.prototype.slice.call(arguments);
  var obj = args.shift();
  return function() {
    var curArgs = Array.prototype.slice.call(arguments);
    return func.apply(obj, args.concat(curArgs));
  }
}
function rand(mi, ma) { return Math.random() * (ma - mi + 1) + mi; }
function irand(mi, ma) { return Math.floor(rand(mi, ma)); }
function isFunction(obj) {return Object.prototype.toString.call(obj) === '[object Function]'; }
function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }
function isEmpty(o) { if(Object.prototype.toString.call(o) !== '[object Object]') {return false;} for(var i in o){ if(o.hasOwnProperty(i)){return false;} } return true; }
function vkNow() { return +new Date; }
function vkImage() { return window.Image ? (new Image()) : ce('img'); } // IE8 workaround
function trim(text) { return (text || '').replace(/^\s+|\s+$/g, ''); }
function stripHTML(text) { return text ? text.replace(/<(?:.|\s)*?>/g, '') : ''; }
function escapeRE(s) { return s ? s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1') : ''; }
function intval(value) {
  if (value === true) return 1;
  return parseInt(value) || 0;
}
function floatval(value) {
  if (value === true) return 1;
  return parseFloat(value) || 0;
}
function positive(value) {
  value = intval(value);
  return value < 0 ? 0 : value;
}

function winToUtf(text) {
  var m, i, j, code;
  m = text.match(/&#[0-9]{2}[0-9]*;/gi);
  for (j in m) {
    var val = '' + m[j]; // buggy IE6
    code = intval(val.substr(2, val.length - 3));
    if (code >= 32 && ('&#' + code + ';' == val)) { // buggy IE6
      text = text.replace(val, String.fromCharCode(code));
    }
  }
  text = text.replace(/&quot;/gi, '"').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  return text;
}
function replaceEntities(str) {
  return se('<textarea>' + (str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')) + '</textarea>').value;
}

//
//  Arrays, objects
//

function each(object, callback) {
  var name, i = 0, length = object.length;

  if (length === undefined) {
    for (name in object)
      if (callback.call(object[name], name, object[name]) === false)
        break;
  } else {
    for (var value = object[0];
      i < length && callback.call(value, i, value) !== false;
        value = object[++i]) {}
  }

  return object;
}

function indexOf(arr, value, from) {
  for (var i = from || 0, l = arr.length; i < l; i++) {
    if (arr[i] == value) return i;
  }
  return -1;
}
function inArray(value, arr) {
  return indexOf(arr, value) != -1;
}
function clone(obj) {
  var newObj = isArray(obj) ? [] : {};
  for (var i in obj) {
    newObj[i] = obj[i];
  }
  return newObj;
}

// Extending object by another
function extend() {
  var a = arguments, target = a[0] || {}, i = 1, l = a.length, deep = false, options;

  if (typeof target === 'boolean') {
    deep = target;
    target = a[1] || {};
    i = 2;
  }

  if (typeof target !== 'object' && !isFunction(target)) target = {};

  for (; i < l; ++i) {
    if ((options = a[i]) != null) {
      for (var name in options) {
        var src = target[name], copy = options[name];

        if (target === copy) continue;

        if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
          target[name] = extend(deep, src || (copy.length != null ? [] : {}), copy);
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  return target;
}


//
// CSS classes
//

function hasClass(obj, name) {
  obj = ge(obj);
  return obj && (new RegExp('(\\s|^)' + name + '(\\s|$)')).test(obj.className);
}
function addClass(obj, name) {
  if ((obj = ge(obj)) && !hasClass(obj, name)) {
    obj.className = (obj.className ? obj.className + ' ' : '') + name;
  }
}
function removeClass(obj, name) {
  if (obj = ge(obj)) {
    obj.className = trim((obj.className || '').replace((new RegExp('(\\s|^)' + name + '(\\s|$)')), ' '));
  }
}
function toggleClass(obj, name, val) {
  if (val === undefined) {
    val = !hasClass(obj, name);
  }
  (val ? addClass : removeClass)(obj, name);
}
function replaceClass(obj, oldName, newName) {
  removeClass(obj, oldName);
  addClass(obj, newName);
}

// Get computed style
function getStyle(elem, name, force) {
  elem = ge(elem);
  if (isArray(name)) { var res = {}; each(name, function(i,v){res[v] = getStyle(elem, v);}); return res; }
  if (force === undefined) {
    force = true;
  }
  if (!force && name == 'opacity' && browser.msie) {
    var filter = elem.style['filter'];
    return filter ? (filter.indexOf('opacity=') >= 0 ?
      (parseFloat(filter.match(/opacity=([^)]*)/)[1] ) / 100) + '' : '1') : '';
  }
  if (!force && elem.style && (elem.style[name] || name == 'height')) {
    return elem.style[name];
  }

  if (force && (name == 'width' || name == 'height')) {
    return getSize(elem, true)[({'width': 0, 'height': 1})[name]] + 'px';
  }

  var ret, defaultView = document.defaultView || window;
  if (defaultView.getComputedStyle) {
    name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
//    var computedStyle = defaultView.getComputedStyle(elem, null);
//    if (computedStyle) {
//      ret = computedStyle.getPropertyValue(name);
//    }
//  } else if (elem.currentStyle) {
//    if (name == 'opacity' && browser.msie) {
//      var filter = elem.currentStyle['filter'];
//      return filter && filter.indexOf('opacity=') >= 0 ?
//        (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : '1';
//    }
//    var camelCase = name.replace(/\-(\w)/g, function(all, letter){
//      return letter.toUpperCase();
//    });
//    ret = elem.currentStyle[name] || elem.currentStyle[camelCase];
//    //dummy fix for ie
//    if (ret == 'auto') {
//      ret = 0;
//    }
//
//    if (!/^\d+(px)?$/i.test(ret) && /^\d/.test(ret)) {
//      var style = elem.style, left = style.left, rsLeft = elem.runtimeStyle.left;
//
//      elem.runtimeStyle.left = elem.currentStyle.left;
//      style.left = ret || 0;
//      ret = style.pixelLeft + 'px';
//
//      style.left = left;
//      elem.runtimeStyle.left = rsLeft;
//    }
  }

  return ret;
}

function setStyle(elem, name, value){
  elem = ge(elem);
  if (!elem) return;
  if (typeof name == 'object') return each(name, function(k, v) { setStyle(elem,k,v); });
  if (name == 'opacity') {
    if (browser.msie) {
      if ((value + '').length) {
        if (value !== 1) {
          elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
        } else {
          elem.style.filter = '';
        }
      } else {
        elem.style.cssText = elem.style.cssText.replace(/filter\s*:[^;]*/gi, '');
      }
      elem.style.zoom = 1;
    };
    elem.style.opacity = value;
  } else {
    try{
    var isN = typeof(value) == 'number';
    if (isN && (/height|width/i).test(name)) value = Math.abs(value);
    elem.style[name] = isN && !(/z-?index|font-?weight|opacity|zoom|line-?height/i).test(name) ? value + 'px' : value;
    } catch(e){debugLog([name, value]);}
  }
}

//
// Store data connected to element
//

var vkExpand = 'VK' + vkNow(), vkUUID = 0, vkCache = {};

function data(elem, name, data) {
  var id = elem[vkExpand], undefined;
  if (!id) {
    id = elem[vkExpand] = ++vkUUID;
  }

  if (name && !vkCache[id]) {
    vkCache[id] = {};
    if (__debugMode) vkCache[id].__elem = elem;
  }

  if (data !== undefined) {
    vkCache[id][name] = data;
  }

  return name ? vkCache[id][name] : id;
}
function removeAttr(el) {
  for (var i = 0, l = arguments.length; i < l; ++i) {
    var n = arguments[i];
    if (el[n] === undefined) continue;
    try {
      delete el[n];
    } catch(e) {
      try {
        el.removeAttribute(n);
      } catch(e) {}
    }
  }
}
function removeData(elem, name) {
  var id = elem ? elem[vkExpand] : false;
  if (!id) return;

  if (name) {
    if (vkCache[id]) {
      delete vkCache[id][name];
      name = '';
      for (name in vkCache[id]) {
        break;
      }

      if (!name) {
        removeData(elem);
      }
    }
  } else {
    removeEvent(elem);
    removeAttr(elem, vkExpand);
    delete vkCache[id];
  }
}
function cleanElems() {
  var a = arguments;
  for (var i = 0; i < a.length; ++i) {
    var el = ge(a[i]);
    if (el) {
      removeData(el);
      removeAttr(el, 'btnevents');
    }
  }
}

// Simple FX
function animate(el, params, speed, callback) {
  el = ge(el);
  if (!el) return;
  var _cb = isFunction(callback) ? callback : function() {};
  var options = extend({}, typeof speed == 'object' ? speed : {duration: speed, onComplete: _cb});
  var fromArr = {}, toArr = {}, visible = isVisible(el), self = this, p;
  options.orig = {};
  params = clone(params);
  if (browser.iphone)
    options.duration = 0;
  var tween = data(el, 'tween'), i, name, toggleAct = visible ? 'hide' : 'show';
  if (tween && tween.isTweening) {
    options.orig = extend(options.orig, tween.options.orig);
    tween.stop(false);
    if (tween.options.show) toggleAct = 'hide';
    else if (tween.options.hide) toggleAct = 'show';
  }
  for (p in params)  {
    if (!tween && (params[p] == 'show' && visible || params[p] == 'hide' && !visible)) {
      return options.onComplete.call(this, el);
    }
    if ((p == 'height' || p == 'width') && el.style) {
      if (options.orig.overflow == undefined) {
        options.orig.overflow = getStyle(el, 'overflow');
      }
      el.style.overflow = 'hidden';
      el.style.display = 'block';
    }
    if (/show|hide|toggle/.test(params[p])) {
      if (params[p] == 'toggle') {
        params[p] = toggleAct;
      }
      if (params[p] == 'show') {
        var from = 0;
        options.show = true;
        if (options.orig[p] == undefined) {
          options.orig[p] = getStyle(el, p, false) || '';
          setStyle(el, p, 0);
        }

        var o;
        if (p == 'height' && browser.msie6) {
          o = '0px';
          el.style.overflow = '';
        } else {
          o = options.orig[p];
        }

        var old = el.style[p];
        el.style[p] = o;
        params[p] = parseFloat(getStyle(el, p, true));
        el.style[p] = old;

        if (p == 'height' && browser.msie) {
          el.style.overflow = 'hidden';
        }
      } else {
        if (options.orig[p] == undefined) {
          options.orig[p] = getStyle(el, p, false) || '';
        }
        options.hide = true;
        params[p] = 0;
      }
    }
  }
  if (options.show && !visible) {
    show(el);
  }
  tween = new Fx.Base(el, options);
  each(params, function(name, to) {
    if (/backgroundColor|borderBottomColor|borderLeftColor|borderRightColor|borderTopColor|color|borderColor|outlineColor/.test(name)) {
      var p = (name == 'borderColor') ? 'borderTopColor' : name;
      from = getColor(el, p);
      to = getRGB(to);
    } else {
      var parts = to.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
        start = tween.cur(name, true) || 0;
      if (parts) {
        to = parseFloat(parts[2]);
        if (parts[1]) {
          to = ((parts[1] == '-=' ? -1 : 1) * to) + to;
        }
      }

      if (options.hide && name == 'height' && browser.msie6) {
        el.style.height = '0px';
        el.style.overflow = '';
      }
      from = tween.cur(name, true);
      if (options.hide && name == 'height' && browser.msie6) {
        el.style.height = '';
        el.style.overflow = 'hidden';
      }
      if (from == 0 && (name == 'width' || name == 'height'))
        from = 1;

      if (name == 'opacity' && to > 0 && !visible) {
        setStyle(el, 'opacity', 0);
        from = 0;
        show(el);
      }
    }
    if (from != to || (isArray(from) && from.join(',') == to.join(','))) {
      fromArr[name] = from;
      toArr[name] = to;
    }
  });
  tween.start(fromArr, toArr);
  data(el, 'tween', tween);

  return tween;
}

function fadeTo(el, speed, to, callback) {
  return animate(el, {opacity: to}, speed, callback);
}

var Fx = fx = {
  Transitions: {
    linear: function(t, b, c, d) { return c*t/d + b; },
    sineInOut: function(t, b, c, d) { return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b; },
    halfSine: function(t, b, c, d) { return c * (Math.sin(Math.PI * (t/d) / 2)) + b; },
    easeOutBack: function(t, b, c, d) { var s = 1.70158; return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b; },
    easeInCirc: function(t, b, c, d) { return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b; },
    easeOutCirc: function(t, b, c, d) { return c * Math.sqrt(1 - (t=t/d-1)*t) + b; },
    easeInQuint: function(t, b, c, d) { return c*(t/=d)*t*t*t*t + b; },
    easeOutQuint: function(t, b, c, d) { return c*((t=t/d-1)*t*t*t*t + 1) + b; }
  },
  Attrs: [
    [ 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom' ],
    [ 'width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight' ],
    [ 'opacity', 'left', 'top' ]
  ],
  Timers: [],
  TimerId: null
}

Fx.Base = function(el, options, name) {
  this.el = ge(el);
  this.name = name;
  this.options = extend({
    onComplete: function() {},
    transition: options.transition || Fx.Transitions.sineInOut,
    duration: 500
  }, options || {});
}

function genFx(type, num) {
  var obj = {};
  each(Fx.Attrs.concat.apply([], Fx.Attrs.slice(0, num)), function() {
    obj[this] = type;
  });
  return obj;
};

// Shortcuts for custom animations
each({slideDown: genFx('show', 1),
  slideUp: genFx('hide', 1),
  slideToggle: genFx('toggle', 1),
  fadeIn: {opacity: 'show'},
  fadeOut: {opacity: 'hide'},
  fadeToggle: {opacity: 'toggle'}}, function(f, val) {
  window[f] = function(el, speed, callback) { return animate(el, val, speed, callback); }
});

Fx.Base.prototype = {
  start: function(from, to){
    this.from = from;
    this.to = to;
    this.time = vkNow();
    this.isTweening = true;

    var self = this;
    function t(gotoEnd) {
      return self.step(gotoEnd);
    }
    t.el = this.el;
    if (t() && Fx.Timers.push(t) && !Fx.TimerId) {
      Fx.TimerId = setInterval(function() {
        var timers = Fx.Timers, l = timers.length;
        for (var i = 0; i < l; i++) {
          if (!timers[i]()) {
            timers.splice(i--, 1);
            l--;
          }
        }
        if (!l) {
          clearInterval(Fx.TimerId);
          Fx.TimerId = null;
        }
      }, 13);
    }
    return this;
  },

  stop: function(gotoEnd) {
    var timers = Fx.Timers;

    for (var i = timers.length - 1; i >= 0; i--) {
      if (timers[i].el == this.el ) {
        if (gotoEnd) {
          timers[i](true);
        }
        timers.splice(i, 1);
      }
    }
    this.isTweening = false;
  },

  step: function(gotoEnd) {
    var time = vkNow();
    if (!gotoEnd && time < this.time + this.options.duration) {
      this.cTime = time - this.time;
      this.now = {};
      for (p in this.to) {
        // color fx
        if (isArray(this.to[p])) {
          var color = [], j;
          for (j = 0; j < 3; j++) {
            if (this.from[p] === undefined || this.to[p] === undefined) {
              return false;
            }
            color.push(Math.min(parseInt(this.compute(this.from[p][j], this.to[p][j])), 255));
          }
          this.now[p] = color;
        } else {
          this.now[p] = this.compute(this.from[p], this.to[p]);
        }
      }
      this.update();
      return true;
    } else {
      setTimeout(this.options.onComplete.bind(this, this.el), 10);
      this.now = extend(this.to, this.options.orig);
      this.update();
      if (this.options.hide) hide(this.el);
      this.isTweening = false;
      return false;
    }
  },

  compute: function(from, to){
    var change = to - from;
    return this.options.transition(this.cTime, from, change, this.options.duration);
  },

  update: function(){
    for (var p in this.now) {
      if (isArray(this.now[p])) setStyle(this.el, p, 'rgb(' + this.now[p].join(',') + ')');
      else this.el[p] != undefined ? (this.el[p] = this.now[p]) : setStyle(this.el, p, this.now[p]);
    }
  },

  cur: function(name, force){
    if (this.el[name] != null && (!this.el.style || this.el.style[name] == null))
      return this.el[name];
    return parseFloat(getStyle(this.el, name, force)) || 0;
  }
};

// Parse strings looking for color tuples [255,255,255]
function getRGB(color) {
  var result;
  if (color && isArray(color) && color.length == 3)
    return color;
  if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
    return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
  if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
    return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];
  if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
    return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];
  if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
    return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];
}

function getColor(elem, attr) {
  var color;
  do {
    color = getStyle(elem, attr);
    if (!color.indexOf('rgba')) color = '';
    if (color != '' && color != 'transparent' || elem.nodeName.toLowerCase() == 'body') {
      break;
    }
    attr = 'backgroundColor';
  } while (elem = elem.parentNode);
  return getRGB(color);
}

function scrollToY(y, speed) {
  if (speed == undefined) speed = 400;
  if (speed) {
    if (browser.msie6) {
      animate(pageNode, {scrollTop: y}, speed);
    } else {
      animate(htmlNode, {scrollTop: y}, speed);
      animate(bodyNode, {scrollTop: y}, speed);
    }
  } else {
    window.scroll(0, y);
    if (browser.msie6) {
      pageNode.scrollTop = y;
    }
    updSideTopLink();
  }
}

function scrollToTop(speed) {
  return scrollToY(0, speed);
}

function scrollGetY() {
  return window.pageYOffset || document.documentElement.scrollTop;
}

function notaBene(el, color, nofocus) {
  el = ge(el);
  if (!el) return;

  if (!nofocus) elfocus(el);
  var oldBack = data(el, 'back') || data(el, 'back', getStyle(el, 'backgroundColor'));
  var colors = {notice: '#FFFFE0', warning: '#FAEAEA'};
  setStyle(el, 'backgroundColor', colors[color] || color || colors.warning);
  setTimeout(animate.pbind(el, {backgroundColor: oldBack}, 300), 400);
}

//
// Events
//

var KEY = window.KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DEL: 8,
  TAB: 9,
  RETURN: 13,
  ENTER: 13,
  ESC: 27,
  PAGEUP: 33,
  PAGEDOWN: 34,
  SPACE: 32
};

function addEvent(elem, types, handler, custom, context) {
  elem = ge(elem);
  if (!elem || elem.nodeType == 3 || elem.nodeType == 8)
    return;

  var realHandler = context ? function (e) {
    var prevData = e.data;
    e.data = context;
    var ret = handler.apply(this, [e]);
    e.data = prevData;
    return ret;
  } : handler;

  // For IE
  if (elem.setInterval && elem != window) elem = window;

  var events = data(elem, 'events') || data(elem, 'events', []),
      handle = data(elem, 'handle') || data(elem, 'handle', function() {
        _eventHandle.apply(arguments.callee.elem, arguments);
      });
  // to prevent a memory leak
  handle.elem = elem;

  each(types.split(/\s+/), function(index, type) {
    if (!events[type]) {
      events[type] = [];
      if (!custom && elem.addEventListener) {
        elem.addEventListener(type, handle, false);
      } else if (!custom && elem.attachEvent) {
        elem.attachEvent('on' + type, handle);
      }
    }
    events[type].push(realHandler);
  });

  elem = null;
}
function removeEvent(elem, types, handler) {
  elem = ge(elem);
  if (!elem) return;
  var events = data(elem, 'events');
  if (!events) return;
  if (typeof(types) != 'string') {
    for (var i in events) {
      removeEvent(elem, i);
    }
    return;
  }
  each(types.split(/\s+/), function(index, type) {
    if (!isArray(events[type])) return;
    var l = events[type].length;
    if (isFunction(handler)) {
      for (var i = l - 1; i >= 0; i--) {
        if (events[type][i] == handler) {
          events[type].splice(i, 1);
          l--;
          break;
        }
      }
    } else {
      for (var i = 0; i < l; i++) {
        delete events[type][i];
      }
      l = 0;
    }
    if (!l) {
      if (elem.removeEventListener) {
        elem.removeEventListener(type, data(elem, 'handle'), false);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + type, data(elem, 'handle'));
      }
      delete events[type];
    }
  });
}
function triggerEvent(elem, type, ev, now) {
  elem = ge(elem);
  var handle = data(elem, 'handle');
  if (handle) {
    var f = function() {
      handle.call(elem, extend((ev || {}), {type: type, target: elem}))
    };
    now ? f() : setTimeout(f, 0);
  }
}
function cancelEvent(event) {
  var e = event.originalEvent || event;
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();
  event.cancelBubble = e.cancelBubble = true;
  event.returnValue = e.returnValue = false;
  return false;
}
function _eventHandle(event) {
  event = normEvent(event);

  var handlers = data(this, 'events');
  if (!handlers || typeof(event.type) != 'string' || !handlers[event.type] || !handlers[event.type].length) {
    return;
  }

  for (var i in (handlers[event.type] || [])) {
    if (event.type == 'mouseover' || event.type == 'mouseout') {
      var parent = event.relatedElement;
      while (parent && parent != this) {
        try { parent = parent.parentNode; }
        catch(e) { parent = this; }
      }
      if (parent == this) {
        continue
      }
    }
    var ret = handlers[event.type][i].apply(this, arguments);
    if (ret === false) {
      cancelEvent(event);
    }
  }
}

function normEvent(event) {
  event = event || window.event;

  var originalEvent = event;
  event = clone(originalEvent);
  event.originalEvent = originalEvent;

  if (!event.target) {
    event.target = event.srcElement || document;
  }

  // check if target is a textnode (safari)
  if (event.target.nodeType == 3) {
    event.target = event.target.parentNode;
  }

  if (!event.relatedTarget && event.fromElement) {
    event.relatedTarget = event.fromElement == event.target;
  }

  if (event.pageX == null && event.clientX != null) {
    var doc = document.documentElement, body = bodyNode;
    event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
    event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
  }

  if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode)) {
    event.which = event.charCode || event.keyCode;
  }

  if (!event.metaKey && event.ctrlKey) {
    event.metaKey = event.ctrlKey;
  } else if (!event.ctrlKey && event.metaKey && browser.mac) {
    event.ctrlKey = event.metaKey;
  }

  // click: 1 == left; 2 == middle; 3 == right
  if (!event.which && event.button) {
    event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
  }

  return event;
}

// Prevent memory leaks in IE
addEvent(window, 'unload', function() {
  for (var id in vkCache) {
    if (vkCache[id].handle && vkCache[id].handle.elem != window) {
      removeEvent(vkCache[id].handle.elem);
    }
  }
});
addEvent(window, 'load', function() {
  vk.loaded = true;
});
if (__debugMode) {
  function __checkData() {
    var r = [];
    for (var i in vkCache) {
      var c = vkCache[i], el;
      if (!c || !(el = c.__elem)) continue;
      var id = el.id;
      if (!id) el.id = id = '__vk' + irand(1000000, 9999999);
      if (ge(id) == el) continue;
      var d = [];
      for (var j in c) {
        if (j == '__elem' || j == 'handle' && c.events) continue;
        if (j == 'events') {
          var e = [];
          for (var k in c[j]) e.push(k + '(' + c[j][k].length + ')');
          d.push('{' + e.join(', ') + '}');
        } else {
          d.push(j);
        }
      }
      var n;
      if (!/^__vk/.test(id)) n = '#' + id;
      else if (trim(el.className)) n = '.' + el.className.split(' ').join('.');
      else if (el.tagName) n = '&lt;' + el.tagName.toLowerCase() + '&gt;';
      else n = el + '';
      r.push(n + ': ' + d.join(', '));
    }
    return r.join('<br>');
  }
  addEvent(document, 'keydown', function(e) {
    if (e.keyCode == 120 && !e.charCode) {
      showFastBox({title: 'Debug'}, __checkData());
    }
  });
}

var _layerAnim = false;
// Layers
var layers = {
  sh: (!_layerAnim || browser.msie || browser.iphone) ? function(el, done) {
    show(el);
    if (done) done();
  } : function(el, done) {
    fadeIn(el, 200, done);
  },
  hd: (!_layerAnim || browser.msie || browser.iphone) ? function(el, done) {
    hide(el);
    if (done) done();
  } : function(el, done) {
    fadeOut(el, 200, done);
  },
  visible: false,
  _show: function(el, con, opacity, color) {
    setStyle(el, {opacity: opacity || '', backgroundColor: color || ''});
    if (!layers.visible) {
      toggleFlash();
      if (browser.mozilla) {
        window._oldScroll = htmlNode.scrollTop;
        pageNode.style.height = (_oldScroll + lastWindowHeight) + 'px';
        pageNode.style.marginTop = -_oldScroll + 'px';
      } else if (!browser.msie6) {
        (browser.msie7 ? htmlNode : bodyNode).style.overflow = 'hidden';
      }
    }
    layers.visible = true;
    show(con);
    layers.sh(el);
    window.updateWndVScroll && updateWndVScroll();
  },
  _hide: function(el, con) {
    var done = function() {
      hide(con);
      if (!isVisible(layerWrap) && !isVisible(boxLayerWrap) && ((window.mvcur && mvcur.minimized) || !isVisible(window.mvLayerWrap))) {
        layers.visible = false;
        toggleFlash(true);
        if (browser.mozilla) {
          pageNode.style.height = 'auto';
          pageNode.style.marginTop = '0px';
          if (window._oldScroll) {
            htmlNode.scrollTop = _oldScroll;
          }
        } else if (!browser.msie6) {
          (browser.msie7 ? htmlNode : bodyNode).style.overflow = 'auto';
        }
      }
      window.updateWndVScroll && updateWndVScroll();
    }
    layers.hd(el, done);
  }
};

window.__seenAds = 2 - intval(getCookie('remixseenads'));
function updSeenAdsInfo() {
  var top = (getXY(ge('left_ads'), true) || {})[1];
  if (!top || !vk.id) return;

  var ads = Math.floor((lastWindowHeight - (getXY(ge('left_ads'), true) || {})[1]) / 170);
  if (ads < 0) {
    ads = 0;
  } else if (ads > 2) {
    ads = 2;
  }
  if (__seenAds !== ads) {
    __seenAds = ads;
    setCookie('remixseenads', 2 - ads, 30);
  }
}

function updSideTopLink(resized) {
  if (!window.scrollNode || browser.mobile) return;

  var pb = ge('page_body'), xy = getXY(pb);
  var st = scrollGetY();
  if (resized) {
    var pl = ge('page_layout');
    var l = vk.rtl ? pl.offsetLeft + pl.offsetWidth : 0, w = vk.rtl ? (lastWindowWidth - l) : pl.offsetLeft;
    setStyle(_stlLeft, {
      left: l,
      width: Math.max(w, 0),
      height: lastWindowHeight
    });
    var sl = vk.rtl ? (xy[0] + pb.offsetWidth + 5) : w, sw = vk.rtl ? (l - sl) : (xy[0] - 5 - sl);
    setStyle(_stlSide, {
      left: sl,
      width: Math.max(sw, 0)
    });
  }

  var sb = ge('side_bar'), is = isVisible(sb);
  window._stlSideTop = Math.max(xy[1] + (is ? getSize(sb)[1] : 0) - st, 0);
  var h = Math.max(lastWindowHeight - _stlSideTop, 0);
  setStyle(_stlSide, {
    top: _stlSideTop,
    height: h
  });
  setTimeout(updAds.pbind(st), 0);
  _stlLeft.style.cursor = _stlSide.style.cursor = (_stlSaved || st > 600) ? 'pointer' : 'default';
  var o = _stlSaved ? (800 - st) / 400 : (st - 800) / 400;
  if (_stlSaved && o < 0) {
    _stlSaved = 0;
    _stlText.className = '';
  }
  setStyle(_stlText, {
    opacity: Math.min(Math.max(o, 0), 1)
  });
}

window.__adsLoaded = vkNow();
window.__adsCanUpd = window.__adsTimer = false;
function updAds(st) {
  var el = ge('left_ads'), top = (getXY(ge('left_ads'), true) || {})[1];
  if (st === false) st = scrollGetY();
  __adsCanUpd = el && !vk.intnat && vk.id && vk.loaded && __activeTab && (top + 170 > st) && (top < st + lastWindowHeight) && isVisible(el) && !layers.visible;
  if (!__adsLoaded && __adsCanUpd) {
    __adsLoaded = vkNow();
    if (Math.random() < (vk.ad || 0.001)) {
      ajax.post('ads_rotate.php', {act: 'al_update_ad'}, {ads: 1});
    }
  }
}
function __adsShow(el, cont) {
  setStyle(el, {overflow: 'hidden'});
  animate(el, {height: getSize(cont)[1]}, 200, animate.pbind(cont, {opacity: 1}, 200, function() {
    while (cont.previousSibling) {
      re(cont.previousSibling);
    }
    setStyle(cont, {position: 'static'});
    setStyle(el, {height: '', overflow: 'visible'});
  }));
}
function __adsSet(ad) {
  __adsLoaded = vkNow();
  if (!vk.id) return;
  var el = ge('left_ads'), vis = el && isVisible(el);
  if (!el) el = ge('side_bar').appendChild(ce('div', {id: 'left_ads'}, {display: vis ? 'block' : 'none'}));
  if (!vis || !el.firstChild || browser.msie6 || browser.msie7) return (el.innerHTML = ad);
  var cont = el.appendChild(ce('div', {innerHTML: ad}, {position: 'absolute', opacity: 0, left: 0, top: 0})), imgs = geByTag('img', cont), wait = [];
  for (var i = 0, l = imgs.length; i < l; ++i) {
    var img = new Image();
    img.src = imgs[i].src;
    wait.push(img);
  }
  debugLog(wait);
  clearInterval(__adsTimer);
  __adsTimer = setInterval(function() {
    for (var i in wait) if (!wait[i].width || !wait[i].height) return;
    __adsShow(el, cont);
    clearInterval(__adsTimer);
  }, 50);
}

function updGlobalPlayer() {
  var w = window, de = document.documentElement;
  if (!w.pageNode) return;
  var _gp = ge('gp'), _gb = ge('gp_back'), _a = window.audioPlayer;
  if (!_gp || !_gb) return;
  var pb = ge('page_body'), pbxy = getXY(pb), pbsz = getSize(pb);
  var pl = ge('page_layout'), plxy = getXY(pl), plsz = getSize(pl);
  var sbw = sbWidth();
  var dwidth = Math.max(intval(w.innerWidth), intval(de.clientWidth)) - sbw * (browser.msie && !browser.msie9 ? 0 : 1) - 1;
  var dheight = Math.max(intval(w.innerHeight), intval(de.clientHeight));
  var pos = _a.pos;
  if (pos) {
    _gp.t = pos.t;
    _gp.l = pos.l;
  } else {
    var gpsz = getSize(_gp);
    var y = pb.offsetTop + pl.parentNode.offsetTop + dheight - gpsz[1] - 20;
    if (browser.msie7 || browser.msie6) y -= 33;
    if (!ge('im_nav_wrap')) y -= 40;
    _gp.t = Math.max(y, 0);
    _gp.l = vk.rtl ? pbxy[0] + pbsz[0] - 2 : plxy[0] - 7;
  }
  var sticked = ls.get('audio_sticked');
  if (_gp.l + _a.gpMaxW >= dwidth || sticked && sticked & 2) {
    if (!vk.rtl && !hasClass(_gp, 'reverse')) {
      addClass(_gp, 'reverse');
      _gp.rev = 1;
      ls.set('audio_rev', 1);
    }

    if (_gp.l + _a.gpMinW > dwidth || sticked && sticked & 2) {
      _gp.l = dwidth - _a.gpMinW;
      if (pos) pos.l = _gp.l;
    }
  } else {
    if (!vk.rtl && hasClass(_gp, 'reverse')) {
      removeClass(_gp, 'reverse');
      delete _gp.rev;
      ls.remove('audio_rev');
    }
  }
  if (!vk.rtl != !_gp.rev && window.gpExpanded)  _gp.l -= _a.gpMaxW - _a.gpMinW ;
  if (_gp.t + _gp.h > dheight || sticked && sticked & 1) {
    _gp.t = dheight - _gp.h;
    if (pos) pos.t = _gp.t;
  }
  _gp.w = (window.gpExpanded) ? _a.gpMaxW : _a.gpMinW;
  _gp.h = 36;
  setStyle(_gb, { width: _gp.w + 'px' });
  setStyle(_gp, {
    top: _gp.t + 'px',
    left: _gp.l + 'px',
    width: _gp.w + 'px'
  });
}

function expandGlobalPlayer(open) {
  var _gp = ge('gp'), _gb = ge('gp_back'), _a = window.audioPlayer;
  if (!_gp || !_gb) return;
  var _w = _a.gpMaxW;
  if (open) {
    if (window.gp_timer) {
      clearTimeout(gp_timer);
      window.gp_timer = null;
      return;
    }
    window.gpExpanded = true;
    hide('gp_small');
    show('gp_large');
    if (_a && _a.player) {
      _a.player.callPlayProgress();
    }
    var el = geByClass1('title_wrap', ge('gp_large'));
    if (el) {
      setStyle(el, {width: '330px'});
    }
    var l = _gp.l, w = getSize(_gp)[0];
    if (!vk.rtl != !_gp.rev) _gp.l += w-_w;
    _gp.w = _w
    setStyle(_gp, {
      width: _gp.w+'px',
      left: _gp.l+'px'
    });
    setStyle(_gb, {width: _gp.w+'px'});
  } else {
    if (!window.gp_timer && !_a.clickPos) {
      var h = function(){
        var pos = _a.pos;
        var pb = ge('page_body'), pbxy = getXY(pb), pbsz = getSize(pb);
        var pl = ge('page_layout'), plxy = getXY(pl), plsz = getSize(pl);
        _gp.l = pos ? pos.l : (vk.rtl ? pbxy[0] + pbsz[0] - 2 : plxy[0] - 7);
        _gp.w = _a.gpMinW;
        setStyle(_gp, {
          left: _gp.l + 'px',
          width: _gp.w + 'px'
        });
        setStyle(_gb, {width: _gp.w + 'px'});
        hide('gp_large');
        show('gp_small');
        window.gpExpanded = null;
        window.gp_timer = null;
      }
      window.gp_timer = setTimeout(h, 800);
    }
  }
}

function toggleGlobalPlayer(open) {
  var _gp = ge('gp'), _gb = ge('gp_back'), _a = window.audioPlayer;
  if (!_gp) return;
  if (open) {
    setStyle(_gb, {opacity: 0});
    show(_gp);
    updGlobalPlayer();
    animate(_gb, {opacity: 0.7}, 200);
  } else {
    updGlobalPlayer();
    animate(_gb, {opacity: 0}, 200, function() {hide(_gp);});
  }
}

function onBodyResize(force) {
  var w = window, de = document.documentElement;
  if (!w.pageNode) return;

  var dwidth = Math.max(intval(w.innerWidth), intval(de.clientWidth));
  var dheight = Math.max(intval(w.innerHeight), intval(de.clientHeight));
  var sbw = sbWidth(), changed = false;

  if (browser.mobile) {
    dwidth = Math.max(dwidth, intval(bodyNode.scrollWidth));
    dheight = Math.max(dheight, intval(bodyNode.scrollHeight));
  } else if (browser.msie7) {
    if (htmlNode.scrollHeight > htmlNode.offsetHeight && !layers.visible) {
      dwidth += sbw + 1;
    }
  } else if (browser.msie8) {
    if (htmlNode.scrollHeight + 3 > htmlNode.offsetHeight && !layers.visible) {
      dwidth += sbw + 1;
    }
  }
  if (w.lastWindowWidth != dwidth || force === true) {
    changed = true;
    w.lastInnerWidth = w.lastWindowWidth = dwidth;
    layerWrap.style.width = boxLayerWrap.style.width = dwidth + 'px';
    var layerWidth = layer.style.width = boxLayer.style.width = (dwidth - sbw - 2) + 'px';
    if (window.mvLayerWrap && !mvcur.minimized) {
      mvLayerWrap.style.width = dwidth + 'px';
      mvLayer.style.width = layerWidth;
    }

    if (bodyNode.offsetWidth < vk.width + sbw + 2) {
      dwidth = vk.width + sbw + 2;
    }
    if (dwidth) {
      for (var el = pageNode.firstChild; el; el = el.nextSibling) {
        if (!el.tagName) continue;
        for (var e = el.firstChild; e; e = e.nextSibling) {
          if (e.className == 'scroll_fix') {
            e.style.width = ((w.lastInnerWidth = (dwidth - sbw * (browser.msie7 ? 2 : 1) - 1)) - 1) + 'px';
          }
        }
      }
    }
  }
  if (w.lastWindowHeight != dheight || force === true) {
    changed = true;
    w.lastWindowHeight = dheight;
    layerBG.style.height = boxLayerBG.style.height =
    layerWrap.style.height = boxLayerWrap.style.height = dheight + 'px';
    if (window.mvLayerWrap && !mvcur.minimized) {
      mvLayerWrap.style.height = dheight + 'px';
    }
    if (browser.mozilla && layers.visible) {
      pageNode.style.height = (_oldScroll + dheight) + 'px';
    } else if (browser.msie6) {
      pageNode.style.height = dheight + 'px';
    }
  }
  updSideTopLink(1);
  if (changed && w.curRBox && w.curRBox.boxes && window.getWndInner) {
    var wndInner = getWndInner();
    each (curRBox.boxes, function () {this._wnd_resize(wndInner[0], wndInner[1])});
  }
  setTimeout(updSeenAdsInfo, 0);
  updGlobalPlayer();
}

function onBodyScroll() {
  if (!window.pageNode) return;

  updSideTopLink();
}

function onDocumentClick(e) {
  __activeTab = true;
  if (checkEvent(e)) {
    debugLog('doc click check event');
    return true;
  }
  if (cur.onMouseClick && cur.onMouseClick(e)) return;
  if (!(e = (window.event || e.originalEvent || e))) {
    debugLog('doc click no event');
    return true;
  }
  var sel = trim((
    window.getSelection && window.getSelection() ||
    document.getSelection && document.getSelection() ||
    document.selection && document.selection.createRange().text || ''
  ).toString());
  if (sel) {
    debugLog('doc click selection');
    return true;
  }

  var i = 4, target = e.target || e.srcElement, href, path;
  while (target && target != bodyNode && target.tagName != 'A' && i--) {
    target = target.parentNode;
  }
  if (!target || target.tagName != 'A' || target.onclick || target.onmousedown || target.getAttribute('target')) {
    debugLog('doc click bad target', target, target && target.onclick);
    return true;
  }
  href = target.href;
  if (!href.indexOf(location.protocol)) {
    href = href.replace(location.protocol + '//', '');
  }
  if (!href.indexOf(location.hostname)) {
    href = href.replace(location.hostname, '');
  }
  if (href.match(/#$/) || !(path = href.match(/^\/(.+?)(\?|#|$)/))) {
    debugLog('doc click wrong href: ' + href)
    return true;
  }
  path = path[1];
  if (path.indexOf('.php') > 0 || path.match(/^(doc\-?\d+_\d+|graffiti\d+|reg\d+|adregister|ads?bonus|images|js|css)/)) {
    debugLog('doc click wrong path: ' + path)
    return true;
  }
  try {
    nav.go(href);
    debugLog('doc click ok');
    return cancelEvent(e);
  } catch (e) {
    debugLog('doc click ex:', e);
    return true;
  }
}

function onCtrlEnter(ev, handler) {
  ev = ev || window.event;
  if (ev.keyCode == 10 || ev.keyCode == 13 && (ev.ctrlKey || ev.metaKey && browser.mac)) {
    handler();
    cancelEvent(ev);
  }
}

function setFavIcon(href, force) {
  if (!window.icoNode) return;
  if (icoNode.href == href && !force) return;
  var ico = ce('link', {rel: 'shortcut icon', type: 'image/gif', href: href});
  headNode.replaceChild(ico, icoNode);
  icoNode = ico;
}

(function() {
var step = 1, timer, to, func = false;
if (browser.mozilla) {
  func = function() {
    setFavIcon('/images/icons/prgicon.gif');
  }
} else if (browser.chrome || browser.opera && !browser.opera_mobile) {
  func = function() {
    step = step % 4 + 1;
    setFavIcon('/images/icons/prgicon' +  step + '.gif');
    timer = setTimeout(arguments.callee, 250);
  }
}
window.showTitleProgress = function(timeout) {
  if (browser.mozilla || browser.chrome) return;
  if (timeout > 0) {
    to = setTimeout(showTitleProgress.pbind(false), timeout);
    return;
  }
  if (timer) {
    return;
  }
  if (document.body) {
    document.body.style.cursor = 'progress';
  }
  if (func) func();
}
window.hideTitleProgress = function() {
  if (browser.mozilla || browser.chrome) return;
  clearTimeout(to);
  document.body.style.cursor = 'default';
  if (timer) {
    clearTimeout(timer);
    timer = false;
  }
  if (browser.mozilla || browser.chrome || browser.opera && !browser.opera_mobile) {
    setFavIcon('/images/favicon' + (vk.intnat ? 'vnew' : 'new') + '.ico');
  }
}
})();

function _stlClick(e) {
  e = e || window.event;
  return checkEvent(e) || cancelEvent(e);
}
function _stlMousedown(e) {
  e = e || window.event;
  if (checkEvent(e)) {
    return;
  }
  if (!__afterFocus) {
    var y = _stlSaved;
    _stlSaved = y ? 0 : scrollGetY();
    _stlText.className = (y || !_stlSaved) ? '' : 'down';
    scrollToY(y, 0);
  }
  return cancelEvent(e);
}

vk.width = 791;
function domStarted() {
  window.headNode = geByTag1('head');
  extend(window, {
    icoNode:  geByTag1('link', headNode),
    bodyNode: geByTag1('body'),
    htmlNode: geByTag1('html'),
    utilsNode: ge('utils'),
    _tbLink: {}
  });
  if (!utilsNode) return;

  if (browser.mozilla) {
    addClass(bodyNode, 'firefox');
  } else if (browser.msie6) {
    addClass(bodyNode, 'nofixed');
  }

  for (var i in StaticFiles) {
    var f = StaticFiles[i];
    f.l = 1;
    if (f.t == 'css') {
      utilsNode.appendChild(ce('div', {id: f.n}));
    }
  }

  var l = ge('layer_bg'), lw = l.nextSibling, bl = ge('box_layer_bg'), blw = bl.nextSibling;
  extend(window, {
    layerBG: l,
    boxLayerBG: bl,
    layerWrap: lw,
    layer: lw.firstChild,
    boxLayerWrap: blw,
    boxLayer: blw.firstChild,
    boxLoader: blw.firstChild.firstChild,
    _stlSide: ge('stl_side'),
    _stlLeft: ge('stl_left'),
    _stlSaved: 0,
    __activeTab: false,
    __afterFocus: false,
    __needBlur: false,
    __blurTime: false,
    __blurTimer: false
  });
  if (!browser.mobile) {
    var s = {
      className: 'fixed',
      onclick: _stlClick,
      onmousedown: _stlMousedown,
      onmouseover: addClass.pbind(_stlLeft, 'over'),
      onmouseout: removeClass.pbind(_stlLeft, 'over')
    };
    _stlLeft.innerHTML = '<nobr id="stl_text">' + getLang('global_to_top') + '</nobr>';
    extend(_stlLeft, s);
    extend(_stlSide, s);
    window._stlText = _stlLeft.firstChild;
    addEvent(window, 'blur', function(e) {
      __needBlur = __activeTab = false;
      __blurTime = vkNow();
    });
    addEvent(window, 'focus', function(e) {
      if (__needBlur) return; // opera fix
      __afterFocus = __needBlur = __activeTab = true;
      if (__blurTime && vkNow() - __blurTime > (vk.adupd || 1800000)) {
        __blurTime = false;
        __blurTimer = setTimeout(function() {
          __adsLoaded = 0;
          updAds(false);
        }, 10);
      }
      setTimeout(function() {
        __afterFocus = false;
      }, 10);
    });
    addEvent(document, 'mousedown', function(e) {
      if (!__afterFocus) return;
      for (var el = e.target; el && el.tagName != 'A'; ) el = el.parentNode;
      if (!el) return;
      clearTimeout(__blurTimer);
    });
  }

  addEvent(boxLayerWrap, 'click', __bq.hideLastCheck);

  extend(layers, {
    show: layers._show.pbind(l, lw),
    boxshow: layers._show.pbind(bl, blw),
    wrapshow: layers._show.pbind(l),
    hide: layers._hide.pbind(l, lw),
    boxhide: layers._hide.pbind(bl, blw),
    wraphide: layers._hide.pbind(l)
  });

  hab.init();
}

vk.started = vkNow();
function domReady() {
  if (!utilsNode) return;

  extend(window, {
    pageNode: ge('page_wrap'),
    _tbLink: ge('top_back_link')
  });
  window.scrollNode = browser.msie6 ? pageNode : ((browser.chrome || browser.safari) ? bodyNode : htmlNode);

  if (vk.al == 1) {
    showTitleProgress();
  }

  var dt = Math.max(vkNow() - vk.started, 10), speed = intval((vk.contlen || 1) / dt * 1000);
  if (browser.mozilla && browser.version >= 4) {
    speed /= 2.5;
  } else if (browser.mozilla) {
    speed *= 1.5;
  } else if (browser.msie && browser.version >= 7) {
    speed /= 1.5;
  } else if (browser.msie) {
    speed *= 2.5;
  }
  __stm.lowlimit = intval(Math.max(2000000 / speed, 1) * 150);
  __stm.highlimit = __stm.lowlimit * 6;
  __stm.lowlimit = Math.min(__stm.lowlimit, 600);

  onBodyResize();

  var scrolledNode = browser.msie6 ? pageNode : window;
  addEvent(scrolledNode, 'scroll', onBodyScroll);

  var dl = ge('debuglog');
  if (dl && !window._debugLogHist[window._debugLogHistOffset]) {
    window._debugLogHist[window._debugLogHistOffset] = dl.innerHTML;
  }
}
function onDomReady(f) {
  f();
}

// Ajax
function serializeForm(form) {
  if (typeof(form) != 'object') {
    return false;
  }
  var result = {};
  var g = function(n) {
    return geByTag(n, form);
  };
  var nv = function(i, e){
    if (!e.name) return;
    if (e.type == 'text' || !e.type) {
      result[e.name] = val(e);
    } else {
      result[e.name] = (browser.msie && !e.value && form[e.name]) ? form[e.name].value : e.value;
    }
  };
  each(g('input'), function(i, e) {
    if ((e.type != 'radio' && e.type != 'checkbox') || e.checked) return nv(i, e);
  });
  each(g('select'), nv);
  each(g('textarea'), nv);

  return result;
}

function ajx2q(qa) {
  var query = [], enc = function (str) {
    try {
      return encodeURIComponent(str);
    } catch (e) { return str;}
  };

  for (var key in qa) {
    if (qa[key] == null || isFunction(qa[key])) continue;
    if (isArray(qa[key])) {
      for (var i = 0, c = 0, l = qa[key].length; i < l; ++i) {
        if (qa[key][i] == null || isFunction(qa[key][i])) {
          continue;
        }
        query.push(enc(key) + '[' + c + ']=' + enc(qa[key][i]));
        ++c;
      }
    } else {
      query.push(enc(key) + '=' + enc(qa[key]));
    }
  }
  query.sort();
  return query.join('&');
}
function q2ajx(qa) {
  if (!qa) return {};
  var query = {}, dec = function (str) {
    try {
      return decodeURIComponent(str);
    } catch (e) { return str;}
  };
  qa = qa.split('&');
  each(qa, function(i, a) {
    var t = a.split('=');
    if (t[0]) {
      var v = dec(t[1] + '');
      if (t[0].substr(t.length - 2) == '[]') {
        var k = dec(t[0].substr(0, t.length - 2));
        if (!query[k]) {
          query[k] = [];
        }
        query[k].push(v);
      } else {
        query[dec(t[0])] = v;
      }
    }
  });
  return query;
}

var stManager = {
  _waiters: [],
  _wait: function() {
    var l = __stm._waiters.length, checked = {}, handlers = [];
    if (!l) {
      clearInterval(__stm._waitTimer);
      __stm._waitTimer = false;
      return;
    }
    for (var j = 0; j < l; ++j) {
      var wait = __stm._waiters[j][0];
      for (var i = 0, ln = wait.length; i < ln; ++i) {
        var f = wait[i];
        if (!checked[f]) {
          if (!StaticFiles[f].l && StaticFiles[f].t == 'css' && getStyle(StaticFiles[f].n, 'display') == 'none') {
            __stm.done(f);
          }
          if (StaticFiles[f].l) {
            checked[f] = 1;
          } else {
            checked[f] = -1;
            if (vk.loaded) {
              var c = ++StaticFiles[f].c;
              if (c > __stm.lowlimit && stVersions[f] > 0 || c > __stm.highlimit) {
                if (stVersions[f] < 0) {
                  topError('<b>Error:</b> Could not load <b>' + f + '</b>.', {dt: 5, type: 1, msg: 'Failed to load with ' + __stm.lowlimit + '/' + __stm.highlimit + ' limits (' + ((vkNow() - vk.started) / 100) + ' ticks passed)', file: f});
                  StaticFiles[f].l = 1;
                  checked[f] = 1;
                } else {
                  topMsg('Some problems with loading <b>' + f + '</b>...', 5);
                  stVersions[f] = irand(-10000, -1);
                  __stm._add(f, StaticFiles[f]);
                }
              }
            }
          }
        }
        if (checked[f] > 0) {
          wait.splice(i, 1);
          --i; --ln;
        }
      }
      if (!wait.length) {
        handlers.push(__stm._waiters.splice(j, 1)[0][1]);
        --j; --l;
      }
    }
    for (var j = 0, l = handlers.length; j < l; ++j) {
      handlers[j]();
    }
  },

  _add: function(f, old) {
    var name = f.replace(/[\/\.]/g, '_');
    if (old && old.l && old.t == 'css') {
      var elem = ce('style', {
        type: 'text/css',
        media: 'screen'
      });
      headNode.appendChild(elem);
      var text = '#' + name + ' { display: block; }';
      if (elem.sheet) {
        elem.sheet.insertRule(text, 0);
      } else if (elem.styleSheet) {
        elem.styleSheet.cssText = text;
      }
    }
    StaticFiles[f] = {v: stVersions[f], n: name, l: 0, c: 0};
    var f_full = f + '?' + stVersions[f];
    if (f.indexOf('.js') != -1) {
      var p = '/js/';
      if (stTypes.fromLib[f]) {
        p += 'lib/';
      } else if (!/^lang\d/i.test(f) && !stTypes.fromRoot[f]) {
        p += 'al/';
      }
      headNode.appendChild(ce('script', {
        type: 'text/javascript',
        src: p + f_full
      }));

      StaticFiles[f].t = 'js';
    } else if (f.indexOf('.css') != -1) {
      var p = '/css/' + (stTypes.fromRoot[f] ? '' : 'al/');
      headNode.appendChild(ce('link', {
        type: 'text/css',
        rel: 'stylesheet',
        href: p + f_full
      }));

      StaticFiles[f].t = 'css';

      if (!ge(name)) {
        utilsNode.appendChild(ce('div', {id: name}));
      }
    }
  },

  add: function(files, callback) {
    var wait = [], de = document.documentElement;
    if (!isArray(files)) files = [files];
    for (var i in files) {
      var f = files[i];
      if (f.indexOf('?') != -1) {
        f = f.split('?')[0];
      }
//p//      if (/^lang\d/i.test(f)) {
//p//        stVersions[f] = stVersions['lang'];
//p//      } else if (!stVersions[f]) {
//p//        stVersions[f] = 1;
//p//      }
// Opera Speed Dial fix
      var opSpeed = browser.opera && de.clientHeight == 768 && de.clientWidth == 1024;
      if ((opSpeed || __debugMode) && !(browser.iphone || browser.ipad) && f != 'common.js' && f != 'common.css' && stVersions[f] > 0 && stVersions[f] < 1000000000) stVersions[f] += irand(1000000000, 2000000000);
      var old = StaticFiles[f];
//p//      if (!old || old.v != stVersions[f]) {
//p//        __stm._add(f, old);
//p//      }
      if (callback && !StaticFiles[f].l) {
        wait.push(f);
      }
    }
    if (!callback) return;
    if (!wait.length) {
      return callback();
    }
    __stm._waiters.push([wait, callback]);
    if (!__stm._waitTimer) {
      __stm._waitTimer = setInterval(__stm._wait, 100);
    }
  },
  done: function(f) {
    if (stVersions[f] < 0) {
      topMsg('<b>Warning:</b> Something is bad, please <b><a href="/techsupp.php?fid=1&act=t&tid=497998">clear your cache</a></b> and restart your browser.', 10);
    }
    StaticFiles[f].l = 1;
  }
}, __stm = stManager;

function requestBox(box, onDone, onFail) {
  box.setOptions({onHide: onFail});
  box.onDone = function() {
    box.setOptions({onHide: false});
    onDone();
  }
  return box;
}
function activateMobileBox(opts) {
  return requestBox(showBox('activation.php', {
    act: 'activate_mobile_box',
    hash: opts.hash
  }), function() {
    vk.nophone = 0;
    opts.onDone();
  }, opts.onFail);
}

var ajaxCache = {};
var globalAjaxCache = {};
var ajax = {
  _init: function() {
    var r = false;
    try {
      if (r = new XMLHttpRequest()) {
        ajax._req = function() { return new XMLHttpRequest(); }
        return;
      }
    } catch(e) {}
    each(['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], function() {
      try {
        var t = '' + this;
        if (r = new ActiveXObject(t)) {
          (function(n) {
            ajax._req = function() { return new ActiveXObject(n); }
          })(t);
          return false;
        }
      } catch(e) {}
    });
    if (!ajax._req) {
      location.replace('/badbrowser.php');
    }
  },
  _getreq: function() {
    if (!ajax._req) ajax._init();
    return ajax._req();
  },
  _frameover: function() {
    var node = iframeTransport.parentNode;
    node.innerHTML = '';
    utilsNode.removeChild(node);
    iframeTransport = false;
    if (cur.onFrameBlocksDone) {
      cur.onFrameBlocksDone();
    }
  },
  _receive: function(cont, html, js) {
    var c = cont && ge(cont);
    if (c && html) {
      var h = ce('div', {innerHTML: html});
      while (h.firstChild) {
        c.appendChild(h.firstChild);
      }
    }
    if (js) {
      var scr = '(function(){' + js + ';})()';
      if (__debugMode) {
        eval(scr);
      } else try {
        eval(scr);
      } catch (e) {
        topError(e, {dt: 15, type: 8, url: ajax._frameurl, js: js, answer: Array.prototype.slice.call(arguments).join('<!>')});
      }
    }
  },
  framedata: false,
  framegot: function(c, h, j) {
    if (ajax.framedata === false) {
      setTimeout(ajax._receive.pbind(c, h, j), 0);
    } else {
      ajax.framedata.push([c, h, j]);
    }
  },
  framepost: function(url, query, done) {
    if (window.iframeTransport) {
      ajax._frameover();
    }
    window.iframeTransport = utilsNode.appendChild(ce('div', {innerHTML: '<iframe></iframe>'})).firstChild;
    ajax._framedone = done;
    ajax.framedata = [];
    url += '?' + ((typeof(query) != 'string') ? ajx2q(query) : query);
    url += (url.charAt(url.length - 1) != '?' ? '&' : '') + '_rndVer=' + irand(0, 99999);
    ajax._frameurl = iframeTransport.src = url;
  },
  plainpost: function(url, query, done, fail, urlonly) {

//      alert('plainpost function parameters: \n - url: ' + url +
//                                           '\n - query: ' + query +
//                                           //'\n - done: ' + done +
//                                           //'\n - fail: ' + fail +
//                                           '\n - urlonly: ' + urlonly);

    var r = ajax._getreq();
    var q = (typeof(query) != 'string') ? ajx2q(query) : query;
      alert(q);
    r.onreadystatechange = function() {
      if (r.readyState == 4) {
        if (r.status >= 200 && r.status < 300) {
            alert('done');
          if (done) done(r.responseText, r);
        } else if (r.status) {
            alert('fail');
          if (fail) fail(r.responseText, r);
        }
      }
    }
    try {
      r.open('POST', url, true);
    } catch(e) {
      return false;
    }
    if (!urlonly) {
      r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      r.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    r.send(q);
    return r;
  },
  post: function(url, query, options) {
    //if (url.substr(0, 1) != '/') url = '/' + url;
    alert(url);
    var o = extend({_captcha: false, _box: false}, options || {}), q = extend({al: o.frame ? -1 : 1}, query);
    if (o.progress) {
      if (!o.showProgress) {
        o.showProgress = show.pbind(o.progress);
      }
      if (!o.hideProgress) {
        o.hideProgress = hide.pbind(o.progress);
      }
    }
    return ajax._post(url, q, o);
  },
  preload: function(url, query, data) {
    if (url.substr(0, 1) != '/') url = '/' + url;
    ajaxCache[url + '#' + ajx2q(query)] = data;
  },
  _debugLog: function(text) {
     window._updateDebug = function() {
       var dlw = ge('debuglogwrap');
       if (dlw) {
         dlw.innerHTML = text;
         window._debugLogHist[window._debugLogHistOffset] += ge('debuglog').innerHTML;
         if (window._debugLogHistShow) {
           ge('debuglog').innerHTML = window._debugLogHist.join('');
           var lnk = ge('debugloghistlnk');
           if (lnk) { lnk.innerHTML = 'Show last'; }
         }
         window._updateDebug = false;
       }
     }
  },
  _parseRes: function(answer) {
    window._updateDebug = false;
    for (var i = 0, l = answer.length; i < l; ++i) {
      var ans = answer[i];
      if (ans.substr(0, 2) == '<!') {
        var from = ans.indexOf('>');
        var type = ans.substr(2, from - 2);
        ans = ans.substr(from + 1);
        switch (type) {
        case 'json' : answer[i] = eval('(' + ans + ')'); break;
        case 'int'  : answer[i] = intval(ans); break;
        case 'float': answer[i] = floatval(ans); break;
        case 'bool' : answer[i] = intval(ans) ? true : false; break;
        case 'null' : answer[i] = null; break;
        case 'debug':
          ajax._debugLog(ans);
          answer.pop(); // <!debug> must be last one
          l--;
        break;
        }
      }
    }
  },
  _post: function(url, q, o) {
    if (!q.captcha_sid && o.showProgress) o.showProgress();
    var cacheKey = false;
    updAds(false);
    if (__adsCanUpd && (o.ads && vk.id || (vkNow() - __adsLoaded > (vk.adupd || 1800000)))) {
      __adsLoaded = vkNow();
      q.al_ad = 1;
    }
    if (o.cache) {
      var boldq = clone(q);
      delete boldq.al;
      delete boldq.al_ad;
      delete boldq.captcha_sid;
      delete boldq.captcha_key;
      cacheKey = url + '#' + ajx2q(boldq);
    }
    var hideBoxes = function() {
      for (var i = 0, l = arguments.length; i < l; ++i) {
        var box = arguments[i];
        if (box && box.isVisible()) {
          box.setOptions({onHide: false});
          box.hide();
        }
      }
      return false;
    }
    var fail = function(text, r) {
      if (o.hideProgress) o.hideProgress();
      if (o._suggest) cleanElems(o._suggest);
      o._suggest = o._captcha = o._box = hideBoxes(o._box, o._captcha);
      if (text.indexOf('The page is temporarily unavailable') != -1 && vk.id == 66748) {
        ajax._post(url, q, o);
        return false;
      }
      if (!o.onFail || o.onFail(text) !== true) {
        topError(text, {dt: 5, type: 3, status: r.status, url: url, query: q && ajx2q(q)});
      }
    }
    if (o.stat) {
      var statAct = false;
      stManager.add(o.stat, function() {
        if (statAct) {
          statAct();
        }
        o.stat = false;
      });
    }
    // Process response function
    var processResponse = function(code, answer) {
      if (o.cache) {
        var answ = ajaxCache[cacheKey];
        if (answ && answ._loading) {
          setTimeout(function() {
            for (var i in answ._callbacks) {
              answ._callbacks[i](code, answer);
            }
          }, 0);
          delete ajaxCache[cacheKey];
        }
      }
      if (o.stat) {
        o.stat = false;
        statAct = processResponse.pbind(code, answer);
        return false;
      }
      if (o.cache && !o.forceGlobalCache) {
        if (!code) {
          ajaxCache[cacheKey] = answer;
        }
      }

      // Parse response
      if (o.hideProgress) o.hideProgress();
      o._box = hideBoxes(o._box);
      if (o._captcha && code != 2) {
        if (o._suggest) cleanElems(o._suggest);
        o._suggest = o._captcha = hideBoxes(o._captcha);
      }
      switch (code) {
      case 1: // email not confirmed
        if (ge('confirm_mail')) {
          showFastBox({
            width: 430,
            title: ge('confirm_mail_title').value,
            onHide: o.onFail
          }, '<div class="confirm_mail">' + ge('confirm_mail').innerHTML + '</div>');
        } else {
          topMsg('<b>Error!</b> Email is not confirmed!');
        }
        break;
      case 2: // captcha
        var resend = function(sid, key) {
          var nq = extend(q, {captcha_sid: sid, captcha_key: key});
          var no = o.cache ? extend(o, {cache: -1}) : o;
          ajax._post(url, nq, no);
        }
        var addText = '';
        if (vk.nophone == 1 && !vk.nomail) {
          addText = getLang('global_try_to_activate').replace('{link}', '<a class="phone_validation_link">').replace('{/link}', '</a>');
          addText = '<div class="phone_validation_suggest">' + addText + '</div>';
        }
        o._captcha = showCaptchaBox(answer[0], intval(answer[1]), o._captcha, {
          onSubmit: resend,
          addText: addText,
          onHide: function() {
            if (o.onFail) o.onFail();
          }
        });
        o._suggest = geByClass1('phone_validation_link', o._captcha.bodyNode);
        if (o._suggest) {
          addEvent(o._suggest, 'click', function() {
            o._box = activateMobileBox({onDone: o._captcha.submit});
          });
        }
        break;
      case 3: // auth failed
        var no = o.cache ? extend(o, {cache: -1}) : o;
        window.onReLoginDone = ajax._post.pbind(url, q, no);
        window.onReLoginFailed = function(toRoot) {
          if (toRoot) {
            nav.go('/');
          } else {
            window.onReLoginDone();
          }
        }
        var iframe = ce('iframe', {src: vk.loginscheme + '://login.vk.com/?al_frame=1&from_host=' + locHost + '&ip_h=' + vk.ip_h}), t = 0;
        utilsNode.appendChild(iframe);
        break;
      case 4: // redirect
        if (answer[1]) { // ajax layout redirect
          nav.go(answer[0], false, {noback: (answer[1] === true) ? true : false, showProgress: o.showProgress, hideProgress: o.hideProgress});
        } else {
          hab.stop();
          location.href = answer[0];
        }
        break;
      case 5: // reload
        nav.reload({force: intval(answer[0])}); // force reload
        break;
      case 6: // mobile activation needed
        var no = o.cache ? extend(o, {cache: -1}) : o;
        o._box = activateMobileBox({onDone: ajax._post.pbind(url, q, no), onFail: o.onFail, hash: answer[0]});
        break;
      case 7: // message
        if (o.onFail) o.onFail();
        topMsg(answer[0], 10);
        break;
      case 8: // error
        if (o.onFail) {
          if (o.onFail(answer[0])) {
            return;
          }
        }
        topError(answer[0], {dt: answer[1] ? 0 : 10, type: 4, url: url, query: q && ajx2q(q)});
        break;
      case 9: // votes payment
        o._box = showFastBox(answer[0], answer[1]);
        var no = extend(clone(o), {showProgress: o._box.showProgress, hideProgress: o._box.hideProgress});
        if (o.cache) {
          no.cache = -1;
        }
        o._box = requestBox(o._box, function() {
          if (isVisible(o._box.progress)) return;
          ajax._post(url, extend(q, {_votes_ok: 1}), no);
        }, o.onFail);
        o._box.evalBox(answer[2]);
        break;
      case 10: //zero zone
        o._box = showFastBox({
          title: answer[0] || getLang('global_charged_zone_title'),
          onHide: o.onFail
        }, answer[1], getLang('global_charged_zone_continue'), function() {
          var nq = extend(q, {charged_confirm: answer[3]});
          ajax._post(url, nq, o);
        }, getLang('global_cancel'));
        break;
      default:
        if (code == -1) {
          __adsSet(answer.pop());
        }
        if (o.onDone) { // page, box or other
          o.onDone.apply(window, answer);
        }
        break;
      }
      if (window._updateDebug) _updateDebug();
    }
    var done = function(text, data) { // data - for iframe transport post
      text = text.replace(/^<!--/, '').replace(/->->/g, '-->');
      if (!trim(text).length) {
        data = [8, getLang('global_unknown_error')];
        text = stVersions['nav'] + '<!><!>' + vk.lang + '<!>' + stVersions['lang'] + '<!>8<!>' + data[1];
      }
      var answer = text.split('<!>');

      var navVersion = intval(answer.shift());
      if (!navVersion) {
        return fail(text, {status: -1});
      }

      // First strict check for index.php reloading, in vk.al == 1 mode.
      if (vk.version && vk.version != navVersion) {
        if (navVersion && answer.length > 4) {
          nav.reload({force: true});
        } else {
          if (nav.strLoc) {
            location.replace(locBase);
          } else {
            topError('Server error.', {type: 100});
          }
        }
        return;
      }
      vk.version = false;

      // Common response fields
      var newStatic = answer.shift();
      var langId = intval(answer.shift());
      var langVer = intval(answer.shift());

      if (o.frame) answer = data;

      var code = intval(answer.shift());
      if (vk.lang != langId && o.canReload) { // Lang changed
        nav.reload({force: true});
        return;
      }

      // Wait for attached static files
      var waitResponseStatic = function() {
        var st = ['common.css'];
        if (browser.msie6) {
          st.push('ie6.css');
        } else if (browser.msie7) {
          st.push('ie7.css');
        }
        if (newStatic) {
          newStatic = newStatic.split(',');
          for (var i = 0, l = newStatic.length; i < l; ++i) {
            st.push(newStatic[i]);
          }
        }
        if (stVersions['lang'] < langVer) {
          stVersions['lang'] = langVer;
          for (var i in StaticFiles) {
            if (/^lang\d/i.test(i)) {
              st.push(i);
            }
          }
        }

        if (!o.frame) {
          try {
            ajax._parseRes(answer);
          } catch(e) {
            topError('<b>JSON Error:</b> ' + e.message, {type: 5, answer: answer.join('<!>'), url: url, query: q && ajx2q(q)});
          }
        }
        stManager.add(st, processResponse.pbind(code, answer));
      };

      // Static managing function
      if (navVersion <= stVersions['nav']) {
        return waitResponseStatic();
      }
      headNode.appendChild(ce('script', {
        type: 'text/javascript',
        src: '/al_loader.php?act=nav&v=' + navVersion
      }));
      setTimeout(function() {
        if (navVersion <= stVersions['nav']) {
          return waitResponseStatic();
        }
        setTimeout(arguments.callee, 100);
      }, 0);
    }
    if (o.cache > 0 || o.forceGlobalCache) {
      var answer = ajaxCache[cacheKey];
      if (answer && answer._loading) {
        answer._callbacks.push(processResponse);
        return;
      } else {
        if (answer && !o.forceGlobalCache) {
          processResponse(0, answer);
          if (o.cache === 3) delete ajaxCache[cacheKey];
          return;
        } else if (answer = globalAjaxCache[cacheKey]) {
          if (answer == -1 || isFunction(answer)) {
            globalAjaxCache[cacheKey] = o.onDone;
          } else {
            o.onDone.apply(window, answer);
          }
          if (o.hideProgress) o.hideProgress();
          return;
        }
      }

    }
    ajaxCache[cacheKey] = {_loading: 1, _callbacks: []};
    debugLogHist(url + (q ? ': ' + ajx2q(q).split('&').join('&amp;') : ''));
      alert(o.frame);
    return ajax.plainpost(url, q, done, fail);
  }
}

function HistoryAndBookmarks(params) {
  // strict check for cool hash display in ff.
  var fixEncode = function(loc) {
    var h = loc.split('#');
    var l = h[0].split('?');
    return l[0] + (l[1] ? ('?' + ajx2q(q2ajx(l[1]))) : '') + (h[1] ? ('#' + h[1]) : '');
  }

  var frame = null, withFrame = browser.msie6 || browser.msie7;
  var frameDoc = function() {
    return frame.contentDocument || (frame.contentWindow ? frame.contentWindow.document : frame.document);
  }

  var options = extend({onLocChange: function() {}}, params);

  var getLoc = function(skipFrame) {
    var loc = '';
    if (vk.al == 3) {
      loc = (location.pathname || '') + (location.search || '') + (location.hash || '');
    } else {
      if (withFrame && !skipFrame) {
        try {
          loc = frameDoc().getElementById('loc').innerHTML.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>').replace(/&quot;/ig, '"').replace(/&amp;/ig, '&');
        } catch(e) {
          loc = curLoc;
        }
      } else {
        loc = (location.toString().match(/#(.*)/) || {})[1] || '';
        if (loc.substr(0, 1) != vk.navPrefix) {
          loc = (location.pathname || '') + (location.search || '') + (location.hash || '');
        }
      }
    }
    if (!loc && vk.al > 1) {
      loc = (location.pathname || '') + (location.search || '');
    }
    return fixEncode(loc.replace(/^(\/|!)/, ''));
  }

  var curLoc = getLoc(true);

  var setFrameContent = function(loc) {
    try {
      var d = frameDoc();
      d.open();

      d.write('<script type="text/javascript">var u=navigator.userAgent,d=location.host.toString().match(/[a-zA-Z]+\\.[a-zA-Z]+$/)[0];if(/opera/i.test(u)||!/msie 6/i.test(u)||document.domain!=d)document.domain=d;</script>' +
        '<div id="loc">' +
          loc.replace('&', '&amp;').replace('"', '&quot;').replace('>', '&gt;').replace('<', '&lt;') +
        '</div>'
      );

      d.close();
    } catch(e) {}
  }

  var setLoc = function(loc) {
    //curLoc = fixEncode(loc.replace(/#(\/|!)?/, ''));
    curLoc = fixEncode(loc);
    var l = (location.toString().match(/#(.*)/) || {})[1] || '';
    if (!l && vk.al > 1) {
      l = (location.pathname || '') + (location.search || '');
    }
    l = fixEncode(l);
    if (l.replace(/^(\/|!)/, '') != curLoc) {
      if (vk.al == 3) {
        try {
          history.pushState({}, '', '/' + curLoc);
          return;
        } catch(e) {}
      }
      window.chHashFlag = true;
      location.hash = '#' + vk.navPrefix + curLoc;
      if (withFrame && getLoc() != curLoc) {
        setFrameContent(curLoc);
      }
    }
  }

  var locChecker = function() {
    var loc = getLoc(true);
    if (loc != curLoc) {
      if (browser.msie6) {
        location.reload(true);
      } else {
        setFrameContent(loc);
      }
    }
  }

  var checker = function(force) {
    var l = getLoc();
    if (l == curLoc && force !== true) {
      return;
    }
    options.onLocChange(l);

    curLoc = l;
    if (withFrame && location.hash.replace('#' + vk.navPrefix, '') != l) {
      location.hash = '#' + vk.navPrefix + l;
    }
  }
  var checkTimer;
  var frameChecker = function() {
    try {
      if (frame.contentWindow.document.readyState != 'complete') {
        return;
      }
    } catch(e) {
      return;
    }
    checker();
  }
  var init = function() {
    if (vk.al == 1) {
      checker(true);
    }
    if (vk.al < 3) {
      if (withFrame) {
        frame = document.createElement('iframe');
        frame.id = 'hab_frame';
        frame.attachEvent('onreadystatechange', frameChecker);
        frame.src = 'al_loader.php?act=hab_frame&loc=' + encodeURIComponent(curLoc);

        utilsNode.appendChild(frame);

        checkTimer = setInterval(locChecker, 200);
      } else {
        if ('onhashchange' in window) {
          addEvent(window, 'hashchange', function() {
            if (window.chHashFlag) {
              window.chHashFlag = false;
            } else {
              checker();
            }
          });
        } else {
          checkTimer = setInterval(checker, 200);
        }
      }
    } else if (vk.al == 3) {
      addEvent(window, 'popstate', checker);
      if (browser.safari) {
        addEvent(window, 'hashchange', checker);
      }
    }
  }
  return {
    setLoc: setLoc,
    getLoc: getLoc,
    init: init,
    setOptions: function(params) {
      options = extend(options, params);
    },
    checker: checker,
    stop: function() {
      if (vk.al < 3) {
        clearInterval(checkTimer);
        if (withFrame) {
          frame.detachEvent('onreadystatechange', frameChecker);
        }
      } else if (vk.al == 3) {
        removeEvent(window, 'popstate', checker);
      }
    }
  }
}

window.hab = new HistoryAndBookmarks({onLocChange: function(loc) {
  nav.go('/' + loc, undefined, {back: true, hist: true});
}});

function checkEvent(e) {
  return (e && (e.which > 1 || e.button > 1 || e.ctrlKey || e.shiftKey || browser.mac && e.metaKey));
}

function leftBlockOver(block) {
  var timer = 'timer', over = 1;
  if (!block.id) {
    block = ge('left_hide' + block);
    over = 0;
  }
  if (over || !block.timer) {
    if (block.showing) {
      removeAttr(block, 'showing');
    } else {
      animate(block, {opacity: over ? 1 : 0.5}, 200);
      if (over) {
        block.showing = 1;
      }
    }
  }
  if (block.timer) {
    clearTimeout(block.timer);
    removeAttr(block, 'timer');
  }
}
function leftBlockOut(block) {
  var opacity = 0.5;
  if (!block.id) {
    block = ge('left_hide' + block);
    opacity = 0;
  }
  block.timer = setTimeout(function() {
    animate(block, {opacity: opacity}, 200);
    removeAttr(block, 'timer');
  }, 1);
}
function leftBlockHide(block, hash) {
  ajax.post('al_index.php', {act: 'hide_block', block: block, hash: hash}, {onDone: updSeenAdsInfo});
  hide('left_block' + block);
}
function leftAdBlockHide(blockId, url) {
  ajax.post(url, {}, {onDone: function(response) {
    if (!response.done) return;

    var box = ge('ad_box' + blockId);
    var mask = ge('ad_hide_mask' + blockId);

    if (!box || !mask) return false;

    mask.timer = setTimeout(function() {
      animate(mask, {opacity: 1}, 200);
      delete mask.timer;
    }, 0);
    var s = getSize(box), btop = 1, bbot = 1;
    if (box.style.borderTop == '0px') {
      btop = 0;
    }
    if (btop) {
      s[1] -= btop;
    }
    if (bbot) {
      s[1] -= bbot;
    }

    var textH = (mask.firstChild.nextSibling === null) ? 40 : 108;
    var padtop;
    if (s[1] < textH + 10) {
      s[1] = textH + 10;
      padtop = Math.floor((s[1] - textH) / 2);
      box.style.height = s[1] - 6 - padtop + 'px';
    }
    var padtop = Math.floor((s[1] - textH) / 2);
    setStyle(mask, {left: 4, height: s[1] - padtop + 1, paddingTop: padtop, display: 'block'});
  }});


  var hideX = ge('left_hide' + blockId);
  if (hideX && hideX.parentNode) {
    hideX.parentNode.removeChild(hideX);
  }

  return false;
}

function updateOtherCounters() {
  if (vk.zero) return;

  vkImage().src = 'http://www.tns-counter.ru/V13a***R>' + document.referrer.replace(new RegExp('\\*', 'g'), '%2a') + '*vkontakte_ru/ru/UTF-8/tmsec=' + (vk.intnat ? 'vk' : 'vkontakte') + '_total/' + Math.round(Math.random() * 1000000000);
  vkImage().src = 'http://counter.yadro.ru/hit?r' + escape(document.referrer) + (window.screen === undefined ? '' : ';s' + screen.width + '*' + screen.height + '*' + (screen.colorDepth ? screen.colorDepth : screen.pixelDepth)) + ';u' + escape(document.URL) + ';' + Math.random() + '';
}

function handlePageView(params) {
  var footer = ge('footer_wrap');
  if (vk.noleftmenu && !params.noleftmenu) {
    ge('page_body').className = footer.className = 'fl_r';
    show('side_bar');
  } else if (!vk.noleftmenu && params.noleftmenu) {
    hide('side_bar');
    ge('page_body').className = footer.className = 'simple';
    footer.style.width = 'auto';
  }
  vk.noleftmenu = params.noleftmenu;

  if (params.width != vk.width) {
    vk.width = params.width || 791;
    ge('page_layout').style.width = vk.width + 'px';
    ge('page_body').style.width = (vk.width - 160) + 'px';
    if (!vk.noleftmenu) {
      footer.style.width = (vk.width - 130) + 'px';
    }
    setTimeout(updSideTopLink.pbind(true), 0);
  }

  if (vk.notopmenu && !params.notopmenu) {
    hide('top_home_link');
    show('quick_search', 'top_links', 'qsearch_border', 'bottom_nav');
  } else if (!vk.notopmenu && params.notopmenu) {
    hide('quick_search', 'top_links', 'qsearch_border', 'bottom_nav');
    show('top_home_link');
  }
  vk.notopmenu = params.notopmenu;
}

function handlePageParams(params) {
  vk.id = params.id;
  cur._level = params.level;

  handlePageView(params);

  var confMail = ge('confirm_mail_wrap'), chPhone = ge('change_phone_wrap');
  if (confMail) {
    if (!params.nomail) {
      confMail.parentNode.removeChild(confMail);
    } else if (params.notopbars) {
      hide(confMail);
    } else {
      show(confMail);
    }
  }
  vk.nomail = params.nomail;
  if (chPhone) {
    if (!params.chphone) {
      chPhone.parentNode.removeChild(chPhone);
    } else if (params.notopbars) {
      hide(chPhone);
    } else {
      show(chPhone);
    }
  }

  vk.nophone = intval(params.nophone);

  if (vk.id) {
    ge('left_blocks').innerHTML = (params.leftblocks || '');
    if (params.leftads) {
      __adsSet(params.leftads)
    }
  }

  setTimeout(updateOtherCounters, 10);

  if (!params.counters) return;
  var cnts = (params.counters || '').split(',');

  var i = 0, setEl = ge('l_set'), sep = setEl && setEl.nextSibling || false, sh = false, ids = ['fr', 'ph', 'vid', 'msg', 'nts', 'gr', 'ev', 'wsh', 'ap', 'ads', 'nws', 'wk', 'docs'];
  var lnks = ['friends', 'albums' + vk.id, 'video', '', 'notes', 'groups', 'events', 'gifts.php?act=wishlist', 'apps', 'ads.php?act=office', 'feed', 'pages', 'docs'];
  var adds = ['', 'act=added', 'section=tagged', '', 'act=comments', 'tab=inv', 'tab=invitations', '', 'act=notifications', '', 'section=mentions'];
  var allnks = [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1];

  if (vk.counts === undefined) {
    vk.counts = {};
  }

  for (; i < 13; ++i) {
    if (vk.counts[i] === cnts[i]) {
      continue;
    }
    vk.counts[i] = cnts[i];
    handlePageCount(ids[i], cnts[i], lnks[i], adds[i]);
  }

  for (var e = sep.nextSibling; e; e = e.nextSibling) {
    if (e.tagName && e.tagName.toLowerCase() == 'li' && isVisible(e)) {
      sh = true;
      break;
    }
  }
  (sh ? show : hide)(sep);
  for (var l = cnts.length; i < l; ++i) {
    var id_v = cnts[i].split(':'), e = ge('l_app' + intval(id_v[0]));
    if (!e) continue;
    geByTag1('span', e.firstChild).innerHTML = intval(id_v[1]) ? ('(<b>' + intval(id_v[1]) + '</b>)') : '';
  }
  setTimeout(updSeenAdsInfo, 0);
}
function handlePageCount(id, val, lnk, add) {
  var v = intval(val), e = ge('l_' + id), toAdd;
  if (v >= 0 && e) {
    geByTag1('span', e.firstChild).innerHTML = v ? ('(<b>' + v + '</b>)') : '';
    if (add && lnk) {
      if (id != 'wsh') {
        toAdd = (v && add) ? ('?' + add) : '';
        if (v > 20 && id == 'gr') toAdd = ''; // groups
        e.firstChild.href = '/' + lnk + toAdd;
      } else {
        e.firstChild.href = '/' + (v ? ('gifts.php?act=wish&wish=' + vk.id + '_' + intval(val.split(':')[1])) : lnk);
      }
    }
  }
  toggle(e, v >= 0);
}

function processDestroy(c) {
  if (c._back && c._back.hide && c == cur) {
    for (var i in c._back.hide) {
      try {c._back.hide[i]();}catch(e){}
    }
  }
  if (!c.destroy || !c.destroy.length) return;
  for (var i in c.destroy) {
    try {c.destroy[i](c);}catch(e){}
  }
}

var globalHistory = [];
function globalHistoryDestroy(loc) {
  for (var i = 0, l = globalHistory.length; i < l; ++i) {
    if (globalHistory[i].loc == loc) {
      var h = globalHistory.splice(i, 1)[0];
      processDestroy(h.cur);
      h.content.innerHTML = '';
      --i; --l;
    }
  }
}
function showBackLink(loc, text) {
  var l = loc;
  loc = (loc || '').replace(/^\//, '');
  _tbLink.loc = loc;
  if (l) {
    extend(_tbLink, {href: '/' + loc, innerHTML: text});
    show(_tbLink);
  } else {
    hide(_tbLink);
  }
}

var nav = {
  getData: function(loc) {
    if (loc.length) {
      for (var i in navMap) {
        if (i[0] == '<') continue;
        var m = loc.match(new RegExp('^' + i, 'i'));
        if (m) {
          return {url: navMap[i][0], files: navMap[i][1]};
        }
      }
      var m = loc.match(/^[a-z0-9\-_]+\.php$/i);
      if (m) {
        return {url: loc};
      }
      return {url: navMap['<other>'][0], files: navMap['<other>'][1]};
    }
    return {url: navMap['<void>'][0], files: navMap['<void>'][1]};
  },
  reload: function(opts) {
    opts = opts || {};
    if (opts.force) {
      hab.stop();
      location.href = '/' + nav.strLoc;
    } else {
      nav.go('/' + nav.strLoc, undefined, extend({nocur: true}, opts));
    }
  },
  go: function(loc, ev, opts) {
    if (checkEvent(ev)) return;

    if (loc.tagName && loc.tagName.toLowerCase() == 'a' && loc.href) {
      if (loc.target == '_blank') {
        return;
      }
      loc = loc.href;
    }
    var strLoc = '', objLoc = {}, changed;
    if (typeof(loc) == 'string') {
      loc = loc.replace(new RegExp('^(' + locProtocol + '//' + locHost + ')?/?', 'i'), '');
      strLoc = loc;
      objLoc = nav.fromStr(loc);
    } else {
      if (!loc[0]) loc[0] = '';
      strLoc = nav.toStr(loc);
      objLoc = loc;
    }

    var _a = window.audioPlayer;
    if (_a && _a.id && (_a.gpDisabled || !ge('gp'))) _a.stop();
    opts = opts || {};
    if (!opts.nocur) {
      changed = clone(objLoc);
      for (var i in nav.objLoc) {
        if (nav.objLoc[i] == changed[i]) {
          delete(changed[i]);
        } else if (changed[i] === undefined) {
          changed[i] = false;
        }
      }
      if (zNav(clone(changed), {hist: opts.hist}) === false) {
        return false;
      }
    }
    if (!opts.nocur && (vk.loaded || !changed['0'])) {
      for (var i in (cur.nav || {})) {
        if (cur.nav[i](clone(changed), nav.objLoc, objLoc, opts) === false) {
          return false;
        }
      }
    }
    if (vk.al == 4 || (!vk.loaded && changed['0'])) {
      setTimeout(function() {
        location.href = '/' + (strLoc || '').replace('%23', '#');
      }, 0);
      return false;
    }
    if (opts.back) {
      for (var i = 0, l = globalHistory.length; i < l; ++i) {
        if (globalHistory[i].loc == strLoc) {
          var h = globalHistory.splice(i, 1)[0];
          var wNode = ge('wrap3'), tNode = ge('title');

          if (window.tooltips) tooltips.destroyAll();
          processDestroy(cur);
          radioBtns = h.radioBtns;
          ajaxCache = h.ajaxCache;
          boxQueue.hideAll();
          if (layers.fullhide) layers.fullhide(true);
          hide(_tbLink);

          cur = h.cur;
          if (gSearch.on) gSearch.hide();
          setTimeout(function() {
            wNode.innerHTML = '';
            wNode.parentNode.replaceChild(h.content, wNode);
            if (vk.width != h.width) {
              handlePageView(h);
            }
            scrollNode.scrollTop = h.scrollTop;
            document.title = h.htitle;
            tNode.innerHTML = h.title;
            setStyle(tNode.parentNode, 'display', h.hideHeader ? 'none' : 'block');
            for (var i = 0, l = cur._back.show.length; i < l; ++i) cur._back.show[i]();
            nav.setLoc(strLoc);
            var b = h.back || {};
            setTimeout(showBackLink.pbind(b[0], b[1]), 10);
          }, 10);
          return false;
        }
      }
    }

    var dest = objLoc[0];
    delete(objLoc[0]);

    var where = nav.getData(dest);
    if (where.files) {
      stManager.add(where.files);
    }
    where.params = extend({__query: dest, al_id: vk.id}, objLoc, opts.params || {});
    if (opts.cl_id) {
      where.params.fr_click = cur.oid+','+opts.cl_id+','+cur.options.fr_click;
    }
    var done = function(title, html, js, params) {
      try {
        params._id = params.id;
      } catch(e) {
        return topError(e, {dt: 15, type: 6, msg: 'Error: ' + e.message + ', (params undefined?), title: ' + title + ', html: ' + html + ', js: ' + js, url: where.url, query: ajx2q(where.params), answer: arguments.length});
      }
      if (stVersions['common.js'] > StaticFiles['common.js'].v) {
        nav.setLoc(params.loc || nav.strLoc);
        location.reload(true);
        return;
      }
      var newPage = (where.params.al_id === undefined) || (where.params.al_id != params.id) || params.fullPage;
      var _back = cur._back, wNode = ge('wrap3'), tNode = ge('title'), hist = false;
      if (strLoc == (cur._back || {}).loc || newPage || opts.back) {
        _back = false;
      }
      if (opts.noback || params.level && (!cur._level || params.level <= cur._level) && opts.noback !== false) {
        _back = false;
        if (opts.noback || (cur._level && params.level < cur._level)) {
          showBackLink();
        }
      }
      if (window.tooltips) tooltips.destroyAll();
      if (gSearch.on) gSearch.hide();
      if (_back) {
        hist = {
          loc: _back.loc || nav.strLoc,
          cur: cur,
          radioBtns: radioBtns,
          ajaxCache: ajaxCache,
          scrollTop: scrollNode.scrollTop,
          htitle: document.title.toString(),
          width: vk.width, noleftmenu: vk.noleftmenu, notopmenu: vk.notopmenu,
          back: _tbLink.loc ? [_tbLink.loc, _tbLink.innerHTML] : false
        };
        if (tNode && tNode.parentNode && !isVisible(tNode.parentNode)) {
          hist.hideHeader = true;
        }
        globalHistoryDestroy(hist.loc);
        if (globalHistory.length > 2) {
          var h = globalHistory.shift();
          processDestroy(h.cur);
          h.content.innerHTML = '';
        }
        for (var i = 0, l = cur._back.hide.length; i < l; ++i) cur._back.hide[i]();
        showBackLink(hist.loc, _back.text);
      } else {
        processDestroy(cur);
      }
      radioBtns = {};
      ajaxCache = {};
      boxQueue.hideAll();
      if (layers.fullhide) layers.fullhide(true);

      cur = {destroy: [], nav: []};
      if (newPage) {
        cleanElems('quick_login_button', 'quick_expire', 'search_form', 'top_links', 'bottom_nav')
        while (globalHistory.length) {
          var h = globalHistory.shift();
          processDestroy(h.cur);
          h.content.innerHTML = '';
        }
        pageNode.innerHTML = html;
        if (!browser.mobile) onBodyResize(true);
      } else {
        if (_back) {
          var newW = ce('div', {id: 'wrap3'});
          extend(hist, {
            content: wNode.parentNode.replaceChild(newW, wNode),
            title: tNode.innerHTML
          });
          globalHistory.push(hist);
          wNode = newW;
        }
        wNode.innerHTML = html;
        tNode.innerHTML = title;
        (title ? show : hide)(tNode.parentNode);
      }
      handlePageParams(params);

      if (!opts.noscroll && !params.noscroll) scrollToTop(0);

      nav.curLoc = params.loc;
      eval('(function(){' + js + ';})()');

      for (var i = 0, l = ajax.framedata.length; i < l; ++i) {
        var d = ajax.framedata[i];
        setTimeout(ajax._receive.pbind(d[0], d[1], d[2]), 0);
      }
      ajax.framedata = false;

      if (browser.mobile) onBodyResize();
      setTimeout(nav.setLoc.pbind(params.loc || ''), browser.chrome ? 100 : 50);
    }
    updSeenAdsInfo();
    __adsLoaded = vkNow();
    ajax.post(where.url, where.params, {onDone: function() {
      var a = arguments;
      if (__debugMode) {
        done.apply(null, a);
      } else try {
        done.apply(null, a);
      } catch (e) {
        topError(e, {dt: 15, type: 6, url: where.url, query: ajx2q(where.params), js: a[2], answer: Array.prototype.slice.call(arguments).join('<!>')});
      }
    }, onFail: opts.onFail || function(text) {
      if (!text) return;

      setTimeout(showFastBox(getLang('global_error'), text).hide, 2000);
      return true;
    }, frame: opts.noframe ? 0 : 1, canReload: true, showProgress: opts.showProgress || showTitleProgress, hideProgress: opts.hideProgress || hideTitleProgress, cache: opts.search ? 1 : ''});
    return false;
  },
  setLoc: function(loc) {
    if (typeof(loc) == 'string') {
      nav.strLoc = loc;
      nav.objLoc = nav.fromStr(loc);
    } else {
      nav.strLoc = nav.toStr(loc);
      nav.objLoc = loc;
    }
    hab.setLoc(nav.strLoc);
  },
  change: function(loc, ev, opts) {
    var params = clone(nav.objLoc);
    each(loc, function(i,v) {
      if (v === false) {
        delete params[i];
      } else {
        params[i] = v;
      }
    });
    return nav.go(params, ev, opts);
  },
  fromStr: function(str) {
    str = str.split('#');
    var res = str[0].split('?');
    var param = {'0': res[0] || ''}
    if (str[1]) {
      param['#'] = str[1];
    }
    return extend(q2ajx(res[1] || ''), param);
  },
  toStr: function(obj) {
    obj = clone(obj);
    var hash = obj['#'] || '';
    var res = obj[0] || '';
    delete(obj[0]);
    delete(obj['#']);
    var str = ajx2q(obj);
    return (str ? (res + '?' + str) : res) + (hash ? ('#' + hash) : '');
  },
  init: function() {
    nav.strLoc = hab.getLoc();
    nav.objLoc = nav.fromStr(nav.strLoc);
  }
}

nav.init();

//
// Cookies
//

var _cookies;
function _initCookies() {
  _cookies = {};
  var ca = document.cookie.split(';');
  var re = /^[\s]*([^\s]+?)$/i;
  for (var i = 0, l = ca.length; i < l; i++) {
    var c = ca[i].split('=');
    if (c.length == 2) {
     _cookies[c[0].match(re)[1]] = unescape(c[1].match(re) ? c[1].match(re)[1] : '');
    }
  }
}
function getCookie(name) {
  _initCookies();
  return _cookies[name];
}
function setCookie(name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    expires = '; expires='+date.toGMTString();
  }
  var domain = locDomain;
  document.cookie = name + '='+escape(value) + expires + '; path=/' + (domain ? '; domain=.' + domain : '');
}

//
// Other stuff
//

function dispatchIntro(step, params) {
  if (typeof dispatchIntroEvent != 'undefined') {dispatchIntroEvent(step, params);}
}

function parseLatin(text){
  var outtext = text;
  var lat1 = ['yo','zh','kh','ts','ch','sch','shch','sh','eh','yu','ya','YO','ZH','KH','TS','CH','SCH','SHCH','SH','EH','YU','YA',"'"];
  var rus1 = ['ё', 'ж', 'х', 'ц', 'ч', 'щ',  'щ',   'ш', 'э', 'ю', 'я', 'Ё', 'Ж', 'Х', 'Ц', 'Ч', 'Щ',  'Щ',   'Ш', 'Э', 'Ю', 'Я', 'ь'];
  for (var i = 0, l = lat1.length; i < l; i++) {
    outtext = outtext.split(lat1[i]).join(rus1[i]);
  }
  var lat2 = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ';
  var rus2 = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';
  for (var i = 0, l = lat2.length; i < l; i++) {
    outtext = outtext.split(lat2.charAt(i)).join(rus2.charAt(i));
  }
  return (outtext == text) ? null : outtext;
}

function __phCheck(el, back, focus, blur) {
  var val = el.value, shown = el.phshown, ph = el.phcont;

  if (shown && (back && val || !back && (focus || val))) {
    hide(ph);
    el.phshown = false;
  } else if (!shown && !val && (back || blur)) {
    show(ph);
    el.phshown = true;
  }
  if (back && !val) {
    if (focus) {
      clearTimeout(el.phanim);
      el.phanim = setTimeout(function() {
        animate(ph.firstChild.firstChild, {color: '#C0C8D0'}, 200);
      }, 100);
    }
    if (blur) {
      clearTimeout(el.phanim);
      el.phanim = setTimeout(function() {
        animate(ph.firstChild.firstChild, {color: '#777777'}, 200);
      }, 100);
    }
  }
}
function placeholderSetup(id, opts) {
  var el = ge(id), ph, o = opts ? clone(opts) : {};
  if (!el || (el.phevents && !o.reload) || !(ph = (el.getAttribute('placeholder') || el.placeholder))) {
    return;
  }

  el.setAttribute('placeholder', '');

  var pad = {}, dirs = ['Top', 'Bottom', 'Left', 'Right'];
  if (o.fast) {
    for (var i = 0; i < 4; ++i) {
      pad['padding' + dirs[i]] = 3;
      pad['margin' + dirs[i]] = 0;
    }
    extend(pad, o.styles || {});
  } else {
    var prop = [];
    for (var i = 0; i < 4; ++i) {
      prop.push('margin' + dirs[i]);
      prop.push('padding' + dirs[i]);
    }
    pad = getStyle(el, prop);
  }
  for (var i = 0; i < 4; ++i) { // add border 1px
    var key = 'margin' + dirs[i];
    pad[key] = (intval(pad[key]) + 1) + 'px';
  }
  if (o.reload) {
    var prel = el.previousSibling;
    if (prel && hasClass(prel, 'input_back_wrap')) re(prel);
  }
  var b1 = el.phcont = el.parentNode.insertBefore(ce('div', {className: 'input_back_wrap no_select', innerHTML: '\
<div class="input_back"><div class="input_back_content">' + ph + '</div></div>\
  '}), el), b = b1.firstChild, c = b.firstChild;
  setStyle(b, pad);

  var cv = __phCheck.pbind(el, o.back), checkValue = browser.mobile ? cv : function(f, b) {
    setTimeout(cv.pbind(f, b), 0);
  }

  if (browser.msie && !browser.msie8) {
    setStyle(b, {marginTop: 1});
  }
  el.phonfocus = function(hid) {
    el.focused = true;
    cur.__focused = el;
    if (hid === true) {
      setStyle(el, {backgroundColor: '#FFF'});
      hide(b);
    }
    checkValue(true, false);
  }
  el.phonblur = function() {
    cur.__focused = el.focused = false;
    show(b);
    checkValue(false, true);
  }
  el.phshown = true, el.phanim = null;
  if (el.value) {
    el.phshown = false;
    hide(b1);
  }

  if (!browser.opera_mobile) {
    addEvent(b1, 'focus click', function() { el.blur(); el.focus(); });
    addEvent(el, 'focus', el.phonfocus);
    addEvent(el, 'keydown paste cut input', checkValue);
  }
  addEvent(el, 'blur', el.phonblur);

  el.getValue = function() {
    return el.value;
  }
  el.setValue = function(v) {
    el.value = v;
    checkValue();
  }
  el.phevents = true;
  el.phonsize = function() {};

  if (o.global) return;

  if (!o.reload) {
    if (!cur.__phinputs) {
      cur.__phinputs = [];
      cur.destroy.push(function() {
        for (var i = 0, l = cur.__phinputs.length; i < l; ++i) {
          removeData(cur.__phinputs[i]);
        }
      });
    }
    cur.__phinputs.push(el);
  }
}

function val(input, value, nofire) {
  input = ge(input);
  if (!input) return;

  if (value !== undefined) {
    if (input.setValue) {
      input.setValue(value);
      !nofire && input.phonblur && input.phonblur();
    } else if (input.tagName == 'INPUT' || input.tagName == 'TEXTAREA') {
      input.value = value
    } else {
      input.innerHTML = value
    }
  }
  return input.getValue ? input.getValue() :
         (((input.tagName == 'INPUT' || input.tagName == 'TEXTAREA') ? input.value : input.innerHTML) || '');
}

function elfocus(el, from, to) {
  el = ge(el);
  try {
    el.focus();
    if (from === undefined || from === false) from = el.value.length;
    if (to === undefined || to === false) to = from;
    if (el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', from);
      range.moveStart('character', to);
      range.select();
    } else if (el.setSelectionRange) {
      el.setSelectionRange(from, to);
    }
  } catch(e) {}
}

// Message box
var _message_box_guid = 0, _message_boxes = [], _show_flash_timeout = 0;

var __bq = boxQueue = {
  hideAll: function() {
    if (__bq.count()) {
      var box = _message_boxes[__bq._boxes.pop()];
      box._in_queue = false;
      box._hide();
    }
    while (__bq.count()) {
      var box = _message_boxes[__bq._boxes.pop()];
      box._in_queue = false;
    }
  },
  hideLast: function(check, e) {
    if (__bq.count()) {
      var box = _message_boxes[__bq._boxes[__bq.count() - 1]];
      if (check === true && (box.changed || __bq.skip)) {
        __bq.skip = false;
        return;
      }
      box.hide();
    }
    if (e && e.type == 'click') return cancelEvent(e);
  },
  hideBGClick: function(e) {
    if (e && e.target && /^box_layer/.test(e.target.id)) {
      __bq.hideLast();
    }
  },
  count: function() {
    return __bq._boxes.length;
  },
  _show: function(guid) {
    var box = _message_boxes[guid];
    if (!box || box._in_queue) return;
    if (__bq.count()) {
      _message_boxes[__bq._boxes[__bq.count() - 1]]._hide(true, true);
    } else if (window.tooltips) {
      tooltips.hideAll();
    }
    box._in_queue = true;
    var notFirst = __bq.count() ? true : false;
    __bq.curBox = guid;
    box._show(notFirst || __bq.currHiding, notFirst);
    __bq._boxes.push(guid);
  },
  _hide: function(guid) {
    var box = _message_boxes[guid];
    if (!box || !box._in_queue || __bq._boxes[__bq.count() - 1] != guid || !box.isVisible()) return;
    box._in_queue = false;
    __bq._boxes.pop();
    box._hide(__bq.count() ? true : false);
    if (__bq.count()) {
      var prev_guid = __bq._boxes[__bq.count() - 1];
      __bq.curBox = prev_guid;
      _message_boxes[prev_guid]._show(true, true, true);
    }
  },
  _boxes: [],
  curBox: 0
}

__bq.hideLastCheck = __bq.hideLast.pbind(true);
function curBox() { var b = _message_boxes[__bq.curBox]; return (b && b.isVisible()) ? b : null; }

if (!browser.mobile) {
  addEvent(document, 'keydown', function(e) {
    if (e.keyCode == KEY.ESC && __bq.count()) {
      __bq.hideLast();
      return false;
    }
  });
}

function boxRefreshCoords(cont) {
  var height = window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : boxLayerBG.offsetHeight);
  var top = browser.mobile ? intval(window.pageYOffset) : 0;
  containerSize = getSize(cont);
  cont.style.marginTop = Math.max(0, top + (height - containerSize[1]) / 3) + 'px';
}

function MessageBox(options) {
  var defaults = {
    width: 410,
    animSpeed: 0,
    height: 'auto',
    bodyStyle: '',
    selfDestruct: true,
    progress: false
  };

  options = extend(defaults, options);

  var buttonsCount = 0,
      boxContainer, boxBG, boxLayout;
  var boxTitleWrap, boxTitle, boxCloseButton, boxBody;
  var boxControlsWrap, boxControls, boxButtons, boxProgress, boxControlsText;
  var guid = _message_box_guid++, visible = false;

  if (!options.progress) options.progress = 'box_progress' + guid;

  var controlsStyle = options.hideButtons ? ' style="display: none"' : '';
  boxContainer = ce('div', {
    className: 'popup_box_container',
    innerHTML: '\
<div class="box_layout" onclick="__bq.skip=true;">\
<div class="box_title_wrap"><div class="box_x_button"></div><div class="box_title"></div></div>\
<div class="box_body" style="' + options.bodyStyle + '"></div>\
<div class="box_controls_wrap"' + controlsStyle + '><div class="box_controls">\
<table cellspacing="0" cellpadding="0" class="fl_r"><tr></tr></table>\
<div class="progress" id="' + options.progress + '"></div>\
<div class="box_controls_text"></div>\
</div></div>\
</div>'
  }, {
    display: 'none'
  });
  hide(boxContainer);

  boxLayout = boxContainer.firstChild;

  boxTitleWrap = boxLayout.firstChild;
  boxCloseButton = boxTitleWrap.firstChild;
  boxTitle = boxCloseButton.nextSibling;

  boxBody = boxTitleWrap.nextSibling;

  boxControlsWrap = boxBody.nextSibling;
  boxControls = boxControlsWrap.firstChild;
  boxButtons = boxControls.firstChild;
  boxProgress = boxButtons.nextSibling;
  boxControlsText = boxProgress.nextSibling;

  boxLayer.appendChild(boxContainer);

  refreshBox();
  boxRefreshCoords(boxContainer);

  // Refresh box properties
  function refreshBox() {
    // Set title
    if (options.title) {
      boxTitle.innerHTML = options.title;
      removeClass(boxBody, 'box_no_title');
      show(boxTitleWrap);
    } else {
      addClass(boxBody, 'box_no_title');
      hide(boxTitleWrap);
    }

    // Set box dimensions
    boxContainer.style.width = typeof(options.width) == 'string' ? options.width : options.width + 'px';
    boxContainer.style.height = typeof(options.height) == 'string' ? options.height : options.height + 'px';
  }

  // Add button
  function addButton(label, onclick, type) {
    ++buttonsCount;
    if (type == 'no') type = 'gray';
    if (type == 'yes') type = 'blue';
    var buttonWrap = ce('div', {
      className: 'button_' + (type ? type : 'blue'),
      innerHTML: '<button>' + label + '</button>'
    }), row = boxButtons.rows[0], cell = row.insertCell(0);
    cell.appendChild(buttonWrap);
    createButton(buttonWrap.firstChild, onclick);
    return buttonWrap;
  }

  // Add custom controls text
  function setControlsText(text) {
    boxControlsText.innerHTML = text;
  }

  // Remove buttons
  function removeButtons() {
    var row = boxButtons.rows[0];
    while (row.cells.length) {
      cleanElems(row.cells[0]);
      row.deleteCell(0);
    }
  }

  var destroyMe = function() {
    if (options.onClean) options.onClean();
    removeButtons();
    cleanElems(boxContainer, boxCloseButton, boxTitleWrap, boxControlsWrap);
    boxLayer.removeChild(boxContainer);
    delete _message_boxes[guid];
  }

  // Hide box
  var hideMe = function(showingOther, tempHiding) {
    if (!visible) return;
    visible = false;

    var speed = (showingOther === true) ? 0 : options.animSpeed;

    if (options.hideOnBGClick) {
      removeEvent(document, 'click', __bq.hideBGClick);
    }

    if (isFunction(options.onBeforeHide)) {
      options.onBeforeHide();
    }

    if (_layerAnim && !showingOther) {
      layers.boxhide();
    }

    var onHide = function () {
      if (__bq.currHiding == _message_boxes[guid]) {
        __bq.currHiding = false;
      }
      if (!_layerAnim && !_message_boxes[guid].shOther && !showingOther) {
        layers.boxhide();
      }
      if (!tempHiding && options.selfDestruct) {
        destroyMe();
      } else {
        hide(boxContainer);
      }

      if (options.onHide) {
        options.onHide();
      }
    }
    if (speed > 0) {
      __bq.currHiding = _message_boxes[guid];
      fadeOut(boxContainer, speed, onHide);
    } else {
      onHide();
    }
  }

  // Show box
  function showMe(noAnim, notFirst, isReturned) {
    if (visible || !_message_boxes[guid]) return;
    visible = true;

    var speed = (noAnim === true || notFirst) ? 0 : options.animSpeed;

    if (options.hideOnBGClick) {
      addEvent(document, 'click', __bq.hideBGClick);
    }

    // Show blocking background
    if (!notFirst) {
      layers.boxshow();
    }

    if (__bq.currHiding) {
      __bq.currHiding.shOther = true;
      var cont = __bq.currHiding.bodyNode.parentNode.parentNode;
      data(cont, 'tween').stop(true);
    }

    // Show box
    if (speed > 0) {
      fadeIn(boxContainer, speed);
    } else {
      show(boxContainer);
    }

    boxRefreshCoords(boxContainer);
    if (options.onShow) {
      options.onShow(isReturned);
    }

    _message_box_shown = true;
  }

  var fadeToColor = function(color) {
    return function() {
      animate(this, {backgroundColor: color}, 200);
    }
  }
  addEvent(boxCloseButton, 'mouseover', fadeToColor('#FFFFFF'));
  addEvent(boxCloseButton, 'mouseout', fadeToColor('#9DB7D4'));
  addEvent(boxCloseButton, 'click', __bq.hideLast);

  var retBox = _message_boxes[guid] = {
    guid: guid,
    _show: showMe,
    _hide: hideMe,

    bodyNode: boxBody,

    // Show box
    show: function() {
      __bq._show(guid);
      return this;
    },
    progress: boxProgress,
    showProgress: function() {
      hide(boxControlsText);
      show(boxProgress);
    },
    hideProgress: function() {
      hide(boxProgress);
      show(boxControlsText);
    },

    // Hide box
    hide: function(attemptParam) {
      if (isFunction(options.onHideAttempt) && !options.onHideAttempt(attemptParam)) return false;
      __bq._hide(guid);
      return true;
    },

    isVisible: function() {
      return visible;
    },
    bodyHeight: function() {
      return getStyle(boxBody, 'height');
    },

    // Insert html content into the box
    content: function(html) {
      if (options.onClean) options.onClean();
      boxBody.innerHTML = html;
      boxRefreshCoords(boxContainer);
      refreshBox();
      return this;
    },

    // Add button
    addButton: function(label, onclick, type, returnBtn) {
      var btn = addButton(label, onclick ? onclick: this.hide, type);
      return (returnBtn) ? btn : this;
    },

    setButtons: function(yes, onYes, no, onNo) {
      var b = this.removeButtons();
      if (!yes) return b.addButton(box_close);
      if (no) b.addButton(no, onNo, 'no');
      return b.addButton(yes, onYes);
    },

    // Set controls text
    setControlsText: setControlsText,

    // Remove buttons
    removeButtons: function() {
      removeButtons();
      return this;
    },

    destroy: destroyMe,

    // Update box options
    setOptions: function(newOptions) {
      if (options.hideOnBGClick) {
        removeEvent(document, 'click', __bq.hideBGClick);
      }
      options = extend(options, newOptions);
      if ('bodyStyle' in newOptions) {
        var items = options.bodyStyle.split(';');
        for (var i = 0, l = items.length; i < l; ++i) {
          var name_value = items[i].split(':');
          if (name_value.length > 1 && name_value[0].length) {
            boxBody.style[trim(name_value[0])] = trim(name_value[1]);
            if (boxBody.style.setProperty) {
              boxBody.style.setProperty(trim(name_value[0]), trim(name_value[1]), '');
            }
          }
        }
      }
      if (options.hideOnBGClick) {
        addEvent(document, 'click', __bq.hideBGClick);
      }
      if (options.hideButtons) {
        hide(boxControlsWrap);
      } else {
        show(boxControlsWrap);
      }
      refreshBox();
      boxRefreshCoords(boxContainer);
      return this;
    },
    evalBox: function(js, url, params) {
      var scr = '((function() { return function() { var box = this; ' + (js || '') + ';}; })())'; // IE :(
      if (__debugMode) {
        var fn = eval(scr);
        fn.apply(this, [url, params]);
      } else try {
        var fn = eval(scr);
        fn.apply(this, [url, params]);
      } catch (e) {
        topError(e, {dt: 15, type: 7, url: url, query: params ? ajx2q(params) : undefined, js: js});
      }
    }
  }
  return retBox;
}

function showBox(url, params, options, e) {
  if (checkEvent(e)) return false;

  var opts = options || {}, box = new MessageBox(opts.params || {}), p = {
    onDone: function(title, html, js) {
      if (!box.isVisible()) return;
      try {
        show(boxLayerBG);
        box.setOptions({title: title, hideButtons: false});
        if (opts.showProgress) {
          box.show();
        } else {
          show(box.bodyNode);
        }
        box.content(html);
        box.evalBox(js, url, params);
        if (opts.onDone) opts.onDone();
      } catch(e) {
        topError(e, {dt: 15, type: 103, url: url, query: ajx2q(params), answer: Array.prototype.slice.call(arguments).join('<!>')});
        if (box.isVisible()) box.hide();
      }
    },
    onFail: function(error) {
      box.failed = true;
      setTimeout(box.hide, 0);
      if (isFunction(opts.onFail)) return opts.onFail(error);
    },
    cache: opts.cache,
    stat: opts.stat
  };

  if (opts.prgEl) {
    opts.showProgress = showGlobalPrg.pbind(opts.prgEl, {cls: opts.prgClass, w: opts.prgW, h: opts.prgH, hide: true});
    opts.hideProgress = hide.pbind('global_prg');
  }
  if (opts.showProgress) {
    extend(p, {
      showProgress: opts.showProgress,
      hideProgress: opts.hideProgress
    });
  } else {
    box.setOptions({title: false, hideButtons: true}).show();
    if (__bq.count() < 2) {
      hide(boxLayerBG);
    }
    hide(box.bodyNode);
    p.showProgress = function() {
      show(boxLoader);
      boxRefreshCoords(boxLoader);
    }
    p.hideProgress = hide.pbind(boxLoader);
  }
  box.removeButtons().addButton(getLang('global_close'));

  ajax.post(url, params, p);
  return box;
}

function showTabbedBox(url, params, options, e) {
  options = options || {};
  options.stat = options.stat || [];
  options.stat.push('box.js', 'boxes.css');
  return showBox(url, params, options, e)
}

function showFastBox(o, c, yes, onYes, no, onNo) {
  return (new MessageBox(typeof(o) == 'string' ? {title: o} : o)).content(c).setButtons(yes, onYes, no, onNo).show();
}

function showCaptchaBox(sid, dif, box, o) {
  var done = function(e) {
    if (e && e.keyCode !== undefined && e.keyCode != 10 && e.keyCode != 13) return;
    var key = geByTag1('input', box.bodyNode);
    if (!trim(key.value) && e !== true) {
      elfocus(key);
      return;
    }
    var imgs = geByTag1('img', box.bodyNode);
    var captcha = imgs[0], loader = imgs[1];
    removeEvent(key);
    removeEvent(captcha);
    show(geByClass1('progress', box.bodyNode));
    hide(key);
    o.onSubmit(sid, key.value);
  }
  var was_box = box ? true : false;
  var difficulty = intval(dif) ? '' : '&s=1';
  var imgSrc = o.imgSrc || '/captcha.php?sid=' + sid + difficulty;
  if (!was_box) {
    var content = '\
<div class="captcha">\
  <div><img src="' + imgSrc + '"/></div>\
  <div><input type="text" class="text" maxlength="7" /><div class="progress" /></div></div>\
</div>' + (o.addText || '');
    box = showFastBox({
      title: getLang('captcha_enter_code'),
      width: 300,
      onHide: o.onHide
    }, content, getLang('captcha_send'), function() {
      box.submit();
    }, getLang('captcha_cancel'), function() {
      var key = geByTag1('input', box.bodyNode);
      var captcha = geByTag1('img', box.bodyNode);
      removeEvent(key);
      removeEvent(captcha);
      box.hide();
    });
  }
  box.submit = done.pbind(true);
  box.changed = true;
  var key = geByTag1('input', box.bodyNode);
  var captcha = geByTag1('img', box.bodyNode);
  if (was_box) {
    key.value = '';
    captcha.src = '/captcha.php?sid=' + sid + difficulty;
    hide(geByClass1('progress', box.bodyNode));
  }
  show(key);
  addEvent(key, 'keypress', done);
  addEvent(captcha, 'click', function() {
    this.src = '/captcha.php?sid=' + sid + difficulty + '&v=' + irand(1000000, 2000000);
  });
  elfocus(key);
  return box;
}

// Three-state button

function createButton(el, onClick) {
  el = ge(el);
  if (!el || el.btnevents) return;
  var p = el.parentNode;

  if (hasClass(p, 'button_blue') || hasClass(p, 'button_gray')) {
    if (isFunction(onClick)) {
      el.onclick = onClick.pbind(el);
    }
    return;
  }
  var hover = false;
  addEvent(el, 'click mousedown mouseover mouseout', function(e) {
    if (hasClass(p, 'locked')) return;
    switch (e.type) {
    case 'click':
      if (!hover) return;
      el.className = 'button_hover';
      onClick(el);
      return cancelEvent(e);
    break;
    case 'mousedown':
      el.className = 'button_down';
    break;
    case 'mouseover':
      hover = true;
      el.className = 'button_hover';
    break;
    case 'mouseout':
      el.className = 'button';
      hover = false;
    break;
    }
  });
  el.btnevents = true;
}

function lockButton(el) {
  if (!(el = ge(el))) return;
  var btn = (el.tagName.toLowerCase() == 'button'), d = btn ? 2 : ((browser.msie6 || browser.msie7) ? 2 : 4);
  if (!btn && !hasClass(el, 'file_button')) return;
  var lock = ce('span', {className: 'button_lock'});
  el.parentNode.insertBefore(lock, el);
  el['old_width'] = el.style.width;
  el['old_height'] = el.style.height;
  var s = getSize(el.parentNode);
  setStyle(el, {width: s[0] - d, height: s[1] - d});
  if (browser.msie6 || browser.msie7) {
    el['old_html'] = el.innerHTML; el.innerHTML = '';
  } else {
    el.style.textIndent = '-9999px';
  }
}
function unlockButton(el) {
  if (!(el = ge(el))) return;
  var lock = geByClass1('button_lock', el.parentNode, 'span');
  if (!lock) return;
  el.parentNode.removeChild(lock);
  el.style.width = el['old_width'];
  el.style.height = el['old_height'];
  if (browser.msie6 || browser.msie7) el.innerHTML = el['old_html'];
  el.style.textIndent = '';
}

function sbWidth() {
  if (window._sbWidth === undefined) {
    var t = ce('div', {innerHTML: '<div style="height: 75px;">1<br>1</div>'}, {
      overflowY: 'scroll',
      position: 'absolute',
      width: '50px',
      height: '50px'
    });
    bodyNode.appendChild(t);
    window._sbWidth = Math.max(0, t.offsetWidth - t.firstChild.offsetWidth - 1);
    bodyNode.removeChild(t);
  }
  return window._sbWidth;
}

function imPopup(peer_id) {
  if (window.event && (window.event.which == 2 || window.event.button == 1)) {
    return true;
  }

  var params = 'scrollbars=0,resizable=1,menubar=0,location=0,width=810,height=669,toolbar=0,status=0';
  var url = 'http://' + locHost + '/im.php?act=a_box&popup=1';
  var js = 'window.im.activate_tab(0);';
  if (peer_id) {
    url += '&sel=' + peer_id;
    js = 'window.im.add_peers(' + peer_id + ', ' + peer_id + ')';
  }

  url = 'javascript: try { ' + js + ' } catch(e) { document.location = "' + url + '"; void(0); }';

  window.im_popup_window = window.open(url, 'im', params);

  try {
    if (!browser.chrome && !browser.msie && !browser.mozilla && !browser.safari && window.im_popup_window.im) {
      window.im_already_box = new MessageBox({title: getLang('im_already_shown_title')});
      im_already_box.content(getLang('im_already_shown'));
      im_already_box.addButton(getLang('box_close'));
      setTimeout('im_already_box.hide(400)', 2000);
      im_already_box.show();
    }
  } catch (e) {}

  if (!browser.msie) {
    window.im_popup_window.blur();
  }
  window.im_popup_window.focus();

  return false;
}

function checkTextLength(maxLen, inp, warn, nobr) {
  var val = (inp.getValue) ? inp.getValue() : inp.value;
  if (inp.lastLen === val.length) return;
  inp.lastLen = val.length;
  var countRealLen = function(text, nobr) {
    var spec = {'&': 5, '<': 4, '>': 4, '"': 6, "\n": (nobr ? 1 : 4), "\r": 0, '!': 5, "'": 5};
    var res = 0;
    for (var i = 0, l = text.length; i < l; i++) {
      var k = spec[text.charAt(i)], c = text.charCodeAt(i);
      if (k !== undefined) res += k;
      else if ((c > 0x80 && c < 0xC0) || c > 0x500) res += ('&#' + c + ';').length;
      else res += 1;
    }
    return res;
  }
  var realLen = countRealLen(val, nobr);
  warn = ge(warn);
  if (realLen > maxLen - 100) {
    show(warn);
    if (realLen > maxLen) {
      warn.innerHTML = getLang('text_exceeds_symbol_limit', realLen - maxLen);
    } else {
      warn.innerHTML = getLang('text_N_symbols_remain', maxLen - realLen);
    }
  } else {
    hide(warn);
  }
}

function autosizeSetup(el, options) {
  el = ge(el);
  if (!el) return;
  if (el.autosize) {
    el.autosize.update();
    return;
  }

  options.minHeight = intval(options.minHeight) || intval(getStyle(el, 'height'));
  options.maxHeight = intval(options.maxHeight);

  var elwidth = intval(getStyle(el, 'width'));
  if (elwidth < 1) {
    elwidth = intval(getStyle(el, 'width', false));
  }
  el.autosize = {
    options: options,
    helper: ce('textarea', {className: 'ashelper'}, {
      width: elwidth,
      height: 10,
      fontFamily: getStyle(el, 'fontFamily'),
      fontSize: intval(getStyle(el, 'fontSize')) + 'px',
      lineHeight: getStyle(el, 'lineHeight')
    }),
    handleEvent: function(val, e) {
      var ch = e.charCode ? String.fromCharCode(e.charCode) : e.charCode;
      if (ch === undefined) {
        ch = String.fromCharCode(e.keyCode);
        if (e.keyCode == 10 || e.keyCode == 13) {
          ch = '\n';
        } else if (!browser.msie && e.keyCode <= 40) {
          ch = '';
        }
      }
      if (!ch) {
        return val;
      }
      if (!browser.msie) {
        return val.substr(0, el.selectionStart) + ch + val.substr(el.selectionEnd);
      }
      var r = document.selection.createRange();
      if (r.text) {
        val = val.replace(r.text, '');
      }
      return val + ch;
    },
    update: function(e) {
      var value = el.value;
      if (e && e.type != 'blur' && e.type != 'keyup' && (!browser.msie || e.type == 'keypress')) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          value = el.autosize.handleEvent(value, e);
        }
      }
      if (!value) {
        value = ' ';
      }
      if (el.autosize.helper.value != value) {
        el.autosize.helper.value = value;
      }
      var opts = el.autosize.options;

      var oldHeight = getSize(el, true)[1];
      var newHeight = el.autosize.helper.scrollHeight;
      if (newHeight < opts.minHeight) {
        newHeight = opts.minHeight;
      }
      var newStyle = {overflow: 'hidden'}, curOverflow = getStyle(el, 'overflow').indexOf('auto') > -1 ? 'auto' : 'hidden';
      if (opts.maxHeight && newHeight > opts.maxHeight) {
        newHeight = opts.maxHeight;
        newStyle = extend(newStyle, {overflow: 'auto', overflowX: 'hidden'});
      }
      if (oldHeight != newHeight || curOverflow != newStyle.overflow) {
        newStyle.height = newHeight;
        setStyle(el, newStyle);
        if (isFunction(opts.onResize)) {
          opts.onResize(newHeight);
        }
      }
    }
  }
  utilsNode.appendChild(el.autosize.helper);
  if (browser.opera_mobile) {
    setStyle(el, {overflow: 'hidden'});
    el.autosize.update();
    addEvent(el, 'blur', el.autosize.update);
  } else {
    addEvent(el, 'keydown keyup keypress', el.autosize.update);
    setTimeout(function() {
      setStyle(el, {overflow: 'hidden'});
      el.autosize.update();
      var t = val(el); val(el, ' ', true); val(el, t, true);
    }, 0);
  }
}

function goAway(lnk, prms, e) {
  if ((prms || {}).h != -1 || checkEvent(e)) {
    return true;
  }
  if ((prms || {}).h != -1) {
    var m = lnk.match(/https?:\/\/([a-zA-Z0-9\-_\.]+\.)?(vk\.com|vkontakte\.ru)(\/|$)/i);
    if (m && m[1].toLowerCase() != 'api.') {
      location.href = lnk;
      return false;
    }
    var no_warning = intval(getCookie('remixsettings_bits'));
    if (/https?:\/\/([a-zA-Z0-9\-_]+\.)(vk\.com|vkontakte\.ru)(\/|$)/i.test(locBase) || no_warning & 1) {
      window.open('/away.php?to=' + encodeURIComponent(lnk) + ((prms && prms.h !== undefined) ? '&h=' + prms.h : ''), '_blank');
      return false;
    }
  }
  var params = extend({act: 'a_go', to: lnk}, prms || {});
  return !showBox('away.php', params, {}, e);
}

function isChecked(el) {
  el = ge(el);
  return hasClass(el, 'on') ? 1 : '';
}
function checkbox(el, val) {
  el = ge(el);
  if (!el || hasClass(el, 'disabled')) return;

  if (val === undefined) {
    val = !isChecked(el);
  }
  if (val) {
    addClass(el, 'on');
  } else {
    removeClass(el, 'on');
  }
  return false;
}

function disable(el, val) {
  el = ge(el);

  if (val === undefined) {
    val = !hasClass(el, 'disabled');
  }
  if (val) {
    addClass(el, 'disabled');
  } else {
    removeClass(el, 'disabled');
  }
  return false;
}

var radioBtns = {};
function radioval(name) {
  return radioBtns[name] ? radioBtns[name].val : false;
}
function radiobtn(el, val, name) {
  if (!radioBtns[name]) return;
  each(radioBtns[name].els, function() {
    if (this == el) {
      addClass(this, 'on');
    } else {
      removeClass(this, 'on');
    }
  });
  return radioBtns[name].val = val;
}

function renderFlash(cont, opts, params, vars) {
  if (!opts.url || !opts.id) {
    return false;
  }
  opts = extend({
    version: 9,
    width: 1,
    height: 1
  }, opts);
  var f = opts.url;
  if (!stVersions[f]) {
    stVersions[f] = '';
  }
  if (__debugMode && stVersions[f] < 1000000) stVersions[f] += irand(1000000, 2000000);

  if (stVersions[f]) {
    opts.url += ((opts.url.indexOf('?') == -1) ? '?' : '&') + '_stV=' + stVersions[f];
  }

  params = extend({
    quality: 'high',
    flashvars: ajx2q(vars)
  }, params);
  if (browser.flash < opts.version) {
//    if (opts.express) {
//      params.flashvars += '&MMplayerType=PlugIn&MMredirectURL=' + encodeURIComponent(locBase + location.hash);
//    } else {
      return false;
//    }
  }
  ge(cont).innerHTML = browser.flashwrap(opts, params);
  return true;
}

function playAudio() {
  var args = arguments;
  stManager.add('player.js', function() {
    audioPlayer.operate.apply(null, args);
  });
}

function playAudioNew() {
  var args = arguments;
  if (args[args.length - 1] !== false) args = Array.prototype.slice.apply(arguments).concat([true]);
  stManager.add(['new_player.js', 'new_player.css'], function() {
    audioPlayer.operate.apply(null, args);
  });
}

window.onLoginDone = nav.reload;
window.onLogout = function() {
  if (window.audioPlayer) {
    audioPlayer.stop();
    toggleGlobalPlayer(false);
  }
  nav.reload();
}

function onLoginFailed(code, opts) {
  switch (code) {
    case 2: location.href = '/login.php?r=1&email=' + opts.email; break;
    case 3: location.href = '/register.php?hash=' + opts.regh + '&gid=' + opts.inv; break;
    case 4: location.href = '/login.php?m=1&email=' + opts.email; break;
    default: location.href = '/login.php'; break;
  }
}
function onLoginCaptcha(sid, dif) {
  window.qloginBox = showCaptchaBox(sid, dif, window.qloginBox, {onSubmit: function(sid, key) {
    ge('quick_captcha_sid').value = sid;
    ge('quick_captcha_key').value = key;
    ge('quick_login_form').submit();
  }, onHide: function() { window.qloginBox = false; }});
}

function callHub(func, count) {
  this.count = count || 1;
  this.done = function(c) {
    this.count -= c || 1;
    if (this.count <= 0) {
      func();
    }
  };
}

function showWriteMessageBox(e, id) {
  gSearch.hide(e, true);
  var box = showBox('al_mail.php', {act: 'write_box', to: id}, {params: {width: 450}, stat: ['page.js', 'mail.css'], cache: 1}, e);
  if (box) cancelEvent(e);
  return !box;
}

var gSearch = new (function() {
  this.on = 0;
  var self = this;
  this.hub = new callHub(function() {
    if (self.onShow) self.onShow();
  }, 2);
  this.hintsHub = new callHub(function() {
    self.showStartHints();
  }, 2);
  this.load = function() {
    if (!ge('quick_search')) return;
    if (this.loading) return;
    this.loading = true;
    stManager.add('qsearch.js', function() {
      self.hub.done();
    });
    ajax.post('hints.php', {act: 'a_start_hints'}, {onDone: function(text) {
      self.startHintsText = trim(text);
      self.hintsHub.done();
    }});
  },
  this.show = function(e, noAnim) {
    if (!ge('quick_search')) return;
    if (this.on) {
      return this.go(e);
    }
    this.on = 1;
    show(self.sCont);
    placeholderSetup('search_input');
    ge('search_input').setAttribute('autocomplete', 'off');
    addClass(ge('qsearch_link'), 'active');
    this.prev_content = ge('content');
    if (!this.qsearch_cont) {
      this.qsearch_cont = ce('div', {id: 'content', innerHTML: '<div style="padding: 200px; text-align: center;"><img src="/images/progress7.gif"/></div>'});
    }
    // hide('header');
    this.prev_content.parentNode.replaceChild(this.qsearch_cont, this.prev_content);
    if (!this.loading) this.load();
    self.hub.done();
    self.hintsHub.done();
    if (e) return cancelEvent(e);
  };
  this.go = function (e) {
    var url = '/gsearch.php?section=' + (self.last_section || 'people') + '&q=' + trim(ge('search_input').value) + '&name=1';
    cancelEvent(e || window.event);
    location.href = url;
    return false;
  };

  this.hide = function(e, force) {
    if (!ge('quick_search')) return;
    if ((self.active && !force) || !self.on) return;
    self.on = 0;
    toggleFlash();
    if (self.beforeHide && self.beforeHide()) {
      return true;
    }
    if (ge('search_input').setValue) {
      ge('search_input').setValue('');
    } else {
      ge('search_input').value = '';
    }
    // show('header');
    hide(self.sCont);
    removeClass(ge('qsearch_link'), 'active');
    self.qsearch_cont.parentNode.replaceChild(self.prev_content, self.qsearch_cont);
  };
  this.init = function(options) {
    this.sCont = ge('quick_search');
    this.opt = options || {};
  };
  var qsearch_start = false, qsearch_requested = false;
  this.preload = function() {
    var url = '/al_search.php', params = {__query: 'search', al_id: vk.id}, q = url + '#' + ajx2q(params);
    if (globalAjaxCache[q] !== undefined) return;
    globalAjaxCache[q] = -1;
    ajax.post(url, extend(params, {al: 1}), {onDone: function() {
      var cb = globalAjaxCache[q], args = Array.prototype.slice.call(arguments);
      globalAjaxCache[q] = args;
      if (isFunction(cb)) {
        cb.apply(window, args);
      }
    }, onFail: function() {
      delete globalAjaxCache[q];
    }});
  };
})();

// opts: {url: '...', params: {}} or {text: '...'} or {content: '...'}
var _cleanHide = function(el) {
  if (el.temphide) {
    removeEvent(el, 'mouseout', el.temphide);
    removeAttr(el, 'temphide');
    removeAttr(el, 'showing');
  }
}

function showTooltip(el, opts) {
  if (!vk.loaded) return;

  if (!el.temphide) {
    el.temphide = function() {
      el.showing = false;
    }
    addEvent(el, 'mouseout', el.temphide);
  }
  el.showing = true;
  if (el.tt == 'loadingstat') return;

  if (!el.tt) {
    el.tt = 'loadingstat';
  }
  if (opts.stat) stManager.add(opts.stat);
  stManager.add(['tooltips.js', 'tooltips.css'], function() {
    if (el.tt == 'loadingstat') el.tt = false;

    if (!el.showing) return;
    _cleanHide(el);

    if (!el.tt || !el.tt.el || opts.force) {
      tooltips.create(el, opts);
      if (opts.onCreate) opts.onCreate();
    }
    tooltips.show(el, opts);
  });
}
function reportAd(aid) {
  showBox('reports.php', {act: 'a_report_ad_box', aid: aid}, {params: {width: 350}, stat: ['ui_controls.js', 'ui_controls.css']});
}

function updateMoney(balance) {
  if (balance === undefined || balance === false) return;
  vk.balance = balance;
  var els = geByClass('votes_balance_nom');
  for (var i in els) {
    els[i].innerHTML = balance+' '+langNumeric(balance, votes_flex);
  }
}

function zNav(changed, opts) {
  var z = changed.z, f = changed.f;
  delete changed.z;
  delete changed.f;

  if (!isEmpty(changed)) return;

  if (f) {
    handleScroll(f);
    if (z === undefined) return false;
  }
  if (z === false) {
    if (layers.fullhide) {
      layers.fullhide(opts.hist ? 2 : false);
    }
    return false;
  }
  if (!z) return;
  var zType = z.match(/^([a-z]+)(-?\d+(?:_\d+)?)\/?(.*)/i);
  if (zType) {
    var onFail = function() {
      delete nav.objLoc.z;
      nav.setLoc(nav.objLoc);
      return true;
    };
    switch (zType[1]) {
      case 'photo':
        showPhoto(zType[2], zType[3], extend(opts || {}, {onFail: onFail, noHistory: true}));
        return false;
        break;
      case 'video':
        showVideo(zType[2], zType[3], extend(opts || {}, {onFail: onFail}));
        return false;
        break;
      case 'screen':
        JoinPhotoview.show(intval(zType[2]));
        return false;
        break;
    }
  }
}

function handleScroll (scroll) {
  scroll = scroll.split(',');
  var named = cur.named || {},
      scrollEl = scroll[0] && (named[scroll[0]] || ge(scroll[0])) || false,
      focusEl = scroll[1] && (named[scroll[1]] || ge(scroll[1])) || false;

  if (!scrollEl && !focusEl) {
    scrollEl = document.getElementsByName(scroll[0])[0];
    if (!scrollEl) {
      return;
    }
  }

  setTimeout(function () {
    scrollEl && scrollToY(getXY(scrollEl)[1], 0);
    focusEl && elfocus(focusEl);
  }, 300);
}

function showGlobalPrg(img, opts) {
  var xy = getXY(img), sz = getSize(img), o = opts || {}, w = o.w || 32, h = o.h || 13, el = ge('global_prg');
  el.className = o.cls || 'progress';
  setStyle(el, {
    left: xy[0] + Math.floor((sz[0] - w) / 2),
    top: xy[1] + Math.floor((sz[1] - h) / 2),
    width: w, height: h,
    display: 'block'
  });
  if (o.hide) {
    img.style.visibility = 'hidden';
  }
}
function showPhoto(photoId, listId, options, ev) {
  if (checkEvent(ev)) return;

  var stat = ['photoview.js', 'photoview.css'], phv = window.photoview;
  if (options.img) {
    //p//options.showProgress = showGlobalPrg.pbind(options.img, {cls: 'progress_inv_img', w: 46, h: 16});
    options.hideProgress = hide.pbind('global_prg');
  }
  if (phv && (phv.showPhoto(photoId, listId, options) === false)) {
    return false;
  }
  var doShow = true;
  if (options.temp) {
    stManager.add(stat, function() {
      extend(cur, {pvBig: options.big, pvDark: options.dark, pvCancelLoad: function() {
        doShow = false;
      }});
      if (!cur.pvData) cur.pvData = {};
      cur.pvData.temp = [options.temp];
      photoview.show('temp', 0);
    });
  }
  extend(options, {onDone: function(lst) {
    photoview.list(photoId, listId, lst);
    photoview.loaded.apply(window, arguments);
    if (!doShow) return;
    photoview.showPhoto(photoId, listId, options, true);
  }, stat: stat, cache: 1});
    alert('post1');
  ajax.post('http://vkontakte.ru/al_photos.php', {act: 'show', photo: photoId, list: listId}, options);
    alert('post2');
  return false;
}

function showVideo(videoId, listId, options, ev) {
  if (checkEvent(ev)) return true;

  if (window.mvcur && mvcur.mvShown && mvcur.minimized && mvcur.videoRaw == videoId) {
    videoview.unminimize();
    return false;
  }

  var stat = ['videoview.js', 'videoview.css'];

  var hub = new callHub(function() {
    videoview.showVideo.apply(videoview, hub.data);
  }, 2);

  if (!options) {
    options = {};
  }

  stManager.add(stat, function() {
    videoview.show(ev, videoId, listId, options);
    hub.done();
  });

  extend(options, {onDone: function() {
    hub.data = arguments;
    hub.done();
  }, cache: (listId != 'status')});

  if (!options.params) {
    options.params = {act: 'show', video: videoId, list: listId, autoplay: (options.autoplay) ? 1 : 0, a: options.a};
  }
  ajax.post('al_video.php', options.params, options);
  return false;
}

function videoCallback(params) {
  var method = params.shift();
  debugLog(method, params);
  if (window.videoview && videoview.playerCallback[method]) {
    videoview.playerCallback[method].apply(videoview, params);
  } else {
    throw Error('Unregistered player callback: ' + method);
  }
}

function showDoneBox(msg, opts) {
  opts = opts || {};
  var l = (opts.w || 380) + 20;
  var style = opts.w ? ' style="width: ' + opts.w + 'px;"' : '';
  var pageW = bodyNode.offsetWidth,
      resEl = ce('div', {
      className: 'top_result_baloon_wrap fixed',
      innerHTML: '<div class="top_result_baloon"' + style + '>' + msg + '</div>'
  }, {left: (pageW - l) / 2});
  bodyNode.insertBefore(resEl, ge('page_wrap'));
  boxRefreshCoords(resEl);
  var out = opts.out || 2000;
  var _fadeOut = function() {
    setTimeout(function () {
      if (opts.permit && !opts.permit()) {
        _fadeOut();
        return;
      }
      fadeOut(resEl.firstChild, 500, function () {
        re(resEl);
        if (opts.callback) {
          opts.callback();
        }
      });
    }, out);
  }
  _fadeOut();
}

var ls = {
  checkVersion: function() {
    return (window.localStorage !== undefined && window.JSON !== undefined);
  },
  set: function(key, val) {
    this.remove(key);
    return (ls.checkVersion()) ? localStorage.setItem(key, JSON.stringify(val)) : false;
  },
  get: function(key) {
    if (!ls.checkVersion()) {
      return false;
    }
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return false;
    };
  },
  remove: function(key) {
    try { localStorage.removeItem(key); } catch(e) {};
  }
}


try{stManager.done('common.js');}catch(e){}
