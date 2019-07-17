/**
 * 打印地图
 */
define([
    "widget/MapCustom",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "dojo/dom",
    "esri/core/urlUtils",
    "esri/geometry/SpatialReference"
], function (
	Custom, 
	Map, 
   	MapView,
   	Point,
   	Extent,
   	dom,
    urlUtils,
   	SpatialReference
) {
    'use strict';

    var PrintMapInit = Custom.createSubclass({
        declaredClass: "esri.custom._PrintMapInit",
        normalizeCtorArgs: function (container) {
            var me = this;
            this._myMap = new Map();
            this._mapView = new MapView({
          	  container: container,  
        	  map: this._myMap
    		});
            this.mainView=null;
            this.serverHostArr=[];//当前图层url
        },
        initPrintMap: function (mapParam, mainMap) {
        	var me=this;
        	var mapView = this._mapView;
        	this.mainView=mainMap;
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
    		
    		mainMap.watch("extent",dojo.hitch(me, function(newValue, oldValue, type, g){
				me.multiAssociate(mainMap);
			}))
        	
        	//分屏与主屏范围同步
        	//me.multiAssociate(mainMap);
        	
    		//
        	//分屏移动显示坐标
        	me._mapView.on('pointer-move',function(evt){
        		//multiMapMoveShowCoor(evt);
        	});
        	
        },
        getExtent:function(){
        	this.extent=this._mapView.extent;
        	this.zoom=this._mapView.zoom;
        },
        setExtent:function(){
        	this._mapView.extent=this.extent;
        	this._mapView.zoom=this.zoom;
        },
        addProxyRule:function(url){
        	if(!url){
        		return;
			}
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
        copyMap: function (mainMap){
        	var me=this;
        	 me.subLayers=[];
        	var count=mainMap.allLayerViews.items.length;
        	var countBack=0;
        	$.each(mainMap.allLayerViews.items,function(k,mainLayer){
        		mainLayer=mainLayer.layer;
                me.addProxyRule(mainLayer.url);
        		if(!mainLayer.visible || mainLayer.opacity == 0){
        			countBack++;
        			return true;
        		}
        		if(mainLayer.type == "tile"){
        			require([
               			   "esri/layers/TileLayer"
               	 		],(TileLayer) => {
               	 			var tileLayer = new TileLayer({  
               	 				id: mainLayer.id,
               	 				url: mainLayer.url,
               	 				opacity: mainLayer.opacity
               	 			});
               	 			me._myMap.layers.add(tileLayer)
               	 		countBack++;
               	 		if(count == countBack){
        					me.showLegend();
        				}
//               	 		me.showLegend(0,mainLayer.url);
               	 		    //6:电子地图,7:影像图, 电子地图和影像图置于地图最低端
//               	 			if(layerObj.pd && layerObj.pd.layer_type == 6 || layerObj.pd.layer_type == 7){
//               	 				me._myMap.reorder(tileLayer, 0);
//               	 			}
               	 		});
        		}else if(mainLayer.type == "map-image"){
        			require([
                	   		  "esri/core/Collection",
                	   		  "esri/layers/MapImageLayer"
                	 		],(Collection, MapImageLayer) =>{
                	 			var subLayer  = new Collection();
                	 			var i=0;
                	 			var tmp=[];
                	 			for(;i<mainLayer.sublayers.items.length;i++){
                	 				subLayer.add(new Object({id:parseInt(mainLayer.sublayers.items[i].id)}));
                	 				tmp.push(parseInt(mainLayer.sublayers.items[i].id));
                	 			}
                	 			me.subLayers.push({id:mainLayer.id,subLayers:tmp});
                	 			var imageLayer = new MapImageLayer({
                	 				id: mainLayer.id,
                	 				url: mainLayer.url,
                	 				opacity: mainLayer.opacity,
                	 				sublayers: subLayer //mainLayer.createServiceSublayers().items
                	 			});
                	 			me._myMap.layers.add(imageLayer)
                	 			countBack++;
                	 			if(count == countBack){
                					me.showLegend();
                				}
//                	 			me.showLegend(1,mainLayer.url);
                	 		});
        		}else if(mainLayer.type == "graphics"){
        			require([
        			         "esri/layers/GraphicsLayer",
        			         "esri/Graphic",
        			  		 "esri/geometry/Point",
        			  		 "esri/geometry/Polyline",
        			  		 "esri/symbols/SimpleLineSymbol"
        			 	], function(
        		 			GraphicsLayer,
        		 			Graphic,
        		 	 		Point,
        		 	 		Polyline,
        		 	 		SimpleLineSymbol
        			 	){
        				if(mainLayer.graphics.items.length == 0){
        					return true;
        				}
        				var graphic;
        				var graphicLayer;
        				if(me._myMap.findLayerById(mainLayer.id)){
        					graphicLayer=me._myMap.findLayerById(mainLayer.id);
        					graphicLayer.removeAll();
        				}else{
        					graphicLayer = new GraphicsLayer({id: mainLayer.id, spatialReference: me._myMap.spatialReference});
        					me._myMap.add(graphicLayer);
        				}
        				 
        				var m=0;
        				for(;m<mainLayer.graphics.items.length;m++){
        					var gra=mainLayer.graphics.items[m];
        					var attr={};
            				var geo={};
            				var symbol={};
            				$.extend(true,attr,gra.attributes);
            				$.extend(true,geo,gra.geometry);
            				$.extend(true,symbol,gra.symbol);
            				graphic = new Graphic(geo, symbol,attr);
            				graphicLayer.add(graphic);
        				}
        				me._myMap.reorder(graphicLayer,500+k);
        				countBack++;
        				if(count == countBack){
        					me.showLegend();
        				}
        			});
        		}
        	});
        	var extent = new Extent({
				xmin: me.mainView.extent.xmin,
				ymin: me.mainView.extent.ymin,
				xmax: me.mainView.extent.xmax,
				ymax: me.mainView.extent.ymax,
				spatialReference:new SpatialReference({wkid:me.mainView.spatialReference.wkid})
			});
        	this._mapView.extent=extent;
        	try{
        		this._mapView.zoom=me.mainView.zoom;
        	}catch(e){
        		
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
        	this._mapView.zoom=mainMap.zoom;
        },
        showLegend:function(layerType,url){
        	var me=this;
        	var count=0;
        	var countBack=0;
        	var layerInfo=[];
        	var i=0;
        	for (;i<me._myMap.layers.items.length;i++){
        		var layer=me._myMap.layers.items[i];
        		var layerType =1; 
        		if(layer.type == "tile"){
        			layerType = 0 ;
        			if( layer.title.toLowerCase()== "dzdt"){
        				//return true;// 变break?;
        			}else{
        				layerInfo.push({url:layer.url,type:layerType});
        			}
        		}else if(layer.type == "map-image"){
        			layerType = 1 ;
        			var subLayers  = [];
    	 			var j=0;
    	 			for(;j<me.subLayers.length;j++){
    	 				if(layer.id == me.subLayers[j].id){
    	 					subLayers=me.subLayers[j].subLayers;
    	 					break;
    	 				}
    	 			}
        			layerInfo.push({url:layer.url,type:layerType,subLayers:subLayers});
        		}
        	}
        	me.layerInfo=layerInfo;
        	me.layerCount=0;
        	me.legendHtml="";
//        	var a=0;
//        	var funArr=[];
//        	for(;a<layerInfo.length;a++){
//        		funArr.push(me.getLegendData1(layerInfo[a]));
//        	}
//        	if(funArr.length > 0){
//        		Promise.race([funArr]).then(function(datas){
//        			//datas为，ajax未执行完便返回
//        			var b=0;
//        			var legendHtml="";
//        			for(;b<funArr.length;b++){
//        				legendHtml+=me.getLegendHtml(me.layerInfo[b].type,datas[b].layers);
//        			}
//        			$("#print-legend-content").html(me.legendHtml);
//                	if($("#print-legend-content").height() > 500){
//                		$("#print-legend-parent").css("height",500);
//                	}else{
//                		$("#print-legend-parent").css("height",$("#print-legend-content").height()+10);
//                	}
//        		});
//        	}
        	
        	me.getLegendData();
        	
        },
        getLegendData1:function(layerObj){
        	getMainPageWindow().GuoDi.Map.Request.POST({
                url: layerObj.url+"/legend?f=pjson",
                success: function(r){
                	var legendJson = JSON.parse(r);
                	if(layerObj.hasOwnProperty("subLayers") && layerObj.subLayers.length > 0){
                		var layers=legendJson.layers;
                		var subLayers=layerObj.subLayers;
                		var m=0;
                		var newLayers=[];
                		for(;m<subLayers.length;m++){
                			var n=0;
                			for(;n<layers.length;n++){
                				if(layers[n].layerId == subLayers[m]){
                					newLayers.push(layers[n]);
                				}
                			}
                		}
                		legendJson.layers=newLayers;
                	}
                	return legendJson;
        		},
                failure: function(r){
                	me.layerCount++;
                	me.getLegendData();
                	parent.showMessage("叠加图层图例失败！",2);
        		}
            });
        },
        getLegendData:function(){
        	var me=this;
        	if(me.layerInfo.length > me.layerCount){
        		getMainPageWindow().GuoDi.Map.Request.POST({
                    url: me.layerInfo[me.layerCount].url+"/legend?f=pjson",
                    success: function(r){
                    	var legendJson = JSON.parse(r);
                    	if(me.layerInfo[me.layerCount].hasOwnProperty("subLayers") && me.layerInfo[me.layerCount].subLayers.length > 0){
                    		var layers=legendJson.layers;
                    		var subLayers=me.layerInfo[me.layerCount].subLayers;
                    		var m=0;
                    		var newLayers=[];
                    		for(;m<subLayers.length;m++){
                    			var n=0;
                    			for(;n<layers.length;n++){
                    				if(layers[n].layerId == subLayers[m]){
                    					newLayers.push(layers[n]);
                    				}
                    			}
                    		}
                    		legendJson.layers=newLayers;
                    	}
                    	me.legendHtml+=me.getLegendHtml(me.layerInfo[me.layerCount].type,legendJson.layers);
                    	me.layerCount++;
                    	me.getLegendData();
            		},
                    failure: function(r){
                    	me.layerCount++;
                    	me.getLegendData();
                    	parent.showMessage("叠加图层图例失败！",2);
            		}
                });
        	}else{
        		$("#print-legend-content").html(me.legendHtml);
            	if($("#print-legend-content").height() > 500){
            		$("#print-legend-parent").css("height",500);
            	}else{
            		$("#print-legend-parent").css("height",$("#print-legend-content").height()+10);
            	}
        	}
        	
        },
        getLegendHtml:function(layerType,layers){
        	//拼接图例html
        	var legendHtml = "";
        	for(var i = 0; i < layers.length; i++){
        		//获取图层对象
        		var layerObj = layers[i];
        		
        		var paddingCss = i == 0 ? "padding-top:0px;" : "padding-top:5px;";
        		
        		//动态加载
        		if(layerType == 1){
        			if(true){
        				//图例标题
        				legendHtml += "<div class='row'><div style='"+paddingCss+"'><span style='font-size:12px;color:#312e2e;'>&nbsp;"+layerObj.layerName+"（"+(layerObj.layerId)+"）</span></div>";
        				//获取图层图例数组
        				var legendArray = layerObj.legend;
        				for(var j = 0; j < legendArray.length; j++){
        					var legendObj = legendArray[j];
        					var legendName = legendObj.label;
        					if(legendName.length > 4){
        						//图例名称长度超出4，只显示前面4个文字
        						legendName = legendName.substring(0,5);
        					}
        					//图例说明
        					legendHtml += "<div class='col-xs-4' style='padding:0px;'><img  style=\"opacity: "+1+"\"  src=\"data:"+legendObj.contentType+";base64,"+legendObj.imageData+"\" /> <span style=\"font-size:12px;color:#858585;\" data-toggle='tooltip' data-placement='bottom' title='"+legendObj.label+"'>"+legendName+"</span></div>";
        				}
        				legendHtml += "</div>";
        				break;
        			}
        		}else{//瓦片加载
        			//图例标题
        			legendHtml += "<div class='row'><div style='"+paddingCss+"'><span style='font-size:12px;color:#312e2e;'>&nbsp;"+layerObj.layerName+"（"+(layerObj.layerId)+"）</span></div>";
        			//获取图层图例数组
        			var legendArray = layerObj.legend;
        			for(var j = 0; j < legendArray.length; j++){
        				var legendObj = legendArray[j];
        				var legendName = legendObj.label;
        				if(legendName.length > 4){
        					//图例名称长度超出4，只显示前面4个文字
        					legendName = legendName.substring(0,5);
        				}
        				//图例说明
        				legendHtml += "<div class='col-xs-4' style='padding:0px;'><img  style=\"opacity: "+1+"\"  src=\"data:"+legendObj.contentType+";base64,"+legendObj.imageData+"\" /> <span style=\"font-size:12px;color:#858585;\" data-toggle='tooltip' data-placement='bottom' title='"+legendObj.label+"'>"+legendName+"</span></div>";
        			}
        			legendHtml += "</div>";
        		} 
        	}
        	legendHtml += "";
        	return legendHtml;
        },
        getMapView: function(){
        	return this._mapView;
        },
        /**地图坐标**/
        mapCoordinate: function(point){
        	var point = this._mapView.toMap({x: point.x, y: point.y});
//   		    dom.byId("coordinate").innerHTML=point.x.toFixed(3)+","+point.y.toFixed(3);
        },
        destroy: function() {
        	this._myMap.removeAll();
        }
    });

    return PrintMapInit;
});