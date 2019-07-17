/**
 * 分屏地图页面js
 */
var mapObject, //分屏地图对象
	mapProject = parent.mapProject; //分屏地图专题对象
	multiScreenPower=0, //图例显示开关，0:开启分屏，1:关闭分屏;
	multiScreenAddLayerPower=0; //多屏添加图层开关(主屏专题图层树开关)

window.onload=initMultiScreen;
function initMultiScreen(){
	//初始化专题图层树
	$("#projectDirIfr").attr("src","Map/toMapLayers"+"?token="+localStorage.token);
	$("[data-toggle='tooltip']").tooltip();

	//初始化开关按钮
	$(".bootstrap-switch").on("click",function(){
		if($(".bootstrap-switch").hasClass("bootstrap-switch-on")){
			$(".bootstrap-switch").addClass("bootstrap-switch-off");
			$(".bootstrap-switch").removeClass("bootstrap-switch-on");
			$(".bootstrap-switch-container").animate({"margin-left": "-38px"},100);
			document.getElementById("associatePowerChk").checked = false;
		}else{
			$(".bootstrap-switch").removeClass("bootstrap-switch-off");
			$(".bootstrap-switch").addClass("bootstrap-switch-on");
			$(".bootstrap-switch-container").animate({"margin-left": "0px"},100);
			document.getElementById("associatePowerChk").checked = true;
		};
	});
	//初始化多屏地图
	initMultiScreenMap();
}

function initMultiScreenMap(){
	require([
		"widget/MapMultiMapInit"
	],function(
		MapMultiMapInit
	){
		//当前地图参数
		var mapParam = mapProject.currentMapParam;
		var mainMap = parent.mapObject.getMapView();
		if(Object.prototype.toString.call(MapMultiMapInit) === "[object Object]"){
			console.warn(JSON.stringify(MapMultiMapInit));
		}
		//初始化小屏对象
		try{
			mapObject = new MapMultiMapInit("mapDiv");
			//开始初始化小屏
			mapObject.initMultiMap(mapParam, mainMap);
		}catch (e) {
			// parent.document.getElementById(parent.curMapIframeId).src=window.location.href;
			return;
		}

		//第一次打开多屏时将地图extent改变事件添加到集合中(arcgis api 4.11版本不能给自身绑定extent事件)
		var mapView = mapObject._mapView;
		parent.extentHandles.push(
			mapView.watch("extent", function(newValue, oldValue, type, g) {
				if($("#associatePowerChk").is(':checked')){
					parent.multiAssociate(mapView, "mapDiv1");
					parent.multiAssociate(mapView, "mapDiv2");
					parent.multiAssociate(mapView, "mapDiv3");
				}
			})
		);
	});
}

//销毁分屏地图对象
function destroyMap(){
	if(mapObject){
		mapObject.destroy();
	}
}

//点击弹出树图层
$("#zjditu_global_config").on("click",function(){
	$("#projectDirDiv").toggleClass("fade in");  
	$(".projectDirDiv-arrow").toggleClass("arrow");
	$(".wb-list").toggleClass("active");
})


//添加图层
function loadLayer(currentChecked, currentNodeObj){
	parent.netPing(currentNodeObj.pd.layerUrl,function(flag){
		if(flag){
			mapObject.addLoadLayer(currentChecked, currentNodeObj);
			//根据选中状态添加或删除当前叠加图层
			if(mapProject.visibleMapLayers.length > 0){ //当前叠加图层数组visibleMapLayers去除和当前操作图层相同的图层
				var _tempArr = new Array();
				for(var i=0;i<mapProject.visibleMapLayers.length;i++){
					if(mapProject.visibleMapLayers[i].id != currentNodeObj.id){
						_tempArr.push(mapProject.visibleMapLayers[i]);
					}
				}
				mapProject.visibleMapLayers = _tempArr;
			}
			if(currentChecked){ //添加当前操作图层
				if(currentNodeObj.pd.layer_type != "layer_type_dt" && currentNodeObj.pd.layer_type != "layer_type_yxt"){ //电子地图和影像图不添加
					mapProject.visibleMapLayers.push(currentNodeObj);
				}
			}
		}
	},{id:currentNodeObj.id});
}

//获取分屏mapView
function getMapView(){
	if(mapObject){
		mapObject.getMapView();
	}
}

//多屏地图移动显示坐标
function multiMapMoveShowCoor(point){
	parent.multiMapMoveShowCoor(point);
}

//分屏开关
function setMultiScreenPower(power) {
	multiScreenPower=power;
}

//分屏同步加载图层
function multiScreenAddLayer(flag,currentNodeObj){
	var dirId = currentNodeObj.id;
	var obj = $("#"+dirId);
	var projectDirIframe = document.getElementById('projectDirIfr').contentWindow;
	var currentChecked = projectDirIframe.document.getElementById(dirId).checked;
	var currentObj = projectDirIframe.document.getElementById("check_node_"+dirId);
	if(flag && currentChecked)return;
	if(!flag && !currentChecked)return;
	//设置当前节点复选框样式
	if(currentChecked){
		$(currentObj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-primary");
		projectDirIframe.document.getElementById(dirId).checked = false;
	}else{
		$(currentObj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-default");
		projectDirIframe.document.getElementById(dirId).checked = true;
	}
	projectDirIframe.changeProjectDirNode(obj,dirId);
}

