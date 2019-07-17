/**
 * 地图geo绘制
 */
define([
	"widget/MapCustom",
	"esri/geometry/Point",
	"esri/geometry/Polyline",
	"esri/geometry/Polygon",
	"esri/Graphic",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/layers/GraphicsLayer",
	"widget/MapDraw",
	"dojo/dom"
],function(
	Custom,	
	Point,
	Polyline,
	Polygon,
	Graphic,
	SimpleLineSymbol,
	SimpleFillSymbol,
	GraphicsLayer,
	Draw, 
	dom
){
	var tools = {
		POLYGON: 'polygon',
		CIRCLE: 'circle',
		FREE_EXTENT: 'free_extent'
    };
	
	var MapGeoDraw  = Custom.createSubclass({
        declaredClass: "esri.custom._MapGeoDraw",
        normalizeCtorArgs: function (view) {
        	this._mapView = view;
        	this._initDraw();
        	this._drawVectors = new GraphicsLayer({id:"draw_layer_temp"});
        	this._mapView.map.add(this._drawVectors);
        	this._tooltipNode = dom.byId('fn-tooltip-div');
        	this.lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1);
        	this.fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,this.lineSymbol, new dojo.Color([0,0,0,0.1]));
        },
        _initDraw: function(){
        	 var me = this;
             this._draw = new Draw(this._mapView);
             this._draw.watch('end', function(graphic){
            	 if(!graphic) return;
            	 graphic.id = "draw_geo_temp";
            	 me._drawVectors.add(graphic);
                 me._draw.deactivate();
                 //隐藏鼠标tip
             	 var mouseTipNode = $("#fn-tooltip-div");
             	 setTimeout(function(){
             		mouseTipNode.hide();
             	 },100);
             });
        },
        activate: function(geometryType, toolTipMsg){
        	this._draw.deactivate();
        	if(geometryType == "free_extent"){
        		this._draw.tooltipMsg.drag = toolTipMsg;
        	}else{
        		this._draw.tooltipMsg.click = toolTipMsg;
        	}
        	switch (geometryType) {
	            case tools.FREE_EXTENT:
	            	this._draw.activate(Draw.TYPE.FREE_EXTENT); 
	            	break;
	            case tools.POLYGON:
	                this._draw.activate(Draw.TYPE.POLYGON); break;
	            case tools.CIRCLE:
	                this._draw.activate(Draw.TYPE.CIRCLE); break;
	        };
        },
        /**
         * 绘制导入空间图形
         */
        mapShowGeoList: function(geoObjList, _layerId){
        	var mapView = this._mapView;
        	var gl = mapView.map.findLayerById(_layerId);
        	if(!gl){
        		gl = new GraphicsLayer({id: _layerId});
        	}else{
        		gl.removeAll();
        	}
        	gl.spatialReference = mapView.spatialReference;
			if(geoObjList!=null && geoObjList.length>0){
				 for(var i=0;i<geoObjList.length;i++){
					 var geoObj = geoObjList[i];
					 var geometryJson = geoObj.geometry;
					 var geometryType = geoObj.geometryType;
					 var attributes = geoObj.attributes;
					 geoObj.geometry.spatialReference = mapView.spatialReference;
					 var grap = null;
					 if(geometryType == "esriGeometryPolygon"){
					    	grap = new Graphic(new Polygon(geometryJson),this.fillSymbol,attributes);
					  }else if(geometryType=="esriGeometryPolyline"){
					    	grap = new Graphic(new Polyline(geometryJson),null,attributes);
					 }else if(geometryType=="esriGeometryPoint"){
					    	grap = new Graphic(new Point(geometryJson),null,attributes);
					 }
					 //grap = geometryJsonToGraphic(geometryJson, geometryType, attributes);
					 if(grap!=null){
						 grap.title = geoObj.name;
						 grap.id="ligraphic_"+geoObj.id;
						 gl.add(grap);
						 mapView.map.add(gl);
					 }
				  }
			}
			
        },
        /**
         * 添加图层
         */
        addImpGraphic: function(geoObj, layerId){
        	if(geoObj == null){
 			   return ;
 			}
        	var mapView = this._mapView;
 		    var gl = mapView.map.findLayerById(layerId);
 		    var flag = false;
 		   var grap = null;
 		    //判断是否已经存在
 			if(gl!=null && gl.graphics!=null && gl.graphics.length>0){
 				 var graphics = gl.graphics;
 				 for(var i=0;i<graphics.length;i++){
 					 var graphic = graphics.items[i];
 					 if(graphic.id == "graphic_"+geoObj.id){
 						 flag = true;
 						 grap=graphics;
 						 break;
 					 }
 				  }
 			}
 			//gl不存在创建graphicsLayer
 			if(!gl){
        		gl = new GraphicsLayer({id: layerId});
        		gl.spatialReference = mapView.spatialReference;
        		mapView.map.add(gl);
        	}
        	
 			if(flag==false){//不存在添加
 				 var geometryJson = geoObj.geometry;
 				 var geometryType = geoObj.geometryType;
 				 var attributes = geoObj.attributes;
 				 geoObj.geometry.spatialReference = mapView.spatialReference;
 				 if(geometryType == "esriGeometryPolygon"){
 				    	grap = new Graphic(new Polygon(geometryJson),this.fillSymbol,attributes);
 				  }else if(geometryType=="esriGeometryPolyline"){
 				    	grap = new Graphic(new Polyline(geometryJson),null,attributes);
 				 }else if(geometryType=="esriGeometryPoint"){
 				    	grap = new Graphic(new Point(geometryJson),null,attributes);
 				 }
 				 if(grap!=null){
 					 grap.title = geoObj.name;
 					 grap.id="graphic_"+geoObj.id;
 					 gl.add(grap);
 				 }
 			}
 			
 			//清理小屏渲染
 		    //addGraphicsLitterMap();
 			return grap;
        }
	});
	
	return MapGeoDraw;
	
});