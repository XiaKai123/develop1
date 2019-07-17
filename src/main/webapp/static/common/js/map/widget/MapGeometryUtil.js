define([
  "widget/MapCustom",
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/geometry/Polygon",
  "esri/geometry/Multipoint",
  "esri/geometry/Extent",
  "esri/request"
], function (
	Custom,
	Point,
    Polyline,
    Polygon,
    Multipoint,
    Extent,
    esriRequest
) {
    'use strict';

    var GeometryUtil = Custom.createSubclass({
        declaredClass: "esri.custom._GeometryUtil",
        normalizeCtorArgs: function (spatialReference) {
        	this._spatialReference=spatialReference;
        },
        /**点转成字符串***/
		pointToWKT: function(geometry) {
			return "POINT" + "(" + geometry.x + " " + geometry.y + ")";
		},
		/**线转成字符串***/
		lineToWKT: function(geometry) {
			var geoStr = "LINESTRING" + "(";
			var paths = geometry.paths[0];
			for (var k = 0; k < paths.length; k++) {
				geoStr += paths[k][0] + " " + paths[k][1] + ",";
			}
			return geoStr = geoStr.substring(0, geoStr.length - 1) + ")";
		},
		/**面转成字符串***/
		polygonToWKT: function(geometry) {
			var geoStr = "POLYGON" + "(" + "(" + "";
			var rings = geometry.rings[0];
			for (var j = 0; j < rings.length; j++) {
				geoStr += rings[j][0] + " " + rings[j][1] + ",";
			}
			return geoStr = geoStr.substring(0, geoStr.length - 1) + ")" + ")";
		},
		/**面转成字符串***/
		extentToPolygon: function(extentGeometry) {
			var polygon = new Polygon(this._spatialReference);
			var rings = new Array();
			rings.push(new Point(parseFloat(extentGeometry.xmin), parseFloat(extentGeometry.ymax),this._spatialReference));
			rings.push(new Point(parseFloat(extentGeometry.xmin), parseFloat(extentGeometry.ymin),this._spatialReference));
			rings.push(new Point(parseFloat(extentGeometry.xmax), parseFloat(extentGeometry.ymin),this._spatialReference));
			rings.push(new Point(parseFloat(extentGeometry.xmax), parseFloat(extentGeometry.ymax),this._spatialReference));
			rings.push(new Point(parseFloat(extentGeometry.xmin), parseFloat(extentGeometry.ymax),this._spatialReference));
			polygon.addRing(rings);
			return polygon;
		},
		
		/**将字符串拼成几何对象**/	 
		wktToGeometry: function(wkt) {
			var spatialReference = this._spatialReference;
			var geo = null;
			if (wkt == null || wkt == "") {
				return null;
			}
			if(Object.prototype.toString.call(wkt) === "[object Object]"){
				wkt=JSON.stringify(wkt);
		 	}
			var headStr = wkt.substring(0, wkt.indexOf("("));
			var temp = wkt.substring(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"));
			if (headStr.indexOf("POINT") != -1) {
				var values = temp.split(" ");
				geo = new Point(parseFloat(values[0]), parseFloat(values[1]),spatialReference);
			} else if (headStr.indexOf("LINESTRING") != -1) {
				var polyline = new Polyline(spatialReference);
				var lineValues = temp.split(",");
				var paths = new Array();
				for (var i = 0; i < lineValues.length; i++) {
					var linePoints = lineValues[i].split(" ");
					paths.push(new Point(parseFloat(linePoints[0]), parseFloat(linePoints[1]),spatialReference));
				}
				polyline.addPath(paths);
				geo = polyline;
			} else if (headStr.indexOf("POLYGON") != -1) {
				var polygon = new Polygon(spatialReference);
				temp = temp.substring(temp.indexOf("(") + 1, temp.lastIndexOf(")"));
				var gonValues = temp.split(",");
				var rings = new Array();
				for (var j = 0; j < gonValues.length; j++) {
					var gonPoints = gonValues[j].split(" ");
					if (gonPoints.length > 2 && gonPoints[0] == "") {
						rings.push(new Point(parseFloat(gonPoints[1]), parseFloat(gonPoints[2]),spatialReference));
					} else rings.push(new Point(parseFloat(gonPoints[0]), parseFloat(gonPoints[1]),spatialReference));
				}
				polygon.addRing(rings);
				geo = polygon;
			}
			return geo;
		},
		/**服务调用获取中心****/
		getGeometryCenterByURL: function(geometry, callback) {
			var me = this;
			var geometryType = "";
			if (geometry.type == "point") {
				geometryType = "esriGeometryPoint";
			} else if (geometry.type == "polyline") {
				geometryType = "esriGeometryPolyline";
			} else if (geometry.type == "polygon") {
				geometryType = "esriGeometryPolygon";
			}
			var geometryCenterUrl = geoCenterURL;
			if (geometryCenterUrl != null && geometryCenterUrl != "") {
				var query = {
						'geometry': dojo.toJson(geometry),
						'geometryType': geometryType,
						'f': "json"
				};
				var options = {
				  responseType: "json",
				  callbackParamName: "callback",
				  query: query
				};

				var queryStr=urlEncode(query);
                Ajax.post(geometryCenterUrl,queryStr,function(response){
                    response=JSON.parse(response);
                    var mapPoint = new Point(response.x, response.y, me._spatialReference);
                    callback(mapPoint);
				})

                // esriRequest(
					// geometryCenterUrl,
					// options
                // ).then(function(response){
					//  //var geoJson = response.data;
					// var mapPoint = new Point(response.data.x, response.data.y, me._spatialReference);
					// callback(mapPoint);
                // },function (resp) {
					// debugger;
                // });
				/*content: content,
					load: function(response, io) {
						var mapPoint = new Point(response.x, response.y, this._spatialReference);
						callback(mapPoint);
					},
					error: function() {
						var mapPoint = me.getGeometryCenter(geometry);
						callback(mapPoint);
					}*/
			} else {
				var mapPoint = this.getGeometryCenter(geometry);
				callback(mapPoint);
			}
			
		},
		
		/**服务调用获取中心****/
		getGeometryCenterByRest: function(geometry, callback) {
			var geometryType = "";
			if (geometry.type == "point") {
				geometryType = "esriGeometryPoint";
				callback(geometry);
				return ;
			} else if (geometry.type == "polyline") {
				geometryType = "esriGeometryPolyline";
			} else if (geometry.type == "polygon") {
				geometryType = "esriGeometryPolygon";
			}
			var content = {
					'geometry': dojo.toJson(geometry),
					'geometryType': geometryType,
					'f': "json"
			};
			GuoDi.Map.Request.POST({
				url: baseRestUrl +"/rest/getGeometryCenter.json?d="+ new Date().getTime(),
				headers: { 'Content-Type': "application/json" },
				data: encodeURI(dojo.toJson(content)),//记得要对传输内容进行编码不是传输的时候会出现乱码,在后台再解码
				success: dojo.hitch(this, function(r){
					var mapPoint;
					if(r != ''){
						var data = eval('(' + r + ')');
						mapPoint = new Point(data.x, data.y, this._spatialReference);	
					}else{
						mapPoint = geometry.getExtent().getCenter();
					}
					if(callback){
						callback(mapPoint);
					}	     
				}),
				failure: function(r){
					var mapPoint = geometry.getExtent().getCenter();
					callback(mapPoint);
				}
			});          
		},
		/**获取图形的中心点****/
		getGeometryCenter:function(geometry){
			var mapPoint;
			switch(geometry.type){
			case "point":
				mapPoint=geometry;
				break;
			case "polyline":
				var paths=geometry.paths;
				var len=0;
				var pathindex=0;
				for(var i=0;i<paths.length;i++){
					var pathLen=this.calcPathLen(paths[i]);
					if(pathLen>len){
						len=pathLen;
						pathindex=i;
					}
				}
				var centerIndex=paths[pathindex].length/2;
				mapPoint=paths[pathindex][centerIndex];
				break;
			case "polygon":
				mapPoint=this.getGravityCenter(geometry);
				break;
			}
			return mapPoint;
		},
		/**
		 * 获取多边形重心
		 * */
		getGravityCenter:function(polygon){  
			var me = this;
			var ext = polygon.extent;              
			var p0 = new Point(ext.xmin, ext.ymin,this._spatialReference);
			var momentX = 0;  
			var momentY = 0;  
			var weight = 0;  
			
			var ringindex=0;
			if(polygon.rings.length==1){
				ringindex=0;
			}else{
				//找出面积最大的多边形,计算单个多边形的重心 
				var sArea=0;
				for(var i=0;i<polygon.rings.length;i++){
					var ring=polygon.rings[i];
					var ringArea=me.calcConvexpolygonArea(ring);
					if(ringArea>sArea){
						sArea=ringArea;
						ringindex=i;
					}
				}
			}
			var pts = polygon.rings[ringindex];  
			for ( var j=0; j<pts.length; j++ )  {  
				var p1 = polygon.getPoint(ringindex, j);  
				var p2;  
				if( j==pts.length-1 )  
				{  
					p2 = polygon.getPoint(ringindex, 0);  
				} else  {  
					p2 = polygon.getPoint(ringindex, j+1);  
				}  
				var dWeight = (p1.x-p0.x)*(p2.y-p1.y)- (p1.x-p0.x)*(p0.y-p1.y)/2   - (p2.x-p0.x)*(p2.y-p0.y)/2  - (p1.x-p2.x)*(p2.y-p1.y)/2;  
				weight += dWeight;    
				
				var pTmp = new Point((p1.x+p2.x)/2, (p1.y+p2.y)/2,this._spatialReference);  
				var gravityX = p0.x + (pTmp.x-p0.x)*2/3;  
				var gravityY = p0.y + (pTmp.y-p0.y)*2/3;  
				momentX += gravityX*dWeight;  
				momentY += gravityY*dWeight;                      
			}
			return new Point(momentX/weight, momentY/weight,this._spatialReference);  
		},
		/**
		 * 计算三角形面积
		 * */
		calcTriangleArea:function(p0,p1,p2){
			return (p1.x-p0.x)*(p2.y-p0.y)-(p1.y-p0.y)*(p2.x-p0.x);  
		},
		/**
		 * 计算凸多边形的面积
		 * */
		calcConvexpolygonArea:function(points){
			var me = this;
			var s=0;
			for(var i=1;i<points.length-2;i++){
				s+=me.calcTriangleArea(points[0],points[i],points[i+1]);
			}
			return 0.5*Math.abs(s);
		},
		/**
		 * 计算Path的长度
		 * */
		calcPathLen:function (points){
			var len=0;
			for(var i=1;i<points.length;i++){
				len+=Math.sqrt(Math.pow((points[i].x-points[i-1].x),2)+Math.pow((points[i].y-points[i-1].y),2));
			}
			return len;
		}
    });
    
    return GeometryUtil;
});