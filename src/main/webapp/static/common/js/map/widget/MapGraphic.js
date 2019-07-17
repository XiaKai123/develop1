/**
 * 点、线、面
 */
define([
    "widget/MapCustom",
    "esri/Map",
    "esri/views/MapView",
	"esri/geometry/Point",
	"esri/geometry/Polyline",
	"esri/geometry/Polygon",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/Graphic"
], function (
	Custom,
	Map,
	MapView,
	Point, 
	Polyline,
	Polygon,
	SimpleMarkerSymbol,
	SimpleLineSymbol,
	SimpleFillSymbol,
	Graphic
) {
	'use strict';
	
	var MapGraphic = Custom.createSubclass({
        declaredClass: "esri.custom._MapGraphic",
        normalizeCtorArgs: function (mapView) {
            this._mapView = mapView;
     		//点
     		this._pointSymbol = new SimpleMarkerSymbol({
     			color: [227, 139, 79, 1],
 	        	style: "circle",//circle,solid
     	        outline: {
     	        	color: [255, 0, 0],
     	        	width: 2,
     	        	style: "solid"
     	    	}
     		});
            //线
    		this._lineSymbol = new SimpleFillSymbol({
     			color: [227, 139, 79, 1],
     			style: "solid",
     	        outline: {
     	        	color: [255, 0, 0],
     	        	width: 2,
     	        	style: "solid"
     	    	}
     		});
            //面
    		this._polyonSymbol = new SimpleFillSymbol({
     			color: [227, 139, 79, 0.4],
     			style: "solid",
     	        outline: {
     	        	color: [255, 0, 0],
     	        	width: 2,
     	        	style: "solid"
     	    	}
     		});
        },
        /**
         * 渲染点、线、面
         * @graphicId		图形id
         * @geometry		几何图形
         * @graphicsLayer	几何图层
         * @symbol 			图形样式
         */
        drawGraphic: function(graphicId,geometry,graphicsLayer,symbol){
        	var graphic = new Graphic({
    			geometry: geometry
    		});
        	if(graphicId){
        		//设置graphic图形id
        		graphic.id = graphicId;
        	}
        	if(!symbol){//图形样式为空，根据图形类别设置默认样式
	        	if(geometry.type == "point"){//点
	        		graphic.symbol = this._pointSymbol;
	        	}else if(geometry.type == "polyline"){//线
	        		graphic.symbol = this._lineSymbol;
	        	}else if(geometry.type == "polygon"){//面
	        		graphic.symbol = this._polyonSymbol;
	        	}
        	}else{
        		graphic.symbol = symbol;
    		}
        	if(graphicsLayer){
        		//几何图层不为空，则往几何图层添加图形
    			graphicsLayer.add(graphic);
    		}else{
    			this._mapView.graphics.add(graphic);
    		}
        	return graphic;
        }
	});
	return MapGraphic;
});
