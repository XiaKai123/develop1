/**
* @描述：主屏地图工具栏多屏操作js
**/

var extentHandles = [], //地图范围监听集合
    winHeight, //屏幕高度
    winWidth; //屏幕宽度

//分屏-两屏
function changeScreenTwo(that,mapDiv){
    // 关闭二级菜单及内容面板
    hideLeftIframeContainerAnim();
    screenNum=1;
    //获取浏览器的高度
    setContentHeight();
    //多屏状态下隐藏动画
    moreScreenHideAnim ();
    //多屏状态下
    isMoreScreen = true;
    //左右两屏宽高设置
    $("#mapDiv").removeClass("col-xs-12");
    $("#mapDiv").animate({width:winWidth/2,height:winHeight},200);
    $("#mapDiv1").animate({width:winWidth/2,height:winHeight,marginTop:"0px"},200);
    //清除第二屏，第三屏样式
    $("#mapDiv2").animate({width:"0px",height:"0px"},200);
    $("#mapDiv3").animate({width:"0px",height:"0px"},200);
    multiScreen("two");
    setMultiScreenPower("mapDiv1", 0);
}

//分屏-三屏
function changeScreenThere(that){
    screenNum=2;
    //获取浏览器的高度
    setContentHeight();
    //多屏状态下隐藏动画
    moreScreenHideAnim ();
    //多屏状态
    isMoreScreen = true;

    $("#mapDiv").removeClass("col-xs-12");
    $("#mapDiv").animate({width:winWidth/2},200);
    $("#mapDiv1").animate({width:winWidth/2,height:winHeight/2,marginTop:"0px"},200);
    $("#mapDiv2").animate({width:winWidth/2,height:winHeight/2},200);
    //清除第三屏样式
    $("#mapDiv3").animate({width:"0px",height:"0px"},200);
    multiScreen("three");
    setMultiScreenPower("mapDiv2", 0);
}

//分屏-四屏
function changeScreenFour(that){
    screenNum=3;
    //获取浏览器的高度
    setContentHeight();
    //多屏状态下隐藏动画
    moreScreenHideAnim ();
    isMoreScreen = true;
    $("#mapDiv").removeClass("col-xs-12");
    $("#mapDiv").animate({width:winWidth/2,height:winHeight/2},200);
    $("#mapDiv1").animate({width:winWidth/2,height:winHeight/2},200);
    $("#mapDiv2").animate({width:winWidth/2,height:winHeight/2},200);
    $("#mapDiv3").animate({width:winWidth/2,height:winHeight/2},200);
    multiScreen("four");
    setMultiScreenPower("mapDiv3", 0);
}

function multiScreen(mapId){
    //一屏
    if(mapId == "one"){
    }else if(mapId == "two"){
        addMultiScreen("mapDiv1");
    }else if(mapId == "three"){
        addMultiScreen("mapDiv1");
        addMultiScreen("mapDiv2");
    }else if(mapId == "four"){
        addMultiScreen("mapDiv1");
        addMultiScreen("mapDiv2");
        addMultiScreen("mapDiv3");
    }
}

//添加多屏
function addMultiScreen(mapId){
    curMapIframeId = "mapDivFrame_"+mapId;
    var iframeObj = document.getElementById(curMapIframeId);
    if(iframeObj == null||iframeObj==undefined){
        $("#"+mapId).html(" <iframe id=\""+curMapIframeId+"\"  frameborder=\"0\" src='Map/toMultiScreen?token="+localStorage.token+"' width=\"100%\" height=\"100%\"></iframe>" );
        $("#"+curMapIframeId).load(function(){
            //初始化多屏联动事件
            initMapExtentChangeEvent();
        });
    }
}

//销毁多屏地图对象
function destroyMultiMap(){
    var mapIframeArr = ["mapDiv1","mapDiv2","mapDiv3"];
    $.each(mapIframeArr, function(i,mapDiv){
        var iframeObj=document.getElementById("mapDivFrame_"+mapDiv);
        if(iframeObj){
            iframeObj.contentWindow.destroyMap();
        }
    });
}

//当鼠标移入地图后给当前地图添加extent改变事件
function initMapExtentChangeEvent(){
    $("#mapDiv").mouseenter(function(){
        addMapExtentChangeEvent("mapDiv");
    });
    $("#mapDiv1").mouseenter(function(){
        addMapExtentChangeEvent("mapDiv1");
    });
    $("#mapDiv2").mouseenter(function(){
        addMapExtentChangeEvent("mapDiv2");
    });
    $("#mapDiv3").mouseenter(function(){
        addMapExtentChangeEvent("mapDiv3");
    });
}

//多屏下其他隐藏动画
function moreScreenHideAnim (){
    //隐藏右侧工具条
    $(".map-tool-list").hide();
    $(".toolbox").hide();
    //显示退出多屏按钮
    $(".quit-screen").show();

    //隐藏系统菜单
    $(".aside-menu").css("left","-80px");
    if($(".sys-menu-list").hasClass("active")){
        //清除菜单激活样式
        $(".sys-menu-list").removeClass("active");
        $("#tool-menu-container").removeClass("open");
        $("#tool-menu-container").css("left","-400px");
    }
    //专题切换、行政区划、检索
    $("#zjditu_global_change").css("left","10px");
    $("#division_pane").css("left","80px");
    $("#search_pane").css("left","130px");
    //比例尺
    if($(".mapLegend").width() < 52){
        $(".mapLegend").css("left","0px");
        $("#mapxydiv").css("left","65px");
    }else{
        $(".mapLegend").css("left","0px");
        $("#mapxydiv").css("left","185px");
    }

    //打开系统菜单按钮
    $("#open-sys-menu").show();
}

//多屏状态下，鼠标移入阴影部分，显示系统菜单
var _trigger =null;
$("#open-sys-menu").hover(function(){
    _trigger = setTimeout(function(){
        $("#open-sys-menu").hide();
        $(".aside-menu").animate({"left":"0px"},500);

        //专题切换、行政区划、检索
        $("#zjditu_global_change").animate({"left":"85px"},500);
        $("#division_pane").animate({"left":"155px"},500);
        $("#search_pane").animate({"left":"205px"},500);
        //比例尺
        if($(".mapLegend").width() < 52){
            //比例尺
            $(".mapLegend").animate({"left":"80px"},500);
            $("#mapxydiv").animate({"left":"145px"},500);
        }else{
            //比例尺
            $(".mapLegend").animate({"left":"80px"},500);
            $("#mapxydiv").animate({"left":"265px"},500);
        }
    },300);  //这里1000就是间隔1秒
},function(){
    clearTimeout(_trigger);   //清除将要在1秒后执行的弹出框动作
})

//多屏状态下，未打开三级菜单面板，鼠标移出系统菜单栏，隐藏系统菜单
$("#aside-menu").mouseleave(function(){
    if ( isMoreScreen == true && threeMenuIsOpen == false){
        $(".aside-menu").animate({"left":"-80px"},500,function(){
            $("#open-sys-menu").show();

        });
        //专题切换、行政区划、检索
        $("#zjditu_global_change").animate({"left":"10px"},500);
        $("#division_pane").animate({"left":"80px"},500);
        $("#search_pane").animate({"left":"130px"},500);
        //比例尺
        if($(".mapLegend").width() < 52){
            //比例尺
            $(".mapLegend").animate({"left":"0px"},500);
            $("#mapxydiv").animate({"left":"65px"},500);
        }else{
            //比例尺
            $(".mapLegend").animate({"left":"0px"},500);
            $("#mapxydiv").animate({"left":"185px"},500);
        }
    }
})

//退出多屏
function quitMoreScreen(){
    isMoreScreen = false;
    //获取浏览器的宽度
    var winWidth=document.documentElement.clientWidth;
    var winHeight=document.documentElement.clientHeight;
    $(".aside-menu").animate({"left":"0px"},100,function(){
        $("#open-sys-menu").hide();
    });
    //显示右侧工具条
    $(".map-tool-list").show();
    $(".toolbox").show();
    if($(".sys-menu-list").hasClass("active")){
        //清除菜单激活样式
        $(".sys-menu-list").removeClass("active");
        $("#tool-menu-container").removeClass("open");
        $("#tool-menu-container").css("left","-400px");
    }
    if($(".mapLegend").width() < 52){
        //比例尺
        $(".mapLegend").css("left","80px");
        $("#mapxydiv").css("left","145px");
    }else{
        //比例尺
        $(".mapLegend").css("left","80px");
        $("#mapxydiv").css("left","265px");
    }

    //专题切换、行政区划、检索
    //$("#zjditu_global_change").css("left","85px");
    //$("#division_pane").css("left","155px");
    //$("#search_pane").css("left","205px");

    screenNum=0;
    //隐藏退出多屏按钮
    $(".quit-screen").hide();
    $("#mapDiv").animate({width:winWidth,height:winHeight},200);
    $(".map-screen").animate({width:"0px",height:"0px",marginTop:"0px"},200);
    //获取iframe变量
    $("#projectDirIfr").contents().find("#linkage-btn").fadeOut();
    //分屏地图对象
    destroyMultiMap();
    //清空多屏地图iframe节点
    var mapDivArr=['mapDiv1','mapDiv2','mapDiv3'];
    $.each(mapDivArr,function(i,mapDiv){
        var mapIframeId = "mapDivFrame_"+mapDiv;
        $("#"+mapIframeId).remove();
    });
}

//添加地图范围改变事件
function addMapExtentChangeEvent(mapDiv){
    //删除地图extent改变事件
    extentHandles.forEach(function(handle) {
        handle.remove();
    });
    if(mapDiv=="mapDiv" && mapObject){//主图添加extent改变事件
        var _mapView=mapObject.getMapView();
        extentHandles.push(
            _mapView.watch("extent", function(newValue, oldValue, type, g){
                multiAssociate(_mapView, mapDiv);
            })
        );
    }else{//小图添加extent改变事件
        var iframeObj = document.getElementById("mapDivFrame_"+mapDiv);
        if (iframeObj && iframeObj.contentWindow.mapObject){
            var iframeObj_mapView = iframeObj.contentWindow.mapObject.getMapView();
            //将地图extent改变事件添加到集合中
            extentHandles.push(
                iframeObj_mapView.watch("extent", function(newValue, oldValue, type, g){
                    var associatePowerChk = iframeObj.contentWindow.document.getElementById("associatePowerChk");
                    if($(associatePowerChk).is(':checked')){
                        multiAssociate(iframeObj_mapView, mapDiv);
                    }
                })
            );
        }
    }
}

//多屏联动
function multiAssociate(mapObj, mapViewContainer){
    var mapIframeArr = ["mapDiv","mapDiv1","mapDiv2","mapDiv3"];
    $.each(mapIframeArr, function(i,mapDiv){
        if(mapViewContainer==mapDiv){//不联动本身，解决地图晃动
            return true;
        }else{
            if(mapDiv=="mapDiv"){
                mapObject.multiAssociate(mapObj);
            }else{
                var iframeObj=document.getElementById(mapDiv=="mapDiv"?mapDiv:"mapDivFrame_"+mapDiv);
                if (iframeObj && iframeObj.contentWindow.mapObject){
                    var associatePowerChk = iframeObj.contentWindow.document.getElementById("associatePowerChk");
                    if($(associatePowerChk).is(':checked')){
                        iframeObj.contentWindow.mapObject.multiAssociate(mapObj);
                	}
                }
            }
        }
    });
}

//多屏地图移动显示坐标
function multiMapMoveShowCoor(point){
    if(mapObject){
        mapObject.mapCoordinate(point);
    }
}

//分屏开关
function setMultiScreenPower(mapDiv, power) {
    var iframeObj=document.getElementById("mapDivFrame_" + mapDiv);
    if(iframeObj && iframeObj.contentWindow.setMultiScreenPower){
        iframeObj.contentWindow.setMultiScreenPower(power);
    }
    //获取iframe变量
    $("#projectDirIfr").contents().find("#linkage-btn").fadeIn();
}

//分屏同步加载图层
function multiScreenAddLayer(flag,currentNodeObj){
    var mapIframeArr = ["mapDiv1","mapDiv2","mapDiv3"];
    $.each(mapIframeArr, function(i,mapDiv){
        var iframeObj=document.getElementById("mapDivFrame_"+mapDiv);
        if(iframeObj && iframeObj.contentWindow.multiAssociate){
            if(multiScreenAddLayerPower){
                iframeObj.contentWindow.multiScreenAddLayer(flag,currentNodeObj);
            }
        }
    });
}