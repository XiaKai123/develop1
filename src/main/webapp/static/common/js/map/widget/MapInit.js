/**
 * 地图加载以及地图操作类
 */
define([
    "widget/MapCustom",
    "widget/MapGeoDraw",
    "widget/MapBookMark",
    "esri/Map",
    "esri/views/MapView",
    "dojo/dom",
    "esri/widgets/ScaleBar",
    "esri/widgets/Zoom",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "widget/MapMeasure",
    "esri/geometry/SpatialReference",
    "esri/core/urlUtils",
    "dojo/dom-construct"
], function (
	Custom, 
	MapGeoDraw,
	BookMark,
	Map, 
   	MapView,
   	dom,
   	ScaleBar,
   	Zoom,
   	Point,
   	Extent,
   	Measure,
   	SpatialReference,
    urlUtils,
	domConstruct
) {
    'use strict';

    var MapInit = Custom.createSubclass({
        declaredClass: "esri.custom._MapInit",
        normalizeCtorArgs: function (viewContainer) {
            var me = this;
            this._myMap = new Map();
            this._mapView = new MapView({
          	  container: viewContainer,
        	  map: this._myMap
    		});
            //禁止旋转
            // this._mapView.constraints = {
            //     rotationEnabled: false
            // };
            this._mapParam=null;//当前地图参数
            this.serverHostArr=[];//当前图层url
            //this._showLayers=[];//选中图层集合
        },
        /**
         * 设置地图参数(切换地图)
         * @param mapParam
         */
        setMapOptions: function(mapParam) {
        	var me = this;
        	this._mapParam=mapParam;
        	var zoomArr=null;
        	if(this._mapParam.hasOwnProperty("zoom_solutions")){
        		zoomArr=this._mapParam.zoom_solutions.split(",");
        	}
        	
        	if(!this._mapParam.hasOwnProperty("map_extent") && !this._mapParam.hasOwnProperty("map_xy") && 
        			!this._mapParam.hasOwnProperty("zoom_solutions")){
        		return;
        	}
        	
        	var mapExtentStrArr=this._mapParam.map_extent.split(",");
        	var mapXYStrArr=this._mapParam.map_xy.split(",");
        	var mapReference=parseInt(this._mapParam.map_refernce);
        	var scaleArr=this._mapParam.map_scales.split(",");
        	var mapScalesIntArr=JSON.parse('[' + scaleArr+ ']');
        	var mapExtentIntArr=JSON.parse('[' + mapExtentStrArr+ ']');
        	var mapXYIntArr=JSON.parse('[' + mapXYStrArr+ ']');
        	var mapZoom=this._mapParam.map_zoom;
        	this._scaleArr=scaleArr;
        	this._mapZoom=mapZoom;
        	
        	if(zoomArr !=null&&scaleArr !=null&&zoomArr.length>0&&scaleArr.length>0&&zoomArr.length==scaleArr.length ){
        		//地图缩放规则
    			var lodsa = "[";
    			for(var i=0;i<zoomArr.length;i++){
    				if(i==0){
    					lodsa += "{ \"level\": "+i+",\"resolution\": "+zoomArr[i]+",\"scale\": "+mapScalesIntArr[i]+"}";
    				}else{
    					lodsa += ",{ \"level\": "+i+",\"resolution\":"+zoomArr[i]+",\"scale\": "+mapScalesIntArr[i]+"}";
    				}	 
    			}
    			lodsa += "]";
    			//地图范围参数
    			var extent = new Extent({
    				xmin: mapExtentIntArr[0],
    				ymin: mapExtentIntArr[1],
    				xmax: mapExtentIntArr[2],
    				ymax: mapExtentIntArr[3],
    				spatialReference:mapReference
    			});
    			this._mapView.extent = extent;
    			//设置地图比例尺范围 
    			this._mapView.constraints = {
    				lods:eval("("+lodsa+")")
    			};
	    		//投影
	    		this._mapView.spatialReference=mapReference;
	    		//显示等级
	    		//this._mapView.zoom=mapZoom;
	    		//中心点
	    		var centerPoint = new Point({
	    			x: mapXYIntArr[0],
	    			y: mapXYIntArr[1],
	    			spatialReference:mapReference
	    		});
	    		this._centerPoint=centerPoint;
	        	//this._mapView.center=centerPoint;
	    		
	    		//初始化设置地图比例尺 、坐标
	    		$("#scaleDiv").empty().html("比例尺1:<span id='scale'>"+ scaleArr[mapZoom+1] +"</span>");
	    		$("#coordinateDiv").empty().html("坐标:<span id='coordinate'>0.0,0.0</span>");
        	}	
        	
        },
        addProxyRule:function(url){
            var me=this;
            var re=new RegExp ("^http[s]{0,1}://.*?/");
            var serverHost=url.match(re);
            if($.inArray(serverHost[0],me.serverHostArr) == -1 && serverHost && serverHost.length>0){
                urlUtils.addProxyRule({
                    urlPrefix: serverHost[0],
                    proxyUrl: "proxy.jsp"
                });
                me.serverHostArr.push(serverHost[0]);
            }

        },
        initMap: function () {
        	var me = this;
        	//移除放大缩小按钮
    		this._mapView.ui.remove("zoom");
    		//地图比例尺
    		// var scaleBar = new ScaleBar({
    		//   container:"scaleBar",
       		//   view: this._mapView,
       		//   unit: "metric"
       		// });
    		
    		//地图放大缩小
    		this._mapView.on(['mouse-wheel','double-click'],function(evt){
    			$(".site-skintools").removeClass("is-open");
    			me.onMapZoomEnd(evt);
    		});
    		
    		//放大缩小按钮
    		$(".BMap_button_new").click(function(evt){
    			var isClass=$(this).hasClass("BMap_stdMpZoomIn");
    			$(".site-skintools").removeClass("is-open");
    			var changeZoom,scaleStr;
    			if(isClass){
    				changeZoom=me._mapView.zoom+1;
    				scaleStr=me._scaleArr[me._mapView.zoom+1];
    			}else{
    				changeZoom= me._mapView.zoom-1;
    				scaleStr=me._scaleArr[me._mapView.zoom-1];
    			}
    			me._mapView.goTo({
    		      target: me._mapView.center,
    		      zoom: changeZoom
    		    });
    			$("#scale").html(scaleStr);
    		});
    		
    		//地图动画
    		this._mapView.watch("animation", function(response){
			  if(response && response.state === "running"){
				//动画开始
		        $("#loadAnimation").show();
			  }else{
				$("#loadAnimation").hide();
			  }
			});
    		
    		//地图坐标
    		this._mapView.on('pointer-move',function(evt){
    			me.mapCoordinate(evt);
    		});
    		//地图加载动画
    		$("#loadAnimation").hide();
        },
        /**
         * 添加图层
         * isChecked:是否显示,
         * layerObj:图层信息
         */
        addLoadLayer: function(isChecked, layerObj) {
        	var me=this;
        	//获取图层对象
         	var layer = this._myMap.findLayerById(layerObj.id);
         	//获取当前图层层级顺序
 			var orderIndex = getLayerOrder(this._myMap.allLayers);
            me.addProxyRule(layerObj.pd.layer_url);
         	if(layer){    //图层已经存在
         		if(isChecked){  //改变图层显示顺序，放最上面
         			//设置地图显示层级,6:电子地图,7:影像图
	         		if(layerObj && layerObj.pd.layer_type == "layer_type_dt" || layerObj.pd.layer_type == "layer_type_yxt"){
	         			this._myMap.reorder(layer, 0);
	         		}else{
	         			//获取当前地图显示顺序最大值
	         			this._myMap.reorder(layer,orderIndex);
	         		}
         		}
         		layer.visible = isChecked;
         	}else{
         		if(isChecked){
	         		//设置图层默认透明度
	         		if(!layerObj.layer_alpha){
	         			layerObj.layer_alpha = 1;
	         		}
	         		if(layerObj.pd.load_type == "layer_load_dynamic"){//动态加载数据图层
	         	   		require([
	         	   		  "esri/core/Collection",
	         	   		  "esri/layers/MapImageLayer"
	         	 		],(Collection, MapImageLayer) =>{
	         	 			var collection = new Collection();
	         	 			var layers = layerObj.pd.layer_table.toString().split(",");
	         	 			for(var i = 0; i < layers.length; i++){
	         	 				collection.add(new Object({id:parseInt(layers[i])}));
	         	 			}
	         	 			
	         	 			var imageLayer = new MapImageLayer({
	         	 				id: layerObj.id,
	         	 				url:  layerObj.pd.layer_url,
	         	 				opacity: layerObj.layer_alpha,
	         	 				sublayers: collection
	         	 			});
	         	 			this._myMap.layers.add(imageLayer);
			         		this._myMap.reorder(imageLayer,orderIndex == 0 ? orderIndex + 1 : orderIndex);
	         	 		});
	         		}else if(layerObj.pd.load_type == "layer_load_vector"){ //矢量切片数据加载
						require([
							"esri/layers/VectorTileLayer"
						],(VectorTileLayer) => {
							var tileLayer = new VectorTileLayer({
								id: layerObj.id,
								url:  layerObj.pd.layer_url,
								opacity: layerObj.layer_alpha
							});
							this._myMap.layers.add(tileLayer);
							this._myMap.reorder(tileLayer,orderIndex == 0 ? orderIndex + 1 : orderIndex);
						});
					}else{//瓦片数据加载
	         			require([
	         			   "esri/layers/TileLayer"
	         	 		],(TileLayer) => {
	         	 			var tileLayer = new TileLayer({  
	         	 				id: layerObj.id,
	         	 				url:  layerObj.pd.layer_url,
	         	 				opacity: layerObj.layer_alpha
	         	 			});
	         	 			this._myMap.layers.add(tileLayer);
         	 				this._myMap.reorder(tileLayer,orderIndex);
         	 				//6:电子地图,7:影像图, 电子地图和影像图置于地图最低端
	         	 			if(layerObj.pd && layerObj.pd.layer_type == "layer_type_yxt" || layerObj.pd.layer_type == "layer_type_dt"){
	         	 				this._myMap.reorder(tileLayer, 0);
	         	 			}
	         	 		});
	         		}
         		}
         	}
        },
        /**地图放大缩小完成事件**/
        onMapZoomEnd: function(evt){
        	var scaleStr = null;
        	if(evt.deltaY>0){//缩小
        		scaleStr = this._scaleArr[this._mapView.zoom-1];
        	}else{//放大
        		scaleStr = this._scaleArr[this._mapView.zoom+1];
        	}
        	$("#scale").html(scaleStr);
        },
        /**测距**/
        measureLength: function(){
        	if(this.measure){
        		var handlers = this.measure._draw._handlers;
    			dojo.forEach(handlers, function (handler) {
    				handler.remove();
    			});
        		this.measure = null;
        	}
        	this.measure = new Measure(this._mapView,{coordinates:'projected'});
        	this.measure.activate(Measure.TOOLS.LENGTH,{
  				 customUnit:"千米",
  				 parseResult:function(result){return result},
  				 decimal:2, // 保留小数位数
  				 unit:'' // 此处为测量单位，为api中geometryEngine里的单位字符串，默认为米和平方米
  			 });  
        },
        /**测面**/
        measureArea: function(){
        	if(this.measure){
        		var handlers = this.measure._draw._handlers;
        		dojo.forEach(handlers, function (handler) {
                    handler.remove();
                });
        		this.measure = null;
        	}
        	this.measure = new Measure(this._mapView,{coordinates:'projected'});
        	this.measure.activate(Measure.TOOLS.AREA,{
   				 customUnit:'平方公里',
   				 parseResult:function(result){return result/1000},
   				 decimal:3, 
   				 unit:'' 
   			});
        },
        /**获取mapView对象**/
        getMapView: function(){
        	return this._mapView;
        },
        /**多屏联动**/
        multiAssociate: function(mapObj){
        	var extent = new Extent({
				xmin: mapObj.extent.xmin,
				ymin: mapObj.extent.ymin,
				xmax: mapObj.extent.xmax,
				ymax: mapObj.extent.ymax,
				spatialReference:new SpatialReference({wkid:mapObj.spatialReference.wkid})
			});
        	this._mapView.extent=extent;
        },
        /**地图坐标**/
        mapCoordinate: function(point){
        	var point = this._mapView.toMap({x: point.x, y: point.y});
   		    dom.byId("coordinate").innerHTML=point.x.toFixed(2)+","+point.y.toFixed(2);
        },
        /**删除map中所有图层**/
        removeMapLayerAll: function(){
        	this._mapView.graphics.removeAll();
        	this._mapView.allLayerViews.removeAll();
        },
        //初始化地图绘制类
        initMapGeoDraw: function(){
        	if(!this.mapGeoDraw){
        		this.mapGeoDraw = new MapGeoDraw(this._mapView);
        	}
        },
        //初始化地图标注对象
        initMapBookMark: function(){
        	if(!this.bookMark){
        		this.bookMark = new BookMark(this._mapView,{coordinates:'projected'});
        		this.bookMark.startup();
        	}
        }
    });
    
    return MapInit;
});
