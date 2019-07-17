/**
 * 地图工具方法
 */

//定时闪烁对象
var _highLightInterval = null,
	_solidPolyonSymbol = null,		//实线样式
	_dashPolyonSymbol = null,		//虚线样式
	_dashDotPolyonSymbol = null,	//点、虚线样式
	_highLightIndex = 0;			//定时闪烁计数

var layersValidCheck={}; //

$(function(){
	//
});

 GuoDi.Application = {
/// <summary>
/// 系统运行时框架

/// </summary>
}

//初始化地图类对象
function initMapObject(mapObject){
	var mpObj = null;
	require([
      "widget/MapInit"
	], function(
	  MapInit
	){
		if(!mapObject){//mapObject对象为空
			mpObj = new MapInit("mapDiv");
			mpObj.initMap();

            initSymbol();
		}
	});
	return mpObj;
}

/**
 * 初始化样式
 */
function initSymbol(){
	require([
         "esri/symbols/SimpleFillSymbol"
 	], function(
 		SimpleFillSymbol
 	){
		//实线样式
		_solidPolyonSymbol = new SimpleFillSymbol({
 			color: [227, 139, 79, 0.4],
 			style: "solid",
 	        outline: {
 	        	color: [255, 0, 0],
 	        	width: 2,
 	        	style: "solid"
 	    	}
 		});
 		//虚线样式
 		_dashPolyonSymbol = new SimpleFillSymbol({
 			color: [227, 139, 79, 0.4],
 			style: "solid",
 	        outline: {
 	        	color: [255, 0, 0],
 	        	width: 2,
 	        	style: "short-dash"
 	    	}
 		});
 		//点、虚线样式
 		_dashDotPolyonSymbol = new SimpleFillSymbol({
 			color: [227, 139, 79, 0.4],
 			style: "solid",
 	        outline: {
 	        	color: [255, 0, 0],
 	        	width: 2,
 				style: "short-dash-dot"
 	    	}
 		});
 	});
}

var timerFlashId=null;
var timerFlashIdArr=[];
/**
 * 1、传入graphics,graphicsLayer,对graphic实现闪动
 * 2、传入null,graphicsLayer,对layer进行闪动
 * 3、传入graphics,null,3,false,false,true,对map.graphics中的要素闪动
 * @param oldLayerAnimeVisible 原图层在动画中是否可见
 * @param graphics
 * @param graphicsLayer
 * @param flashNum 闪动次数
 * @param isFlashGraphics 是否是map.graphics中的要素
 */
function graphicsFlashing(graphics,graphicsLayer,flashNum,isAnime,oldLayerAnimeVisible,isMapGraphics,callback){
	var tempFlashLayer;
	var timerCount = 1;
	require([
	         "esri/layers/GraphicsLayer"
	 	], function(
 			GraphicsLayer
	 	){
		var mapView=getMapView();
		tempFlashLayer=mapView.map.findLayerById("tempAnimeLayer1");
		if(tempFlashLayer){
			tempFlashLayer.removeAll();
		}
		tempFlashLayer=mapView.map.findLayerById("tempAnimeLayer2");
		if(tempFlashLayer){
			tempFlashLayer.removeAll();
		}

		tempFlashLayer=mapView.map.findLayerById("tempFlashLayer");
		if(!tempFlashLayer){
			tempFlashLayer=new GraphicsLayer();
			tempFlashLayer.id="tempFlashLayer";
			mapView.map.layers.add(tempFlashLayer);
		}else{
			tempFlashLayer.removeAll();
		}
		mapView.map.reorder(tempFlashLayer,999);
		if(timerFlashId && !isMapGraphics){
			window.clearInterval(timerFlashId);
			timerFlashIdArr.forEach(function(id){
				window.clearInterval(id);
			});
		}
		if(timerAnimeId){
			window.clearInterval(timerAnimeId);
		}
		if(graphics){
			graphics=graphics.filter(function(g, index) {
				var r=false;
				if(g){
					r=true;
				}
				return r;
			});
		}
		if(graphics && graphics.length>0 && !isMapGraphics){
			tempFlashLayer.addMany(graphics);
		}else if(graphicsLayer && !isMapGraphics){
			tempFlashLayer.addMany(graphicsLayer.graphics.items);
		}else if(graphics && graphics.length>0 && isMapGraphics){
			flashNum=flashNum*2;
			if(timerFlashId){
				window.clearInterval(timerFlashId);
			}
			mapObject._mapView.graphics.removeAll();
			timerFlashId=window.setInterval(function(){
				graphics.forEach(function(graphic,index,arr){
					if(timerCount%2 == 1){
						mapObject._mapView.graphics.remove(graphic);
					}else{
						mapObject._mapView.graphics.add(graphic);
					}
				});
				if(timerCount >= flashNum){
					window.clearInterval(timerFlashId);
					timerFlashIdArr.forEach(function(id){
						window.clearInterval(id);
					});
					if(callback && Object.prototype.toString.call(callback) === '[object Function]'){
						callback();
					}
				}
				timerCount++;
			},300);
			timerFlashIdArr.push(timerFlashId);
			return;
		}
		if(graphicsLayer){
			graphicsLayer.visible=false;
		}
		flashNum=flashNum*2;
		timerFlashId=window.setInterval(function(){
			tempFlashLayer.visible=!tempFlashLayer.visible;
			timerCount++;
			if(timerCount >= flashNum){
				window.clearInterval(timerFlashId);
				timerFlashIdArr.forEach(function(id){
					window.clearInterval(id);
				});
				if(graphicsLayer){
					graphicsLayer.visible=true;
				}
				tempFlashLayer.removeAll();
				if(isAnime){
					if(oldLayerAnimeVisible){
						graphicAnime(graphics,graphicsLayer,true);
					}else{
						graphicAnime(graphics,graphicsLayer,false);
					}

				}
				if(callback && Object.prototype.toString.call(callback) === '[object Function]'){
					callback();
				}
			}
		},300)
		timerFlashIdArr.push(timerFlashId);

	});
}

var timerAnimeId=null;
var timerAnimeIdArr=[];
var oldAnimeGraphicsLayer=null;
/**
 *
 * @param graphics 数组
 * @param graphicsLayer
 * @param animeNum 闪动次数
 * @param polyColor 面颜色
 * @param lineColor 线颜色
 */
function graphicAnime(graphics,graphicsLayer,oldLayerVisible,animeNum,polyColor,lineColor,callback){
	var tempAnimeLayer1;
	var tempAnimeLayer2;
	var timerCount = 1;
	if(!graphicsLayer && !graphics){
		return;
	}
	if(!animeNum){
		animeNum=99999;
	}
	require([
	         "esri/layers/GraphicsLayer","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleMarkerSymbol","esri/symbols/PictureMarkerSymbol",
	         "esri/Graphic","esri/geometry/Polyline","esri/geometry/Point","esri/geometry/Polygon"
	 	], function(
 			GraphicsLayer,SimpleFillSymbol,SimpleLineSymbol,SimpleMarkerSymbol,PictureMarkerSymbol,Graphic,Polyline,Point,Polygon
	 	){

		var mapView=getMapView();
		tempAnimeLayer1=mapView.map.findLayerById("tempAnimeLayer1");
		if(!tempAnimeLayer1){
			tempAnimeLayer1=new GraphicsLayer();
			tempAnimeLayer1.id="tempAnimeLayer1";
			mapView.map.layers.add(tempAnimeLayer1);
		}else{
			tempAnimeLayer1.removeAll();
		}
		tempAnimeLayer2=mapView.map.findLayerById("tempAnimeLayer2");
		if(!tempAnimeLayer2){
			tempAnimeLayer2=new GraphicsLayer();
			tempAnimeLayer2.id="tempAnimeLayer2";
			mapView.map.layers.add(tempAnimeLayer2);
		}else{
			tempAnimeLayer2.removeAll();
		}
		mapView.map.reorder(tempAnimeLayer1,998);
		mapView.map.reorder(tempAnimeLayer2,997);
		if(timerAnimeId){
			window.clearInterval(timerAnimeId);
			timerAnimeIdArr.forEach(function(id){
				window.clearInterval(id);
			});
		}
		if(!polyColor){
			polyColor=[227, 139, 79, 0];
		}
		if(!lineColor){
			lineColor=[255,0,0,0.8];
		}
		if(oldAnimeGraphicsLayer){
			oldAnimeGraphicsLayer.visible=true;
			oldAnimeGraphicsLayer=null;
		}
		var dashPolyonSymbol = new SimpleFillSymbol({
 			color: polyColor,
 			style: "solid",
 	        outline: {
 	        	color: lineColor,
 	        	width: 2,
 	        	style: "short-dash"
 	    	}
 		});

		//var lineSymbol1 = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor,2);
 		var dashDotPolyonSymbol = new SimpleFillSymbol({
 			color:polyColor,
 			style: "solid",
 	        outline: {
 	        	color: lineColor,
 	        	width: 2,
 				style: "short-dash-dot"
 	    	}
 		});
 		var lineSymbol1 = new SimpleLineSymbol(
			{
 	        	color: lineColor,
 	        	width: 2,
 				style: "short-dash"
 	    	}
		);
		var lineSymbol2 = new SimpleLineSymbol(
			{
 	        	color: lineColor,
 	        	width: 2,
 				style: "short-dash-dot"
 	    	}
		);

		var pointSymbol1 = new SimpleMarkerSymbol({
			  style: "circle",
			  color: polyColor,
			  size: "10px",
			  outline: {
	 	        	color: lineColor,
	 	        	width: 2,
	 	        	style: "short-dot" //"short-dash"
	 	    	}
			});

		var pointSymbol2 = new SimpleMarkerSymbol({
			  style: "circle",
			  color: polyColor,
			  size: "10px",
			  outline: {
	 	        	color: lineColor,
	 	        	width: 2,
	 				style: "solid"
	 	    	}
			});
		var pointSymbol3 = new PictureMarkerSymbol({
    		url: "static/map/images/location/blue_A.png",
    		width: 16,
    		height: 16
    	});
		var graphicArr1=[];
		var graphicArr2=[];
		var graphicArr=[];
		if(graphics && graphics.length>0){
			graphicArr=graphics;
		}else{
			graphicArr=graphicsLayer.graphics.items;
		}
//		graphicArr.every(function (graphic,index,arr) {
//		    //
//		});
		var k=0;
		for(;k<graphicArr.length;k++){
			var graphic=graphicArr[k];
			var sym1={};
			var sym2={};
		    var geo={};
		    var popupTemplate={};
		    if(graphic.geometry.type == "polygon"){
		    	sym1=dashPolyonSymbol;
		    	sym2=dashDotPolyonSymbol;
		    }else if(graphic.geometry.type == "polyline"){
		    	sym1=lineSymbol1;
		    	sym2=lineSymbol2;
		    }else if(graphic.geometry.type == "point"){
		    	sym1=pointSymbol1;
		    	sym2=pointSymbol2;
		    }else{

		    	showMessage("暂不支持的类型:"+graphic.geometry.type, 8);
		    	return false;//跳出循环
		    }

		    if(graphic.popupTemplate){
		    	$.extend(true,popupTemplate,graphic.popupTemplate);
		    }
		    if(popupTemplate.hasOwnProperty("content")){
		    	$.extend(true,geo,graphic.geometry);
			    graphicArr1.push(new Graphic(geo, sym1,null,popupTemplate));
			    $.extend(true,geo,graphic.geometry);
			    graphicArr2.push(new Graphic(geo, sym2,null,popupTemplate));
		    }else{
		    	$.extend(true,geo,graphic.geometry);
			    graphicArr1.push(new Graphic(geo, sym1,null));
			    $.extend(true,geo,graphic.geometry);
			    graphicArr2.push(new Graphic(geo, sym2,null));
		    }
		}
		tempAnimeLayer1.addMany(graphicArr1);
		tempAnimeLayer2.addMany(graphicArr2);

		if(oldLayerVisible && graphicsLayer){
			graphicsLayer.visible=true;
		}else if(graphicsLayer && (oldLayerVisible == false)){
			graphicsLayer.visible=false;
		}
		if(oldAnimeGraphicsLayer){
			oldAnimeGraphicsLayer=graphicsLayer;
		}
		timerAnimeId=window.setInterval(function(){
			if(timerCount % 2 ==0 ){
				tempAnimeLayer1.visible=true;
				tempAnimeLayer2.visible=false;
			}else{
				tempAnimeLayer1.visible=false;
				tempAnimeLayer2.visible=true;
			}
			timerCount++;
			if(timerCount > animeNum){
				if(graphicsLayer){
					graphicsLayer.visible=true;
				}
				oldAnimeGraphicsLayer=null;
				window.clearInterval(timerAnimeId);
				timerAnimeIdArr.forEach(function(id){
					window.clearInterval(id);
				});
				tempAnimeLayer1.removeAll();
				tempAnimeLayer2.removeAll();
				if(callback && Object.prototype.toString.call(callback) === '[object Function]'){
					callback();
				}
			}
		},300)

	});
}

function closeGraphicAnime(){
	if(timerAnimeId){
		window.clearInterval(timerAnimeId);
	}
	var mapView=getMapView();
	var tmp=mapView.map.findLayerById("tempAnimeLayer1");
	if(tmp){
		tmp.removeAll();
	}
	tmp=mapView.map.findLayerById("tempAnimeLayer2");
	if(tmp){
		tmp.removeAll();
	}
	if(oldAnimeGraphicsLayer){
		oldAnimeGraphicsLayer.visible=true;
		oldAnimeGraphicsLayer=null;
	}

}

/**
 * 定位图形闪烁3下(3下之后高亮显示图形)
 * @param	graphicsLayer	图层
 * @param	graphic			图形
 * @param   popupObj		popup(title,content,location)属性值对象
 */
function highLightGraphic(graphicsLayer,graphic,popupObj){
	if(popupObj){
		mapObject._mapView.popup.open(popupObj);
	}
	graphicsFlashing([graphic],graphicsLayer,3,true);
	return;
	_highLightIndex = 0;
	if(_highLightInterval){
		window.clearInterval(_highLightInterval);
	}
	_highLightInterval = setInterval(function(){
		if(_highLightIndex > 3){
			window.clearInterval(_highLightInterval);
			if(popupObj){
				mapObject._mapView.popup.open(popupObj);
			}
			//高亮显示图形
			disposeHighLight(graphicsLayer,graphic);
		}else if(_highLightIndex % 2 == 0){
			graphicsLayer.removeAll();
			_highLightIndex++;
		}else{
			graphicsLayer.add(graphic);
			_highLightIndex++;
		}
	},300);
}

/**
 * graphic在graphicsLayer中高亮显示
 * callback从未发现在哪调用!!!
 * @param	graphicsLayer	图层
 * @param	graphic			图形
 */
function disposeHighLight(graphicsLayer,graphic,callback){
	graphicAnime(graphic,graphicsLayer,true);
	return;

	_highLightInterval = setInterval(function(){
		var newGraphic = graphic.clone();
		if(_highLightIndex % 2 == 0){
			newGraphic.symbol = _dashPolyonSymbol;
    	}else{
    		newGraphic.symbol = _dashDotPolyonSymbol;
    	}
		if(!graphicsLayer){
			graphicsLayer = createTemGraphicLayer("tempLayer");
		}
		if(_highLightIndex == 3){
			if(callback){
				callback()
			}
		}
    	graphicsLayer.removeAll();
		graphicsLayer.add(newGraphic);
		_highLightIndex++;

		window.clearInterval(_highLightInterval);
	},300);
}

/**
 * graphicsLayer中闪烁graphic 3次
 * @param	graphic			图形
 * @param	graphicsLayer	图层
 * @param   isHighlight     是否高亮
 * @param   callback        回调函数（执行完闪烁、高亮后执行）
 */
var _highLightTemInterval;
var heighLightInterArr = [];
function glintGraphic(graphic, graphicsLayer, isHighlight, callback){
	graphicsFlashing([graphic],graphicsLayer,3,true,true,callback);
	return;
	require([
	         "esri/layers/GraphicsLayer"
	 	], function(
 			GraphicsLayer
	 	){
			var tempIndex = 0;
			var map = getMapView().map;
			if(_highLightTemInterval){
				if(tempIndex > 5){
					for(var i=0;i<heighLightInterArr.length;i++){
						window.clearInterval(heighLightInterArr[i]);
					}
				}
			}
			//判断graphic高亮
			var hlTemLayer = map.findLayerById("heightLinghtTemLayer");
			if(hlTemLayer){
				hlTemLayer.removeAll();
				//关掉高亮循环
				window.clearInterval(_highLightTemIntervalTwo);
			}else{
				hlTemLayer = new GraphicsLayer({
					id: "heightLinghtTemLayer"
				});
				map.add(hlTemLayer);
			}
			//关闭popup
			getMapView().popup.close();

			_highLightTemInterval = setInterval(function(){
				//var newGraphic = graphic.clone();
				if(tempIndex > 5){
					for(var i=0;i<heighLightInterArr.length;i++){
						window.clearInterval(heighLightInterArr[i]);
					}
					//高亮graphic
					if(isHighlight){
						mapAnaHighLightGraphic(graphic);
					}
					//回调
			        if (callback) {
			            callback();
			        }
				}else if(tempIndex % 2 == 0){
					graphicsLayer.remove(graphic);
					tempIndex++;
		    	}else{
		    		graphicsLayer.add(graphic);
		    		tempIndex++;
		    	}

			},300);
			heighLightInterArr.push(_highLightTemInterval);
	});
}

/**
 * 地图分析高亮graphic
 * @param graphic
 */
var _highLightTemIntervalTwo;
function mapAnaHighLightGraphic(graphic){
	graphicAnime([graphic],null,null,null)
	return;
	require([
	         "esri/layers/GraphicsLayer"
	 	], function(
 			GraphicsLayer
	 	){

		var map = getMapView().map;
		var graphicsLayer = map.findLayerById("heightLinghtTemLayer");
		if(!graphicsLayer){
			graphicsLayer = new GraphicsLayer({
				id: "heightLinghtTemLayer"
			});
			map.add(graphicsLayer);
		}else{
			graphicsLayer.removeAll();
		}

		var tempIndex = 0;
		if(_highLightTemIntervalTwo){
			clearInterval(_highLightTemIntervalTwo);
		}

		_highLightTemIntervalTwo = setInterval(function(){
			var newGraphic = graphic.clone();
			if(graphic && graphic.geometry.type != "point"){
				if(tempIndex % 2 == 0){
					newGraphic.symbol = _dashPolyonSymbol;
				}else{
					newGraphic.symbol = _dashDotPolyonSymbol;
				}
			}
			/*if(tempIndex > 5*2){//亮闪10次
				window.clearInterval(_highLightTemIntervalTwo);
			}*/
			graphicsLayer.removeAll();
			graphicsLayer.add(newGraphic);
			tempIndex++;
		},300);
	})
}

function closeMapAnaHighLightGraphic(funType){
	closeGraphicAnime();
	if(_highLightTemIntervalTwo){
		clearInterval(_highLightTemIntervalTwo);
	}
	var graphicsLayer = mapObject._mapView.map.findLayerById("heightLinghtTemLayer");
	if(graphicsLayer){
		graphicsLayer.removeAll();
	}
	if(funType){
		var i=0;
		for(i;i<mapObject._mapView.graphics.items.length;i++){
			var g=mapObject._mapView.graphics.items[i];
			if(g.id.indexOf(funType) > -1){
				mapObject._mapView.graphics.remove(g);
			}
		}
	}else{
		mapObject._mapView.graphics.removeAll();
	}
}

/**
 * 地图缩放合适范围
 * @param geometry 	几何图形
 * @param level		缩放等级(正负整数)
 */
function setMapExtentByGeometry(geometry,level){
	if(level !=0 && !level){
		level = -1;//默认缩放2级
	}
	var _mapView = getMapView();
	//设置图层显示范围
	if(geometry.extent){
		_mapView.extent = geometry.extent;
		//设置缩放等级
		_mapView.zoom = _mapView.zoom + level;
	}
}

/**
 * 移除指定图形（从layer中移除指定graphic）
 * @param	graphicId		图形id
 * @param	graphicsLayer	图层(可为空)
 */
function removeMapGraphic(graphicId,graphicsLayer){
	if(_highLightInterval){
		window.clearInterval(_highLightInterval);
	}
	var graphic = getMapOrLayerGraphic(graphicId,graphicsLayer ? graphicsLayer.id : null);
	if(graphicsLayer){
		graphicsLayer.remove(graphic);
	}else{
		getMapView().graphics.remove(graphic);
	}
	//关闭要素信息弹窗
	getMapView().popup.close();
	//清除高亮
	closeInterval();
}

/**
 * 根据graphicId在layer中查找graphic
 * @paramg	raphicId		图形id
 * @param	graphicsLayer	图层(可为空)
 */
/*function findMapGraphic(graphicId,graphicsLayer){
	_mapView = getMapView();
	var graphic = null;
	if(graphicsLayer){
		for(var i = 0; i < graphicsLayer.graphics.items.length; i++){
			if(graphicsLayer.graphics.items[i].id == graphicId){
				graphic = graphicsLayer.graphics.items[i];
				break;
			}
		}
	}else{
		for(var i = 0; i < _mapView.graphics.items.length; i++){
			if(_mapView.graphics.items[i].id == graphicId){
				graphic = _mapView.graphics.items[i];
				break;
			}
		}
	}
	return graphic;
}*/


/**
 * 返回图层字段数据集
 * @param fieldData
 */
function getLayerFieldData(fieldData,attributes){
	//存储显示字段数组
	var showFieldData = new Array();
	if(fieldData && attributes){
		//循环添加显示字段信息
		for(var i = 0; i < fieldData.length; i++){
			if(fieldData[i].is_show == 0 || fieldData[i].field_name.indexOf("OBJECTID") != -1 || fieldData[i].field_name.indexOf("SHAPE") != -1){
				fieldData.splice(i,1);
				i--;
				continue;
			}
			var fieldJson = new Object();
			fieldJson.field_name = fieldData[i].field_name;				//字段名称
			fieldJson.field_name_cn = fieldData[i].field_name_cn;		//字段中文名称
			fieldJson.field_value = attributes[fieldData[i].field_name];//字段值
			fieldJson.field_unit = fieldData[i].field_unit;				//单位
			if(!fieldJson.field_unit){
				fieldJson.field_unit = "";
			}
			showFieldData.push(fieldJson);
		}
	}
	return showFieldData;
}

/**
 * 根据图层字段数据集获取标注字段
 * @fieldData	图层字段数据集
 */
function getLabelFieldByLayerField(fieldData){
	var labelField = null;
	for(var i = 0; i < fieldData.length; i++){
		if(fieldData[i].is_label == 1){
			labelField = fieldData[i].field_name;
			break;
		}
	}
	return labelField;
}

/**
 * 弹出窗口
 * @param title		标题
 * @param content	内容
 * @param point		弹出位置Point
 */
function openMapPopup(title,content,point){
	var mapView = getMapView();
	//不停靠
	mapView.popup.dockOptions = {
    	buttonEnabled: false
    };
	mapView.popup.open({
		title: title,
		content: content,
		location: point
	});
}

/**
 * 添加graphic弹出窗口
 * @param title		标题
 * @param content	内容
 * @param graphic	图形
 */
function addPopupTemplate(title,content,graphic){
	require([
         "esri/PopupTemplate"
    ], function(
    	 PopupTemplate
    ){
		var popupTemplate = new PopupTemplate();
		popupTemplate.title = title;
		popupTemplate.content = content;
		graphic.popupTemplate = popupTemplate;
	});
}

/**
 * 获取layer显示层级
 * @param allLayers		所有图层
 */
function getLayerOrder(allLayers){
	var orderIndex = allLayers.items.length;
	for(var i = 0; i < allLayers.items.length; i++){
		if(allLayers.items[i].type == "graphics"){//判断是否为临时图层，如果是，则返回临时图层上一个层级
			orderIndex = i - 1;
			break;
		}
	}
	return orderIndex;
}

/**
 * 图形高亮闪3下(图层、单独的graphic)
 * @param graphicsLayer		图层
 * @param graphic			图形
 * @param heightLightTime   闪烁次数
 */
function simpleHighLightGraphic(graphicsLayer,graphic,heightLightTime,callback){
	graphicsFlashing([graphic],graphicsLayer,heightLightTime,false,false,callback);
	return;
 	_highLightIndex = 0;
	if(_highLightInterval){
		window.clearInterval(_highLightInterval);
	}
	//设置亮闪次数
	if(!heightLightTime){
		heightLightTime = 3;
	}else{
		heightLightTime = 5;
	}
 	_highLightInterval = setInterval(function(){
		if(_highLightIndex > heightLightTime){
			window.clearInterval(_highLightInterval);
			//回调
	        if (callback) {
	            callback();
	        }
		}else if(_highLightIndex % 2 == 0){
			if(graphicsLayer){
				graphicsLayer.remove(graphic);
			}else{
				mapObject._mapView.graphics.remove(graphic);
			}
			_highLightIndex++;
		}else{
			if(graphicsLayer){
				graphicsLayer.add(graphic);
			}else{
				mapObject._mapView.graphics.add(graphic);
			}
			_highLightIndex++;
		}
	},300);
}

/**
 * 根据点构造矩形
 * @param point
 */
function changeGeometryExtent(point){
	if(point){
		var polygon = null;
		require([
		   "esri/geometry/Polygon"
	    ], function(
	    	Polygon
	    ){
			polygon = new Polygon();
			polygon.addRing([
                 [point.x + 100, point.y + 100],
                 [point.x - 100, point.y - 100]
			]);
		});
		return polygon;
	}
}

/**
 * geometry中心定位
 * @param geometry
 * @param zoom
 */
function geometryCenterLocation(geometry, zoom){
	var mapView = mapObject.getMapView();
	if(!zoom){
		zoom = mapView.zoom;
	}
	mapView.goTo({
        target: geometry,
        zoom: zoom
    },{
    	animate: true
    });
}

/**
 * geometryJson转graphic对象
 * @param geometryJson
 * @param geometryType
 * @param attributes
 */
function geometryJsonToGraphic(geometryJson,geometryType,attributes,lineColor,fillColor){
    var geometryJsonToGraphic;
	require([
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/Graphic",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/geometry/Polygon",
		"esri/geometry/Point",
		"esri/geometry/Polyline"
    ], function(
		SimpleLineSymbol,
		SimpleFillSymbol,
		Graphic,
		SimpleMarkerSymbol,
		Polygon,
		Point,
		Polyline
    ){
		var lc=[255,0,0];
		var fc=[255,0,0,0.3];
		fc=[0,0,0,0.1];
		if(lineColor){
			lc=lineColor;
		}
		if(fillColor){
			fc=fillColor;
		}
		var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color(lc),1);
		var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color(fc));
		var graphic = null;
		if(geometryType == "esriGeometryPolygon"){
			graphic = new Graphic(new Polygon(geometryJson), fillSymbol, attributes);
		}else if(geometryType=="esriGeometryPolyline"){
			graphic = new Graphic(new Polyline(geometryJson), lineSymbol, attributes);
		}else if(geometryType=="esriGeometryPoint"){
			graphic = new Graphic(new Point(geometryJson), null, attributes);
		}
		geometryJsonToGraphic = graphic;
		//设置投影
		var mapView = getMapView();
		geometryJsonToGraphic.geometry.spatialReference = mapView.spatialReference;
	})
	return geometryJsonToGraphic;
}

/**
 * 显示详细信息
 * @param attributes
 * @returns {String}
 */
function showAttributes(attributes) {
    var result = "<div style='height:210px;width:350px;'><table class='table table-striped table-bordered table-hover' style='margin-bottom:0px;'>";
    for(var att in attributes){
    	 if(att != "unique"){
	        if (!attributes[att] || attributes[att] == null || attributes[att] == undefined || attributes[att] == "undefined" || attributes[att] == "Null" || attributes[att].toString().replace(' ', "").length == 0) {
	            result += "<tr ><td style='width:30%;'>" + att + "</td><td><span></span></td></tr>";
	        } else if (att.toUpperCase().indexOf("AREA") > -1) {
	            result += "<tr><td style='width:30%;'>面积</td><td><span>" + attributes[att]+ "</span></td></tr>";
	        } else if (att.toUpperCase() == "SHAPE") {
	            var geoType = "";
	            var typeValue = attributes[att];
	            if (typeValue.toUpperCase().indexOf("POLYGON")!=-1)
	                geoType = "面";
	            else if (typeValue.toUpperCase().indexOf("POLYLINE")!=-1)
	                geoType = "线";
	            else if (typeValue.toUpperCase().indexOf( "POINT")!=-1)
	                geoType = "点";
	            result += "<tr><td style='width:30%;'>类型</td><td><span>" + geoType + "</span></td></tr>";
	        } else {
	            result += "<tr><td style='width:30%;'>" + att + "</td><td><span>" + attributes[att] + "</span></td></tr>";
	        }
       }
    }
    result+="</table></div>";
    return result;
}

/**
 * 根据graphicLayerId查询graphicLayer
 * @param id
 * @returns {esri.layers.GraphicsLayer}
 */
function getQueryGraphicLayer(id){
	var mapView = getMapView();
	 var queryResLayer = mapView.map.findLayerById(id);
     if (queryResLayer == null) {
         queryResLayer = createTemGraphicLayer(id);
         mapView.map.add(queryResLayer);
         //dojo.connect(queryResLayer, "onClick", queryClickResLayerHandler);
     } else{
     	 queryResLayer.removeAll();
     }
     return queryResLayer;
}

/**
 * 构造geometry popupTemlate
 * @param graphic
 */
function buildGeoPopup(graphic){
	var popupTemplate;
	require([
        "esri/PopupTemplate"
	], function(
		PopupTemplate
	){
		var popupTitle = graphic.title;
		var popupContent = showAttributes(graphic.attributes);
		popupTemplate = new PopupTemplate({
			title: popupTitle,
			content: popupContent
		});
	})
	return popupTemplate;
}

/**
 * extent转换为polygon
 * @param extent
 */
function fromExtent(extent){
	var extentToPolygon;
	require([
      "esri/geometry/Polygon"
	],function(
	  Polygon
	){
		extentToPolygon = Polygon.fromExtent(extent);
	});
	return extentToPolygon;
}

/**
 * 创建临时图层
 * @param layerId
 * @returns {GraphicsLayer}
 */
function createTemGraphicLayer(layerId){
	var mapView = getMapView();
	var temGraphicLayer;
	require([
	         "esri/layers/GraphicsLayer"
	 	], function(
 			GraphicsLayer
	 	){
		temGraphicLayer = new GraphicsLayer({id: layerId, spatialReference: mapView.spatialReference});
	});
	return temGraphicLayer;
}

/**
 * 地图显示到几何图形的范围
 * @param geoExtent
 */
function mapShowGeometryExtent(geoExtent){
	var mapView = getMapView();
	mapView.extent = geoExtent;
}

/**
 * 关闭定时器
 * @param timer
 */
function closeInterval(){
	if(_highLightTemIntervalTwo){
		window.clearInterval(_highLightTemIntervalTwo);
		var map = getMapView().map;
		var graphicsLayer = map.findLayerById("heightLinghtTemLayer");
		if(graphicsLayer){
			graphicsLayer.removeAll();
		}
	}
	window.closeGraphicAnime();
}

//数字显示格式
function formatNum(strNum) {
	if (strNum.length <= 3) {
    	return strNum;
	}
	if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(strNum)) {
     	return strNum;
	}
	var a = RegExp.$1, b = RegExp.$2, c = RegExp.$3;
	var re = new RegExp();
	re.compile("(\\d)(\\d{3})(,|$)");
	while (re.test(b)) {
	    b = b.replace(re, "$1,$2$3");
	}
	return a + "" + b + "" + c;
}

/**
 * graphicLayer图层闪烁3次
 */
var highLightLayerIndex = 0;
var _highLightLayerInterval = null;
function highLightLayer(graphicLayerId){
	highLightLayerIndex = 0;
	var mapView = getMapView();
	var graphicLayer = mapView.map.findLayerById(graphicLayerId);
	if(_highLightLayerInterval){
		window.clearInterval(_highLightLayerInterval);
	}
 	_highLightLayerInterval = setInterval(function(){
		if(highLightLayerIndex > 5){
			window.clearInterval(_highLightLayerInterval);
		}else if(highLightLayerIndex % 2 == 0){
			if(graphicLayer){
				graphicLayer.visible = false;
			}
			highLightLayerIndex++;
		}else{
			if(graphicLayer){
				graphicLayer.visible = true;
			}
			highLightLayerIndex++;
		}
	},300);
}

//数组转成线
function polylineArrGraphic(pointStrArray){
	var graphic = null;
	var mapView = getMapView();
	require([
 		"esri/Graphic",
 		"esri/geometry/Point",
 		"esri/geometry/Polyline",
 		"esri/symbols/SimpleLineSymbol"
     ], function(
 		Graphic,
 		Point,
 		Polyline,
 		SimpleLineSymbol
     ){
		var pArrPolyline = new Array();
		var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1);
		for(var k =0;k<pointStrArray.length;k++){
			var pointArray = StringSplit(String(pointStrArray[k]),",");
			var pPoint=new Point(parseFloat(pointArray[0]), parseFloat(pointArray[1]), mapView.spatialReference);
			pArrPolyline.push(pPoint);
		}
		if(pArrPolyline!=null && pArrPolyline.length>0){
			var polyline = new Polyline(mapView.spatialReference);
			polyline.addPath(pArrPolyline);
			graphic =  new Graphic(polyline,null,null);
			graphic.symbol = lineSymbol;
		}
	})
	return graphic;
}

//数组转成点
function pointArrGraphic(pointArray){
	var graphic = null;
	var mapView = getMapView();
	require([
  		"esri/Graphic",
  		"esri/geometry/Point",
  		"esri/symbols/SimpleMarkerSymbol"
      ], function(
  		Graphic,
  		Point,
  		SimpleMarkerSymbol
      ){
		var markSymbol = new SimpleMarkerSymbol({
        	  color: "red",
        	  size: "3px",
        	  outline: {
        	    color: [255, 0, 0],
        	    width: 5
        	  }
        	});
		if(pointArray != null && pointArray.length==2){
			var pPoint = new Point(parseFloat(pointArray[0]), parseFloat(pointArray[1]), mapView.spatialReference);
			graphic = new Graphic(pPoint,null,null);
			graphic.symbol = markSymbol;
		}
	})
	return graphic;
}

//数组转成面
function polygonArrGraphic(pointStrArray){
	    var graphic = null;
		var pArrPolygon = new Array();
		var mapView = getMapView();
		require([
	  		"esri/Graphic",
	  		"esri/geometry/Point",
	  		"esri/geometry/Polygon",
			"esri/symbols/SimpleLineSymbol",
			"esri/symbols/SimpleFillSymbol"
	      ], function(
	  		Graphic,
	  		Point,
	  		Polygon,
	  		SimpleLineSymbol,
	  		SimpleFillSymbol
	      ){

			var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1);
        	var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color([0,0,0,0.1]));
			for(var k =0;k<pointStrArray.length;k++){
				var pointArray = StringSplit(String(pointStrArray[k]),",");
				var pPoint=new Point(parseFloat(pointArray[0]), parseFloat(pointArray[1]), mapView.spatialReference);
				pArrPolygon.push(pPoint);
			}
			if(pArrPolygon!=null && pArrPolygon.length>0){
				var polygon = new Polygon(mapView.spatialReference);
				polygon.addRing(pArrPolygon);
				graphic = new Graphic(polygon,null,null);
				graphic.symbol = fillSymbol;//填充颜色和边框颜色
			}
		})
		return graphic;
}

//显示多点在地图
function addMapPointList(pointArray,graphicLayerId){
	var mapView = getMapView();
	var gl = mapView.map.findLayerById(graphicLayerId);
    //var gl = getQueryGraphicLayer(graphicLayerId);
    require([
   		"esri/geometry/Point",
		"esri/Graphic",
		"esri/symbols/SimpleMarkerSymbol"
       ], function(
   		Graphic,
   		Point,
   		SimpleMarkerSymbol
       ){
    	var markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 8,new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]),3), new dojo.Color([255, 0, 0]));
    	for(var i=0;i<pointArray.length;i+=2){
    		var mapPoint = new Point(parseFloat(pointArray[i]),parseFloat(pointArray[i+1]), mapView.spatialReference);
    		var graphic = new Graphic(mapPoint,markerSymbol,null);
    		gl.add(graphic);
    		if(i==0){//定位
    			//mapObject.map.centerAndZoom(graphic.geometry, getGisObject().map.getLevel()+5);
    			setMapExtentByGeometry(graphic.geometry, 5.5);
    		}
    	}
    })
	//添加小屏渲染
	//addGraphicsLitterMap();
}

//转成数组
function StringSplit(source, find ){
	return source.split(find);
}

/**
 * 给graphic添加颜色
 * @param graphic
 * @param color
 */
function addColorForGraphic(graphic, color){
	if(graphic){
		var geometryType = graphic.geometry.type;
		if(geometryType == "polygon"){//面
			var outline = {
	                color: [253, 128, 68, 1],
	                width: 2
	            };
			if(color) color = [253, 128, 68, 0.2];
			graphic.symbol.color = color;
			graphic.symbol.outline = outline
			graphic.symbol.style = "solid";
		}else if(geometryType == "polyline"){//线

		}else if(geometryType == "point"){//点

		}
		var mapView = getMapView();
		mapView.graphics.add(graphic);
	}
	return graphic;
}

/**
 * 清除map中临时图层
 */
function removeMapTempLayers(){
	var mapView = getMapView();
	var map = mapView.map;
	var layers = map.allLayers.items;
	$.each(layers, function(i, layer){
		var layerId = layer.id;
		if(layerId.indexOf("_temp")>-1){
			map.remove(layer);
		}
	});
}

/**
 * 根据graphicId|layerId获取graphic
 * @param graphicId
 * @param layerId
 */
function getMapOrLayerGraphic(graphicId, layerId){
	var graphic = null,
		searchGraphics = null;
	//获取mapView
	var mapView = getMapView();
	if(layerId){//图层
		var layer = mapView.map.findLayerById(layerId);
		searchGraphics = layer.graphics.items;
	}else{//map
		searchGraphics = mapView.graphics.items;
	}
	if(searchGraphics){
		for (var i = 0; i < searchGraphics.length; i++) {
			if(graphicId == searchGraphics[i].id){
				graphic = searchGraphics[i];
				break;
			}
		}
	}
	return graphic;
}

/**
 * geometry转graphic
 * @param geometry
 * @param attributes
 * @param symbol
 * @returns
 */
function geometryToGraphic(geometry,attributes,symbol){
    var geometryToGraphic;
	require([
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/Graphic",
		"esri/geometry/Polygon",
		"esri/geometry/Point",
		"esri/geometry/Polyline"
    ], function(
		SimpleLineSymbol,
		SimpleFillSymbol,
		Graphic,
		Polygon,
		Point,
		Polyline
    ){
		var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]),1);
		var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color([255,0,0,0.3]));

		if(!geometry)return;
		var graphic = null;
		var geometryType = geometry.type;
		if(geometryType == "polygon"){
			graphic = new Graphic(geometry, fillSymbol, attributes);
		}else if(geometryType=="polyline"){
			graphic = new Graphic(geometry, lineSymbol, attributes);
		}else if(geometryType=="point"){
			graphic = new Graphic(geometry, null, attributes);
		}
		geometryToGraphic = graphic;
		//设置投影
		var mapView = getMapView();
		geometryToGraphic.geometry.spatialReference = mapView.spatialReference;
	})
	return geometryToGraphic;
}

function getClickGraphic(callback){
	mapObject._mapView.on("click",function(event){
		 var screenPoint = {x: event.x,y: event.y};
		 mapObject._mapView.hitTest(screenPoint).then(function(response){
			    callback(response.results)
			  });

	});

}

function netPing(url,callback,token) {
	if(token && token.hasOwnProperty("id") && layersValidCheck.hasOwnProperty(token.id)){
		callback(layersValidCheck[token.id]);
	}else{
		$.ajax({
	        type: "GET",
	        cache: false,
	        url: url,
	        data: "",
	        success: function() {
	        	if(token && token.hasOwnProperty("id")){
	        		layersValidCheck[token.id]=true;
	        	}
	        	callback(true);
	        },
	        error: function() {
	        	if(token && token.hasOwnProperty("id")){
	        		layersValidCheck[token.id]=false;
	        	}
	        	callback(false);
	        }
	    });
	}
}

//获取mapView对象
function getMapView(){
    if(!mapObject){
        mapObject = initMapObject(mapObject);
    }
    return mapObject.getMapView();
}

//清除检索渲染图形
function clearMapGraphicIdentfy(){
    var _mapView = getMapView();
    //关闭弹出窗口
    _mapView.popup.close();
    //循环删除上一次检索列表定位图形
    for(var i = 0; i < _mapView.graphics.items.length; i++){
        var graphic = _mapView.graphics.items[i];
        if(graphic.id.indexOf("identfy_") != -1){
            _mapView.graphics.remove(graphic);
            i--;
        }
    }
    if(_highLightInterval){
        //移除高亮显示setInterval
        window.clearInterval(_highLightInterval);
    }
    //移除定位图形
    var graphicsLayer = _mapView.map.findLayerById("identfy_graphicLayer");
    if(graphicsLayer){
        graphicsLayer.removeAll();
    }
    closeGraphicAnime();
}

//rgb转成16进制颜色值
function showRGB(rgb) {
	var hexcode = "#";
	for (x = 0; x < 3; x++) {;
		var n = rgb[x];
		if (n == "") n = "0";
		if (parseInt(n) != n) return alert("请输入数字！");
		if (n > 255) return alert("数字在0-255之间！");
		var c = "0123456789ABCDEF",
			b = "",
			a = n % 16;
		b = c.substr(a, 1);
		a = (n - a) / 16;
		hexcode += c.substr(a, 1) + b;
	}
	return  hexcode;
}

//color转rgb
function showRGB2(color) {
	var a = color;
	if (a.substr(0, 1) == "#") a = a.substring(1);
	if (a.length != 6) return alert("请输入正确的十六进制颜色码！");
	var a = a.toLowerCase() ;
	var b = new Array();
	for (x = 0; x < 3; x++) {
		b[0] = a.substr(x * 2, 2) ;
		b[3] = "0123456789abcdef";
		b[1] = b[0].substr(0, 1);
		b[2] = b[0].substr(1, 1) ;
		b[20 + x] = b[3].indexOf(b[1]) * 16 + b[3].indexOf(b[2]);
	}
	return  b[20] + "," + b[21] + "," + b[22];
}
