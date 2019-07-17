/**
* @描述：一张图属性查询js方法
* @作者：邹艺
* @日期：2019/4/17 19:42
**/
//查询相关参数
var layerIndex = 0, //查询图层下标
    isLocation = false, //弹出框渲染标识,默认渲染最外层图层的数据
    mapPoint = null, //查询时鼠标点击地图的坐标
    attQueryHandler = null, //属性查询地图点击事件
    layerAttributues = new Array(); //当前查询默认显示的结果数据集

//所有不同查询结果集合
// var resultData = {
//     queryLayers: new Array(), //执行当前查询时叠加的图层
//     curIndexTitle: new Array(),   //所有查询结果默认显示的地图弹出框title
//     curLayerFieldArray: new Array(), //所有查询结果默认显示的弹出框属性数组
//     curPolygon: new Array(),    //所有查询结果默认显示几何图形
//     layerAttributuesArr: new Array() //所有查询结果数据集
// };

$(function(){
    //属性查询
    if($("#identfy").length > 0){
        $("#identfy").unbind("click").click(function(event){
            if(event.stopPropagation()) {
                event.stopPropagation();// 阻止事件冒泡
            }else if(window.event.cancelBubble){
                window.event.cancelBubble = true;//ie 阻止事件冒泡
            }
            identfy();
        });
    }
})

//属性查询按钮点击事件方法
function identfy(){
    $("#identfy").addClass("active");
    require([
        "dojo/dom"
    ],function(
        dom
    ){
        //设置鼠标提示
        var mapView = mapObject._mapView;
        dojo.query(mapView.container).addContent('<div id="identfy-tooltip-div"  style="position:absolute;padding: 1px;font-size:14px;color:black;font-family: 宋体,Arial,sans-serif;"></div>');
        var tooltipNode = dom.byId('identfy-tooltip-div');
        $(document).mousemove(function(e){
            tooltipNode.style.left = (event.x+11) + 'px';
            tooltipNode.style.top = (event.y-1) + 'px';
        });
        tooltipNode.style.display = "block";
        tooltipNode.innerHTML='<i class="wb-info-circle black" aria-hidden="true"></i>';
        //点击地图进行查询
        if(attQueryHandler){
            attQueryHandler.remove();
        }
        attQueryHandler = mapView.on("click", mapAttributeQuery);
    });
}

//开始进行属性查询
function mapAttributeQuery(e){
    //判断是否已经叠加图层
    if (mapProject.visibleMapLayers.length > 0){
        layerAttributues = []; //初始化默认显示的结果数据集
        mapPoint = e.mapPoint;
        if($("#two_menu_iframe_identfy").length > 0){ //判断结果界面是否已创建
            //打开结果界面
            parent.$("#identfy").click();
            //判断之前是否已进行过同样的查询
            // if(isSameArr(resultData.queryLayers, mapProject.visibleMapLayers)){ //若已进行过同样的查询则从resultData读取数据进行渲染
            //     if(resultData.curPolygon.length > 0){
            //         for (var i=0;i<resultData.curPolygon.length;i++){
            //             if(resultData.curPolygon[i].contains(mapPoint)){
            //                 identfyHighLightGraphic(resultData.curIndexTitle[i], resultData.curLayerFieldArray[i], resultData.curPolygon[i]);
            //                 if(resultData.layerAttributuesArr[i]){
            //                     document.getElementById("two_menu_iframe_identfy").contentWindow.loadData(resultData.layerAttributuesArr[i]);
            //                 }
            //                 return;
            //             }
            //         }
            //     }
            // }else{
            //     //如果查询图层与之前查询的不一致,则初始化查询结果
            //     resultData.queryLayers = mapProject.visibleMapLayers;
            //     resultData.queryLayers.reverse();  //翻转查询数组
            //     resultData.curIndexTitle = [];
            //     resultData.curLayerFieldArray = [];
            //     resultData.curPolygon = [];
            //     resultData.layerAttributuesArr = [];
            // }
            //初始化相关参数
            layerIndex = mapProject.visibleMapLayers.length -1;
            isLocation = false;
            //查询数据
            queryResult();
        }else{
            //创建结果界面
            parent.addOneMenu('identfy', '查询结果', 'Map/toIdentfy', 'wb-alert-circle', "Tab");
            $("#two_menu_iframe_identfy").load(function(){ //初次创建结果界面时需等待iframe加载完成才能渲染数据
                //初始化相关参数
                // resultData.queryLayers = mapProject.visibleMapLayers;
                // resultData.queryLayers.reverse(); //翻转查询数组
                layerIndex = mapProject.visibleMapLayers.length -1;
                isLocation = false;
                queryResult();
            });
        }
    }else{
        //parent.$(".one-menu-list").eq(0).click();
        showMessage("请先叠加图层再进行属性查询!", 8);
    }
}

//查询图层数据
function queryResult(){
    require([
        "widget/MapQuery"
    ],function(
        MapQuery
    ){
        if(layerIndex > -1){
            var layer = mapProject.visibleMapLayers[layerIndex];
            if(layer.dir_type == 2){
                var queryWhere = "1=1";
                var queryUrl = layer.pd.layer_url + "/" + layer.pd.layer_table;//
                var mapQuery = new MapQuery();
                //图层查询
                mapQuery.query(queryUrl, queryWhere, mapPoint, true, dataCallBack,errback);
            }
        }
    });
}

//处理查询结果数据
function dataCallBack(data){
    layerIndex--;
    if(data.features.length > 0){
        var gonGeometry = data.features[0].geometry;
        //根据图层id查询图层字段
        SystemInfo.getLayerFieldByLayerId(mapProject.visibleMapLayers[layerIndex + 1].layer_id, function(fieldData){
            //根据图层字段数据集获取标注字段
            var labelField = getLabelFieldByLayerField(fieldData);
            var features = data.features;
            var dataArr = new Array();
            for(var i = 0; i < features.length; i++){
                //获取图层显示字段数据集
                var showIdentfyData = getLayerFieldData(fieldData,features[i].attributes);
                if(!labelField){
                    labelField = data.displayFieldName;
                }
                dataArr.push({"labelField":labelField,"showIdentfyData":showIdentfyData,"geometry":gonGeometry});
            }
            var layerObj = {"layerId":mapProject.visibleMapLayers[layerIndex + 1].layer_id,"layerName":mapProject.visibleMapLayers[layerIndex + 1].dir_name, "layerInfo":dataArr};
            layerAttributues.push(layerObj);
            //默认渲染第一个
            if(!isLocation){
                isLocation = true;
                var makeValue=dataArr[0].labelField;
                $.each(dataArr[0].showIdentfyData,function(m,item){
                    if(item.field_name == dataArr[0].labelField ){
                        makeValue=item.field_value;
                        return false;
                    }
                });
                //保存默认显示结果
                // resultData.curIndexTitle.push(makeValue);
                // resultData.curLayerFieldArray.push(dataArr[0].showIdentfyData);
                // resultData.curPolygon.push(dataArr[0].geometry);
                identfyHighLightGraphic(makeValue,dataArr[0].showIdentfyData,dataArr[0].geometry);
            }
            if(layerIndex == -1){
                //resultData.layerAttributuesArr.push(layerAttributues);
                document.getElementById("two_menu_iframe_identfy").contentWindow.loadData(layerAttributues);
            }else{
                queryResult();
            }
        });
    }else{
        if(layerIndex == -1){
            document.getElementById("two_menu_iframe_identfy").contentWindow.loadData(layerAttributues);
        }else{
            queryResult();
        }
    }
}

function errback(e){
    layerIndex--;
    if(layerIndex == -1){
        document.getElementById("two_menu_iframe_identfy").contentWindow.loadData(layerAttributues);
    }else{
        queryResult();
    }
}
//点击高亮，弹出窗口图层字段信息
function identfyHighLightGraphic(indexTitle,layerFieldArray,geometry){
    require([
            "widget/MapGraphic",
            "esri/layers/GraphicsLayer",
            "esri/symbols/SimpleFillSymbol"
        ], function(
        MapGraphic,
        GraphicsLayer,
        SimpleFillSymbol
        ){
            var _mapView = mapObject._mapView;
            //关闭弹出窗口
            _mapView.popup.close();
            var graphicsLayer = _mapView.map.findLayerById("identfy_graphicLayer");
            if(graphicsLayer){
                graphicsLayer.removeAll();
            }else{
                graphicsLayer = new GraphicsLayer({
                    id: "identfy_graphicLayer"
                });
                _mapView.map.add(graphicsLayer);
            }
            //鼠标划过图形显示popup弹框事件
            /*$('#mapDiv').on('mousemove', function(evt) {
                _mapView.hitTest({x: event.x,y: event.y}).then(function(response) {
                    var graphics = response.results;
                    if(graphics.length > 0){
                        if(!popupObj){
                            var popupObj = {
                                title: indexTitle,
                                content: layerFieldHtml,
                                location: identfyWindow._currentPoint
                            };
                            _mapView.popup = {
                                dockOptions: {
                                    buttonEnabled: false,//不显示停靠按钮
                                }
                            };
                        }
                        mapObject._mapView.popup.open(popupObj);
                    }else{
                        mapObject._mapView.popup.close();
                    }
                });
            });*/

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
            //拼接弹出窗口图层字段信息
            var layerFieldHtml = "<div style='height:200px;width:350px;'><table class='table table-striped table-bordered table-hover'>";
            for(var i = 0; i < layerFieldArray.length; i++){
                var filedValue = layerFieldArray[i].field_value == null ? "" : layerFieldArray[i].field_value;//获取字段值
                var unit = layerFieldArray[i].field_unit;//获取字段单位
                layerFieldHtml += "<tr><td style='width:30%;'>"+layerFieldArray[i].field_name_cn+"</td><td>"+filedValue+unit+"</td></tr>";
            }
            layerFieldHtml += "</table></div>";
            //构造弹出窗口属性值对象
            var popupObj = {
                title: indexTitle,
                content: layerFieldHtml,
                location: mapPoint,
            };
            _mapView.popup = {
                dockOptions: {
                    buttonEnabled: false,//不显示停靠按钮
                }
            };

            //延迟200ms是为了处理点击同一个图形定位时闪烁3下的效果，否则移除上一次的图形和本次添加的图形会重合，看不到预期的效果
            setTimeout(function(){
                var mapGraphic = new MapGraphic(_mapView);
                //渲染图形
                var gonGraphic = mapGraphic.drawGraphic(null,geometry,graphicsLayer,thinLinePolyonSymbol);
                //地图缩放合适范围
                setMapExtentByGeometry(gonGraphic.geometry,-2);
                //图形定位闪烁，高亮显示
                //highLightGraphic(graphicsLayer,gonGraphic,popupObj);
                if(popupObj){
                    mapObject._mapView.popup.open(popupObj);
                }
                graphicsFlashing([gonGraphic],graphicsLayer,3,true);
                //添加graphic弹出窗口
                addPopupTemplate(indexTitle,layerFieldHtml,gonGraphic);
            },200);
        }
    );
}

//属性查询判断两个图层数组是否一致
function isSameArr(layers1, layers2){
    if(!layers1 || !layers2 || layers1.length != layers2.length){
        return false;
    }else{
        var layers1_layerIds = [], layers2_layerIds = []; //对图层id排序判断两个图层数组的图层id是否完全一致
        for(var i=0;i<layers1.length;i++){ layers1_layerIds.push(layers1[i].layer_id); } //当前查询图层的图层id数组
        for(var i=0;i<layers2.length;i++){ layers2_layerIds.push(layers2[i].layer_id); } //当前地图叠加的图层数组
        if(layers1_layerIds.sort().toString() != layers2_layerIds.sort().toString()){
            return false;
        }
    }
    return true;
}