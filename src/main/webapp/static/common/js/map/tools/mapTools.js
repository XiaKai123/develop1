/**
 * @描述：地图工具初始化js
 **/
var MapTools = function(){}
//初始化工具
MapTools.prototype.initTools = function(){
    //平移
    var me = this;
    if($("#mapTranslation").length > 0){
        $("#mapTranslation").unbind("click").click(function(){
            me.mapTranslation();
        });
    }

    //全图
    if($("#fullMap").length > 0){
        $("#fullMap").unbind("click").click(function(){
            me.fullMap();
        });
    }

    //全屏
    if($("#map-fullScreen").length > 0) {
        $("#map-fullScreen").unbind("click").click(function () {
            me.fullScreen();
        });
    }

    //清除
    if($("#clearAll").length > 0) {
        $("#clearAll").unbind("click").click(function () {
            me.clearMap();
        });
    }

    //工具--测长度
    if($("#mapMeasureLength").length > 0) {
        $("#mapMeasureLength").unbind("click").click(function () {
            me.mapMeasureLength();
        });
    }

    //工具--测面积
    if($("#mapMeasureArea").length > 0) {
        $("#mapMeasureArea").unbind("click").click(function () {
            me.mapMeasureArea();
        });
    }

    //工具--标注
    if($("#mapBookMark").length > 0) {
        $("#mapBookMark").unbind("click").click(function () {
            me.mapBookMark();
        });
    }

    //工具--截屏
    if($("#mapScreenCapture").length > 0) {
        $("#mapScreenCapture").unbind("click").click(function () {
            me.mapScreenCapture();
        });
    }

    //右下角缩略地图鼠标移入事件
    $("#mapType-wrapper").hover(function(){
        $("#mapType-wrapper").addClass("expend");
    },function(){
        $("#mapType-wrapper").removeClass("expend");
        if($(".mapTypeCard.earth").hasClass("active")){
            var html ='<div class="mapTypeCard earth active" data-name="earth" onclick="changeMapType(this,\'layer_type_dt\')"><span>地图</span></div><div class="mapTypeCard normal" data-name="normalMap" onclick="changeMapType(this,\'layer_type_yxt\')"><span>影像</span></div>'
            $("#mapType").html(html);
        }else{
            var html ='<div class="mapTypeCard normal active normal-top" data-name="normalMap" onclick="changeMapType(this,\'layer_type_yxt\')"><span>影像</span></div><div class="mapTypeCard earth earth-top" data-name="earth" onclick="changeMapType(this,\'layer_type_dt\')"><span>地图</span></div>'
            $("#mapType").html(html);
        }
    });

    //行政区划
    if($("#division_pane").length > 0) {
        $("#division_pane").unbind("click").click(function () {
            me.division();
        });
    }

}

//工具列表-平移
MapTools.prototype.mapTranslation = function(){
    //取消属性查询操作
    removeTip();
    //取消测长度操作
    //取消面积操作
    //取消标注操作
    //取消截屏操作
}

//工具列表-全图
MapTools.prototype.fullMap = function(){
    mapObject._mapView.goTo({
        target: mapObject._centerPoint,
        zoom: mapObject._mapZoom
    });
    var scaleStr = mapObject._scaleArr[mapObject._mapZoom];
    $("#scale").html(scaleStr);
    setTimeout(function () {
        mapObject._mapView.rotation=0;
    },300)
}

//工具列表-清除
MapTools.prototype.clearMap = function(){
    var layers = mapObject._mapView.map.allLayers;
    var layerLength = mapObject.getMapView().map.allLayers.length;
    window.closeInterval();
    closeGraphicAnime();
    closeMapAnaHighLightGraphic();
    //清除所有graphics
    mapObject._mapView.graphics.removeAll();
    //清除layer中的graphics,标注功能
    for(var i=0;i<layerLength;i++){
        var layer = layers.items[i];
        if(layer && layer.type == "graphics"){
            layer.removeAll();
        }
        continue;
    }
    //清除测量结果div
    $(".result-div").remove();
    //清除测量关闭按钮
    $(".clear-div").remove();
    mapObject.getMapView().popup.close();
    //showMessage("清除完毕!", 1);
}

//工具列表-全屏
MapTools.prototype.fullScreen = function(){
    $("#map-fullScreen").toggleClass("active");
    if ($("#map-fullScreen").hasClass("active")){
        getMapWindow("mapDiv").parent.parent.$("#iframe-content").css("height", "100%");
        getMapWindow("mapDiv").parent.parent.$("#system-nav").slideUp(200);
        $("#map-fullScreen").attr("data-original-title","取消全屏");
    }else{
        getMapWindow("mapDiv").parent.parent.$("#iframe-content").css("height", "calc(100% - 70px)");
        getMapWindow("mapDiv").parent.parent.$("#system-nav").slideDown(200);
        $("#map-fullScreen").attr("data-original-title","全屏");
    }
}

//工具--测长度
MapTools.prototype.mapMeasureLength = function(){
    require([
        "dojo/dom"
    ], function(
        dom
    ){
        var mapView = mapObject.getMapView();
        dom.byId(mapView.container.id).style.cursor="url(static/map/images/ruler.cur), default";
        mapObject.measureLength();
    });

}

//工具--测面积
MapTools.prototype.mapMeasureArea = function(){
    require([
        "dojo/dom"
    ], function(
        dom
    ){
        var mapView = mapObject.getMapView();
        dom.byId(mapView.container.id).style.cursor="url(static/map/images/ruler.cur), default";
        mapObject.measureArea();
    });
}

//工具--标注
MapTools.prototype.mapBookMark = function(){
    getMapWindow("mapDiv").parent.addOneMenu('bookmark', '地图标注', 'Map/toBookmark', 'iconfont icon-wxbdingwei', "Tab");
}

//工具--截屏
MapTools.prototype.mapScreenCapture = function(){
    require([
        "widget/MapScreenCapture"
    ], function(
        ScreenCapture
    ){
        var mapView = getMapView();
        var screenCapture = new ScreenCapture(mapView);
        screenCapture.startup();
        screenCapture.capture();
    });
}

//行政区划
MapTools.prototype.division = function(){
    getMapWindow("mapDiv").parent.addOneMenu('division', '行政区划', 'Map/toDivision', 'iconfont icon-dangdi', "Tab");
}

/**取消鼠标提示和事件*/
function removeTip(handlers){
    //设置鼠标提示
    require([
        "widget/MapQuery",
        "widget/MapGraphic",
        "dojo/dom",
        "dojo/dom-construct"
    ],function(
        MapQuery,
        MapGraphic,
        dom,
        domConstruct
    ){
        //取消鼠标提示
        var tooltipNode = dom.byId('identfy-tooltip-div');
        var tooltipNode1 = dom.byId('fn-tooltip-div');
        if (tooltipNode){
            domConstruct.destroy(tooltipNode);
        }
        if(tooltipNode1){
            domConstruct.destroy(tooltipNode1);
        }

        domConstruct.destroy(tooltipNode);
        $("#identfy").removeClass("active");
        //取消属性查询地图点击事件
        if(attQueryHandler){
            attQueryHandler.remove();
        }
        //取消传入的事件
        if(handlers){
            dojo.forEach(handlers, function(handler){
                handler.remove();
            });
        }

    })
}

/**
 * @描述：右下角缩略地图类型切换
 * @参数：layer_type 地图类型(6：电子地图,7：影像图(数据字典更改后要及时修改代码相应位置判断))
 **/
function changeMapType(that,layer_type){
    $(".mapTypeCard").removeClass("active");
    $(that).addClass("active");
    //地图和影像图切换
    var _dtyxObj = mapProject.dtyxObj;
    for (var i = 0; i < _dtyxObj.length; i++) {
        if(_dtyxObj[i].layer_type == layer_type){//显示
            //设置初始化图层数组，底图换成对应地图
            var layer_old = mapProject.initLayerArray[0];
            var layer_new = _dtyxObj[i].layerObj;
            mapProject.initLayerArray.splice(0,1,_dtyxObj[i].layerObj);
            //如果图层树存在,直接点击图层树进行勾选
            if($("#one-menu-container iframe").length > 0 && $("#one-menu-container iframe")[0].contentWindow.$("#projectDirIframeDiv")){
                $("#one-menu-container iframe")[0].contentWindow.$("#" + layer_old.id).click();
                $("#one-menu-container iframe")[0].contentWindow.$("#" + layer_new.id).click();
            }else{
                //删除之前的底图, 重新加载底图
                mapObject._myMap.layers.remove(mapObject._mapView.map.findLayerById(layer_old.id));
                mapProject.loadVisibleLayers();
            }
            return;
        }
    }
    if(layer_type == "layer_type_dt"){
        showMessage("该专题下暂无电子地图!" ,8);
    }
    if(layer_type == "layer_type_yxt"){
        showMessage("该专题下暂无影像图!" ,8);
    }
}