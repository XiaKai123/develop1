define([
    "widget/MapCustom",
    "widget/MapDraw",
    "esri/geometry/geometryEngine",
    "esri/symbols/TextSymbol",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/dom-construct"
], function (
	Custom, 
	Draw, 
	geometryEngine, 
	TextSymbol, 
	Graphic, 
	GraphicsLayer, 
	SimpleMarkerSymbol, 
	domConstruct
) {
    'use strict';

    var tools = {
        AREA: 'area',
        LENGTH: 'length',
        LOCATION: 'location',
        CIRCLE: 'circle',
        FREE_POLYGON: 'free_polygon',
        FREE_POLYLINE: 'free_polyline',
        FREE_EXTENT: 'free_extent'
    };
    var _tpl = dojo.string.substitute;
    var startTemplate = '<div class="result-div" data-randomid="${randomId}" data-mapx="${mapx}" data-mapy="${mapy}" style="position:absolute;left:${screenx}px;top:${screeny}px;border: #ff0103 1px solid;background:#fff;font-size:13px;border-radius: 3px;font-family: 宋体,Arial,sans-serif;color: #0c0c0c;padding-left: 2px;padding-right: 2px;">起点</div>';
    var resultTemplate = '<div class="result-div" data-randomid="${randomId}" data-mapx="${mapx}" data-mapy="${mapy}" style="position:absolute;left:${screenx}px;top:${screeny}px;border: #ff0103 1px solid;background:#fff;font-size:13px;border-radius: 3px;font-family: 宋体,Arial,sans-serif;color: #0c0c0c;padding-left: 2px;padding-right: 2px;">${title}<span style="color:#FF0000">${result}</span>${unit}</div>';
    var clearTemplate = '<div id="clear-${randomId}" data-left-offset="${leftOffset}" data-mapx="${mapx}" data-mapy="${mapy}" data-randomid="${randomId}" class="clear-div" title="清除此次测量" style="cursor:pointer;font-family: cursive;border: 1px solid red;height: 12px;display: inline-block;width: 12px;line-height: 8px;font-weight: bolder;color: red;text-align: center;position:absolute;border-radius: 3px;left:${left}px;top:${top}px">x</div>'

    var Measure = Custom.createSubclass({
        declaredClass: "esri.custom._RemoteLegend",
        normalizeCtorArgs: function (view, options) {
            var me = this;
            options || (options = {});
            options.coordinates || (options.coordinates = 'projected'); // 投影坐标系和地理坐标系计算方式不一样 geodesic
            this._options = options;
            this._mapView = view;

            this._mapView.watch('extent', this.debounce(function () {
                me._calResultDiv();
            }, 0));
            this._initDraw(); // 初始化绘图工具
            this._tempGraphicLayer = new GraphicsLayer({id: "temp_measure_"+new Date().getTime()}); // 绘制时的图层
            this._drawNodeGraphicLayer = new GraphicsLayer({id: "temp_node_measure_"+new Date().getTime()}); // 绘制时拐点图层
            this._mapView.map.add(this._tempGraphicLayer);
            this._mapView.map.add(this._drawNodeGraphicLayer);

        },
        _getUnitCh: function () {
            return this._customUnit || this.unitCh[this._unit];
        },
        _initDraw: function () {
            var me = this;
            this._draw = new Draw(this._mapView);
            this._draw.watch('end', function (geometry) {
                me._measure(geometry);
            });
            this._draw.watch('pointermove', function (graphic) {
                var result = me._measure(graphic.geometry);
                if(me._toolname=="length"){
                	var tipMsgHtml = null;
                	if(result<1000){
                		tipMsgHtml = "总长：<span style='color: #ff6319;font-weight: 700;'>"+result + "</span>米<br/><span style='color:#7a7a7a;'>单击确定地点,双击结束</span>";
                	}else{
                		result=result/1000;
                		tipMsgHtml = "总长：<span style='color: #ff6319;font-weight: 700;'>"+result.toFixed(2) +"</span>"+ me._getUnitCh()+ "<br/><span style='color:#7a7a7a;'>单击确定地点,双击结束</span>";
                	}
                	me._draw._setTooltipMsg(tipMsgHtml);
                }else{
                	var unit = null;
                	var tipMsgHtml = null;
                	if(result<1000){
                		var rs = result*1000;
                		result=rs.toFixed(3);
                		unit="平方米";
                    }else{
                    	var rs=result/1000;
                    	result=rs.toFixed(3);
                    	unit="平方公里";
                    }
                	tipMsgHtml = "总面积：<span style='color: #ff6319;font-weight: 700;'>"+result + "</span>"+ unit +"<br/><span style='color:#7a7a7a;'>单击确定地点,双击结束</span>";
                	me._draw._setTooltipMsg(tipMsgHtml);
                }
            });
            this._draw.watch('click', function (graphic) {
            	var result = me._measure(graphic.geometry);
                if (result) {
                    me._toolname === tools.AREA && me._clearCurrentResultDivs(); // 如果是面积测量则清除上一次的测量结果
                    var unit='';
                    if(me._toolname=="length"){//长度
                    	if(result<1000){
                    		unit="米";
                        }else{
                        	var rs=result/1000;
                        	result=rs.toFixed(2);
                        	unit="千米";
                        }
                    }else{//面积
                    	if(result<1000){
                    		var rs = result*1000;
                    		result=rs.toFixed(3);
                    		unit="平方米";
                        }else{
                        	var rs=result/1000;
                        	result=rs.toFixed(3);
                        	unit="平方公里";
                        }
                    }
                    me._createResultDiv(result, graphic.mapPoint, '', resultTemplate, unit); // 添加测量结果信息div
                }else if(graphic.geometry && graphic.geometry.type == "polyline"){
                	me._createResultDiv(result, graphic.mapPoint, '', startTemplate, unit); 
                }
                me._createDrawNode(graphic.mapPoint); // 绘制拐点
            });
            this._draw.watch('end', function (graphic) {
                var result = me._measure(graphic.geometry);
                if (result) {
                    me._toolname === tools.AREA && me._clearCurrentResultDivs();
                    var totleTitle,unit='';
                    if(me._toolname=="length"){
                    	totleTitle="总长:";
                    	if(result<1000){
                    		unit="米";
                        }else{
                        	var rs=result/1000;
                        	result=rs.toFixed(2);
                        	unit="千米";
                        }
                    }else{
                    	totleTitle="总面积:";
                    	if(result<1000){
                    		var rs = result*1000;
                    		result=rs.toFixed(3);
                    		unit="平方米";
                        }else{
                        	var rs=result/1000;
                        	result=rs.toFixed(3);
                        	unit="平方公里";
                        }
                    }
                    me._createResultDiv(result, graphic.mapPoint, totleTitle, resultTemplate, unit);
                }
                graphic.attributes = dojo.mixin(graphic.attributes, {
                    randomId: me._currentRandomId
                });
                me._tempGraphicLayer.add(graphic);
                me._createDrawNode(graphic.mapPoint);
                me._createClearDiv(graphic); // 创建清除测量按钮
                me._draw.deactivate();
            });
        },
        unitCh: {
            'square-meters': '平方米',
            'meters': '米'
        },
        _createClearDiv: function (g) {
            var screen = this._mapView.toScreen(g.mapPoint);
            var me = this;
            var lastTwoPoints = []; // 测量完成后geometry得最后两个点
            switch (g.geometry.type) {
                case 'polygon':
                    var lastRing = this.last(g.geometry.rings);
                    if (lastRing && lastRing.length > 2) {
                        lastTwoPoints = [lastRing[lastRing.length - 1], lastRing[lastRing.length - 2]];
                    }
                    break;
                case 'polyline':
                    var lastPath = this.last(g.geometry.paths);
                    if (lastPath && lastPath.length >= 2) {
                        lastTwoPoints = [lastPath[lastPath.length - 1], lastPath[lastPath.length - 2]];
                    }
                    break;
            }
            var pixel = 0;
            if (lastTwoPoints.length === 2) { // 根据最后两个点的连线计算清除按钮放置点的左边还是右边
                if (lastTwoPoints[0][0] >= lastTwoPoints[1][0]) {
                    pixel = 10;
                } else {
                    pixel = -20;
                }
            }
            var html = _tpl(clearTemplate, {
                left: screen.x + pixel,
                top: screen.y - 7,
                randomId: this._currentRandomId,
                mapx: g.mapPoint.x,
                mapy: g.mapPoint.y,
                leftOffset: pixel
            });
            dojo.query(this._mapView.container).query('.esri-view-root').addContent(html);
            // 清除测量结果的点击事件，
            var handler = dojo.query('#clear-' + this._currentRandomId).on('click', function (event) {
                me._clearMeasureResult(event);
                handler[0].remove(); // 清除后移除该事件
            });
        },
        _clearMeasureResult: function (event) {
            var me = this;
            var randomId = dojo.query(event.currentTarget).attr('data-randomid')[0];
            dojo.query('[data-randomid="' + randomId + '"]').forEach(function (node) { // 移除添加的结果呈现div
                domConstruct.destroy(node);
            });
            this._tempGraphicLayer.removeMany(dojo.filter(this._tempGraphicLayer.graphics.items, function (g) {
                return g.attributes['randomId'] == randomId;
            }));
            this._drawNodeGraphicLayer.removeMany(dojo.filter(this._drawNodeGraphicLayer.graphics.items, function (g) {
                return g.attributes['randomId'] == randomId;
            }));
        },
        _createDrawNode: function (mapPoint) { // 创建节点
            var graphic = new Graphic({
                geometry: mapPoint,
                symbol: new SimpleMarkerSymbol({
                    style: "circle",
                    color: "white",
                    size: "8px",
                    outline: {
                        color: [255, 0, 0],
                        width: 2
                    }
                }),
                attributes: {
                    randomId: this._currentRandomId
                }
            });
            //graphic.id = "temp_"+new Date().getTime();
            this._drawNodeGraphicLayer.add(graphic);
        },
        _clearCurrentResultDivs: function () { // 清除面积测量时的临时结果
            var me = this;
            dojo.query('.result-div').forEach(function (node) {
                if (dojo.query(node).attr('data-randomid')[0] == me._currentRandomId) {
                    domConstruct.destroy(node);
                }
            });
        },
        _createResultDiv: function (result, mapPoint, totalTitle, resultTemplate, unit) { // 创建结果div
            var screen = this._mapView.toScreen(mapPoint);
            var html = _tpl(resultTemplate, {
                    result: result,
                    unit: unit==''?this._getUnitCh():unit,
                    screenx: screen.x - 5,
                    screeny: screen.y + 10,
                    mapx: mapPoint.x,
                    mapy: mapPoint.y,
                    title:totalTitle,
                    randomId: this._currentRandomId
                });
            dojo.query(this._mapView.container).query('.esri-view-root').addContent(html);
        },
        _calResultDiv: function () { // 计算结果div对应到mapPoint时的位置
            var me = this;
            var nodes = dojo.query('.result-div').forEach(function (node) {
                var mapx = dojo.query(node).attr('data-mapx')[0];
                var mapy = dojo.query(node).attr('data-mapy')[0];
                // var screen = me._mapView.toScreen({
                //     x: parseFloat(mapx), y: parseFloat(mapy)
                // });
                var screen = me._mapView.toScreen(parseFloat(mapx), parseFloat(mapy));
                node.style.left = (screen.x - 5) + 'px';
                node.style.top = (screen.y + 10) + 'px';
            });
            dojo.query('.clear-div').forEach(function (node) {
                var dnode = dojo.query(node);
                var mapx = dnode.attr('data-mapx')[0];
                var mapy = dnode.attr('data-mapy')[0];
                var leftOffset = dnode.attr('data-left-offset');
                // var screen = me._mapView.toScreen({
                //     x: parseFloat(mapx), y: parseFloat(mapy)
                // });
                var screen = me._mapView.toScreen(parseFloat(mapx), parseFloat(mapy));
                node.style.left = (screen.x + parseFloat(leftOffset)) + 'px';
                node.style.top = (screen.y - 7) + 'px';
            });
        },
        activate: function (name, params) {
            this._toolname = name;
            params || (params = {});
            this._unit = params.unit;
            this._parseResult = params.parseResult; // 结果转换方法
            this._customUnit = params.customUnit; // 自定义单位名称
            this._decimal = params.decimal; // 保留小数位数
            switch (name) {
				//测面
                case tools.AREA:
                    this._draw.activate(Draw.TYPE.POLYGON); break;
				//测距
                case tools.LENGTH:
                    this._draw.activate(Draw.TYPE.POLYLINE); break;
				//定位	
                case tools.LOCATION:
                    this._draw.activate(Draw.TYPE.POINT); break;
            };
            this._currentRandomId = (new Date()).valueOf();
        },
        deactivate: function () {
            dojo.query('.result-div').forEach(function (node) {
                domConstruct.destroy(node);
            });
            dojo.query('.clear-div').forEach(function (node) {
                domConstruct.destroy(node);
            });
            this._tempGraphicLayer.removeAll();
            this._drawNodeGraphicLayer.removeAll();
            this._draw.deactivate();
        },
        _measure: function (geometry) {
            var result;
            if (!geometry) {
                return;
            }
            switch (this._toolname) {
                case tools.AREA:
                    if (geometry.type === 'polygon') {
                        this._unit || (this._unit = 'square-meters');
                        if (this._options.coordinates === 'projected') {
                            result = geometryEngine.planarArea(geometry, this._unit);
                        } else {
                            result = geometryEngine.geodesicArea(geometry, this._unit);
                        }
                        result = Math.abs(result);
                        break;
                    }
                case tools.LENGTH:
                    if (geometry.type === 'polyline') {
                        this._unit || (this._unit = 'meters');
                        if (this._options.coordinates === 'projected') {
                            result = geometryEngine.planarLength(geometry, this._unit);
                        } else {
                            result = geometryEngine.geodesicLength(geometry, this._unit);
                        }
                        result = Math.abs(result);
                        break;
                    }
            };

            if (this._parseResult) {
                result = this._parseResult(result);
            }
            if (this._decimal) { // 测量结果的小数保留
                var num = Math.pow(10, this._decimal);
                result = Math.round(result * num) / num;
            }
            return result;
        }
    });

    Measure.TOOLS = tools;
    return Measure;
});