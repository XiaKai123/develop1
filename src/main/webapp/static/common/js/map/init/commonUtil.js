/**
* @描述：业务公共方法js
**/

/**获取wDialog 对象**/
function getWinDialog(dialogWin){
    if(dialogWin != undefined &&  dialogWin != null){
        var objectDiv = document.getElementById("_DialogDiv_"+dialogWin.ID);
        if(!objectDiv){
            dialogWin = null;
        }
    }
    return dialogWin;
}

/**
 * 功能模块设置图层显示
 * @param layerId
 * @param flag
 * @param layerObject
 */
function showModuleLayer(layerId,flag,layerObject){
    var mapView = getMapView();
    var layer = mapView.map.findLayerById(layerId);
    if(!document.getElementById('projectDirIfr')){
        return;
    }
    var projectDirIframe = document.getElementById('projectDirIfr').contentWindow;
    var layerObj = null;
    //所有图层对象
    var projectAllArray = projectDirIframe.projectAllArray;
    var projectAllArrayLen = projectAllArray.length;
    if(!layerObject){
        //根据layerId查找layerdir节点对象
        for(var i=0;i<projectAllArrayLen;i++){
            var children = projectAllArray[i].children;
            if(children){
                for(var j=0;j<children.length;j++){
                    var childrenNode = children[j];
                    if(childrenNode.layer_id == layerId){
                        layerObj = childrenNode;
                        break;
                    }
                }
            }
        }
    }else{
        layerObj = layerObject
    }
    if(layerObj){
        var dirId = layerObj.id;
        var obj = $("#"+dirId);
        //图层树选中节点对象
        var checkNodeDirId = projectDirIframe.document.getElementById(dirId);
        if(!checkNodeDirId){
            return;
        }
        var currentChecked = checkNodeDirId.checked;
        var currentObj = projectDirIframe.document.getElementById("check_node_"+dirId);
        //设置当前节点复选框样式
        if(currentChecked && flag==false){
            $(currentObj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-primary");
            checkNodeDirId.checked = false;
        }else if(flag==true){
            $(currentObj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-default");
            checkNodeDirId.checked = true;
            //获取当前地图显示顺序最大值
            var orderIndex = getLayerOrder(mapView.map.allLayers);
            //显示层级,顶层
            mapView.map.reorder(layer,orderIndex);
        }
        projectDirIframe.changeProjectDirNode(obj,dirId);
    }
}


/**
 * 行政区划/控规分析/土规分析/林规分析/辅助选址
 */
//根据图形id、图层url、条件查询、是否闪烁
function simpleDivisionGraphic(graphicId,layerUrl,whereStr,isFlicker){
    _graphicId = graphicId;
    _isFlicker = isFlicker;
    require([
            "widget/MapQuery"
        ], function(
        MapQuery
        ){
            //根据条件查询图形信息
            var mapQuery = new MapQuery();
            mapQuery.query(layerUrl,whereStr,null,true,renderDivisionGraphic);
        }
    );
}

//渲染行政区划图形（闪烁3下后定位）
function renderDivisionGraphic(data){
    require([
            "widget/MapGraphic",
            "esri/symbols/SimpleFillSymbol"
        ], function(
        MapGraphic,
        SimpleFillSymbol
        ){
            var _mapView = getMapView();
            var gonGeometry = data.features[0].geometry;
            var mapGraphic = new MapGraphic(_mapView);
            //实线样式
            var thinLinePolyonSymbol = new SimpleFillSymbol({
                color: [227, 139, 79, 0.3],
                style: "solid",
                outline: {
                    color: [255, 0, 0],
                    width: 1,
                    style: "solid"
                }
            });

            //延迟200ms是为了处理点击同一个图形定位时闪烁3下的效果，否则移除上一次的图形和本次添加的图形会重合，看不到预期的效果
            setTimeout(function(){
                //地图缩放合适范围
                setMapExtentByGeometry(gonGeometry,-1);
                //渲染图形
                var gonGraphic = mapGraphic.drawGraphic(_graphicId,gonGeometry,null,thinLinePolyonSymbol);

                if(_isFlicker){
                    //图形闪烁3下
                    //simpleHighLightGraphic(null,gonGraphic);
                    graphicsFlashing([gonGraphic],null,3,false,false,true);
                }
            },200);
        }
    );
}

/**
 * 地图标注绘制
 * @param geometryType geometry类型
 */
function mapBookMarkDraw(geometryType){
    require([
        "widget/MapBookMark",
        "dojo/dom"
    ], function(
        BookMark,
        dom
    ){
        // if(mapObject.bookMark){
        //     mapObject.initMapBookMark();
        // }
        var _bookMarkObj = mapObject.bookMark;
        //移除绘制动作和绘制tip
        _bookMarkObj._draw.deactivate();
        //开始绘制
        var mapView = mapObject.getMapView();
        dom.byId(mapView.container.id).style.cursor="pointer";
        if(geometryType=='point'){
            _bookMarkObj.activate(BookMark.TOOLS.POINT);
        }else if(geometryType=='polyline'){
            _bookMarkObj.activate(BookMark.TOOLS.POLYLINE);
        }else if(geometryType=='polygon'){
            _bookMarkObj.activate(BookMark.TOOLS.POLYGON);
        }else if(geometryType=='info'){
            _bookMarkObj.activate(BookMark.TOOLS.INFO);
        }
    });
}

/**
 *对象转url参数
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 */
function urlEncode(param, key, encode) {
    if(param==null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
            paramStr += urlEncode(param[i], k, encode);
        }
    }
    return paramStr;
}

//原生请求，避免ajax全局设置的token影响
var Ajax={
    get: function(url, fn) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send();
    },
    post: function (url, data, fn) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // 添加http头，发送信息至服务器时内容编码类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send(data);
    }
}

/**
 * 关闭地图弹出窗
 */
function closeWinDialog(dialogWin){
    if(dialogWin != undefined &&  dialogWin != null){
        //清除
        var iframe = dialogWin.innerFrame;
        if(iframe && iframe.contentWindow && isExitsFunction(iframe.contentWindow.clearShowGraphics)){
            iframe.contentWindow.clearShowGraphics();
            //清理小屏渲染
            //addGraphicsLitterMap();
        }
        //关闭
        var objectDiv = document.getElementById("_DialogDiv_"+dialogWin.ID);
        if(objectDiv){
            dialogWin.close();
        }
    }
}

/**
 * 清除分析结果
 */
function clearMapLayer(layerArr){
    var map = getMapView().map;
    $.each(layerArr, function(i, layer){
        map.remove(layer);
    });
}


//清除绘制圆的结果
function clearDrawCircleResult(){
    if($(".result-div")){
        $(".result-div").remove();
    }
}

/**
 * 框选范围检查
 * drawType: 绘制类型，extent、polygon、circle
 * toolTipMsg: 鼠标右下角消息
 */
function drawExtentCheck(drawType, toolTipMsg){
    //初始化mapGeoDraw对象
    mapObject.initMapGeoDraw();
    //清除绘画graphicLayer
    mapObject.mapGeoDraw._drawVectors.removeAll();//清理
    //开始绘画
    mapObject.mapGeoDraw.activate(drawType, toolTipMsg);
}

//辅助选址分析
//分析结果显示
function showAuxiliaryAnalysisGraphis(graphicLayeId,analysisData){
    require([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Graphic",
        "esri/geometry/Polygon"
    ], function(
        GraphicsLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Graphic,
        Polygon
    ){
        if(analysisData!=null){
            var mapView = getMapView();
            var graphicLayeId = graphicLayeId;
            var graphicLayer = mapView.map.findLayerById(graphicLayeId);
            if(graphicLayer == null){
                graphicLayer = new GraphicsLayer({ id: graphicLayeId});
                mapView.map.add(graphicLayer);
            }else{
                graphicLayer.visible = true;
                graphicLayer.removeAll();
            }
            var graphicArr = analysisData.features;
            if(graphicArr!=null && graphicArr.length>0){
                for(var j=0;j<graphicArr.length;j++){
                    var graphicObj = graphicArr[j];
                    if(graphicObj!=null){
                        var color =  graphicObj.fillcolor;
                        var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([255,0,0]), 1);
                        /*var colorfillArr = (showRGB2(color)+",1").split(",");
                        var fillcolor = new dojo.Color(colorfillArr);
                        var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,lineSyl, fillcolor);*/
                        var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSyl, new dojo.Color([0,0,0,0.1]));

                        var geometryObj = graphicObj.geometry;
                        graphicObj.geometry.spatialReference = mapView.spatialReference;
                        var graphic = new Graphic();//new Geometry geometry.Polygon(geometry),fillSyl,graphicObj.attributes
                        graphic.id = "graphic_"+j;
                        graphic.title = "辅助选址地块信息";
                        var polygon = new Polygon({
                            rings: geometryObj.rings,
                            spatialReference: mapView.spatialReference
                        });
                        graphic.attributes = graphicObj.attributes;
                        graphic.symbol = fillSyl;
                        graphic.geometry = polygon;
                        /*if(graphicLayer!=null){
                            graphicLayer.add(graphic);
                        }*/
                    }
                }
            }
        }

    })
}

//控制线检测

//获取图层授权列表
function filterAuthLayerField(layerId, callback) {
    if (!GuoDi.Application.fieldsOrder) {
        GuoDi.Application.fieldsOrder = {};
    }
    //获取查询元素的服务地址
    var ids = [];
    if (!GuoDi.Application.fieldsOrder[layerId] && (dojo.indexOf(ids, layerId) == -1)) {
        ids.push(layerId);
    }

    if (!userId) {
        showMessage("没有用户信息!", 8);
        return;
    }
    //缓存所有的查询服务图层的排序字段
    SystemInfo.getUserLayersFields(userId, dojo.toJson(ids), function (rls) {
        var result = rls;
        //存储结果
        for (var i = 0; i < result.length; i++) {
            var item=result[i];
            if(Object.prototype.toString.call(item)==="[object String]"){
                item = JSON.parse(item);
            }
            if (!GuoDi.Application.fieldsOrder[item["id"]]) {
                GuoDi.Application.fieldsOrder[item["id"]] =  item['dbFields'];
            }
        }
        //执行回调函数
        callback();
    },function(event){
        ;
    });
}

/**
 * 渲染控制线检测结果
 * graphicLayerId_: 控制线检测图层
 * controlTypeArr: 控制线类型数组
 * typeIndex: 类型下标
 * totalDataObj: 检测的graphic对象
 * flag: 是否全选
 *
 */
var kzxGraphicLayerArr = [];//用于清除地图渲染结果
function showControlDetectionGraphis(graphicLayerId_, controlTypeArr, typeIndex, totalDataObj, flag,funType){
    require([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Graphic",
        "esri/geometry/Polygon",
        "dojo/on"
    ], function(
        GraphicsLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Graphic,
        Polygon,
        on
    ){
        var type="";
        if(funType){
            type=funType;
        }
        var controlTypeObj = null;
        if(controlTypeArr!=null && controlTypeArr.length>typeIndex){
            controlTypeObj = controlTypeArr[typeIndex];
        }
        var mapView = mapObject.getMapView();

        //图形渲染
        if(controlTypeObj&& controlTypeObj.children && controlTypeObj.children.length>0 ){
            var dataArr = controlTypeObj.children;
            //渲染
            if(dataArr!=null && dataArr.length>0){
                for(var i=0;i<dataArr.length;i++){
                    var dataObj = dataArr[i];
                    var layerId = dataObj.layerId;
                    var legend = dataObj.fillcolor;
                    var objId = dataObj.id;
                    var controlMapObj = totalDataObj[objId];
                    if(flag){//是否全选
                        controlMapObj.checked = flag;
                    }
                    if(controlMapObj.checked == true){
                        var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([0,0,0]), 0);
                        //透明度
                        var colorfillArr = (showRGB2(legend)+",0.8").split(",");
                        var fillcolor = new dojo.Color(colorfillArr);
                        var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSyl, fillcolor);
                        dataObj.sysmbol = fillSyl;

                        var graphicLayerId = graphicLayerId_ + "_" +objId+"_"+type;
                        var gl = mapView.map.findLayerById(graphicLayerId);
                        if(gl == null){
                            gl = new GraphicsLayer({id: graphicLayerId});
                            mapView.map.add(gl);
                        }else{
                            //显示和清除所有
                            gl.visible = true;
                            gl.removeAll();
                        }
                        //存储graphicLayerId，方便清除
                        kzxGraphicLayerArr.push(gl);

                        var graphicArr = totalDataObj[objId].features;
                        if(graphicArr != null && graphicArr.length > 0){
                            for(var j=0; j<graphicArr.length; j++){
                                var graphicObj = graphicArr[j];
                                if(graphicObj != null){
                                    var geometry = graphicObj.geometry;
                                    var grap = new Graphic(new Polygon(geometry), fillSyl, graphicObj.attributes);
                                    grap.id = "graphic_"+objId+"_"+j+"_"+type;
                                    grap.title = dataObj.name;
                                    grap.popupTemplate = buildGeoPopup(grap);
                                    if(gl != null){
                                        gl.add(grap);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

//获取控制线渲染symbol
var kzxFillSyl;
function getControlLineSymbol(_color){
    require([
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol"
    ],function(
        SimpleLineSymbol,
        SimpleFillSymbol
    ){
        var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([0,0,0]), 0);
        var colorfillArr = (showRGB2(_color)+",0.8").split(",");
        var fillcolor = new dojo.Color(colorfillArr);
        kzxFillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSyl, fillcolor);
    });
}

/**
 * 控规分析结果显示
 * @param graphicLayerId_
 * @param analysisData
 */
var controlAnaLayerArr = [];//用于清除地图渲染结果
function showAnalysisGraphis(graphicLayerId_, analysisData,funType){
    controlAnaLayerArr = [];
    require([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Graphic",
        "esri/geometry/Polygon"
    ], function(
        GraphicsLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Graphic,
        Polygon
    ){
        var type="";
        if(funType){
            type=funType;
        }
        var mapView = mapObject.getMapView();
        if(analysisData!=null){
            for(var key in analysisData){
                var item = analysisData[key];
                if(item != null){
                    var code = key;
                    var color =  item.fillcolor;
                    var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([0,0,0]), 0);
                    var colorfillArr = (showRGB2(color)+",0.8").split(",");
                    var fillcolor = new dojo.Color(colorfillArr);
                    var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSyl, fillcolor);

                    var graphicLayerId = graphicLayerId_+"_"+code+"_"+type;
                    var gl = mapView.map.findLayerById(graphicLayerId);
                    if(gl == null){
                        gl = new GraphicsLayer({ id: graphicLayerId});
                        mapView.map.add(gl);
                    }else{
                        gl.visible = true;
                        gl.removeAll();
                    }
                    gl.spatialReference = mapView.spatialReference;
                    controlAnaLayerArr.push(gl);

                    var graphicArr = item.features;
                    if(graphicArr!=null && graphicArr.length>0){
                        for(var j=0;j<graphicArr.length;j++){
                            var graphicObj = graphicArr[j];
                            if(graphicObj!=null){
                                var geometry = graphicObj.geometry;
                                graphicObj.geometry.spatialReference = mapView.spatialReference;
                                var grap = new Graphic(new Polygon(geometry),fillSyl,graphicObj.attributes);
                                grap.id = "graphic_"+code+"_"+j+"_"+type;
                                grap.title = item.name;
                                grap.geometry.spatialReference = mapView.spatialReference;
                                if(gl!=null){
                                    gl.add(grap);
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}

/**
 * 土规分析结果显示
 * @param graphicLayerId_
 * @param analysisData
 */
var landAnaLayerArr = [];//用于清除地图渲染结果
function showLandAnalysisGraphis(graphicLayerId_, analysisData,funType){
    landAnaLayerArr = [];
    require([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Graphic",
        "esri/geometry/Polygon"
    ], function(
        GraphicsLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Graphic,
        Polygon
    ){
        var type="";
        if(funType){
            type=funType;
        }
        var mapView = mapObject.getMapView();
        if(analysisData!=null){
            for(var key in analysisData){
                var item = analysisData[key];
                if(item != null){
                    var code = key;
                    var color =  item.fillcolor;
                    var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([0,0,0]), 0);
                    var colorfillArr = (showRGB2(color)+",0.8").split(",");
                    var fillcolor = new dojo.Color(colorfillArr);
                    var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSyl, fillcolor);

                    var graphicLayerId = graphicLayerId_+"_"+code+"_"+type;
                    //渲染图层
                    var renderGraphicLayer = mapView.map.findLayerById(graphicLayerId);
                    if(renderGraphicLayer == null){
                        renderGraphicLayer = new GraphicsLayer({ id: graphicLayerId});
                        mapView.map.add(renderGraphicLayer);
                    }else{
                        renderGraphicLayer.visible = true;
                        renderGraphicLayer.removeAll();
                    }
                    renderGraphicLayer.spatialReference = mapView.spatialReference;
                    landAnaLayerArr.push(renderGraphicLayer);

                    var graphicArr = item.features;
                    if(graphicArr!=null && graphicArr.length>0){
                        for(var j=0;j<graphicArr.length;j++){
                            var graphicObj = graphicArr[j];
                            if(graphicObj!=null){
                                var geometry = graphicObj.geometry;
                                graphicObj.geometry.spatialReference = mapView.spatialReference;
                                var grap = new Graphic(new Polygon(geometry),fillSyl,graphicObj.attributes);
                                grap.id = "graphic_"+code+"_"+j+"_"+type;
                                grap.title = item.name;
                                grap.geometry.spatialReference = mapView.spatialReference;
                                if(renderGraphicLayer!=null){
                                    renderGraphicLayer.add(grap);
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}

/**
 * 林规分析结果显示
 * @param graphicLayerId_
 * @param analysisData
 */
var forestAnaLayerArr = [];//用于清除地图渲染结果
function showForestAnalysisGraphis(graphicLayerId_, analysisData,funType) {
    forestAnaLayerArr = [];
    require([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Graphic",
        "esri/geometry/Polygon"
    ], function(
        GraphicsLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Graphic,
        Polygon
    ){
        var mapView = mapObject.getMapView();
        var type="";
        if(funType){
            type=funType;
        }
        if(analysisData!=null){
            for(var key in analysisData){
                var item = analysisData[key];
                if(item !=null){
                    var code = key;
                    var color =  item.fillcolor;
                    var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([0,0,0]), 0);
                    var colorfillArr = (showRGB2(color)+",0.8").split(",");
                    var fillcolor = new dojo.Color(colorfillArr);
                    var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSyl, fillcolor);

                    var graphicLayerId = graphicLayerId_+"_"+code+"_"+type;
                    var gl = mapView.map.findLayerById(graphicLayerId);
                    if(gl == null){
                        gl = new GraphicsLayer({ id: graphicLayerId});
                        mapView.map.add(gl);
                    }else{
                        gl.visible = true;
                        gl.removeAll();
                    }
                    gl.spatialReference = mapView.spatialReference;
                    forestAnaLayerArr.push(gl);

                    var graphicArr = item.features;
                    if(graphicArr!=null && graphicArr.length>0){
                        for(var j=0;j<graphicArr.length;j++){
                            var graphicObj = graphicArr[j];
                            if(graphicObj!=null){
                                var geometry = graphicObj.geometry;
                                graphicObj.geometry.spatialReference = mapView.spatialReference;
                                var grap = new Graphic(new Polygon(geometry),fillSyl,graphicObj.attributes);
                                grap.id = "graphic_"+code+"_"+j+"_"+type;
                                grap.title = item.name;
                                grap.geometry.spatialReference = mapView.spatialReference;
                                if(gl!=null){
                                    gl.add(grap);
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}

//冲突检测
/**
 * 两规分析结果图形渲染
 * @param graphicLayerIdKey
 * @param dataArr
 */
var conflictAnaLayerArr = [];//用于清除地图渲染结果
function showConflictDetectionGraphis(graphicLayerIdKey,dataArr,funType){
    require([
        "esri/layers/GraphicsLayer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Graphic",
        "esri/geometry/Polygon"
    ], function(
        GraphicsLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Graphic,
        Polygon
    ){
        var type="";
        if(funType){
            type=funType;
        }
        //渲染
        if(dataArr!=null && dataArr.length>0){
            var mapView = mapObject.getMapView();
            for(var i=0;i<dataArr.length;i++){
                var dataObj = dataArr[i];
                var legend = dataObj.legend;
                var lineSyl = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new dojo.Color([0,0,0]), 0);
                var colorfillArr = (showRGB2(legend)+",0.8").split(",");
                var fillcolor = new dojo.Color(colorfillArr);
                var fillSyl = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,lineSyl, fillcolor);
                dataObj.sysmbol = fillSyl;

                var graphicArr = dataObj.graphicArr;
                var graphicLayerId = graphicLayerIdKey+i+"_"+type;
                var gl = mapView.map.findLayerById(graphicLayerId);
                if(gl == null){
                    gl = new GraphicsLayer({ id: graphicLayerId});
                    mapView.map.add(gl);
                }else{
                    gl.removeAll();
                }
                conflictAnaLayerArr.push(gl);//方便移除

                if(graphicArr!=null && graphicArr.length>0){
                    for(var j=0;j<graphicArr.length;j++){
                        var graphicObj = graphicArr[j];
                        if(graphicObj!=null){
                            var geometry = graphicObj.geometry;
                            var grap = new Graphic(new Polygon(geometry),fillSyl,graphicObj.attributes);
                            grap.id = "graphic_"+i+"_"+j+"_"+type;
                            grap.title = "两规差异图斑";
                            if(gl!=null){
                                gl.add(grap);
                            }
                        }
                    }
                }
            }
        }

    })
}

/**
 * graphicsLayerIds 渲染图层id
 * 导出图片参数
 * @param graphicsObjs
 * @param clipPolygon
 * @param scale
 * @returns {___anonymous43455_43579}
 */
function getExportImageParams(graphicsObjs,clipPolygon,scale,funType,graphicArr){
    var params = null;
    require([
        "esri/geometry/Geometry",
        "esri/geometry/Polygon",
        "esri/geometry/Extent"
    ], function(
        Geometry,
        Polygon,
        Extent
    ){
        var mapView = getMapView();
        /*var allLayers = mapView.map.layers.items;
        var showLayers = [];//mapView.map.layers.items;//mapObject._showLayers;//
        $.each(allLayers, function(i,layer){
            if(layer.visible)
                showLayers.push(layer);
        });
        //显示图层Id
        var showIds = [];
        if(showLayers!=null && showLayers.length>0){
            for(var i=0;i<showLayers.length;i++){
                var showLayer = showLayers[i];
                showIds.push(showLayer.id);
            }
        }*/
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
        //截取范围
        //var polygonExtent = null;
        var clipGeo = clipPolygon;
        if(clipPolygon){
            var polygon = new Polygon(clipPolygon);
            var polygonExtent = polygon.extent;
            //最小
            // var minMapPoint = {x:polygonExtent.xmin,y:polygonExtent.ymin};
            var minScreenPoint = mapView.toScreen(polygonExtent.xmin, polygonExtent.ymin);
            //最大
            // var maxMapPoint = {x:polygonExtent.xmax,y:polygonExtent.ymax};
            var maxScreenPoint = mapView.toScreen(polygonExtent.xmax, polygonExtent.ymax);
            var minX =(minScreenPoint.x>maxScreenPoint.x?maxScreenPoint.x:minScreenPoint.x);
            var maxX =(minScreenPoint.x<=maxScreenPoint.x?maxScreenPoint.x:minScreenPoint.x);
            var minY =(minScreenPoint.y>maxScreenPoint.y?maxScreenPoint.y:minScreenPoint.y);
            var maxY = (minScreenPoint.y<=maxScreenPoint.y?maxScreenPoint.y:minScreenPoint.y);

            minMapPoint = mapView.toMap({x:(minX-40),y:(minY-40)});
            maxMapPoint = mapView.toMap({x:(maxX+40),y:(maxY+40)});

            var extent = new Extent(parseFloat(minMapPoint.x), parseFloat(minMapPoint.y), parseFloat(maxMapPoint.x), parseFloat(maxMapPoint.y), getMapView().spatialReference);
            //clipGeo = GeometryUtil.extentToPolygon(extent);
            clipGeo = Polygon.fromExtent(extent);
        }

        var dpi = 200;
        var imageType = "PNG";
        var scale = mapView.scale;;//map.scale; getMapView().scale
        var graphics =[];
        //地图叠加
        if(graphicsObjs && graphicsObjs!=null && graphicsObjs.length>0){
            for(var i=0;i< graphicsObjs.length;i++){
                var graphicsLayerId = "";
                if(funType){
                    graphicsLayerId=graphicsObjs[i].id+"_"+funType;
                }else{
                    graphicsLayerId=graphicsObjs[i].id;
                }

                var graphicLayer = mapView.map.findLayerById(graphicsLayerId);
                if(graphicLayer!=null){
                    var layerGraphics = graphicLayer.graphics.items;
                    for(var j=0;j<layerGraphics.length;j++){
                        var graphic = layerGraphics[j];
                        var symbol = graphic.symbol;//graphicsObjs[i].symbol;
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
                            }
                            geoObj.style = style;
                            geoObj.geometryType = geometryType;
                            graphics.push(geoObj);
                        }
                    }
                }
            }
        }else if(graphicArr){
            graphicArr.forEach(function(graphic,index,arr){
                var symbol = graphic.symbol;//graphicsObjs[i].symbol;
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
                    }
                    geoObj.style = style;
                    geoObj.geometryType = geometryType;
                    graphics.push(geoObj);
                }
            });
        }else{
            console.warn("error:getExportImageParams");
        }

        //参数
        params = {
            layerIds:showIds,
            clipGeo:clipGeo,
            dpi:dpi,
            imageType:imageType,
            scale:scale,
            graphics:graphics
        }
    })
    return params;
}
