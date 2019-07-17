//var IMAGESPATH = 'images/'; //图片路径配置
var IMAGESPATH = 'plugins/attention/zDialog/skins/blue/'; //图片路径配置
var HideScrollbar=true;//弹出Dialog时是否隐藏滚动条
/*************************一些公用方法和属性****************************/
var agt =   window.navigator.userAgent;
var isIE = agt.toLowerCase().indexOf("msie") != -1;
var isGecko = agt.toLowerCase().indexOf("gecko") != -1;
var ieVer = isIE ? parseInt(agt.split(";")[1].replace(/(^\s*)|(\s*$)/g,"").split(" ")[1]) : 0;
var isIE8 = !!window.XDomainRequest && !!document.documentMode;
var isIE7 = ieVer==7 && !isIE8;
var ielt7 = isIE && ieVer<7;
 
if(isIE)
        try{ document.execCommand('BackgroundImageCache',false,true); }catch(e){}
 
var $id = function (id) {
    return typeof id == "string" ? document.getElementById(id) : id;
};
//if (!window.$) var $ = $id;
function stopEvent(evt){//阻止一切事件执行,包括浏览器默认的事件
        evt = window.event||evt;
        if(!evt){
                return;
        }
        if(isGecko){
                evt.preventDefault();
                evt.stopPropagation();
        }
        evt.cancelBubble = true;
        evt.returnValue = false;
}
 
// Array.prototype.remove = function (s, dust) { //如果dust为ture，则返回被删除的元素
//     if (dust) {
//         var dustArr = [];
//         for (var i = 0; i < this.length; i++) {
//             if (s == this[i]) {
//                 dustArr.push(this.splice(i, 1)[0]);
//             }
//         }
//         return dustArr;
//     }
//     for (var i = 0; i < this.length; i++) {
//         if (s == this[i]) {
//             this.splice(i, 1);
//         }
//     }
//     return this;
// };
if(!isIE&&HTMLElement){
        if(!HTMLElement.prototype.attachEvent){
                window.attachEvent = document.attachEvent = HTMLElement.prototype.attachEvent = function(evtName,func){
                        evtName = evtName.substring(2);
                        this.addEventListener(evtName,func,false);
                };
                window.detachEvent = document.detachEvent = HTMLElement.prototype.detachEvent = function(evtName,func){
                        evtName = evtName.substring(2);
                        this.removeEventListener(evtName,func,false);
                };
        }
}
var $topWindow = function () {
    var parentWin = window;
  /*  while (parentWin != parentWin.parent) {
        if (parentWin.parent.document.getElementsByTagName("FRAMESET").length > 0) break;
        parentWin = parentWin.parent;
    }*/
    return parentWin;
};
var $bodyDimensions = function (win) {
    win = win || window;
    var doc = win.document;
    var cw = doc.compatMode == "BackCompat" ? doc.body.clientWidth : doc.documentElement.clientWidth;
    var ch = doc.compatMode == "BackCompat" ? doc.body.clientHeight : doc.documentElement.clientHeight;
    var sl = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
    var st = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop); //考虑滚动的情况
    var sw = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    var sh = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight); //考虑滚动的情况
    var w = Math.max(sw, cw); //取scrollWidth和clientWidth中的最大值
    var h = Math.max(sh, ch); //IE下在页面内容很少时存在scrollHeight<clientHeight的情况
    return {
        "clientWidth": cw,
        "clientHeight": ch,
        "scrollLeft": sl,
        "scrollTop": st,
        "scrollWidth": sw,
        "scrollHeight": sh,
        "width": w,
        "height": h
    };
};
 
var fadeEffect = function(element, start, end, speed, callback){//透明度渐变：start:开始透明度 0-100；end:结束透明度 0-100；speed:速度1-100
        if(!element.effect)
                element.effect = {fade:0, move:0, size:0};
        clearInterval(element.effect.fade);
        var speed=speed||20;
        element.effect.fade = setInterval(function(){
                start = start < end ? Math.min(start + speed, end) : Math.max(start - speed, end);
                element.style.opacity =  start / 100;
                element.style.filter = "alpha(opacity=" + start + ")";
                if(start == end){
                        clearInterval(element.effect.fade);
                        if(callback)
                                callback.call(element);
                }
        }, 20);
};
 
/*************************弹出框类实现****************************/
var topWin = $topWindow();
var topDoc = topWin.document;
var WinDialog = function () {
    /****以下属性以大写开始，可以在调用show()方法前设置值****/
    this.ID = null;
    this.Width = null;
    this.Height = null;
    this.Url = null;
    this.OnLoad=null;
    this.InnerHtml = "";
    this.InvokeElementId = "";
    this.Top = "50%";
    this.Left = "50%";
    this.Title = "";
    this.OKEvent = null; //点击确定后调用的方法
    this.CancelEvent = null; //点击取消及关闭后调用的方法
    this.ShowButtonRow = false;
    this.MessageIcon = "window.gif";
    this.MessageTitle = "";
    this.Message = "";
    this.ShowMessageRow = false;
    this.Modal = true;
    this.Drag = true;
    this.AutoClose = null;
    this.ShowCloseButton = true;
    this.Animator = true;
    this.MsgForESC = "";
    /****以下属性以小写开始，不要自行改变****/
    this.dialogDiv = null;
    this.bgDiv=null;
    this.opener = null;
    this.innerFrame = null;
    this.innerWin = null;
    this.innerDoc = null;
    this.zindex = 9999999;
    this.cancelButton = null;
    this.okButton = null;
    this.IsMaximize = false;//是否显示最大化窗口按钮
    this.Folding = false;//是否显示折叠按钮
    this.showTop="false";//是否显示运维head
    this.showHeadHeight=80;//显示的head的高度
 
    if (arguments.length > 0 && typeof(arguments[0]) == "string") { //兼容旧写法
        this.ID = arguments[0];
    } else if (arguments.length > 0 && typeof(arguments[0]) == "object") {
        WinDialog.setOptions(this, arguments[0]);
    }
    if(!this.ID)
    this.ID = topWin.WinDialog._Array.length + "";
        
    //初始化弹出窗口高、宽度   
    initialHeight = null;
    initialWidth = null;
};
WinDialog._Array = [];
WinDialog.bgDiv = null;
WinDialog.setOptions = function (obj, optionsObj) {
    if (!optionsObj) return;
    for (var optionName in optionsObj) {
        obj[optionName] = optionsObj[optionName];
    }
};
WinDialog.attachBehaviors = function () {
        document.attachEvent("onkeydown", WinDialog.onKeyDown);
        window.attachEvent('onresize', WinDialog.resetPosition);
        if(!HideScrollbar&&ielt7)
                window.attachEvent("onscroll", WinDialog.resetPosition);
};
WinDialog.prototype.attachBehaviors = function () {
        var self = this;
    if (this.Drag && topWin.Drag){//注册拖拽方法
                var dragHandle=topWin.$id("_Draghandle_" + this.ID),dragBody=topWin.$id("_DialogDiv_" + this.ID);
                topWin.Drag.init(dragHandle, dragBody);
                dragBody.onDragStart = function (left,top,mouseX,mouseY) {
                        if (!isIE && self.Url) { //非ie浏览器下在拖拽时用一个层遮住iframe，以免光标移入iframe失去拖拽响应
                                topWin.$id("_Covering_" + self.ID).style.display = "";
                        }
                };
                dragBody.onDragEnd = function(left,top,mouseX,mouseY){
                        if (!isIE && self.Url) {
                                topWin.$id("_Covering_" + self.ID).style.display = "none";
                        }
                        var bd = $bodyDimensions(topWin);
                        if(left<0)
                                this.style.left='0px';
                        if(left+this.clientWidth>bd.clientWidth)
                                this.style.left=bd.clientWidth-this.clientWidth+'px';
                        if(ielt7){
                                if(top<bd.scrollTop)
                                        this.style.top=bd.scrollTop+'px';
                                if(top+33>bd.scrollTop+bd.clientHeight)
                                        this.style.top=bd.scrollTop+bd.clientHeight-33+'px';
                        }else{
                                if(top<0)
                                        this.style.top='0px';
                                if(top+33>bd.clientHeight)
                                        this.style.top=bd.clientHeight-33+'px';
                        }
                };
        }
};
WinDialog.prototype.displacePath = function () {
    if (this.Url && (this.Url.substr(0, 7) == "http://" || this.Url.substr(0, 1) == "/" || this.Url.substr(0, 11) == "javascript:")) {
        return this.Url;
    } else {
        var thisPath = this.Url;
        var locationPath = window.location.href;
        locationPath = locationPath.substring(0, locationPath.lastIndexOf('/'));
        while (thisPath.indexOf('../') >= 0) {
            thisPath = thisPath.substring(3);
            locationPath = locationPath.substring(0, locationPath.lastIndexOf('/'));
        }
        return locationPath + '/' + thisPath;
    }
};
WinDialog.prototype.setPosition = function () {
    var bd = $bodyDimensions(topWin);
    var thisTop = this.Top,
        thisLeft = this.Left,
                thisdialogDiv=this.getDialogDiv();
    if (typeof this.Top == "string" && this.Top.substring(this.Top.length - 1, this.Top.length) == "%") {
        var percentT = this.Top.substring(0, this.Top.length - 1) * 0.01;
                        thisTop =ielt7?bd.clientHeight * percentT - thisdialogDiv.scrollHeight * percentT + bd.scrollTop:bd.clientHeight * percentT - thisdialogDiv.scrollHeight * percentT;
    }
    if (typeof this.Left == "string" && this.Left.substring(this.Left.length - 1, this.Left.length) == "%") {
        var percentL = this.Left.substring(0, this.Left.length - 1) * 0.01;
        thisLeft = ielt7?bd.clientWidth * percentL - thisdialogDiv.scrollWidth * percentL + bd.scrollLeft:bd.clientWidth * percentL - thisdialogDiv.scrollWidth * percentL;
    }
    if(this.showTop == "true" && false){
   	 	thisdialogDiv.style.top = Math.round(thisTop) + "px";
   }else{
	   	try{
				top.window.document;
				if(top.window.document && !top.window.document.getElementById("mapDiv")){
					this.showHeadHeight=0;//运维中使用
				}
			}catch(e){
				this.showHeadHeight=0;//运维中使用
			}
		if(this.ID =="printMapDialog"){
			this.showHeadHeight=-thisTop;
		}
	   	thisdialogDiv.style.top = Math.round(thisTop+this.showHeadHeight) + "px";
   }
    thisdialogDiv.style.left = Math.round(thisLeft) + "px";
};
WinDialog.setBgDivSize = function () {
    var bd = $bodyDimensions(topWin);
    if(WinDialog.bgDiv){
        if(ielt7){
                WinDialog.bgDiv.style.height = bd.clientHeight + "px";
                WinDialog.bgDiv.style.top=bd.scrollTop + "px";
                WinDialog.bgDiv.childNodes[0].style.display = "none";//让div重渲染,修正IE6下尺寸bug
                WinDialog.bgDiv.childNodes[0].style.display = "";
        }else{
                WinDialog.bgDiv.style.height = bd.scrollHeight + "px";
        }
	}
};
WinDialog.resetPosition = function () {
    WinDialog.setBgDivSize();
    for (var i = 0, len = topWin.WinDialog._Array.length; i < len; i++) {
        topWin.WinDialog._Array[i].setPosition();
    }
};
WinDialog.prototype.create = function () {
    var bd = $bodyDimensions(topWin);
    if (typeof(this.OKEvent)== "function") this.ShowButtonRow = true;
    if (!this.Width) this.Width = Math.round(bd.clientWidth * 4 / 10);
    if (!this.Height) this.Height = Math.round(this.Width / 2);
    if (this.MessageTitle || this.Message) this.ShowMessageRow = true;
    var DialogDivWidth = this.Width + 13 + 13;
    var DialogDivHeight = this.Height + 33 + 13 + (this.ShowButtonRow ? 40 : 0) + (this.ShowMessageRow ? 50 : 0);
 
    if (DialogDivWidth > bd.clientWidth) this.Width = Math.round(bd.clientWidth - 26);
    if (DialogDivHeight > bd.clientHeight) this.Height = Math.round(bd.clientHeight - 46 - (this.ShowButtonRow ? 40 : 0) - (this.ShowMessageRow ? 50 : 0));
    /*var html = '\
 <table id="_DialogTable_' + this.ID + '" width="' + (this.Width + 26) + '" cellspacing="0" cellpadding="0" border="0" onselectstart="return false;" style="-moz-user-select: -moz-none; font-size:12px; line-height:1.4;border-collapse: collapse;">\
   <tr id="_Draghandle_' + this.ID + '" style="' + (this.Drag ? "cursor: move;" : "") + '">\
     <td width="13" height="33" style="background-image: url(' + IMAGESPATH + 'dialog_lt.png) !important;background: url(' + IMAGESPATH + 'dialog_lt.gif) no-repeat 0 0;"><div style="width: 13px;"></div></td>\
     <td height="33" style="background-image:url(' + IMAGESPATH + 'dialog_ct.png) !important;background: url(' + IMAGESPATH + 'dialog_ct.gif) repeat-x top;"><div style="padding: 9px 0 0 4px; float: left; font-weight: bold; color:#fff;"><img align="absmiddle" src="' + IMAGESPATH + 'icon_dialog.gif"/><span id="_Title_' + this.ID + '">' + this.Title + '</span></div>\
     <div onclick="Dialog.getInstance(\'' + this.ID + '\').cancelButton.onclick.apply(Dialog.getInstance(\'' + this.ID + '\').cancelButton,[]);" onmouseout="this.style.backgroundImage=\'url(' + IMAGESPATH + 'dialog_closebtn.gif)\'" onmouseover="this.style.backgroundImage=\'url(' + IMAGESPATH + 'dialog_closebtn_over.gif)\'" style="margin: 4px 0 0;*margin-top: 5px; position: relative;top:auto; cursor: pointer; float: right; height: 17px; width: 28px; background: url(' + IMAGESPATH + 'dialog_closebtn.gif) 0 0;' + (ielt7 ? "margin-top: 3px;" : "") + (this.ShowCloseButton ? "" : "display:none;") + '"></div>'+maximizeHtml+'</td>\
     <td width="13" height="33" style="background-image: url(' + IMAGESPATH + 'dialog_rt.png) !important;background: url(' + IMAGESPATH + 'dialog_rt.gif) no-repeat right 0;"><div style="width: 13px;"><a id="_forTab_' + this.ID + '" href="#;"></a></div></td>\
   </tr>\
   <tr valign="top" id="_DialogTable_Contain_'+this.ID+'">\
     <td width="13" style="background-image: url(' + IMAGESPATH + 'dialog_mlm.png) !important;background: url(' + IMAGESPATH + 'dialog_mlm.gif) repeat-y left;"></td>\
     <td align="center"><table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">\
         <tr id="_MessageRow_' + this.ID + '" style="' + (this.ShowMessageRow ? "" : "display:none") + '">\
           <td valign="top" height="50"><table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eaece9 url(' + IMAGESPATH + 'dialog_bg.jpg) no-repeat scroll right top;" id="_MessageTable_' + this.ID + '">\
               <tr>\
                 <td width="50" height="50" align="center"><img width="32" height="32" src="' + IMAGESPATH + this.MessageIcon + '" id="_MessageIcon_' + this.ID + '"/></td>\
                 <td align="left" style="line-height: 16px;"><div id="_MessageTitle_' + this.ID + '" style="font-weight:bold">' + this.MessageTitle + '</div>\
                   <div id="_Message_' + this.ID + '">' + this.Message + '</div></td>\
               </tr>\
             </table></td>\
         </tr>\
         <tr>\
           <td valign="top" align="center"><div id="_Container_" style="position: relative; width: ' + this.Width + 'px; height: ' + this.Height + 'px;">\
               <div style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0.5;" id="_Covering_' + this.ID + '">&nbsp;</div>\
        ' + (function (obj) {
        if (obj.InnerHtml) return obj.InnerHtml;
        if (obj.Url) return '<iframe width="100%" height="100%" frameborder="0" style="border:none 0;" id="_DialogFrame_' + obj.ID + '" src="' + obj.displacePath() + '"></iframe>';
        return "";*/
    if(!this.Title){
    	this.Title = "系统提示";
    }
    
    var html = '\
    	 <div style="box-shadow:0 0 6px #464646;background-color:white;" onmouseover="showOpacity(\''+this.ID+'\',\'over\')" onmouseout="showOpacity(\''+this.ID+'\',\'out\')">\
    	 <table id="_DialogTable_' + this.ID + '" width="' + (this.Width + 2) + '" cellspacing="0" cellpadding="0" border="0" onselectstart="return false;" style="-moz-user-select: -moz-none; font-size:12px; line-height:1.4;border-collapse: inherit;">'+
    	 	//弹出框顶部
    	   '<tr id="_Draghandle_' + this.ID + '" style="' + (this.Drag ? "cursor: move;" : "") + '">'+
    	   	//上边框左上角背景颜色
    	     //'<td width="3" height="33" style=""><div style="width:3px;height:33px;background-color:gray;"></div></td>'+
    	     //上边框背景颜色
    	    '<td colspan="3" style="color:#454545;"><div id="_Title_'+this.ID+'" style="height:28px;border-bottom:1px solid #CCCCCC;color:#6B6B6B;"><div id="title_'+this.ID+'" style="position:absolute;top:6px;left:10px;font-size:13px;font-weight:bold;white-space:nowrap;cursor:pointer;" onclick="WinDialog.getInstance(\'' + this.ID + '\').folding(\'open\',\''+this.ID+'\')"  onmousedown="mousedown()" onmouseup="mouseup(\''+this.ID+'\')">'+this.Title+'</div><span id="operationBtn_'+this.ID+'">';
    		var defaultRightWidth = "24px";
		    if(this.IsMaximize){//最大化按钮
		    	defaultRightWidth = "43px";
		    	html += '<i class="iconfont icon-zuidahua" style="cursor:pointer;position:absolute;top:0px;right:21px;font-size:21px;color:#888;" title="最大化"  onmouseover="btnMouse(this,\'over\')"  onmouseout="btnMouse(this,\'out\')" onclick="resizeWindow(this,\''+this.ID+'\')"></i>';
		    }
    	    if(this.Folding){//折叠按钮
    	    	html += '<i id="folding_'+this.ID+'" class="iconfont icon-suoxiao" style="cursor:pointer;position:absolute;top:4px;right:'+defaultRightWidth+';font-size:16px;color:#888;" title="收缩"  onmouseover="btnMouse(this,\'over\')"  onmouseout="btnMouse(this,\'out\')" onclick="WinDialog.getInstance(\'' + this.ID + '\').folding(\'folding\',\''+this.ID+'\')"></i>';
    	    }
    	    //关闭按钮
    	    html += '<i class="iconfont icon-icon-" style="cursor:pointer;position:absolute;top:2px;right:5px;font-size:18px;color:#888;" title="关闭" onmouseover="btnMouse(this,\'over\')"  onmouseout="btnMouse(this,\'out\')" onclick="WinDialog.getInstance(\'' + this.ID + '\').cancelButton.onclick.apply(WinDialog.getInstance(\'' + this.ID + '\').cancelButton,[]);"></i>'+//WinDialog.getInstance(\'' + this.ID + '\').close();
    	     //上边框右上角背景颜色
    	     //'<td width="3" height="33" style="background-color:pink;"><div style="width:3px;"><a id="_forTab_' + this.ID + '" href="#;"></a></div></td>\
    	   '</span></div></td></tr>'+
    	   
    	   //弹出框左边
    	   '<tr valign="top" id="_DialogTable_Contain_'+this.ID+'">'+
    	   	//左边框背景颜色
    	     '<td width="1"></td>\
    	     <td align="center">'+
  	     	//该div用于拖拽使用
    	   '<div style="position: absolute; height: 100%; width: 100%; display: none; background-color:#fff; opacity: 0;" id="_Covering_' + this.ID + '">&nbsp;</div>\
    	   <div id="contentDiv_'+this.ID+'" style="height:'+this.Height+'px;width:'+this.Width+'px;">';
    	   	if(this.Url){
    	   		//弹出框内容Iframe
    	   			html+='<iframe width="100%" height="100%" frameborder="0"  id="_DialogFrame_' + this.ID + '" src="' + this.displacePath() + '"></iframe>';
    	   	}else if(this.InnerHtml){
    	   			html+=this.InnerHtml;
    	   	}
    	     	
    	   		html+='</div></td>'+
       //右边框背景颜色
     '<td width="1"></td>\
   </tr>\
   <tr>'+
      //下边框左下角背景颜色 
     //'<td width="13" height="13" style="background-color:blue;"></td>'+
     //下边框背景颜色 
     '<td id="dialogBottomBorder_'+this.ID+'" colspan="3" style="height:2px;"></td>'+
     //下边框右下角背景颜色 
     //'<td width="13" height="13" style="background-color:black;"><a onfocus=\'$id("_forTab_' + this.ID + '").focus();\' href="#;"></a></td>\
   '</tr>\
     <tr id="_ButtonRow_' + this.ID + '" style="' + (this.ShowButtonRow ? "" : "display:none") + '">\
     <td height="36"><div id="_DialogButtons_' + this.ID + '" style="border-top: 1px solid #DADEE5; padding: 8px 20px; text-align: center; background-color:#f6f6f6;">\
         <input type="button" value="确 定" class="button" id="_ButtonOK_' + this.ID + '"/>\
         <input type="button" value="取 消" class="button" onclick="WinDialog.getInstance(\'' + this.ID + '\').close();" id="_ButtonCancel_' + this.ID + '"/>\
       </div></td>\
   </tr>\
 </table>\
</div>\
';
    
    var div = topWin.$id("_DialogDiv_" + this.ID);
    if (!div) {
        div = topDoc.createElement("div");
        div.id = "_DialogDiv_" + this.ID;
        topDoc.getElementsByTagName("BODY")[0].appendChild(div);
    }
    div.style.position =ielt7?"absolute":"fixed";
    div.style.left = "-9999px";
    div.style.top = "-9999px";
    div.innerHTML = html;
    
    div.mouseover = function(){
    	showOpacity(div,"over"); 
    }
    div.mouseout = function(){
    	showOpacity(div,"out");
    }
    	
    if (this.InvokeElementId) {
        var element = $id(this.InvokeElementId);
        element.style.position = "";
        element.style.display = "";
        if (isIE) {
            var fragment = topDoc.createElement("div");
            fragment.innerHTML = element.outerHTML;
            element.outerHTML = "";
            topWin.$id("_Covering_" + this.ID).parentNode.appendChild(fragment);
        } else {
            topWin.$id("_Covering_" + this.ID).parentNode.appendChild(element);
        }
    }
    this.opener = window;
    if (this.Url) {
        if (topWin.$id("_DialogFrame_" + this.ID)) {
            this.innerFrame = topWin.$id("_DialogFrame_" + this.ID);
        };
        var self = this;
        this.innerFrameOnload = function () {
            try {
                                self.innerWin = self.innerFrame.contentWindow;
                                self.innerWin.ownerDialog = self;
                self.innerDoc = self.innerWin.document;
                if (self.Title=='　' && self.innerDoc && self.innerDoc.title) {
                    if (self.innerDoc.title) topWin.$id("_Title_" + self.ID).innerHTML = self.innerDoc.title;
                };
            } catch(e) {
                if (window.console && window.console.log) console.log("可能存在访问限制，不能获取到浮动窗口中的文档对象。");
            }
            if (typeof(self.OnLoad)== "function")self.OnLoad();
        };
        if (!isGecko) {
            this.innerFrame.attachEvent("onreadystatechange", function(){//在ie下可以给iframe绑定onreadystatechange事件
                                if((/loaded|complete/).test(self.innerFrame.readyState)){
                                        self.innerFrameOnload();
                                }
                        });
            //this.innerFrame.attachEvent("onload", self.innerFrameOnload);
        } else {
                        this.innerFrame.contentWindow.addEventListener("load", function(){self.innerFrameOnload();}, false);//在firefox下iframe仅能够绑定onload事件
            //this.innerFrame.onload = self.innerFrameOnload;
        };
    };
    topWin.$id("_DialogDiv_" + this.ID).dialogId = this.ID;
    topWin.$id("_DialogDiv_" + this.ID).dialogInstance = this;
    this.attachBehaviors();
    this.okButton = topWin.$id("_ButtonOK_" + this.ID);
    this.cancelButton = topWin.$id("_ButtonCancel_" + this.ID);
        div=null;
};
WinDialog.prototype.setSize = function (w, h) {
    if (w && +w > 20) {
        this.Width = +w;
        topWin.$id("_DialogTable_" + this.ID).width = this.Width + 26;
        topWin.$id("_Container_" + this.ID).style.width = this.Width + "px";
    }
    if (h && +h > 10) {
        this.Height = +h;
        topWin.$id("_Container_" + this.ID).style.height = this.Height + "px";
    }
    this.setPosition();
};
WinDialog.prototype.show = function () {
    this.create();
    var bgdiv = WinDialog.getBgdiv(),
                thisdialogDiv=this.getDialogDiv();
    this.zindex = thisdialogDiv.style.zIndex = WinDialog.bgDiv.style.zIndex + 1;
    if (topWin.WinDialog._Array.length > 0) {
        this.zindex = thisdialogDiv.style.zIndex = topWin.WinDialog._Array[topWin.WinDialog._Array.length - 1].zindex + 2;
    } else {
        bgdiv.style.display = "none";
        if(HideScrollbar){
                var topWinBody = topDoc.getElementsByTagName(topDoc.compatMode == "BackCompat" ? "BODY" : "HTML")[0];
                topWinBody.styleOverflow = topWinBody.style.overflow;
                topWinBody.style.overflow = "hidden";
        }
    }
    topWin.WinDialog._Array.push(this);
    if (this.Modal) {
        bgdiv.style.zIndex = topWin.WinDialog._Array[topWin.WinDialog._Array.length - 1].zindex - 1;
        WinDialog.setBgDivSize();
                if(bgdiv.style.display == "none"){
                        if(this.Animator){
                                var bgMask=topWin.$id("_DialogBGMask");
                                bgMask.style.opacity = 0;
                                bgMask.style.filter = "alpha(opacity=0)";
                        bgdiv.style.display = "";
                                fadeEffect(bgMask,0,40,ielt7?20:10);
                                bgMask=null;
                        }else{
                        bgdiv.style.display = "";
                        }
                }
    }
    this.setPosition();
    if (this.CancelEvent) {
        this.cancelButton.onclick = this.CancelEvent;
        if(this.ShowButtonRow)this.cancelButton.focus();
    }
    if (this.OKEvent) {
        this.okButton.onclick = this.OKEvent;
        if(this.ShowButtonRow)this.okButton.focus();
    }
    if (this.AutoClose && this.AutoClose > 0) this.autoClose();
    this.opened = true;
        bgdiv=null;
};
WinDialog.prototype.close = function () {
    var thisdialogDiv=this.getDialogDiv();
    if (this == topWin.WinDialog._Array[topWin.WinDialog._Array.length - 1]) {
        var isTopDialog = topWin.WinDialog._Array.pop();
    } else {
        topWin.WinDialog._Array.remove(this);
    }
    if (this.InvokeElementId) {
        var innerElement = topWin.$id(this.InvokeElementId);
        innerElement.style.display = "none";
        if (isIE) {
            //ie下不能跨窗口拷贝元素，只能跨窗口拷贝html代码
            var fragment = document.createElement("div");
            fragment.innerHTML = innerElement.outerHTML;
            innerElement.outerHTML = "";
            document.getElementsByTagName("BODY")[0].appendChild(fragment);
        } else {
            document.getElementsByTagName("BODY")[0].appendChild(innerElement);
        }
 
    }
    if (topWin.WinDialog._Array.length > 0) {
        if (this.Modal && isTopDialog) WinDialog.bgDiv.style.zIndex = topWin.WinDialog._Array[topWin.WinDialog._Array.length - 1].zindex - 1;
    } else {
        WinDialog.bgDiv.style.zIndex = "9999999";
        WinDialog.bgDiv.style.display = "none";
        if(HideScrollbar){
                var topWinBody = topDoc.getElementsByTagName(topDoc.compatMode == "BackCompat" ? "BODY" : "HTML")[0];
                if(topWinBody.styleOverflow != undefined)
                        topWinBody.style.overflow = topWinBody.styleOverflow;
        }
    }
    this.opener.focus();
    if (isIE) {
                /*****释放引用，以便浏览器回收内存**/
                thisdialogDiv.dialogInstance=null;
                this.innerFrame=null;
                //this.opener=null;
                this.bgDiv=null;
                if (this.CancelEvent){this.cancelButton.onclick = null;};
                if (this.OKEvent){this.okButton.onclick = null;};
                topWin.$id("_DialogDiv_" + this.ID).onDragStart=null;
                topWin.$id("_DialogDiv_" + this.ID).onDragEnd=null;
                topWin.$id("_Draghandle_" + this.ID).onmousedown=null;
                topWin.$id("_Draghandle_" + this.ID).root=null;
                /**end释放引用**/
        thisdialogDiv.outerHTML = "";
                CollectGarbage();
    } else {
        var RycDiv = topWin.$id("_RycDiv");
        if (!RycDiv) {
            RycDiv = topDoc.createElement("div");
            RycDiv.id = "_RycDiv";
        }
        if(thisdialogDiv){
        RycDiv.appendChild(thisdialogDiv);
        RycDiv.innerHTML = "";
                RycDiv=null;
        }
    }
        thisdialogDiv=null;
    this.closed = true;
};
WinDialog.prototype.autoClose = function () {
    if (this.closed) {
        clearTimeout(this._closeTimeoutId);
        return;
    }
    this.AutoClose -= 1;
    topWin.$id("_Title_" + this.ID).innerHTML = this.AutoClose + " 秒后自动关闭";
    if (this.AutoClose <= 0) {
        this.close();
    } else {
        var self = this;
        this._closeTimeoutId = setTimeout(function () {
            self.autoClose();
        },
        1000);
    }
};
WinDialog.getInstance = function (id) {
    var dialogDiv = topWin.$id("_DialogDiv_" + id);
    if (!dialogDiv) alert("没有取到对应ID的弹出框页面对象");
        try{
        return dialogDiv.dialogInstance;
        }finally{
                dialogDiv = null;
        }
};
WinDialog.prototype.addButton = function (id, txt, func) {
    topWin.$id("_ButtonRow_" + this.ID).style.display = "";
    this.ShowButtonRow = true;
    var button = topDoc.createElement("input");
    button.id = "_Button_" + this.ID + "_" + id;
    button.type = "button";
    button.style.cssText = "margin-right:5px";
    button.value = txt;
    button.onclick = func;
    var input0 = topWin.$id("_DialogButtons_" + this.ID).getElementsByTagName("INPUT")[0];
    input0.parentNode.insertBefore(button, input0);
    return button;
};
WinDialog.prototype.removeButton = function (btn) {
    var input0 = topWin.$id("_DialogButtons_" + this.ID).getElementsByTagName("INPUT")[0];
    input0.parentNode.removeChild(btn);
};
WinDialog.getBgdiv = function () {
    if (WinDialog.bgDiv) return WinDialog.bgDiv;
    var bgdiv = topWin.$id("_DialogBGDiv");
    if (!bgdiv) {
        bgdiv = topDoc.createElement("div");
        bgdiv.id = "_DialogBGDiv";
        bgdiv.style.cssText = "position:absolute;left:0px;top:0px;width:100%;height:100%;z-index:9999999";
        var bgIframeBox = '<div style="position:relative;width:100%;height:100%;">';
                var bgIframeMask = '<div id="_DialogBGMask" style="position:absolute;background-color:#333;opacity:0.4;filter:alpha(opacity=40);width:100%;height:100%;"></div>';
                var bgIframe = ielt7?'<iframe src="about:blank" style="filter:alpha(opacity=0);" width="100%" height="100%"></iframe>':'';
                bgdiv.innerHTML=bgIframeBox+bgIframeMask+bgIframe+'</div>';
        topDoc.getElementsByTagName("BODY")[0].appendChild(bgdiv);
        if (ielt7) {
            var bgIframeDoc = bgdiv.getElementsByTagName("IFRAME")[0].contentWindow.document;
            bgIframeDoc.open();
            bgIframeDoc.write("<body style='background-color:#333' oncontextmenu='return false;'></body>");
            bgIframeDoc.close();
                        bgIframeDoc=null;
        }
    }
    WinDialog.bgDiv = bgdiv;
        bgdiv=null;
    return WinDialog.bgDiv;
};
WinDialog.prototype.getDialogDiv = function () {
        var dialogDiv=topWin.$id("_DialogDiv_" + this.ID)
        try{
                return dialogDiv;
        }finally{
                dialogDiv = null;
        }
};
WinDialog.onKeyDown = function (evt) {
        var evt=window.event||evt;
    if ((evt.shiftKey && evt.keyCode == 9)
                 ||evt.keyCode == 8) { //shift键及tab键,或backspace键
        if (topWin.WinDialog._Array.length > 0) {
                        var target = evt.srcElement||evt.target;
                        if(target.tagName!='INPUT'&&target.tagName!='TEXTAREA'){//如果在不在输入状态中
                                stopEvent(evt);
                                return false;
                        }
        }
    }
    if (evt.keyCode == 27) { //ESC键
        WinDialog.close();
    }
};
WinDialog.close = function (id) {
    if (topWin.WinDialog._Array.length > 0) {
        var diag = topWin.WinDialog._Array[topWin.WinDialog._Array.length - 1];
        if(diag.MsgForESC){
                        WinDialog.confirm(diag.MsgForESC,function(){diag.cancelButton.onclick.apply(diag.cancelButton, []);})
        }else{
                diag.cancelButton.onclick.apply(diag.cancelButton, []);
        }
    }
};
WinDialog.alert = function (msg, func, w, h) {
    var w = w || 300,
        h = h || 110;
    var diag = new WinDialog({
        Width: w,
        Height: h
    });
    diag.ShowButtonRow = true;
    diag.Title = "系统提示";
    diag.CancelEvent = function () {
        diag.close();
        if (func) func();
    };
    diag.InnerHtml = '<table height="100%" border="0" align="center" cellpadding="10" cellspacing="0">\
                <tr><td align="right"><img id="Icon_' + this.ID + '" src="' + IMAGESPATH + 'icon_alert.gif" width="34" height="34" align="absmiddle"></td>\
                        <td align="left" id="Message_' + this.ID + '" style="font-size:9pt">' + msg + '</td></tr>\
        </table>';
    diag.show();
    diag.okButton.parentNode.style.textAlign = "center";
    diag.okButton.style.display = "none";
    diag.cancelButton.value = "确 定";
    diag.cancelButton.focus();
};
WinDialog.confirm = function (msg, funcOK, funcCal, w, h) {
    var w = w || 300,
        h = h || 110;
    var diag = new WinDialog({
        Width: w,
        Height: h
    });
    diag.ShowButtonRow = true;
    diag.Title = "信息确认";
    diag.CancelEvent = function () {
        diag.close();
        if (funcCal) funcCal();
    };
    diag.OKEvent = function () {
        diag.close();
        if (funcOK) funcOK();
    };
    diag.InnerHtml = '<table height="100%" border="0" align="center" cellpadding="10" cellspacing="0">\
                <tr><td align="right"><img id="Icon_' + this.ID + '" src="' + IMAGESPATH + 'icon_query.gif" width="34" height="34" align="absmiddle"></td>\
                        <td align="left" id="Message_' + this.ID + '" style="font-size:9pt">' + msg + '</td></tr>\
        </table>';
    diag.show();
    diag.okButton.parentNode.style.textAlign = "center";
    diag.okButton.focus();
};
WinDialog.open = function (arg) {
    var diag = new WinDialog(arg);
    diag.show();
    return diag;
};
window.attachEvent("onload", WinDialog.attachBehaviors); 

var initWinObj = new Object();
var initialHeight,initialWidth,initTop,initLeft,initID,initTitleWidth;//存储初始化窗口高、宽度、上边距、左边距、ID、头部title宽度
//WinDialog弹出窗口最大化、最小化
function resizeWindow(btnObj,ID,navHeight){
	if($(btnObj).hasClass("iconfont icon-zuidahua")){//最大化
		btnObj.title = "最小化";
		$(btnObj).removeClass("iconfont icon-zuidahua").addClass("iconfont icon-zuidahua2");
		
		//设置图标大小、位置
		btnObj.style.fontSize = "20px";
		btnObj.style.top = "1px";
		btnObj.style.right = "22px";
		
		var initObj = new Object();
		//存储初始化窗口高、宽度、上边距、左边距、ID
		initObj["initID"] = ID;
		initObj["initTop"] = topWin.$id("_DialogDiv_"+ID).style.top;
		initObj["initLeft"] = topWin.$id("_DialogDiv_"+ID).style.left;
		initObj["initialHeight"] = topWin.$id("contentDiv_"+ID).style.height;
		initObj["initialWidth"] = topWin.$id("contentDiv_"+ID).style.width;
		initObj["initTitleWidth"] = topWin.$id("_DialogDiv_"+ID).style.width;
		//将每个弹出窗口初始化参数对象存入initWinObj所有弹出窗口对象中
		initWinObj[ID] = initObj;
		
		//设置弹出距离左、上边距
		topWin.$id("_DialogDiv_"+ID).style.top = "1px";
		topWin.$id("_DialogDiv_"+ID).style.left = "1px";
		
//		if(showTop == false){
//	    	 thisdialogDiv.style.top = Math.round(thisTop) + "px";
//	    }else{
//	    	thisdialogDiv.style.top = Math.round(thisTop+showHeadHeight) + "px";
//	    }
		
		//重新赋值弹出窗口高、宽度
		topWin.$id("contentDiv_"+ID).style.height = (document.documentElement.clientHeight-33)+"px";
		topWin.$id("contentDiv_"+ID).style.width = document.documentElement.clientWidth+"px";
		topWin.$id("_DialogDiv_"+ID).style.width = document.documentElement.clientWidth+"px";
		if(navHeight){
			topWin.$id("contentDiv_"+ID).style.height = (document.documentElement.clientHeight-33-navHeight)+"px";
		}
	}else{//最小化
		btnObj.title = "最大化";
		$(btnObj).removeClass("iconfont icon-zuidahua2").addClass("iconfont icon-zuidahua");
		
		//设置图标大小、位置
		btnObj.style.top = "0px";
		btnObj.style.right = "21px";
		btnObj.style.fontSize = "21px";
		
		//重新赋值窗口初始化高、宽度、上边距、左边距
		topWin.$id("_DialogDiv_"+ID).style.top = initWinObj[ID]["initTop"];
		topWin.$id("_DialogDiv_"+ID).style.left = initWinObj[ID]["initLeft"];
		topWin.$id("contentDiv_"+ID).style.height = initWinObj[ID]["initialHeight"];
		topWin.$id("contentDiv_"+ID).style.width = initWinObj[ID]["initialWidth"];
		topWin.$id("_DialogDiv_"+ID).style.width = initWinObj[ID]["initTitleWidth"];
	}
}

//鼠标移入、移出按钮事件
function btnMouse(btnObj,type){
	if(type == "over"){
		$(btnObj).css("color","#000");
	}else{
		$(btnObj).css("color","#888");
	}
	/*if(type == "over"){
		if($(btnObj).hasClass("iconfont icon-zuidahua") || $(btnObj).hasClass("iconfont icon-zuixiaohua1")){
			btnObj.style.fontSize = "18px";//最大化、最小化图标较大，所以像素直接加1就可以
		}else{
			btnObj.style.fontSize = "18px";
		}
	}else{
		if($(btnObj).hasClass("iconfont icon-zuidahua") || $(btnObj).hasClass("iconfont icon-zuixiaohua1")){
			btnObj.style.fontSize = "18px";
		}else{
			btnObj.style.fontSize = "18px";
		}
	}*/
}

var targetObj = new Object();//存储初始化div高度、弹出框title宽度、title名称宽度
var winObj = new Object();//存储所有弹出窗口对象

//最大最小化切换
WinDialog.prototype.resizeWindow=resizeWindow;

//折叠
WinDialog.prototype.folding = function(type,ID){
	var obj = document.getElementById("folding_"+ID);
	
	if(type == "folding"){//收缩
		targetObj = new Object();//初始化窗口对象
		targetObj["isOpenFlag"] = true;//单击弹出窗口title是否展开弹出框
		targetObj["isShowFlag"] = false;//弹出窗口是否已经展开
		
		var divHeight = $("#contentDiv_"+ID).css("height");
		//根据ID作为key，高度为value，多个弹出框一一对应
		targetObj["height_"+ID] = divHeight;
		//存储弹出框title宽度
		targetObj["width_"+ID] = $("#_DialogDiv_"+ID+"").css("width");
		//存储title名称宽度
		targetObj["titleWidth_"+ID] = $("#title_"+ID).css("width");
		//将当前窗口对象存储到winObj所有窗口对象中
		winObj[ID] = targetObj;
		calculateHeight(type,ID);
		//calculateHeight(-50,ID);//折叠重置div高度
	}else if(winObj && winObj[ID] && winObj[ID]["isOpenFlag"] && !winObj[ID]["isShowFlag"]){//展开
		//还原弹出框title宽度
		$("#_DialogDiv_"+ID).css("width",winObj[ID]["width_"+ID]);
		//还原弹出框title宽度
		$("#title_"+ID).css("width",winObj[ID]["titleWidth_"+ID]);
		$("#title_"+ID).css("overflow","auto");
		$("#_Title_"+ID).css("border-width","1px");
		//透明还原
		$("#_DialogDiv_"+ID).css("opacity","1");
		//显示头部右上角操作按钮
		$("#operationBtn_"+ID).show();
		calculateHeight(type,ID);
		//calculateHeight(50,ID);//展开重置div高度
	}
}
//折叠、展开重置div高度
function calculateHeight(type,ID){	
	if(type == "folding"){
		//缩小时设置弹出框内容高度
		$("#contentDiv_"+ID).css("height","0px");
		//缩小弹出框title宽度
		$("#_DialogDiv_"+ID).css("width","220px");
		//缩小弹出框时，固定title宽度，超出部门隐藏
		$("#title_"+ID).css("width","205px");
		$("#title_"+ID).css("overflow","hidden");
		//不显示边框
		$("#_Title_"+ID).css("border-width","0px");
		//设置弹出框title为半透明
		$("#_DialogDiv_"+ID).css("opacity","0.8");
		
		$("#dialogBottomBorder_"+ID).css("height","0px");
		
		//隐藏头部右上角操作按钮
		$("#operationBtn_"+ID).hide();
	}else{
		//还原弹出框内容高度
		$("#contentDiv_"+ID).css("height",winObj[ID]["height_"+ID]);
		$("#dialogBottomBorder_"+ID).css("height","2px");
		winObj[ID]["isShowFlag"] = true;
	}
}




//折叠、展开重置div高度
/*function calculateHeight(value,ID){
	var divHeight = $("#contentDiv_"+ID).css("height");
	divHeight = parseInt(divHeight.substring(0,divHeight.length-2));
	divHeight = divHeight + value;
	if(divHeight <= 0){
		//缩小时设置弹出框内容高度
		$("#contentDiv_"+ID).css("height","0px");
		//缩小弹出框title宽度
		$("#_DialogDiv_"+ID).css("width","220px");
		//缩小弹出框时，固定title宽度，超出部门隐藏
		$("#title_"+ID).css("width","205px");
		$("#title_"+ID).css("overflow","hidden");
		//不显示边框
		$("#_Title_"+ID).css("border-width","0px");
		//设置弹出框title为半透明
		$("#_DialogDiv_"+ID).css("opacity","0.8");
		
		$("#dialogBottomBorder_"+ID).css("height","0px");
		
		//隐藏头部右上角操作按钮
		$("#operationBtn_"+ID).hide();
	}else if(divHeight <= parseInt(winObj[ID]["height_"+ID].substring(0,winObj[ID]["height_"+ID].length-2))){
		$("#contentDiv_"+ID).animate({"height":divHeight},50,function(){
		calculateHeight(value,ID);
		})
		//$("#contentDiv_"+ID).css("height",divHeight);		
		//setTimeout("calculateHeight("+value+",'"+ID+"')","20");
	}else if(divHeight > parseInt(winObj[ID]["height_"+ID].substring(0,winObj[ID]["height_"+ID].length-2))){
		//还原弹出框内容高度
		$("#contentDiv_"+ID).css("height",winObj[ID]["height_"+ID]);
		$("#dialogBottomBorder_"+ID).css("height","2px");
		winObj[ID]["isShowFlag"] = true;
	}
}*/

var startCounter = 0;//鼠标单击起始时间
//弹出窗口title鼠标按键被按下
function mousedown(){
	startCounter = new Date().getTime();
}

//弹出窗口title鼠标按键松开
function mouseup(ID){
	var endCounter = new Date().getTime();//鼠标单击结束时间
	var result = endCounter - startCounter;
	if(result > 150 && winObj && winObj[ID]){//鼠标单击至结束时间大于150毫秒视为拖拽操作，否则为展开窗口操作
		winObj[ID]["isOpenFlag"] = false;
	}else if(winObj && winObj[ID]){
		winObj[ID]["isOpenFlag"] = true;
	}
}

//弹出窗口收缩后，鼠标移入、移出透明度设置
function showOpacity(ID,type){
	if(winObj && winObj[ID] && !winObj[ID]["isShowFlag"]){
		if(type == "over"){
			$("#_DialogDiv_"+ID).css("opacity","1");
		}else{
			$("#_DialogDiv_"+ID).css("opacity","0.8");
		}
	}
}