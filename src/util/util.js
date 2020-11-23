//1.加密解密方法使用：

//1.加密  
// var str = '124中文内容';  
// var base = new Base64();  
// var result = base.encode(str);  
//2.解密  
// var result2 = base.decode(result);  
//2.加密、解密算法封装：
// private property  
let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
export const Base64 = {
	// private method for UTF-8 encoding
	_utf8_encode: function(string){  
	    string = string.replace(/\r\n/g,"\n");  
	    var utftext = "";  
	    for (var n = 0; n < string.length; n++) {  
	        var c = string.charCodeAt(n);  
	        if (c < 128) {  
	            utftext += String.fromCharCode(c);  
	        } else if((c > 127) && (c < 2048)) {  
	            utftext += String.fromCharCode((c >> 6) | 192);  
	            utftext += String.fromCharCode((c & 63) | 128);  
	        } else {  
	            utftext += String.fromCharCode((c >> 12) | 224);  
	            utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
	            utftext += String.fromCharCode((c & 63) | 128);  
	        }  
	
	    }  
	    return utftext;  
	},
	
	// private method for UTF-8 decoding  
	_utf8_decode: function(utftext){  
	    var string = "";  
	    var i = 0;  
	    var c = 0;
		var c1 = 0;
		var c2 = 0;
	    while ( i < utftext.length ) {  
	        c = utftext.charCodeAt(i);  
	        if (c < 128) {  
	            string += String.fromCharCode(c);  
	            i++;  
	        } else if((c > 191) && (c < 224)) {  
	            c2 = utftext.charCodeAt(i+1);  
	            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
	            i += 2;  
	        } else {  
	            c2 = utftext.charCodeAt(i+1);  
	            c3 = utftext.charCodeAt(i+2);  
	            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
	            i += 3;  
	        }  
	    }  
	    return string;  
	},
    // public method for encoding  
    encode: function(input){
        var output = "";  
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = this._utf8_encode(input);  
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
    },

    // public method for decoding  
    decode: function(input){
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
        output = this._utf8_decode(output);  
        return output;  
    },
};

/**   根据节点生成tree数据
 * @param {Object} data   需要转换的数据
 * @param {String} sid 本身id唯一参数
 * @param {String} pid 父级id参数
 * 
 */
export const toTree = function(data, sid, pid) {
  // 删除 所有 children,以防止多次调用
  data.forEach(function(item) {
    delete item.children;
  });

  // 将数据存储为 以 sid 为 KEY 的 map 索引数据列
  var map = {};
  data.forEach(function(item) {
    item.id = item[sid];
    map[item.id] = item;
  });
  var val = [];
  data.forEach(function(item) {
    // 以当前遍历项的pid,去map对象中找到索引的sid
    var parent = map[item[pid]];
    // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
      val.push(item);
    }
  });
  return val;
};
