/**
 * 地图标记
 */
define([
	"widget/MapCustom",
	"widget/MapGeometryUtil",
	"esri/geometry/Point",
	"esri/geometry/Polyline",
	"esri/geometry/Polygon",
	"esri/Graphic",
	"esri/symbols/SimpleLineSymbol",
	"esri/widgets/Popup",
	"esri/symbols/PictureMarkerSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/layers/GraphicsLayer",
	"esri/PopupTemplate",
	"widget/MapDraw",
	"widget/MapQuery",
	"dojo/dom"
],function(
	Custom,	
	GeometryUtil,
	Point,
	Polyline,
	Polygon,
	Graphic,
	SimpleLineSymbol,
	Popup,
	PictureMarkerSymbol,
	SimpleFillSymbol,
	GraphicsLayer,
	PopupTemplate,
	Draw, 
	MapQuery,
	dom
){
	var tools = {
		POINT: 'point',
		POLYLINE: 'polyline',
		POLYGON: 'polygon',
		INFO: 'info'
	};
	var BookMark  = Custom.createSubclass({
        declaredClass: "esri.custom._BookMark",
        normalizeCtorArgs: function (view, options) {
            var me = this;
            options || (options = {});
            this._options = options;
            this._mapView = view;
            //定义点、线、面绘制初始化样式
            this._defaultSymbol = dojo.mixin({
            	pointSymbol: new PictureMarkerSymbol({
	                url: rootPath+'static/map/images/location/red_A.png',
	                width: "32px",
	                height: "32px"
	            }),
	            //默认绘制polygon的样式
	            polygonSymbol: new SimpleFillSymbol({ 
                    color: [253, 128, 68, 0.2],
                    style: "solid",
                    outline: {
                        color: [253, 128, 68, 1],
                        width: 2
                    }
                }),
                polylineSymbol: new SimpleLineSymbol({
                    color: [253, 128, 68, 1],
                    width: 2,
                    style: "solid"
                }),
                tempPolylineSymbol: new SimpleLineSymbol({
                    color: [0, 124, 247, 1],
                    width: 2,
                    style: "solid"
                })
	            
            }, options.defaultSymbol);
            
            this._Style = {
    	            line: {
    	                strokeWeight: 3,
    	                strokeOpacity: 0.8,
    					strokeStartarrow:'none',
    					strokeEndarrow: 'none',
    	                strokeColor: "#fd8044",
    					strokeDashstyle : 'solid'
    	            },
    	            polygon: {
    	                strokeWeight: 2,
    	                strokeOpacity: 0.8,
    	                strokeColor: "#fd8044",
    	                fillColor: "#f8f7f4",
    	                fillOpacity: 0.2
    	            }
    	    };
            
            //定义鼠标左下角的提示
            this.tooltipMsg = dojo.mixin({
            	pointMove: "创建点标记<br/><span style='color:#CCCCCC;'>单击确定地点</span>",
            	polylineClick: "创建线标记<br/><span style='color:#CCCCCC;'>单击确定地点</span>",
            	polygonClick: "创建面标记<br/><span style='color:#CCCCCC;'>单击确定地点</span>",
            	searchClick: "点击搜索要素"
            }, options.tooltipMsg);
            //初始化geometryUtil工具类
            this._geometryUtil = new GeometryUtil(this._mapView.spatialReference);
            //创建graphicsLayer
            this._drawVectors = new GraphicsLayer({id:"bookmark_layer_temp"});
            //添加到mapView
            this._mapView.map.add(this._drawVectors);
            this._draw = new Draw(this._mapView);
            this._mapQuery = new MapQuery();
        },
        startup: function(){
        	var me = this;
        	this._initDraw();
        },
        activate: function (geometryType) {
        	var me = this;
            this._geometryType = geometryType;
            this.tooltipNode = dom.byId('fn-tooltip-div');
            $(document).mousemove(function(e){
            	me.tooltipNode.style.left = (event.x+15) + 'px';
            	me.tooltipNode.style.top = (event.y+15) + 'px';
            });
            this.tooltipNode.style.display = "block";

            switch (geometryType) {
	            case tools.POLYGON:
	            	this._draw.tooltipMsg.click = this.tooltipMsg.polygonClick;
	                this._draw.activate(Draw.TYPE.POLYGON); 
	                break;
	            case tools.POLYLINE:
	            	this._draw.tooltipMsg.click = this.tooltipMsg.polylineClick;
	                this._draw.activate(Draw.TYPE.POLYLINE); 
	                break;
	            case tools.POINT:
	            	this._draw.tooltipMsg.click = this.tooltipMsg.pointMove;
	            	this._draw._defaultSymbol.point = this._defaultSymbol.pointSymbol;
	                this._draw.activate(Draw.TYPE.POINT); 
	                break;
	            case tools.INFO:
	            	this.registerMapClickEvents(); 
	            	me.tooltipNode.innerHTML = this.tooltipMsg.searchClick;
	            	break;
	        };
        },
        _initDraw: function () {
        	var me = this;
            //监听鼠标移动
            this._draw.watch('pointermove', function (graphic) {
            });
            //监听结束动作
            this._draw.watch('end', function (graphic) {
            	var that = this;
            	var graphic = me._buildBookMarkPopup(graphic);
            	graphic.id='draw_geo_temp';
            	
            	//获取图形的中心点以及定位
        		me._geometryUtil.getGeometryCenterByURL(graphic.geometry, function(mapPoint){
        			//定位
        			me._mapView.goTo({
    			      target: mapPoint,
    			      zoom: me._mapView.zoom
    			    });
        			//打开popup
        			me._openMapPopup(graphic, mapPoint);
        		});
            	that.deactivate();
            });
        },
        //注册地图点击事件
        registerMapClickEvents: function(){
        	var me = this;
        	//注册点击事件
            this._handlers = [this._mapView.on('click', function (event) {
            	var graphic = null;
            	var geometry = event.mapPoint;
        		
        		if(mapProject.visibleMapLayers.length == 0) {
        			showMessage("请先添加图层, 然后再做要素识别", 8);
        		}else{
        			//搜索图层
        			var searchLayer = mapProject.visibleMapLayers[mapProject.visibleMapLayers.length-1];
        			//图层url
        			var layerUrl = searchLayer.pd.layer_url + "/" + searchLayer.pd.layer_table;
        			var queryWhere = "1=1";
        			me._mapQuery.query(layerUrl, queryWhere, geometry, true, function(response){
        				
        				var searchGraphic = response.features[response.features.length-1];
        				if(searchGraphic){//查询到要素信息
        					var attr = searchGraphic.attributes;
        					var graphic = me._buildBookMarkPopup(searchGraphic);
        					//定位
        					me._mapView.goTo({
        						target: geometry,
        						zoom: me._mapView.zoom
        					});
        					//根据类型设置symbol
        					if(graphic && graphic.geometry.type == "point"){
        						graphic.symbol = me._defaultSymbol.pointSymbol;
        					}else if(graphic && graphic.geometry.type == "polyline"){
        						graphic.symbol = me._defaultSymbol.polylineSymbol;
        					}else if(graphic && graphic.geometry.type == "polygon"){
        						graphic.symbol = me._defaultSymbol.polygonSymbol;
        					}
        					//地图缩放合适范围 
        					setMapExtentByGeometry(geometry, -2);
        					//图形高亮闪3下
        					parent.graphicsFlashing([graphic],me._drawVectors,5,false,false,false);
        					//simpleHighLightGraphic(me._drawVectors, graphic);
        					//打开popup
        					var mapPoint = geometry;
        					me._openMapPopup(graphic, mapPoint);
        					
        				}else{//没有查询到要素信息
        					showMessage("暂无查询到任何要素信息", 8);
        				}
        			});
        		}
        		
        		me.tooltipNode.style.display = "none";
        		me.tooltipNode.innerHTML = '';
        		dom.byId(me._mapView.container.id).style.cursor="default";
        		//移除点击事件
        		dojo.forEach(me._handlers, function (handler) {
        			handler.remove();
        		});
            })];
        },
        //构造标注graphic的popup模版
        _buildBookMarkPopup: function(graphic, bookMark_name){
        	if(!bookMark_name){
        		bookMark_name = "";
        	}
        	var me = this;
        	if(graphic.geometry.type == "point"){
        		var style = {
            		width: me._defaultSymbol.pointSymbol.width,
            		height: me._defaultSymbol.pointSymbol.height,
            		url: me._defaultSymbol.pointSymbol.url,
            		labelAlign: 'cb'  
            	};
            	var id = "bookmark_point_"+ new Date().getTime();
    			var attributes = {id:id, markid:id, bk_name:"", bk_content:"", style:style, type:"point"};
    			var iframeHtml = "<iframe src='Map/toPointTemplate?bk_name="+ bookMark_name +"&bk_content=&id="+ id +"&icon=static/map/images/location/red_A.png&project_id=&token="+localStorage.token+"' style='border: 0px;' width='310px' height='185px' marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=0 name=mapIframe scrolling='no' id='pointIframe'></iframe>";
    			graphic.popupTemplate = new PopupTemplate({
        			title: "点标记",
        			content: iframeHtml
        		});
    			graphic.attributes = attributes;
    			me._drawVectors.add(graphic);
        	}else if(graphic.geometry.type == "polyline"){
        		var style = {
		            strokeWeight: me._Style.line.strokeWeight,
	                strokeOpacity: me._Style.line.strokeOpacity,
					strokeStartarrow:me._Style.line.strokeStartarrow,
					strokeEndarrow: me._Style.line.strokeEndarrow,
	                strokeColor: me._Style.line.strokeColor,
					strokeDashstyle : me._Style.line.strokeDashstyle
			    }
        		
        		var id = "bookmark_line_"+ new Date().getTime();
        		var bk_context = "";
        		var bk_name = bookMark_name;
        		var strokeWeight = me._Style.line.strokeWeight;
    	        var strokeColor = me._Style.line.strokeColor.replace("#", "");
    	        var strokeOpacity = me._Style.line.strokeOpacity ;
    			var strokeDashstyle = me._Style.line.strokeDashstyle;
    			var strokeStartarrow = me._Style.line.strokeStartarrow;
    			var strokeEndarrow = me._Style.line.strokeEndarrow;
        		
    			var parameters = encodeURI(encodeURI(bk_name)) + '&bk_content=' + encodeURI(encodeURI(bk_context)) +
    			'&id=' + encodeURI(encodeURI(id)) + '&strokeWeight=' + encodeURI(encodeURI(strokeWeight)) + 
    			'&strokeColor=' + encodeURI(encodeURI(strokeColor)) + '&strokeOpacity=' + encodeURI(encodeURI(strokeOpacity))+ 
    			'&strokeDashstyle=' + encodeURI(encodeURI(strokeDashstyle))+ '&strokeStartarrow=' + encodeURI(encodeURI(strokeStartarrow))+ 
    			'&strokeEndarrow=' + encodeURI(encodeURI(strokeEndarrow)); 
    			
    			var attributes = {id:id,markid:id,bk_name:"",bk_content:"",style:style,type:"polyline"};
    			var htmlUrl = "Map/toPolylineTemplate?bk_name="+parameters+"&token="+localStorage.token;
    			var iframeHtml = "<iframe src='"+ htmlUrl +"' style='border: 0px;' width='310px' height='185px' marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=0 name=mapIframe scrolling='no' id='polylineIframe'></iframe>";
    			graphic.popupTemplate = new PopupTemplate({
        			title: "线标注",
        			content: iframeHtml
        		});
    			graphic.attributes = attributes;
    			me._drawVectors.add(graphic);
    			
        	}else if(graphic.geometry.type == "polygon"){
        		var style = {
			            strokeWeight: me._Style.polygon.strokeWeight,
		                strokeOpacity: me._Style.polygon.strokeOpacity,
		                strokeColor: me._Style.polygon.strokeColor,
		                fillColor: me._Style.polygon.fillColor,
		                fillOpacity: me._Style.polygon.fillOpacity
				    };
        		var id = "bookmark_polygon_"+ new Date().getTime();
        		var bk_content = "";
        		var bk_name = bookMark_name;
        		
    	        var strokeColor = me._Style.polygon.strokeColor.replace("#", "");
    	        var fillColor = me._Style.polygon.fillColor.replace("#", "");
    	        
    			var parameters = encodeURI(encodeURI(bk_name)) + '&bk_content=' + encodeURI(encodeURI(bk_content)) +
    			'&id=' + encodeURI(encodeURI(id)) + '&strokeWeight=' + encodeURI(encodeURI(style.strokeWeight)) + 
    			'&strokeColor=' + encodeURI(encodeURI(strokeColor)) + '&strokeOpacity=' + encodeURI(encodeURI(style.strokeOpacity))+ 
    			'&fillColor=' + encodeURI(encodeURI(fillColor))+ '&fillOpacity=' + encodeURI(encodeURI(style.fillOpacity)); 
    			
    			var attributes = {id:id,markid:id,bk_name:"",bk_content:"",style:style,type:"polygon"};
    			var htmlUrl = "Map/toPolygonTemplate?bk_name="+parameters+"&token="+localStorage.token;
    			var iframeHtml = "<iframe src='"+ htmlUrl +"' style='border: 0px;' width='310px' height='185px' marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=0 name=mapIframe scrolling='no' id='polygonIframe'></iframe>";
    			graphic.popupTemplate = new PopupTemplate({
        			title: "面标注",
        			content: iframeHtml
        		});
    			graphic.attributes = attributes;
    			me._drawVectors.add(graphic);
        	}
        	return graphic;
        },
        /**
         * 打开指定graphic的popupTemplate
         * graphic 需要显示popup的graphic
         * mapPoint 坐标点
         */
        _openMapPopup: function(graphic, location){
        	this._mapView.popup.dockOptions = {
            	buttonEnabled: false
            };
        	this._mapView.popup.open({
                title: graphic.popupTemplate.title,
                content: graphic.popupTemplate.content,
                location: location
            });
        },
        /**
         * 初始化所有标记数据
         * allBookMarkData 当前用户和专题查询得到的所有标记记录
         */
        initAllBookMarkData: function(allBookMarkData){
        	var me = this;
        	if (this._start) {
		        return;
		    }
        	$.each(allBookMarkData, function(i, bookMark){
        		var graphic = me._buildGraphic(bookMark);
			    me._drawVectors.add(graphic);
        	});
        	this._start = true;
        },
        /**
         * 删除几何图形
         */
        deleteMapGraphic: function(id,callback){
        	//关闭popup
        	this._mapView.popup.close();
	    	//删除几何图形
        	var graphic = this._getGraphicForLayer(id);
        	this._drawVectors.remove(graphic);
        	if(!(id.indexOf("bookmark_") != -1)){//已经保存数据库的，则删除记录，更新列表
        		var t = window.setTimeout(dojo.hitch(this,function(){
  			        window.clearTimeout(t);
  					SystemInfo.removeMapMark(id, dojo.hitch(this,function(data){	
  					     this._updateBookMarks("delete", data);
  					     if(callback){
  					    	 callback();
  					     }
  				    }));   
   	  		    }),200);
        	}
        },
        //清空地图上所有标注的graphic
        clearAllBookMark: function(){
        	this._mapView.popup.close();
        	this._drawVectors.removeAll();
        },
        /**地图上是否显示**/
        bookMarkIsShow: function(flag){
        	this._drawVectors.visible = flag;
        	this._mapView.popup.close();
        },
		/**
		 * 保存标记(点，线，面)到数据库
		 * @param {Object} id
		 * @param {Object} name
		 * @param {Object} context
		 * @param {Object} userId 登录用户id
		 * @param {Object} currProjectId 当前专题id
		 */
		saveCurrentFeature: function(id, bk_name, bk_content, user_id, project_id){
			var me = this;
	    	var geometryJson = null;
	    	var style = null;
	    	var graphic = me._getGraphicForLayer(id);
	    	if(graphic.geometry.type == "point"){
	    		geometryJson = me._geometryUtil.pointToWKT(graphic.geometry);
	    		style = graphic.symbol;
	    	}else if(graphic.geometry.type == "polyline"){
	    		geometryJson = me._geometryUtil.lineToWKT(graphic.geometry);
	    		var attributes = graphic.attributes;
	    		var style = attributes.style;
	    		style = {
		            strokeWeight: graphic.symbol.width,
	                strokeOpacity: graphic.symbol.color.a,
	                /*strokeStartarrow: graphic.symbol.,
					strokeEndarrow: graphic.symbol.,*/
	                strokeColor: style.strokeColor,
					strokeDashstyle : graphic.symbol.style
			    }
	    	}else if(graphic.geometry.type == "polygon"){
	    		geometryJson = me._geometryUtil.polygonToWKT(graphic.geometry);
	    		var attributes = graphic.attributes;
	    		var style = attributes.style;
	    		style = {
	    				strokeWeight: graphic.symbol.outline.width,
    	                strokeOpacity: graphic.symbol.outline.color.a,
    	                strokeColor: style.strokeColor,
    	                fillColor: style.fillColor,
    	                fillOpacity: graphic.symbol.color.a
				    };
	    	}
	    	var _id = id;
	        var result = {
		            id: id.toString().indexOf("bookmark_") != -1 ? null : id,
		            bk_name: bk_name,
		            bk_content: bk_content,
		            geometry_text: dojo.toJson({
		                geometryWKT: geometryJson,
		                style: style
		            }),
		            user_id: user_id,
		            project_id: project_id
	        }
	        //保存标注
		    var t = window.setTimeout(dojo.hitch(this,function(){
					window.clearTimeout(t);
					SystemInfo.saveMapMark(result, dojo.hitch(this,function(data){	
						    var resultData = data;
						    if(id.toString().indexOf("bookmark_") != -1){//保存
						    	//清除修改之前的
						    	me.deleteMapGraphic(id);
						    	//数据库
						    	this._updateBookMarks("add",resultData);
							}else{//修改
								this._updateBookMarks("update",resultData);
							}
				    }));   
		    }),200);
	    },
	    /**
         * 添加、修改、删除(列表)刷新列表
         * operationType 操作类型
         * data 需要操作的数据
         */
        _updateBookMarks: function(operationType, data){
        	if(this.userBookMarks==null){
	    		this.userBookMarks = new Array();
	    	}
        	if(data!=undefined && data != null){
        		if(operationType == "add" || operationType == "update"){//添加、修改
        			if(operationType == "add"){
        				var graphic = this._buildGraphic(data);
        				this._drawVectors.add(graphic);
	    			}else if( operationType == "update"){
	    				//找到graphic
	    				var oldGraphic = this._getGraphicForLayer(data.id);
	    				var newGraphic = this._buildGraphic(data);
	    				this._drawVectors.remove(oldGraphic);
	    				this._drawVectors.add(newGraphic);
	    				
	    				//修改列表记录
	    				$("#"+data.id).find("span[name='bk_name']").empty().html(data.bk_name);
	    				$("#"+data.id).find("span[name='bk_content']").empty().html(data.bk_content);
	    		   		
	    			}
        		}else if(operationType == "delete"){//删除
        			//var id = data.id;
        			//this.deleteMapGraphic(id);
        			var oldGraphic = this._getGraphicForLayer(data.id);
    				this._drawVectors.remove(oldGraphic);
        		}
        		//关闭popup
        		this._mapView.popup.close();
        		//标注iframe对象
				if(!document.getElementById('iframe_result_bookmark')){
					return;
				}
        		var bookMarkIframe = document.getElementById('iframe_result_bookmark').contentWindow;
    			//重新计算标注列表高度
    			bookMarkIframe.subSomething();
    			//刷新标注列表
    			bookMarkIframe.initBookMarkList();
    			//消息提醒
    			var msg = "";
    			if(operationType == "add"){
    				msg = "标注添加成功";
    			}else if(operationType == "update"){
    				msg = "标注修改成功";
    			}else if(operationType == "delete"){
    				msg = "标注删除成功";
    			}
    			showMessage(msg, 1);
        	}
        },
	    /**
         * 更新当前操作的点symbol(图片)
         * scr 标记icon
         * id 标记记录id
         */
        updatePointSymbol: function(src, id){
        	var me = this;
		    var graphic = this._getGraphicForLayer(id);
	    	var attributes = graphic.attributes;
    		//移除
    		me._drawVectors.remove(graphic);
    		var symbol = graphic.symbol;
    		var geometry = graphic.geometry;
    		//添加
    		var newSymbol = new PictureMarkerSymbol({
    			url: src,
    			width: symbol.width,
    			height: symbol.height
    		})
    		var newGraphic = new Graphic({
    			attributes:attributes,
    			symbol:newSymbol,
    			geometry:geometry
    		});
    		me._drawVectors.add(newGraphic);
        },
        /**
         * 更新线symbol
         * strokeColor: 颜色
         * strokeWeight： 线宽度
         * fillOpacity： 填充透明度
         * strokeDashstyle：线样式(实线、虚线等)
         * strokeStartarrow：
         * strokeEndarrow：
         * id:记录编码
         */
        updatePolylineSymbol: function(strokeColor, strokeWeight, fillOpacity, strokeDashstyle, strokeStartarrow, strokeEndarrow, id){
        	var me = this;
        	var graphic = this._getGraphicForLayer(id);
	    	var attributes = graphic.attributes;
    		//移除
    		me._drawVectors.remove(graphic);
    		var symbol = graphic.symbol;
    		var geometry = graphic.geometry;
    		
    		var colorArr = (showRGB2(strokeColor)+","+fillOpacity).split(",");
	    	var color = new dojo.Color(colorArr);
	    	var symbol  = null;
	    	if(strokeDashstyle=="solid"){
	    		 symbol =  new SimpleLineSymbol({
	    			 color: color,
	    			 width: strokeWeight,
	    			 style: 'solid'
	    		 });
	    	}else	if(strokeDashstyle=="dot"){
	    		 symbol = new SimpleLineSymbol({
	    			 color: color,
	    			 width: strokeWeight,
	    			 style: 'dot'
	    		 });
	    	}else	if(strokeDashstyle=="dash"){
	    		 symbol = new SimpleLineSymbol({
	    			 color: color,
	    			 width: strokeWeight,
	    			 style: 'dash'
	    		 });
	    	}else	if(strokeDashstyle=="dashdot"){
	    		 symbol =  new SimpleLineSymbol({
	    			 color: color,
	    			 width: strokeWeight,
	    			 style: 'dash-dot'
	    		 });
	    	}
	    	attributes.style.strokeColor=strokeColor;
    		
    		var newGraphic = new Graphic({
    			attributes:attributes,
    			symbol:symbol,
    			geometry:geometry
    		});
    		//添加
    		me._drawVectors.add(newGraphic);
        },
        /**
         * 更新面symbol
         * strokeWeight: 线宽度
         * strokeOpacity： 线透明度
         * strokeColor： 线颜色
         * fillColor：填充颜色
         * fillOpacity：填充透明度
         * id:记录编码
         */
        updatePolygonSymbol: function(strokeColor, strokeWeight, fillColor, strokeOpacity, fillOpacity, id) {
        	var me = this;
        	var graphic = this._getGraphicForLayer(id);
	    	var attributes = graphic.attributes;
	    	
	    	//移除
    		me._drawVectors.remove(graphic);
    		var geometry = graphic.geometry;
	    	
    		//边框颜色和透明度rgba
	    	var colorlineArr = (showRGB2(strokeColor)+","+strokeOpacity).split(",");
	    	var linecolor = new dojo.Color(colorlineArr);
	    	var lineSymbol = 
	    		new SimpleLineSymbol({
		   			 color: linecolor,
					 width: strokeWeight,
					 style: 'solid'
				 });
	    	attributes.style.strokeColor=strokeColor;
	    	
	    	//填充颜色和透明度
	    	var colorfillArr = (showRGB2(fillColor)+","+fillOpacity).split(",");
	    	var fillcolor = new dojo.Color(colorfillArr);
	    	var symbol =  new SimpleFillSymbol({
	    		color: fillcolor,
	    		outline: lineSymbol,
	    		style: 'solid'	
	    	});
	    	attributes.style.fillColor=fillColor;
	    	
	    	var newGraphic = new Graphic({
    			attributes:attributes,
    			symbol:symbol,
    			geometry:geometry
    		});
    		//添加
    		me._drawVectors.add(newGraphic);
        	
        },
	    /**
	     * 在graphicsLayer中找到指定的graphic对象
	     * id： graphic中attraibutes的id属性
	     */
	    _getGraphicForLayer: function(id){
	    	var graphics = this._drawVectors.graphics.items;
	    	var targetGraphic = null;
	    	$.each(graphics, function(i, graphic){
	    		var attributes = graphic.attributes;
	    		if(attributes.id == id){
	    			targetGraphic = graphic;
	    			return false;
	    		}
	    	});
	    	return targetGraphic;
	    },
	    /**
	     * 构造graphic
	     * bookMark： 标记记录
	     */
	    _buildGraphic: function(bookMark){
	    	var me = this;
	    	var geos = bookMark.geometry_text;
	    	if(Object.prototype.toString.call(bookMark.geometry_text) !== "[object Object]"){
	    		geos=JSON.parse(bookMark.geometry_text);
		 	}
			var bk_name = bookMark.bk_name;
		    var bk_content =  bookMark.bk_content;
		    var id =  bookMark.id;
		    var project_id =  bookMark.project_id;
		    var user_id = bookMark.user_id;
		    var style = geos.style;
		    var type = "";
		    var symbol = null;
		    if (geos.geometryWKT.indexOf("POINT") > -1) {
		    	type = "point";
		    	//样式
		    	symbol = new PictureMarkerSymbol({
		    		url: style.url,
		    		width: style.width,
		    		height: style.height
		    	});
			}else if(geos.geometryWKT.indexOf("LINESTRING") > -1){
				type = "line";
				//16进制颜色值转rgba颜色值(包含透明度)
				var colorlineArr = (showRGB2(style.strokeColor)+","+style.strokeOpacity).split(",");
		    	var linecolor = new dojo.Color(colorlineArr);
				//样式
		    	symbol = new SimpleLineSymbol({
                    color: linecolor,
                    width: style.strokeWeight,
                    style: style.strokeDashstyle
                });
			}else if(geos.geometryWKT.indexOf("POLYGON") > -1){
				type = "polygon";
				
				//边框颜色和透明度rgba
		    	var colorlineArr = (showRGB2(style.strokeColor)+","+style.strokeOpacity).split(",");
		    	var linecolor = new dojo.Color(colorlineArr);
		    	var lineSymbol = 
		    		new SimpleLineSymbol({
			   			 color: linecolor,
						 width: style.strokeWeight,
						 style: 'solid'
					 });
		    	
		    	//填充颜色和透明度
		    	var colorfillArr = (showRGB2(style.fillColor)+","+style.fillOpacity).split(",");
		    	var fillcolor = new dojo.Color(colorfillArr);
				symbol = new SimpleFillSymbol({
		    		color: fillcolor,
		    		outline: lineSymbol,
		    		style: 'solid'	
		    	});
		    	
			}
		    var attributes = {
		    		id:id,
		    		bk_name:bk_name,
		    		bk_content:bk_content,
		    		project_id:project_id,
		    		user_id:user_id,
		    		style:style,
		    		type:type
		    	};
		    var graphic = new Graphic({
		    	attributes:attributes,
                symbol:symbol,
                geometry:me._geometryUtil.wktToGeometry(geos.geometryWKT, me._mapView.spatialReference)
		    });
		    var newGraphic = me._buildGraphicTemplate(graphic)
		    graphic.popupTemplate = newGraphic.popupTemplate;
		    return graphic;
	    },
	    //构造graphic的template
	    _buildGraphicTemplate: function(graphic){
	    	var me = this;
	    	var popupContent = null;
	    	var popupTitle = null;
	    	//var geometry = null;
	    	var symbol = null;
	    	if(graphic && graphic.geometry.type == "point"){
	    		var geometry = graphic.geometry;
	    		var attributes = graphic.attributes;
	    		var style = graphic.symbol;
		    	popupTitle = "点标记";
				symbol = new PictureMarkerSymbol(style.url, style.width, style.height);
				 
				//设置popup模版
				var htmlUrl = 'Map/toPointTemplate?bk_name=' + encodeURI(encodeURI(attributes.bk_name)) +
				 '&bk_content=' + encodeURI(encodeURI(attributes.bk_content)) + '&id=' + encodeURI(encodeURI(attributes.id)) 
				 + '&icon=' + encodeURI(encodeURI(style.url))+ '&project_id=' + encodeURI(encodeURI(attributes.project_id))+'&token='+localStorage.token;
				popupContent = "<iframe src='"+ htmlUrl +"' style='border: 0px;' width='280px' height='190px' marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=0 name=mapIframe scrolling='no' id='pointIframe'></iframe>";
	    	}else if(graphic && graphic.geometry.type == "polyline"){
	    		var geometry = graphic.geometry;
	    		var attributes = graphic.attributes;
	    		var symbolOld = graphic.symbol;
	    		var style = attributes.style;
		    	popupTitle = "线标记";
				symbol = new SimpleFillSymbol({ // 默认绘制polygon的样式
                    color: symbolOld.color,
                    style: symbolOld.style,
                    outline: {
                        color: symbolOld.color,
                        width: symbolOld.width
                    }
				});
                var strokeColor = showRGB([symbol.color.r,symbol.color.g,symbol.color.b]);
                strokeColor = strokeColor.substr(1, strokeColor.length);
                
                //设置popup模版
				var htmlUrl = 'Map/toPolylineTemplate?bk_name=' + encodeURI(encodeURI(attributes.bk_name)) +
				 '&bk_content=' + encodeURI(encodeURI(attributes.bk_content)) + '&id=' + encodeURI(encodeURI(attributes.id)) 
				 + '&project_id=' + encodeURI(encodeURI(attributes.project_id)) + '&strokeWeight=' + encodeURI(encodeURI(style.strokeWeight)) + 
     			'&strokeColor=' + encodeURI(encodeURI(strokeColor)) + '&strokeOpacity=' + encodeURI(encodeURI(style.strokeOpacity))+ 
    			'&strokeDashstyle=' + encodeURI(encodeURI(style.strokeDashstyle))+ '&strokeStartarrow=none' + 
    			'&strokeEndarrow=none'+'&token='+localStorage.token;
				popupContent = "<iframe src='"+ htmlUrl +"' style='border: 0px;' width='280px' height='190px' marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=0 name=mapIframe scrolling='no' id='polylineIframe'></iframe>";
				
	    	}else if(graphic && graphic.geometry.type == "polygon"){
	    		var geometry = graphic.geometry;
	    		var attributes = graphic.attributes;
	    		var style = attributes.style;
	    		var symbolOld = graphic.symbol;
		    	popupTitle = "面标记";
	    		//边框颜色和透明度rgba
		    	var strokeColor = showRGB([symbolOld.outline.color.r,symbolOld.outline.color.g,symbolOld.outline.color.b]);
		    	strokeColor = strokeColor.substr(1, strokeColor.length);
		    	var lineSymbol = 
		    		new SimpleLineSymbol({
			   			 color: symbolOld.outline.color,
						 width: symbolOld.outline.width,
						 style: symbolOld.outline.style
					 });
		    	
		    	//填充颜色和透明度
		    	var fillColor = showRGB([symbolOld.color.r,symbolOld.color.g,symbolOld.color.b]);
		    	fillColor = fillColor.substr(1, fillColor.length);
				symbol = new SimpleFillSymbol({
		    		color: symbolOld.color,
		    		outline: lineSymbol,
		    		style: symbolOld.style	
		    	});
				
				//设置popup模版
				var parameters = encodeURI(encodeURI(attributes.bk_name)) + '&bk_content=' + encodeURI(encodeURI(attributes.bk_content)) +
    			'&id=' + encodeURI(encodeURI(attributes.id)) + '&strokeWeight=' + encodeURI(encodeURI(style.strokeWeight)) + 
    			'&strokeColor=' + encodeURI(encodeURI(strokeColor)) + '&strokeOpacity=' + encodeURI(encodeURI(style.strokeOpacity))+ 
    			'&fillColor=' + encodeURI(encodeURI(fillColor))+ '&fillOpacity=' + encodeURI(encodeURI(style.fillOpacity))+'&token='+localStorage.token;
    			var htmlUrl = "Map/toPolygonTemplate?bk_name="+parameters;
    			popupContent = "<iframe src='"+ htmlUrl +"' style='border: 0px;' width='310px' height='185px' marginWidth=0 frameSpacing=0 marginHeight=0 frameBorder=0 name=mapIframe scrolling='no' id='polygonIframe'></iframe>";
	    	}
	    	
	    	//设置popup模版
	    	if(symbol && geometry){
	    		var popupTemplate = new PopupTemplate({
	    			title: popupTitle,
	    			content: popupContent
	    		});
	    		graphic.popupTemplate = popupTemplate;
	    	}
	    	return graphic;
	    },
	    //定位标注
	    locationBookMark: function(id){
	    	var me = this;
	    	var graphic = this._getGraphicForLayer(id);
	    	graphic = me._buildGraphicTemplate(graphic);
	    	if(!graphic){
	    		showMessage("标注内容异常,定位失败!", 2);
	    		return;
	    	}
	    	//获取图形的中心点以及定位
	    	me._geometryUtil.getGeometryCenterByURL(graphic.geometry, function(mapPoint){
	    		//定位
	    		me._mapView.goTo({
	    			target: mapPoint,
	    			zoom: me._mapView.zoom
	    		},{
	    			animate: false
	    		});
	    		//打开popup
	    		me._openMapPopup(graphic, mapPoint);
	    	});
	    },
	    /**
	     * 导出shap
	     */
	    exportShape: function(id){
	    	var me = this;
	    	var graphic = me._getGraphicForLayer(id);
	    	if(!graphic){
	    		showMessage("标注内容异常,导出失败!", 2);
	    		return;
	    	}
	    	var attributes2 = graphic.attributes;
	    	var fileName = attributes2.bk_name;
	    	var geometry = graphic.geometry;
	    	
	    	var geometryType = "";
	        if (geometry.type == "point") {
	            geometryType = "esriGeometryPoint";
	        } else if (geometry.type == "polyline") {
	            geometryType = "esriGeometryPolyline";
	        } else if (geometry.type == "polygon") {
	            geometryType = "esriGeometryPolygon";
	        }
	        
	        //添加属性
	        var fields = [];
	        var attributes = [];//graphic.attributes;
	        if(attributes != null){
	            for(var att in attributes){
	            	var length =  att.replace(/[^\x00-\xff]/g, '__').length;
	            	if(length <= 10){
	    	    		var fieldObj = new Object();
	    	    		fieldObj.name = att;
	    	    		fieldObj.type = "esriFieldTypeString";
	    	    		fieldObj.alias = att;
	    	    		fieldObj.length = attributes[att].length;
	    	    		fields.push(fieldObj);
	            	}
	        	}
	        }
	    	
	    	var features = [];
	        var obj = new Object();
	        obj.attributes = attributes;
	        obj.geometry = geometry;
	        features.push(obj);
	        var params = {
        		'fileName': fileName,
                'features': features,
                'fields': fields,
                'geometryType': geometryType,
                'f': "json"
	        };
	        
	        //导出shap
		    var t = window.setTimeout(dojo.hitch(this,function(){
					window.clearTimeout(t);
					SystemInfo.exportShape(params, dojo.hitch(this,function(r){	
				    	//关闭等待导出等待提示
				    }),dojo.hitch(this,function(r){
				    	get2DMap().alertAndConfirm("alert",data.result);
				    }));
		    }),200);
	    },
	    //取消标记
	    cancelBookMark: function(){
	    	this._draw.deactivate();
	    	//移除要素识别点击事件
    		dojo.forEach(this._handlers, function (handler) {
    			handler.remove();
    		});
	    },
	    //外部添加标注接口
	    otherAddBookMark: function(id, bk_name, bk_content, user_id, project_id, geometryJson, style){
	    	//判断是否已经加入
	        var result = {
		            id: null,
		            bk_name: bk_name,
		            bk_content: bk_content,
		            geometry_text: dojo.toJson({
		                geometryWKT: geometryJson,
		                style: style
		            }),
		            user_id: user_id,
		            project_id: project_id
	        }
	        //保存标注
		    var t = window.setTimeout(dojo.hitch(this,function(){
					window.clearTimeout(t);
					SystemInfo.saveMapMark(result);   
		    }),200);
	    }
	});
	
	BookMark.TOOLS = tools;
    return BookMark;
});