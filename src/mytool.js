var optimizeCb = function (func, context) {
  return func.call(context);
};
var cb = function (value) {
  if (value == null) return t.identity;
  if (t.isFunction(value)) return value;
  return t.property(value);
};



var t = {
  sum: function (arr, pre) {
    var sum = 0;
    pre = cb(pre);
    arr.forEach(function (item) {
      sum += pre(item);
    })
    return sum
  },
  extent: function (arr, pre) {
    var max = -Infinity;
    var min = Infinity;
    pre = cb(pre);
    arr.forEach(function (item) {
      var num = pre(item);
      max = num > max ? num : max;
      min = num > min ? min : num;
    })
    return [min, max];
  },
  max: function (arr, pre) {
    var max = -Infinity;
    pre = cb(pre);
    arr.forEach(function (item) {
      var num = pre(item);
      max = num > max ? num : max;
    })
    return max
  },
  makeArray: function (arrLike) {
    var arr = new Array(arrLike.length);
    for (var i = 0; i < arrLike.length; i++) {
      arr[i] = arrLike[i];
    }
    return arr;
  },
  getArray: function (arr, pre) {
    var result = [];
    pre = cb(pre);
    arr.forEach(function (item) {
      result.push(pre(item));
    })
    return result;
  },
  spliceArr: function (arr, pre) {
    var result1 = [];
    var result2 = [];
    pre = cb(pre);
    arr.forEach(function (item, i) {
      pre(item) ? result1.push(item) : result2.push(item)
    });
    return [result1, result2];
  },
  copy: function (obj) {
    var no;
    if (obj instanceof Array) {
      no = new Array(obj.length);
      for (let idx = 0; idx < obj.length; idx++) {
        if (typeof obj[idx] === 'object') {
          no[idx] = this.copy(obj[idx]);
        } else {
          no[idx] = obj[idx]
        }
      }
    } else if (typeof obj === 'object') {
      no = {};
      for (var key in obj) {
        if (typeof obj[key] === 'object') {
          no[key] = this.copy(obj[key]);
        } else {
          no[key] = obj[key]
        }
      }
    }
    return no;
  },
  arr2obj: function (arr, pre) {
    var result = {};
    pre = cb(pre);
    arr.forEach(function (item, i) {
      var key = pre(item);
      key = t.isObject(key) ? i : key;
      result[key] = item;
    })
    return result;
  },
  obj2arr: function (obj, pre) {
    var result = [];
    pre = cb(pre);
    for (var key in obj) {
      var item = obj[key];
      item._key = key;
      result.push(item);
    }
    return result;
  },
  identity: function (value) {
    return value;
  },
  property: function (key) {
    return function (item) {
      return item[key]
    };
  },
  isObject: function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  },
  limitLength: function (value, l) {
    return value && value.length > l ? value.substr(0, l - 1) + '...' : value;
  },
  setCookie: function (k, v) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = k + "=" + t.encode(v) + ";expires=" + exp.toGMTString();
  },
  getCookie: function (k) {
    var arr, reg = new RegExp("(^| )" + k + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
      return t.decode(arr[2]);
    else
      return null;
  }
};
t.dateformat = function (date, fmt) {
  date = date instanceof Date ? date : new Date(date);
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "H+": date.getHours() > 12 ? date.getHours() - 12 : date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};
t.numformat = function (num) {
  var num = (num || 0).toString(),
    result = '';
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) { result = num + result; }
  return result;
}
t.getDate = function (daystep) {
  daystep = typeof daystep === 'number' ? daystep : 0;
  return new Date().getTime() + daystep * 24 * 3600 * 1000;
};
// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError. Copey form Underscore
['Arguments', 'String', 'Number', 'Date', 'RegExp', 'Error'].forEach(function (name) {
  t['is' + name] = function (obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
});
t.isFunction = function (obj) {
    return obj && obj instanceof Function;
  }
  // private property 
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


// private method for UTF-8 encoding 
var _utf8_encode = function (string) {
  string = string.replace(/\r\n/g, "\n");
  var utftext = "";
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }

  }
  return utftext;
}

// private method for UTF-8 decoding 
var _utf8_decode = function (utftext) {
  var string = "";
  var i = 0;
  var c1;
  var c2;
  var c3;
  var c = c1 = c2 = 0;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return string;
}

// public method for encoding 
t.encode = function (input) {
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;
  input = _utf8_encode(input);
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output +
      _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
      _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
  }
  return output;
}

// public method for decoding 
t.decode = function (input) {
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++));
    enc2 = _keyStr.indexOf(input.charAt(i++));
    enc3 = _keyStr.indexOf(input.charAt(i++));
    enc4 = _keyStr.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  output = _utf8_decode(output);
  return output;
}
export default t;
