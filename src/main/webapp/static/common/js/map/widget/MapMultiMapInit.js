/**
 * 多屏地图初始化js
 */
define([
    "widget/MapCustom",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/core/urlUtils",
    "esri/geometry/SpatialReference"
], function (
	Custom, 
	Map, 
   	MapView,
   	Point,
   	Extent,
    urlUtils,
   	SpatialReference
) {
    'use strict';

    var MultiMapInit = Custom.createSubclass({
        declaredClass: "esri.custom._MultiMapInit",
        normalizeCtorArgs: function (container) {
            var me = this;
            this.serverHostArr=[];
            this._myMap = new Map();
            this._mapView = new MapView({
          	  container: container,  
        	  map: this._myMap
    		});
        },
        initMultiMap: function (mapParam, mainMap) {
        	var me=this;
        	var mapView = this._mapView;
        	var zoomArr=mapParam.zoom_solutions.split(",");
        	var mapExtentStrArr=mapParam.map_extent.split(",");
        	var mapXYArr=mapParam.map_xy.split(",");
        	var mapExtentIntArr=[];
        	var mapXYIntArr=[];
        	var mapReference=parseInt(mapParam.map_refernce);
        	var scaleArr=mapParam.map_scales.split(",");
        	var mapScalesIntArr=[];
        	var mapZoom=mapParam.map_zoom;
        	mapExtentStrArr.forEach(function(data,index,arr){  
        		mapExtentIntArr.push(+data);  
        	});
        	mapXYArr.forEach(function(data,index,arr){  
        		mapXYIntArr.push(+data);  
        	});
        	scaleArr.forEach(function(data,index,arr){  
        		mapScalesIntArr.push(+data);  
        	});
        	
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
    			//设置地图比例尺范围 
    			this._mapView.constraints = {
    				lods:eval("("+lodsa+")")
    			};
    			
    			//地图范围参数
    			var extent = new Extent({
    				xmin: mapExtentIntArr[0],
    				ymin: mapExtentIntArr[1],
    				xmax: mapExtentIntArr[2],
    				ymax: mapExtentIntArr[3],
    				spatialReference:mapReference
    			});
    			this._mapView.extent = extent;
    			//投影
    			this._mapView.spatialReference=mapReference;
        	}
        	//移除放大缩小按钮
    		this._mapView.ui.remove("zoom");
        	
        	//分屏与主屏范围同步
        	me.multiAssociate(mainMap);
        	
        	//分屏移动显示坐标
        	me._mapView.on('pointer-move',function(evt){
        		multiMapMoveShowCoor(evt);
        	});
        	
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
        /**添加图层**/
        addLoadLayer: function (isChecked, layerObj){
        	var me=this;
        	var myMap = this._myMap;
        	//获取图层对象
         	var layer = myMap.findLayerById(layerObj.id);
         	//获取当前图层层级顺序
 			var orderIndex = parent.getLayerOrder(myMap.allLayers);
 			me.addProxyRule(layerObj.pd.layer_url)
         	if(layer){    //图层已经存在
         		if(isChecked){  //改变图层显示顺序，放最上面
         			//设置地图显示层级,6:电子地图,7:影像图
	         		if(layerObj && layerObj.pd.layer_type == 'layer_type_dt' || layerObj.pd.layer_type == 'layer_type_yxt'){
	         			myMap.reorder(layer, 0);
	         		}else{
	         			//获取当前地图显示顺序最大值
	         			myMap.reorder(layer,orderIndex);
	         		}
         		}
         		layer.visible = isChecked;
         	}else{
         		if(!isChecked) return;
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
         	 			myMap.layers.add(imageLayer);
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
         	 			myMap.layers.add(tileLayer)
         	 		    //6:电子地图,7:影像图, 电子地图和影像图置于地图最低端
         	 			if(layerObj.pd && layerObj.pd.layer_type == 'layer_type_dt' || layerObj.pd.layer_type == 'layer_type_yxt'){
         	 				myMap.reorder(tileLayer, 0);
         	 			}
         	 		});
         		}
         	}
        },
        /**主屏联动**/
        multiAssociate: function(mainMap){
        	var extent = new Extent({
				xmin: mainMap.extent.xmin,
				ymin: mainMap.extent.ymin,
				xmax: mainMap.extent.xmax,
				ymax: mainMap.extent.ymax,
				spatialReference:new SpatialReference({wkid:mainMap.spatialReference.wkid})
			});
        	this._mapView.extent=extent;
			//显示等级
        	try{
        		this._mapView.zoom=mainMap.zoom;
        	}catch(e){;}
        },
        getMapView: function(){
        	return this._mapView;
        },
        destroy: function() {
        	this._myMap.removeAll();
        }
    });

    return MultiMapInit;
});