/**
 * 地图打印功能弹框页面js
 */
var printMapObject;

$(function(){
	
});

function getElement(id) {
	return document.getElementById(id)
}

window.onload=function(event){
	initPrintScreen();
	
//	var oBox = getElement("container"), oTop = getElement("printMapDiv"), oBottom = getElement("rightDiv"), oLine = getElement("line");
//	oLine.onmousedown = function(e) {
//		var disX = (e || event).clientX;
//		oLine.left = oLine.offsetLeft;
//		document.onmousemove = function(e) {
//			var iT = oLine.left + ((e || event).clientX - disX);
//			var e = e || window.event, tarnameb = e.target || e.srcElement;
//			var maxT = oBox.clientWight - oLine.offsetWidth;
//			oLine.style.margin = 0;
//			iT < 0 && (iT = 0);
//			iT > maxT && (iT = maxT);
//			oLine.style.left = oTop.style.width = iT + "px";
//			oBottom.style.width = oBox.clientWidth - iT + "px";
//			getElement("msg").innerText = 'leftDiv.width:' + oTop.style.width
//					+ '---rightDiv.width:' + oBottom.style.width
//					+ '---oLine.offsetLeft:' + oLine.offsetLeft
//					+ '---mapwidth:' + printMapObject._mapView.width;
//			$('#printMapDiv').css({
//		        'width': oTop.style.width
//		    });
//			return false
//		};
//		document.onmouseup = function() {
//			document.onmousemove = null;
//			document.onmouseup = null;
//			oLine.releaseCapture && oLine.releaseCapture()
//		};
//		oLine.setCapture && oLine.setCapture();
//		return false
//	};
};
function onChange(){
	$("#title_label").text($("#title_id").val()); 
}

function authorChange(){
	$("#authorSpan").html($("#authorInput").val()); 
}
function createTimeChange(){
	$("#createTimeSpan").html($("#createTimeInput").val()); 
}
function legendVisible(){
	var visible = $('#print_legend_checkbox').is(':checked');
	if(visible){
		$("#print-legend-content").show();
	}else{
		$("#print-legend-content").hide();
	}
}


function printMap(){
	var oLine = getElement("line");
//	oLine.onmousedown=null;
	//$('#configDiv').hide();
	printMapObject.getExtent();
	var vph = $('#printMapDiv').height();
	var vpw = $('#printMapDiv').width();
	$('#configDiv').css("display","none");
	//$('#zjditu_global_config').hide();
	$('#showTitleDiv').css("top",0);
	$('#mapContentDiv').css("top",50);
	//$('#printMapDiv').css("height",$('#printMapDiv').height() + 50);
	//printMapObject.setExtent();
	//$('#print-legend-parent').css("bottom",50);
//    if(vpw/vph>210/291){
//		//宽大，以高为主
//    	vpw=210*vph/291
//	}else{
//		//高大，以宽为主
//		vph=291*vpw/210
//	}
//    if(vpw<vph){
//    	var tmp=vph;
//    	vph=vpw;
//    	vpw=tmp;
//    	
//    }
	
//	$('#printMapDiv').css({
//        'width':  Number($("#line").css("left").replace("px",""))+ 'px'  //Number($("#line").css("left").replace("px",""))
//    });
	
//	printMapObject._mapView.allLayerViews.removeAll();
//	printMapObject._myMap.layers.removeAll();
//	printMapObject._myMap.allLayers.removeAll()
	
	//printMapObject._mapView.allLayerViews.refresh();
	//printMapObject._myMap.allLayers.refresh();
	
//	$(".esri-view-root").width(1000);
//	$(".esri-view-surface").width(1000);
//	$(".esri-display-object").width(1000);
	setTimeout(function(){
		$('#mapContentDiv').css("left",-400);
		window.print();
		$('#mapContentDiv').css("left",0);
		setTimeout(function(){
			$('#configDiv').show();
			$('#showTitleDiv').css("top",50);
			$('#mapContentDiv').css("top",100);
			getMainPageWindow("mapDiv").document.getElementById("_DialogDiv_printMapDialog").style.top=0;
		},500);
	},500);
}
function resizeDiv() {
	return;
    var vph = $(window).height()-$("#configDiv").height()-$("#showTitleDiv").height();
    var vpw = $(window).width();
    $('#printMapDiv').css({
        'height': vph + 'px',
        'width': vpw + 'px'
    });
}

$(window).resize(function () {
	var vph = $(window).height()-$("#configDiv").height()-$("#showTitleDiv").height();
    var vpw = $(window).width();
    $('#printMapDiv').css({
        'height': vph + 'px',
        'width': vpw + 'px'
    });
});


function loadJS(url,callBack) {//加载js
    var loadScript = document.createElement("script");
    loadScript.type = "text/javascript";
    loadScript.onload = callBack;
    loadScript.src = url;
    document.body.appendChild(loadScript);
}

var tmpSi=null;
var requestCount=0;
function initPrintScreen(){
	require([
		rootPath + "static/common/js/map/widget/MapPrintMapInit.js"
	 ],function(
		MapPrintMapInit
	 ){
		if(tmpSi){
			clearTimeout(tmpSi);
		}
		if(Object.prototype.toString.call(MapPrintMapInit) !== '[object Function]' && requestCount <=1){
			requestCount++;
			tmpSi=setTimeout(initPrintScreen,1000);
			return;
		}
		$('#printMapDiv').css("width",this.parent.$(window).width());
		$('#printMapDiv').css("height",this.parent.$(window).height() -100);
		var mapParam = getMainPageWindow("mapDiv").mapProject.currentMapParam;
		var mainMap = getMainPageWindow("mapDiv").mapObject._mapView;
		printMapObject = new MapPrintMapInit("printMapDiv");
		printMapObject.initPrintMap(mapParam, mainMap);
		//复制地图
		printMapObject.copyMap(mainMap);
//		$("#createTimeInput").val(new Date().Format("yyyy-MM-dd"));
//		$("#createTimeSpan").html($("#createTimeInput").val());
		//$("#authorInput").val("administrator");
		//$("#authorSpan").html($("#authorInput").val());
		$("#authorInput").val(userName);
		$("#authorSpan").html($("#authorInput").val());
	});
}

//根据地图div ID查找地图所在的页面window对象
function getMainPageWindow(mapDiv){
	var win=null;
	if(document.getElementById(mapDiv)){
		win=window;
	}else if(window.parent.document.getElementById(mapDiv)){
		win=parent.window;
	}else if(window.parent.parent.document.getElementById(mapDiv)){
		win=parent.parent.window;
	}else if(window.parent.parent.parent.document.getElementById(mapDiv)){
		win=parent.parent.parent.window;
	}else if(window.parent.parent.parent.parent.document.getElementById("mapDiv")){
		win=parent.parent.parent.parent.window;
	}
	return win;
}




