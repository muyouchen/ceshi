/*
	选择元素
		支持css选择器
		document.querySelector(selector)//返回ele节点元素，获取页面上对应选择器的第一个元素
		document.querySelectorAll(selector);//返回集合，获取页面上对应选择器的元素集合
 */
function $(selector){
	if(document.querySelectorAll){
		var list = document.querySelectorAll(selector);
		// 如果得到的列表只有一个，则直接返回element元素节点
		return list.length==1 ? list[0] : list;
	}else{
		// 判断selector是否为id
		if(/^#document.querySelector\w+/.test(selector)){
			return document.getElementById(selector.substring(1));
		}

		// selector是否为类选择器
		else if(/^\.\w+/.test(selector)){
			return document.getElementsByClassName(selector.substring(1));
		}else{
			return document.getElementsByTagName(selector);
		}
	}
}
// $('#box');
// $('.box span');
// $('span > a');
// $('span.box.content');


/*
	ajax请求封装
		W3C:new XMLHttpRequest()
		IE：new ActiveXObject("Msxml2.XMLHTTP");
			new ActiveXObject("Microsoft.XMLHTTP");

		try{
	
		}catch(){
	
		}
 */
function ajax(opt){
	// type,url,async,callback
	opt = opt || {};
	var defaults = {
		type:'get',
		async:true
	}

	// 合并默认值
	// for(var key in defaults){
	// 	if(opt[key] === undefined){
	// 		opt[key] = defaults[key];
	// 	}
	// }
	opt = extend(defaults,opt);

	var req;
	try{
		req = new XMLHttpRequest();
	}catch(e){
		try{
			req = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){
			try{
				req = new ActiveXObject("Microsoft.XMLHTTP");
			}catch(e){
				alert('你的浏览器太low了，赶紧换吧');
				return;
			}
		}
	}
	req.onreadystatechange = function(){
		if(req.readyState == 4 && req.status == 200){
			opt.callback(JSON.pare(req.responseText));
		}
	}
	req.open(opt.type,opt.url,opt.async);
	req.send();
}
// ajax({type:'get',url:'xxx',async:true,callback:function(data){}})
// ajax({url:'xx',callback:function(data){}});
// 

function extend(defaults,opt){
	var obj = opt || {};
	for(var key in defaults){
		if(obj[key] === undefined){
			obj[key] = defaults[key];
		}
	}
	return obj;
}

/*d
	事件绑定函数
		addEvent(ele,type,fn,capture)
			ele:绑定事件的元素对象
			type:事件名
			fn:事件处理函数
			capture:是否捕获
 */
function addEvent(ele,type,fn,capture){
	capture  = capture || false;

	// 如果传进来的是id
	if(typeof ele === 'string'){
		ele = document.getElementById(ele);
	}
	if(ele.addEventListener){
		ele.addEventListener(type,fn,capture);
	}else{
		ele.attachEvent('on'+type,fn);
	}
}


/*
	获取外部样式函数
	getStyle(ele,attr)
		ele:元素对象
		attr:css属性
 */
function getStyle(ele,attr){
	// 如果传进来的是id
	if(typeof ele === 'string'){
		ele = document.getElementById(ele);
	}

	// 判断浏览器，并返回值
	var _style = window.getComputedStyle ? getComputedStyle(ele)[attr] : ele.currentStyle[attr]
	return _style ? _style : 0;
}



/*
	获取min到max的随机数
 */
function getRandomNum(min,max){
	return parseInt(Math.random()*(max-min + 1)) + min;
}

/*
	获取随机颜色
 */
function getRandomColor(){
	return 'rgb('+ getRandomNum(0,255) + ','+ getRandomNum(0,255) + ','+ getRandomNum(0,255) + ')';
}


/*
	获取cookie
		getCookie(cookie)
		{username:xxx,password:'123456'}
 */
function getCookie(name){
	var cookie = document.cookie;
	var cookies = cookie.split('; ');

	// 把数组转成对象
	var cookieObj = {};
	for(var i=0;i<cookies.length;i++){
		var _obj = cookies[i].split('=');
		cookieObj[_obj[0]] = _obj[1];
	}

	return cookieObj[name];
}

/*
	添加cookie
		setCookie(name,value,expires,domain)
 */
function setCookie(name,value,expires,domain){
	var cookie = name + '='+value;

	// 有失效日期时
	if(expires){
		cookie +=';expires='+expires
	}

	// 有域名限制时
	if(domain){
		cookie += ';domain=' +  domain
	}

	// 写入cookie
	document.cookie = cookie;
}
//setCookie('username','abc',date);
//document.cookie = 'username=abc;expires='+date

/*
	删除cookie
	removeCookie(name)
 */
function removeCookie(name){
	var now = new Date();
	// 通过设置失效时间来达到删除cookie的效果
	document.cookie = name +'=0;expires='+now;
}

/*
	动画函数
	ele:改变样式的元素对象
	opt:目标属性
	callback:回调函数，动画完成后执行
 */
function animate(ele,opt,callback){
	time = opt.time || 50;

	// 如果当前存在正在执行的动画，先清除
	if(ele.timerList && ele.timerList.length){
		for(var name in ele.timerList){
			// if(name == 'length') continue;
			clearAnimate(name);
			typeof callback === 'function' && callback();
		}
	}

	// 开始动画
	// 为当前ele对象创建一个存放定时器的属性timerList
	ele.timerList = {};

	// 创建一个不可枚举的length属性
	// 不可通过for..in获取
	Object.defineProperty(ele.timerList,'length',{enumerable:false,writable:true,value:0});

	// 为每个属性创建一个定时器，实现多个动画同时执行
	for(var attr in opt){
		(function(attr){
			// 为每个属性设一个定时器
			ele.timerList[attr] = setInterval(function(){
				//当前样式
				var currentStyle = parseFloat(getStyle(ele,attr));
				var speed = (opt[attr] - currentStyle)/8;

				//opacity速度
				var ospped = speed>0 ? .1 : -.1;

				// 其他属性速度
				speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);

				// 变化到目标属性值时清除定时器
				if(currentStyle == opt[attr]){
					clearAnimate(attr);
					if(ele.timerList.length == 0){
						typeof callback === 'function' && callback();
					}
					return;
				}
				if(attr == "opacity"){
					ele.style.opacity = (currentStyle+ospped);
					ele.style.filter = "alpha(opacity="+(currentStyle+ospped)*100+")";
				}else{
					ele.style[attr] = currentStyle + speed + 'px';
				}
			},time);
			ele.timerList.length++;
		})(attr);
	}

	// 清除定时器
	function clearAnimate(attr){
		clearInterval(ele.timerList[attr]);
		delete ele.timerList[attr];
		ele.timerList.length--;
	}
}