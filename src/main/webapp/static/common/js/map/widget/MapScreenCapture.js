/**
 * 
 * GIS地图屏幕截图前端范围选择类
 * @classDescription : 屏幕截图
 */
define([
        "widget/MapCustom",
        "widget/MapQuery",
        "widget/MapDraw",
        "widget/MapMeasure",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/geometry/Polygon",
        "esri/geometry/Point",
        "esri/geometry/Extent",
        "dojo/dom"
], function (
		Custom,
		MapQuery,
		Draw,
		Measure,
		SimpleFillSymbol,
		SimpleLineSymbol,
		Polygon,
		Point,
		Extent,
		dom
) {	
	'use strict';
	
	var ScreenCapture = Custom.createSubclass({
        declaredClass: "esri.custom._ScreenCapture",
        normalizeCtorArgs: function (view) {
        	this._mapView = view;
        	this.isDrag = true;
        	this._extentStyle = {
				strokeWeight: 0.1,
				strokeOpacity: 1,
				strokeColor: "#000000",
				fillColor: "#2319dc",
				fillOpacity: 0.08
			};
        },
        startup: function(){
        	//边框
        	var colorlineArr = (showRGB2(this._extentStyle.strokeColor)+","+this._extentStyle.strokeOpacity).split(",");
        	var linecolor = new dojo.Color(colorlineArr);
        	this.lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, linecolor, this._extentStyle.strokeWeight);
        	//填充
        	var colorfillArr = (showRGB2(this._extentStyle.fillColor)+","+this._extentStyle.fillOpacity).split(",");
        	var fillcolor = new dojo.Color(colorfillArr);
        	this.fillSymbol =  new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, this.lineSymbol, fillcolor);
        	//初始化draw
        	this._draw = new Draw(this._mapView);
        },
        //开始选择范围截屏
        capture: function(){
        	var me = this;
        	this.isStartCapture = true;
        	this.ScreenCaptureTitle = document.createElement('div');
        	this.ScreenCaptureTitle.style.position = "absolute";
        	this.ScreenCaptureTitle.style.zIndex = 99999999;
        	this.ScreenCaptureTitle.style.display = 'none';
        	this.ScreenCaptureTitle.style.left = 0;
        	this.ScreenCaptureTitle.style.top = 0;
        	this.ScreenCaptureTitle.style.border = "1px solid #000000";
        	this.ScreenCaptureTitle.style.backgroundColor = "#ffffe1";
        	this.ScreenCaptureTitle.innerHTML = "<table border='0' cellpadding='0' cellspacing='0' width='160px' height='20px'><tr><td align='center'><font color='#808080' style='font-size:13px;font-family: 宋体;'>按住鼠标左键拖选截图范围</font></tr></td></table>";
        	document.body.appendChild(this.ScreenCaptureTitle);
        	//置空drag原有的tip
        	this._draw.tooltipMsg.drag = "";
        	this._draw.tooltipMsg.dragStart = "";
        	this._draw.tooltipMsg.dragEnd = "";
        	this.onmousemove = dojo.connect(document.body, 'onmousemove', this, function(event){
        		var minx = parseInt($("#mapDiv").css("left"));
        		if((event.clientX + 5)>=minx){
        			this.ScreenCaptureTitle.style.display = 'block';
        			this.ScreenCaptureTitle.style.left = event.clientX + 5;
        			this.ScreenCaptureTitle.style.top = event.clientY + 3;
        		}else{
        			this.ScreenCaptureTitle.style.display = 'none';
        		}
        	});
        	//开始绘制范围
        	this._draw.activate(Draw.TYPE.FREE_EXTENT);
        	//监听绘制完的动作
        	this._draw.watch('end', function(newValue, oldValue, propertyName, target){
        		me._draw.deactivate();//结束绘制
        		var endExtent = target.drag.geometry.extent;
        		var spatialReference= me._mapView.spatialReference;
        		var leftTopMapPoint =  new Point(parseFloat(endExtent.xmin), parseFloat(endExtent.ymax),spatialReference);
        		var rightBottomMapPoint =  new Point(parseFloat(endExtent.xmax), parseFloat(endExtent.ymin),spatialReference);
        		me.isStartCapture = false;
        		me.ScreenCaptureTitle.style.display = 'none';
        		dojo.disconnect(me.onmousemove);
        		me.onmousemove = null;
        		document.body.removeChild(me.ScreenCaptureTitle);
        		me.ScreenCaptureTitle = null;
        		var leftTop =  me._mapView.toScreen(leftTopMapPoint);
        		var rightBottom = me._mapView.toScreen(rightBottomMapPoint);

        		var width = Math.abs(rightBottom.x - leftTop.x);
        		var height = Math.abs(leftTop.y - rightBottom.y);

        		var leftcsh = 0;
        		me.ScreenCaptureDiv = document.createElement('div');
        		me.ScreenCaptureDiv.style.position = "absolute";
        		me.ScreenCaptureDiv.style.cursor = "move";
        		me.ScreenCaptureDiv.title = "双击保存图片到剪切板";
        		me.ScreenCaptureDiv.style.zIndex = 999;
        		me.ScreenCaptureDiv.style.left = parseInt(leftcsh) + parseInt(leftTop.x);
        		try{
        			if(top.window.document.getElementById("mapDiv")){
            			me.ScreenCaptureDiv.style.top = leftTop.y;
            		}else{
            			me.ScreenCaptureDiv.style.top = leftTop.y-62;//若在运维中则减
            		}
        		}catch(e){
        			me.ScreenCaptureDiv.style.top = leftTop.y-62;//若在运维中则减
        		}
        		
        		me.ScreenCaptureDiv.style.width = width;
        		me.ScreenCaptureDiv.style.height = height;
        		me.ScreenCaptureDiv.style.border = "1px solid #000000";
        		me.ScreenCaptureDiv.innerHTML = "<div style='width:100%;height:100%;' class='blankAlpha0'></div>";

        		me.ScreenCapturePointConnectArray = new Array();
        		me.ScreenCapturePoint_1 = me.createScreenCapturePoint(0, 0, 4, 'nw-resize', '1');
        		me.ScreenCapturePoint_2 = me.createScreenCapturePoint(width / 2, 0, 4, 'n-resize', '2');
        		me.ScreenCapturePoint_3 = me.createScreenCapturePoint(width, 0, 4, 'ne-resize', '3');
        		me.ScreenCapturePoint_4 = me.createScreenCapturePoint(width, height / 2, 4, 'e-resize', '4');
        		me.ScreenCapturePoint_5 = me.createScreenCapturePoint(width, height, 4, 'nw-resize', '5');
        		me.ScreenCapturePoint_6 = me.createScreenCapturePoint(width / 2, height, 4, 'n-resize', '6');
        		me.ScreenCapturePoint_7 = me.createScreenCapturePoint(0, height, 4, 'ne-resize', '7');
        		me.ScreenCapturePoint_8 = me.createScreenCapturePoint(0, height / 2, 4, 'e-resize', '8');

        		me.ScreenCaptureWH = document.createElement('div');
        		me.ScreenCaptureWH.style.position = "absolute";
        		me.ScreenCaptureWH.style.zIndex = 999;
        		me.ScreenCaptureWH.style.left = 0;
        		me.ScreenCaptureWH.style.top = -25;
        		me.ScreenCaptureWH.style.backgroundColor = "#000000";
        		me.ScreenCaptureWH.innerHTML = "<font color='#ffffff' style='font-size:14px;padding: 3px;' id='ScreenCaptureFont'>" + parseInt(width) + " X " + parseInt(height) + "</font>";
        		me.ScreenCaptureDiv.appendChild(me.ScreenCaptureWH);

        		me.ScreenCaptureConfig = document.createElement('div');
        		me.ScreenCaptureConfig.style.position = "absolute";
        		me.ScreenCaptureConfig.style.zIndex = 999;
        		me.ScreenCaptureConfig.style.left = width - 178;
        		me.ScreenCaptureConfig.style.top = height + 5;
        		me.ScreenCaptureConfig.style.width = 50;
        		me.ScreenCaptureConfig.style.height = 20;
        		me.ScreenCaptureConfig.style.backgroundColor = "#f4f8ff";
        		me.ScreenCaptureConfig.innerHTML = "<div id=\"cap_btn_container\"><div class=\"cap_btn_conbg\" ><div><span id=\"cap_btn_cancel\"  class=\"\"></span><span id=\"cap_btn_show\" class=\"\"></span><span id=\"cap_btn_save\" class=\"\"></span></div></div></div>";
        		me.ScreenCaptureDiv.appendChild(me.ScreenCaptureConfig);
        		document.body.appendChild(me.ScreenCaptureDiv);
        		me.connectScreenCaptureDiv();
        		me.ScreenCaptureDiv.onselectstart = function(){
        			return false;
        		};

        		//范围双击保存
        		me.ScreenCaptureDiv.ondblclick = dojo.hitch(me, function(){
        			var topPx=0;
        			try{
        				topPx=parent.layerInfoTop;
        			}catch(e){
        				topPx=layerInfoTop;
        			}
        			this.msgIndex = layer.msg("正在截屏，请稍后....",{time:0,offset: topPx+"px"});
        			me.startScreenCapture('0');
        		});
        		//保存、取消、确定
        		me.ScreenCapturePointConnectArray.push(dojo.connect(document.getElementById('cap_btn_save'), 'onclick', me, 'startScreenCaptureSave'));
        		me.ScreenCapturePointConnectArray.push(dojo.connect(document.getElementById('cap_btn_show'), 'onclick', me, 'startScreenCaptureUpload'));
        		me.ScreenCapturePointConnectArray.push(dojo.connect(document.getElementById('cap_btn_cancel'), 'onclick', me, 'endScreenCapture'));

        		var coords = dojo.coords(me.ScreenCaptureDiv);
        		if (coords.t >= 22) {
        			me.ScreenCaptureWH.style.top = -22;
        		}
        		else {
        			me.ScreenCaptureWH.style.top = 2;
        		}

        		if (coords.t + coords.h >= dojo.coords(document.body).h - 35) {
        			me.ScreenCaptureConfig.style.top = coords.h - 35;
        		}
        		else {
        			me.ScreenCaptureConfig.style.top = coords.h + 5;
        		}
        		
        		var coords = dojo.coords(me.ScreenCaptureDiv);
    			var x = coords.l + 4;
    			var y = coords.t + 4;
    			var w = coords.w - 8;
    			var h = coords.h - 8;
    			$(me.ScreenCaptureDiv).attr("name",""+x+","+y+","+w+","+h);
    			var top1=$(me.ScreenCaptureDiv).css("top").substring(0,$(me.ScreenCaptureDiv).css("top").length-2);
    			$(me.ScreenCaptureDiv).css('top',Number(top1)+60);
            });
        	//this.displayAll('none');
        	
		},
		/**
		 * 绑定截屏拉伸点 移动相关事件处理
		 */
		disconnectScreenCapturePoint: function(){
			if (this.ScreenCapturePointConnectArray && this.ScreenCapturePointConnectArray.length > 0) {
				for (var i = 0, il = this.ScreenCapturePointConnectArray.length; i < il; ++i) {
					dojo.disconnect(this.ScreenCapturePointConnectArray[i])
				}
				this.ScreenCapturePointConnectArray = new Array();
			}
		},
		/**
		 * 创建截屏DIV拉伸点
		 * @param {Object} left
		 * @param {Object} top
		 * @param {Object} offset
		 * @param {Object} cursor
		 * @param {Object} type
		 */
		createScreenCapturePoint: function(left, top, offset, cursor, type){
			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.zIndex = 999;
			div.style.cursor = cursor;
			div.style.left = left - offset;
			div.style.top = top - offset;
			div.innerHTML = "<img src='static/map/images/screenCapture/ScreenCapture_1.png' width='7' height='7'>";
			this.ScreenCaptureDiv.appendChild(div);
			this.ScreenCapturePointConnectArray.push(dojo.connect(div, 'onmousedown', this, function(event){
				this.pointDragMouseDownType = type;
				this.currentDivDrag = false;
				this.pointDragMouseDown(event);
			}));
			this.ScreenCapturePointConnectArray.push(dojo.connect(div, 'onmouseup', this, 'pointOnmouseup'));
			this.ScreenCapturePointConnectArray.push(dojo.connect(document.body, 'onmouseup', this, 'onDivmouseUp'));
			return div;
		},
		onDivmouseUp: function(event){
			this.index = (this.index==undefined?0:this.index+1);
			this.currentDivDrag = true;
		},
		/**
		 * 拉伸点鼠标按下事件处理---开始拉伸
		 * @param {Object} event
		 */
		pointDragMouseDown: function(event){
			this.draggingpoint = true;
			this.disconnectScreenCaptureDiv();
			this.pointDragMouseMoveHandler = dojo.connect(document.body, 'onmousemove', this, 'pointDragMouseMove');
			if (dojo.isIE) {
				event.currentTarget.setCapture();
			}
			if (!event) {
				event = window.event;
			}
			//记下鼠标按下的位置和大小
			this.pointdragStartLeftDiv = event.clientX;
			this.pointdragStartTopDiv = event.clientY;

			var coords = dojo.coords(this.ScreenCaptureDiv);
			this.pointitopDiv = coords.t;
			this.pointileftDiv = coords.l;

			this._minX = coords.l + 19;
			this._maxX = coords.l + coords.w - 19;
			this._minY = coords.t + 19;
			this._maxY = coords.t + coords.h - 19;

			this.pointObject = event.currentTarget;
			this.pointObject.x = event.clientX;
			this.pointObject.y = event.clientY;
		},
		/**
		 * 拉伸点鼠标弹起事件处理---结束拉伸
		 * @param {Object} event
		 */
		pointOnmouseup: function(event){
			this.draggingpoint = false;
			this.connectScreenCaptureDiv();
			dojo.disconnect(this.pointDragMouseMoveHandler);
			this.pointDragMouseMoveHandler = null;
			if (dojo.isIE) {
				event.currentTarget.releaseCapture();
			}
			this.pointObject = null;
		},
		/**
		 * 拉伸点移动时改变截屏范围
		 * @param {Object} event
		 */
		pointDragMouseMove: function(event){
			var minx = parseInt($("#mapDiv").css("left"));
			if (!this.draggingpoint || event.clientX <= minx || event.clientY <= 0 || event.clientX >= dojo.coords(document.body).w || event.clientY >= dojo.coords(document.body).h) {
				return;
			}
			switch (this.pointDragMouseDownType) {
				case '1':
					if (event.clientX >= this._maxX || event.clientY >= this._maxY) {
						return
					}
					this.ScreenCaptureDiv.style.top = event.clientY + "px";
					this.ScreenCaptureDiv.style.left = event.clientX + "px";
					this.ScreenCaptureDiv.style.width = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.width) - (event.clientX - this.pointdragStartLeftDiv))
					this.ScreenCaptureDiv.style.height = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.height) - (event.clientY - this.pointdragStartTopDiv))
					this.pointdragStartLeftDiv = event.clientX;
					this.pointdragStartTopDiv = event.clientY;
					break;
				case '2':
					if (event.clientY >= this._maxY) {
						return
					}
					this.ScreenCaptureDiv.style.top = event.clientY + "px";
					this.ScreenCaptureDiv.style.height = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.height) - (event.clientY - this.pointdragStartTopDiv))
					this.pointdragStartTopDiv = event.clientY;
					break;
				case '3':
					if (event.clientX <= this._minX || event.clientY >= this._maxY) {
						return
					}
					this.ScreenCaptureDiv.style.top = this.stripPx(this.ScreenCaptureDiv.style.top) + (event.clientY - this.pointdragStartTopDiv) + "px";
					this.ScreenCaptureDiv.style.width = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.width) + (event.clientX - this.pointdragStartLeftDiv))
					this.ScreenCaptureDiv.style.height = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.height) - (event.clientY - this.pointdragStartTopDiv))
					this.pointdragStartLeftDiv = event.clientX;
					this.pointdragStartTopDiv = event.clientY;
					break;
				case '4':
					if (event.clientX <= this._minX) {
						return
					}
					this.ScreenCaptureDiv.style.width = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.width) + (event.clientX - this.pointdragStartLeftDiv))
					this.pointdragStartLeftDiv = event.clientX;
					break;
				case '5':
					if (event.clientX <= this._minX || event.clientY <= this._minY) {
						return
					}
					this.ScreenCaptureDiv.style.width = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.width) + (event.clientX - this.pointdragStartLeftDiv))
					this.ScreenCaptureDiv.style.height = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.height) + (event.clientY - this.pointdragStartTopDiv))
					this.pointdragStartLeftDiv = event.clientX;
					this.pointdragStartTopDiv = event.clientY;
					break;
				case '6':
					if (event.clientY <= this._minY) {
						return
					}
					this.ScreenCaptureDiv.style.height = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.height) + (event.clientY - this.pointdragStartTopDiv))
					this.pointdragStartTopDiv = event.clientY;
					break;
				case '7':
					if (event.clientX >= this._maxX || event.clientY <= this._minY) {
						return
					}
					this.ScreenCaptureDiv.style.left = event.clientX + "px";
					this.ScreenCaptureDiv.style.width = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.width) - (event.clientX - this.pointdragStartLeftDiv))
					this.ScreenCaptureDiv.style.height = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.height) + (event.clientY - this.pointdragStartTopDiv))
					this.pointdragStartLeftDiv = event.clientX;
					this.pointdragStartTopDiv = event.clientY;
					break;
				case '8':
					if (event.clientX >= this._maxX) {
						return
					}
					this.ScreenCaptureDiv.style.left = event.clientX + "px";
					this.ScreenCaptureDiv.style.width = Math.abs(this.stripPx(this.ScreenCaptureDiv.style.width) - (event.clientX - this.pointdragStartLeftDiv))
					this.pointdragStartLeftDiv = event.clientX;
					break;
			}
			this.updateScreenCapturePoint(event);
		},
		/**
		 * 鼠标在当前窗口按下事件处理,开始平移
		 * @param {Object} event
		 */
		dragMouseDown: function(event){
			//开始平移
			this.dragging = true;
			this.startMove(event);
		},
		/**
		 * 鼠标在当前窗口弹起事件处理,结束平移
		 * @param {Object} event
		 */
		onmouseup: function(event){
			//鼠标弹起Div移动事件结束
			this.dragging = false;
			//释放这个事件
			if (this.ScreenCaptureDiv && dojo.isIE) {
				this.ScreenCaptureDiv.releaseCapture();
			}
		},
		/**
		 * document.body鼠标移动事件,用来处理当前窗口移动
		 * @param {Object} event
		 */
		dragMouseMove: function(event){
			if (this.isDrag && this.dragging) {
				this.processMove(event);
			}
		},
		/**
		 * 截屏范围DIV  开始移动
		 * @param {Object} event
		 */
		startMove: function(event){
			if (!event) {
				event = window.event;
			}
			//记下鼠标按下的位置
			this.dragStartLeftDiv = event.clientX;
			this.dragStartTopDiv = event.clientY;
			this.itopDiv = this.stripPx(this.ScreenCaptureDiv.style.top);
			this.ileftDiv = this.stripPx(this.ScreenCaptureDiv.style.left);
			this.dragging = true;
		},
		/**
		 * 截屏范围DIV  鼠标移动处理
		 * @param {Object} event
		 */
		processMove: function(event){
			if (this.isDrag && this.dragging) {
				if (!event) {
					event = window.event;
				}
				
				var minx = parseInt($("#mapDiv").css("left"));
				var coords = dojo.coords(this.ScreenCaptureDiv);
				
				var scTop = this.itopDiv + (event.clientY - this.dragStartTopDiv) <= 0 ? 0 : (this.itopDiv + (event.clientY - this.dragStartTopDiv) + coords.h >= dojo.coords(document.body).h) ? (dojo.coords(document.body).h - coords.h) : this.itopDiv + (event.clientY - this.dragStartTopDiv);
				var scLeft = this.ileftDiv + (event.clientX - this.dragStartLeftDiv) <= minx ? minx : (this.ileftDiv + (event.clientX - this.dragStartLeftDiv) + coords.w >= dojo.coords(document.body).w) ? (dojo.coords(document.body).w - coords.w) : this.ileftDiv + (event.clientX - this.dragStartLeftDiv);
				
				this.ScreenCaptureDiv.style.top = scTop + "px";
				this.ScreenCaptureDiv.style.left = scLeft + "px";
				if (this.ScreenCaptureDiv && dojo.isIE) {
					this.ScreenCaptureDiv.setCapture();
				}
				
				if (coords.t >= 22) {
					this.ScreenCaptureWH.style.top = -22;
				}
				else {
					this.ScreenCaptureWH.style.top = 2;
				}
				
				if (coords.t + coords.h >= dojo.coords(document.body).h - 35) {
					this.ScreenCaptureConfig.style.top = coords.h - 35;
				}
				else {
					this.ScreenCaptureConfig.style.top = coords.h + 5;
				}
			}
		},
		/**
		 * 完成图片
		 */
		startScreenCaptureUpload : function(){
			var topPx="";
			try{
				topPx=parent.layerInfoTop;
			}catch(e){
				topPx=layerInfoTop;
			}
			this.msgIndex = layer.msg("正在截屏，请稍后....",{time:0,offset: topPx+"px"});
			this.startScreenCapture('2');
		},
		/**
		 * 保存图片
		 */
		startScreenCaptureSave : function(){
			var topPx="";
			try{
				topPx=parent.layerInfoTop;
			}catch(e){
				topPx=layerInfoTop;
			}
			this.msgIndex = layer.msg("正在截屏，请稍后....",{time:0,offset: topPx+"px"});
			this.startScreenCapture('1');
		},
		/**
		 * 开始截屏生成图片
		 */
		startScreenCapture: function(type){
			var me = this;
			this.ScreenCaptureWH.style.display = 'none';
			this.ScreenCaptureConfig.style.display = 'none';
			this.ScreenCaptureDiv.title = "";
			
			var map = this._mapView.map;
			var showIds = [];
			//默认初始化图层
			if(mapProject.initLayerArray!=null && mapProject.initLayerArray.length>0){
				for(var i=0;i<mapProject.initLayerArray.length;i++){
					showIds.push(mapProject.initLayerArray[i].layer_id);
				}
			}
			//添加的图层
			if(mapProject.visibleMapLayers!=null && mapProject.visibleMapLayers.length>0){
				for(var i=0;i<mapProject.visibleMapLayers.length;i++){
					showIds.push(mapProject.visibleMapLayers[i].layer_id);
				}
			}

			var coords = dojo.coords(this.ScreenCaptureDiv);
			var x = coords.l + 4-4;
			var y = coords.t + 4-0;//关
			var w = coords.w - 8+10;
			var h = coords.h - 8+4;
			var name=$(this.ScreenCaptureDiv).attr("name");
			try{
    			if(top.window.document.getElementById("mapDiv")){
    				x=Number(name.split(",")[0])-4;
    				y=Number(name.split(",")[1])-4;
    				w=Number(name.split(",")[2])+8;
    				h=Number(name.split(",")[3])+8;
        		}
    		}catch(e){
    			;
    		}
//			x=Number(name.split(",")[0])-4;
//			y=Number(name.split(",")[1])-4;
//			w=Number(name.split(",")[2])+8;
//			h=Number(name.split(",")[3])+8;
			//x = x + window.screenLeft;
			//y = y + window.screenTop;
			type = type == null ? '0' : type;
			//获取截取图形
			//var x = (x - parseInt($("#mapDiv").css("left")));
		    var minPoint = {x:x,y:y};
		    var minMapPoint = this._mapView.toMap(minPoint);
			var maxPoint = {x:(x+w),y:(y+h)};
		    var maxMapPoint = this._mapView.toMap(maxPoint);

			//截取区域
			var xmin = minMapPoint.x;//x最小值
			var ymin = minMapPoint.y;//y最小值
			var xmax = maxMapPoint.x;//x最大值
			var ymax = maxMapPoint.y; //y最大值
			
		    var extent = new Extent(parseFloat(xmin), parseFloat(ymin),parseFloat(xmax),parseFloat(ymax), this._mapView.spatialReference);
		    var clipGeo = fromExtent(extent);
		    var dpi = 200;
		    var imageType = "PNG";
		    var scale = this._mapView.scale;//map.scale;
		    /*if(this._mapView.scalebar != null){
		    	scale = this._gisObject.scalebar.scaleNum; 
		    }*/
		    var graphics =[];
			 //地图叠加
			//var graphicsLayerIds = map.graphicsLayerIds;
			var allLayers = map.allLayers.items;
			if(allLayers!=null && allLayers.length>0){
				for(var i=0;i< allLayers.length;i++){
					var graphicLayer = allLayers[i];
					if(graphicLayer!=null){
						 var layerGraphics = graphicLayer.graphics;
						 if(!layerGraphics)continue;
						 layerGraphics = layerGraphics.items;
						 for(var j=0;j<layerGraphics.length;j++){
							 var graphic = layerGraphics[j];
							 var symbol = graphic.symbol;
							 if(symbol != null){
									 var geoObj = new Object();
									 var geometry = graphic.geometry;
									 geoObj.graGeo = geometry;
									 var geometryType = "";
									 var style = new Object();
									 if(geometry.type=="polygon"){
										 geometryType = "esriGeometryPolygon";
										 if(symbol.outline.style=="none"){
											 style.strokeWeight = 0;
										 }else{
										     style.strokeWeight = symbol.outline.width;
										 }
										 style.strokeOpacity = symbol.outline.color.a;
										 style.strokeColor = showRGB([symbol.outline.color.r,symbol.outline.color.g,symbol.outline.color.b]);
										 style.strokeDashstyle = symbol.outline.style;
										 style.fillColor = showRGB([symbol.color.r,symbol.color.g,symbol.color.b]);
										 style.fillOpacity = symbol.color.a;
									 }else if(geometry.type=="polyline"){
										 geometryType = "esriGeometryPolyline";
										 style.strokeWeight = symbol.width;
										 style.strokeOpacity = symbol.color.a;
										 style.strokeColor = showRGB([symbol.color.r,symbol.color.g,symbol.color.b]);
										 style.strokeDashstyle = symbol.style;					
									 }else if(geometry.type=="point"){
										 geometryType = "esriGeometryPoint";
										 if(symbol.style!=undefined && symbol.style!=null){
											 style.marksymbol = symbol.style;
											 style.size = symbol.size;
											 style.color = showRGB([symbol.color.r,symbol.color.g,symbol.color.b]);
											 var outline = new Object();
											 outline.width = symbol.outline.width;
											 outline.style = symbol.outline.style;
											 outline.color=  showRGB([symbol.outline.color.r,symbol.outline.color.g,symbol.outline.color.b]);
											 style.outline = outline;
										 }
										 //url 标注
										 if(symbol.url!=undefined && symbol.url!=null){
											 style = symbol;
											 if(symbol.url.indexOf("http")!=-1){
												 style.url= symbol.url;
											 }else{
												 style.url= "http://"+baseUrl +"/"+symbol.url;
											 }
										 }
									 }
									 geoObj.style = style;
									 geoObj.geometryType = geometryType;
									 graphics.push(geoObj);
							   }
						  }
					}
				}
				
				//测量标注
				var fontColor = "#000000";
				var totalFontColor = "#FF0000";
				var fontColorRGB = showRGB2(fontColor).split(",");
				var totalFontColorRGB = showRGB2(totalFontColor).split(",");
				var fontsize = (12.0 / 96 * 72);
				//测量工具
				/*if(this._gisObject._mapMeasureDisArr!=null){
					 for(var i=0;i<this._gisObject._mapMeasureDisArr.length;i++){
						 var distanceTool = this._gisObject._mapMeasureDisArr[i];
						 if(distanceTool!=null){//
							 if(distanceTool.infos!=null && distanceTool.infos.length>0){
								 for(var j=0;j<distanceTool.infos.length;j++){
									 var infoPoint = distanceTool.infos[j]["point"];
									 var html = distanceTool.infos[j]["info"].innerHTML;
									 var value = "";//数值
									 var dw = "";//单位
									 if(html.indexOf("起点")==-1){
										 var tempValue = distanceTool.infos[j]["value"];
										 value = tempValue.substring(0,tempValue.indexOf(" "));
										 dw = tempValue.substring(tempValue.indexOf(" "));
									 }
									 var geoObj = new Object();
									 var style = new Object();
									 geoObj.graGeo = infoPoint;
									 geoObj.geometryType = "esriGeometryPoint";
								
									 if(html.indexOf("起点")!=-1){//起点
										 style.text = "<FNT name = \"宋体\" size=\""+fontsize+"\"><CLR red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+html+"</CLR></FNT>";
										 style.xoffset = 10;
										 style.yoffset = 0;
										 style.outlineColor = "#7EABCD";
										 style.outlineXInterval = 1;
										 style.outlineYInterval = 1;
									 }else if(html.indexOf("总长")!=-1){//总长
										 style.text = "<FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">总长：</CLR></FNT><FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+totalFontColorRGB[0]+"\" green= \""+totalFontColorRGB[1]+"\" blue= \""+totalFontColorRGB[2]+"\">"+value+"</CLR></FNT><FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+dw+"</CLR></FNT>";
										 style.xoffset = -40;
										 style.yoffset = 20;
										 style.outlineColor = "#FF0000";
										 style.outlineXInterval = 1;
										 style.outlineYInterval = 6;
									 }else{//
										 style.text = "<FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+value+"</CLR></FNT><FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+dw+"</CLR></FNT>";
										 style.xoffset = 10;
										 style.yoffset = 0;
										 style.outlineColor = "#7EABCD";
										 style.outlineXInterval = 1;
										 style.outlineYInterval = 1;
									 }
									 style.outlineSize = 1;
									 geoObj.style = style;
									 graphics.push(geoObj);
								 }
							 }
						 }
					 }
				 }*/
				 //测量面积
				 /*if(this._gisObject._mapMeasureAreaArr!=null){
					 for(var i=0;i<this._gisObject._mapMeasureAreaArr.length;i++){
						 var areaTool = this._gisObject._mapMeasureAreaArr[i];
						 if(areaTool!=null){
							 if(areaTool.infos!=null && areaTool.infos.length>0){
								 for(var j=0;j<areaTool.infos.length;j++){
									 var infoPoint = areaTool.infos[j]["point"];
									 var html = areaTool.infos[j]["info"].innerHTML;
									 var value = "";//数值
									 var dw = "";//单位
									 if(html.indexOf("起点")==-1){
										 var tempValue = areaTool.infos[j]["value"];
										 value = tempValue.substring(0,tempValue.indexOf(" "));
										 dw = tempValue.substring(tempValue.indexOf(" "));
									 }
									 var geoObj = new Object();
									 var style = new Object();
									 geoObj.graGeo = infoPoint;
									 geoObj.geometryType = "esriGeometryPoint";
									 if(html.indexOf("起点")!=-1){//起点
										 style.text = "<FNT name = \"宋体\" size=\""+fontsize+"\"><CLR red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+html+"</CLR></FNT>";
										 style.xoffset = 10;
										 style.yoffset = 0;
										 style.outlineColor = "#7EABCD";
										 style.outlineXInterval = 1;
										 style.outlineYInterval = 1;
									 }else if(html.indexOf("面积")!=-1){//总长
										 style.text = "<FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">面积：</CLR></FNT><FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+totalFontColorRGB[0]+"\" green= \""+totalFontColorRGB[1]+"\" blue= \""+totalFontColorRGB[2]+"\">"+value+"</CLR></FNT><FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+dw+"</CLR></FNT>";
										 style.xoffset = -40;
										 style.yoffset = 20;
										 style.outlineColor = "#FF0000";
										 style.outlineXInterval = 1;
										 style.outlineYInterval = 6;
									 }else{//
										 style.text = "<FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+value+"</CLR></FNT><FNT name = \"宋体\" size=\""+fontsize+"\"><CLR  red= \""+fontColorRGB[0]+"\" green= \""+fontColorRGB[1]+"\" blue= \""+fontColorRGB[2]+"\">"+dw+"</CLR></FNT>";
										 style.xoffset = 10;
										 style.yoffset = 0;
										 style.outlineColor = "#7EABCD";
										 style.outlineXInterval = 1;
										 style.outlineYInterval = 1;
									 }
									 style.outlineSize = 1;
									 geoObj.style = style;
									 graphics.push(geoObj);
								 }
							 }
						 }
					 }
				 }*/
			}
			//参数
			var params = {
				layerIds:showIds,
				clipGeo:clipGeo,
				dpi:dpi,
				imageType:imageType,
				scale:scale,
				graphics:graphics
			}
			//截图
		    GuoDi.Map.Request.POST({
		        url: rootPath +"rest/MapSoeRest/soeExportImage?d="+ new Date().getTime()+"&token="+localStorage.token,
		        headers: { 'Content-Type': "application/json" },
		        data: encodeURI(dojo.toJson(params)),//记得要对传输内容进行编码不是传输的时候会出现乱码,在后台再解码
		        success: dojo.hitch(this, function(r){
		        	//关闭tip
		        	layer.close(me.msgIndex);
		        	var data = eval("("+r+")");
		        	if(data != null && data.success){
			        	if(type == '2'){//打开
			        		var filePath = data.data.filePath;
			        		window.open(rootPath+"/"+filePath+"?token="+localStorage.token);
			        	}else{//下载
		        		    //window.location.href=rootPath +"MapSoeRest/fileDownload?param="+encodeURI(encodeURI(data.Body)) ;
		        		    window.location.href=rootPath +"rest/MapSoeRest/Downloadfile?param="+encodeURI(encodeURI(JSON.stringify(data.data)))+"&token="+localStorage.token;
			        	}
		        	}else{
		        		showMessage(data.respMessage,8);
		        	}		        		
		        	me.endScreenCapture();
		        }),
		        failure: function(r){
		        	showMessage("系统有误，请联系管理员！",2);
		        }
		  });
			
		},
		/**
		 * 每次移动或改变截屏范围时  更新拉伸点的位置
		 */
		updateScreenCapturePoint: function(event){
			var coords = dojo.coords(this.ScreenCaptureDiv);
			this.ScreenCapturePoint_2.style.left = coords.w / 2 - 4;
			this.ScreenCapturePoint_2.style.top = 0 - 4;
			this.ScreenCapturePoint_3.style.left = coords.w - 4;
			this.ScreenCapturePoint_3.style.top = 0 - 4;
			this.ScreenCapturePoint_4.style.left = coords.w - 4;
			this.ScreenCapturePoint_4.style.top = coords.h / 2 - 4;
			this.ScreenCapturePoint_5.style.left = coords.w - 4;
			this.ScreenCapturePoint_5.style.top = coords.h - 4;
			this.ScreenCapturePoint_6.style.left = coords.w / 2 - 4;
			this.ScreenCapturePoint_6.style.top = coords.h - 4;
			this.ScreenCapturePoint_7.style.left = 0 - 4;
			this.ScreenCapturePoint_7.style.top = coords.h - 4;
			this.ScreenCapturePoint_8.style.left = 0 - 4;
			this.ScreenCapturePoint_8.style.top = coords.h / 2 - 4;

			//拉伸处理
			if(this.pointObject != undefined && this.pointObject != null && this.currentDivDrag == true){
				if((this.pointObject.x-200)>event.clientX  || (this.pointObject.x+200)<event.clientX || (this.pointObject.y-200)>event.clientY  || (this.pointObject.y+200)<event.clientY){
					this.pointOnmouseup(event);
				}
			}
			document.getElementById('ScreenCaptureFont').innerHTML = coords.w + " X " + coords.h;

			this.ScreenCaptureConfig.style.left = coords.w - 185;
			this.ScreenCaptureConfig.style.top = coords.h + 5;

			if (coords.t >= 22) {
				this.ScreenCaptureWH.style.top = -22;
			}
			else {
				this.ScreenCaptureWH.style.top = 2;
			}

			if (coords.t + coords.h >= dojo.coords(document.body).h - 35) {
				this.ScreenCaptureConfig.style.top = coords.h - 35;
			}
			else {
				this.ScreenCaptureConfig.style.top = coords.h + 5;
			}
		},
		/**
		 * 绑定截屏范围DIV 移动相关事件处理
		 */
		connectScreenCaptureDiv: function(){
			this.ScreenCaptureConnectArray = new Array();
			this.ScreenCaptureConnectArray.push(dojo.connect(this.ScreenCaptureDiv, 'onmousedown', this, 'dragMouseDown'));
			this.ScreenCaptureConnectArray.push(dojo.connect(this.ScreenCaptureDiv, 'onmouseup', this, 'onmouseup'));
			this.ScreenCaptureConnectArray.push(dojo.connect(document.body, 'onmousemove', this, 'dragMouseMove'));
		},
		/**
		 * 解除截屏范围DIV 移动相关事件处理
		 */
		disconnectScreenCaptureDiv: function(){
			if (this.ScreenCaptureConnectArray && this.ScreenCaptureConnectArray.length > 0) {
				for (var i = 0, il = this.ScreenCaptureConnectArray.length; i < il; ++i) {
					dojo.disconnect(this.ScreenCaptureConnectArray[i])
				}
				this.ScreenCaptureConnectArray = new Array();
			}
			this.onmouseup();
		},
		/**
		 * 结束截屏范围选择
		 */
		endScreenCapture: function(){
			this.disconnectScreenCaptureDiv();
			this.disconnectScreenCapturePoint();
			//this.displayAll('block');
			if (this.pointDragMouseMoveHandler) {
				dojo.disconnect(this.pointDragMouseMoveHandler);
			}
			if(this.ScreenCaptureTitle){
				this.ScreenCaptureTitle.style.display = 'none';
				dojo.disconnect(this.onmousemove);
				this.onmousemove = null;
				document.body.removeChild(this.ScreenCaptureTitle);
				this.ScreenCaptureTitle = null;
			}
			if(this.ScreenCaptureDiv){
				this.ScreenCaptureDiv.innerHTML = "";
				document.body.removeChild(this.ScreenCaptureDiv);
				this.ScreenCaptureDiv = null;
			}
			this.ScreenCapturePoint_1 = null;
			this.ScreenCapturePoint_2 = null;
			this.ScreenCapturePoint_3 = null;
			this.ScreenCapturePoint_4 = null;
			this.ScreenCapturePoint_5 = null;
			this.ScreenCapturePoint_6 = null;
			this.ScreenCapturePoint_7 = null;
			this.ScreenCapturePoint_8 = null;
			this.ScreenCaptureWH = null;
			this.ScreenCaptureConfig = null;
			this.dragging = false;
			this.draggingpoint = false;

			if(this.toolDrawEndHandler){
					dojo.disconnect(this.toolDrawEndHandler);
			}
			this.isStartCapture = false;
		},
		/**
		 * 坐标处理,把带PX字符去除
		 * @param {Object} value
		 */
		stripPx: function(value){
			if (value == "") {
				return 0;
			}
			return parseFloat(value.substring(0, value.length - 2));
		}
	});
	return ScreenCapture;
});