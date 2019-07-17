/**
* @描述：地图查询功能js
* @作者：邹艺
* @日期：2019/4/19 9:13
**/

$(function(){
    //点击搜索按钮，弹出搜索框
    $(".search-component-submit").on("click",function(){
        if($("#search_component").width()===0){
            $("#search_component").animate({width:"272px"},500);
            $(".search-component-submit").animate({left:"272px"},500,function(){
                $(".search-component-submit").addClass("active");;
            });
        }else{
            //打开检索列表
            openSearchList();
        }
    })
})

//打开检索列表(回车键触发)
document.onkeydown = function(event){
    if(event && event.keyCode == 13 && $("#search_component").width() > 0){
        //打开检索列表
        openSearchList();
    }
}

//打开检索列表(isDirect--图形是否直接定位)
function openSearchList(){
    //检索时将输入框隐藏
    $("#search_component").animate({"width":"0px"},500);

    $(".search-component-submit").animate({"left":"0px"},500,function(){
        $(".search-component-submit").removeClass("active");

    });
    $(".fa-search").toggleClass("active");
    if($("#iframe_result_search").contents().length > 0){
        //显示检索数据列表
        document.getElementById("iframe_result_search").contentWindow.$("#keywordsPanel").fadeIn();
        //清除之前的激活样式
        $(".sys-menu-list").removeClass("active");
        //隐藏三级菜单
        $(".two-menu-container").hide();
        setMapContainerHeight();
        $("#sys_menu_search").addClass("active");
    }
    //隐藏检索下拉列表
    $(".search-box").hide();
    //检索条件必须满足，检索关键字不为空
    if($("#keywords").val().trim()){
        //多屏状态下
        if (isMoreScreen == true){
            $(".aside-menu").animate({"left":"0px"},200,function(){
                $("#open-sys-menu").hide();
            });
        }
        if($("#iframe_result_search").length > 0){
            isAnimFlag = true;
            if($("#iframe_result_search").hasClass("iframe-hide")){
                //如果该窗口被隐藏，则打开
                $(".iframe-result").addClass("iframe-hide");
                $("#iframe_result_search").removeClass("iframe-hide");

            }
            //检索列表数据
            document.getElementById("iframe_result_search").contentWindow.searchResult();
            showLeftIframeContainerAnim();
            setMapContainerHeight();
        }else{
            //打开检索列表
            getMapWindow("mapDiv").parent.addOneMenu("search","地图检索", "Map/toSearchList","iconfont icon-sousuo1", "Tab");
        }
    }
}

//检索
function search(){
    //清空定位dataJson数据集
    locationDataJson = null;
    //获取搜索关键字
    var keywords = $("#keywords").val().trim();
    //检索条件必须满足，检索关键字不为空，检索框为打开状态
    if(keywords){
        var searchPath = rootPath + "rest/map/searchIndex/searchByKeyWords?keywords="+encodeURI(keywords)+"&returnCount=0&d=" + new Date().getTime();
        GuoDi.Map.Request.POST({
            url: searchPath,
            success: function(result){
                var dataJson = eval('(' + result + ')');
                if(dataJson.success){
                    dataJson=dataJson.Body;
                }
                var resultHtml = "";
                if(dataJson.count > 0){
                    var count = (dataJson.count >= 10 ? 10 : dataJson.count);
                    for(var i = 0; i < count; i++){
                        resultHtml += "<li onclick='specificResultSearch("+JSON.stringify(dataJson.list[i])+")'>"+dataJson.list[i].index_field_value+"</li>";
                    }
                }
                $(".search-box ul").html(resultHtml);
                if(resultHtml){
                    $(".search-box").show();//显示检索下拉列表
                }
                if(locationDataJson){
                    //如果是直接打开检索定位则隐藏下拉列表
                    $(".search-box").hide();
                }
            },
            failure: function(r){
                showMessage("检索失败！",2);
            }
        });
        //隐藏专题图层
        $('#projectDirDiv').removeClass("fade in");
        $(".projectDirDiv-arrow").removeClass("arrow");
        //隐藏专题
        $('#projectDirChange').removeClass("fade");
        $(".projectDirChange-arrow").removeClass("arrow");
    }else{
        $(".search-box ul").html("");
        $(".search-box").hide();//隐藏检索下拉列表
        //隐藏专题图层
        $('#projectDirDiv').removeClass("fade in");
        $(".projectDirDiv-arrow").removeClass("arrow");
        //隐藏专题
        $('#projectDirChange').removeClass("fade");
        $(".projectDirChange-arrow").removeClass("arrow");
    }
}

//检索定位dataJson数据集
var locationDataJson = null;
//具体结果检索、定位
function specificResultSearch(dataJson){
    //设置检索值
    $("#keywords").val(dataJson.index_field_value);
    //检索下拉列表数据
    search();
    //赋值定位json数据集
    locationDataJson = dataJson;
    //检索列表数据
    openSearchList();
}

//高亮显示图形
function directResultLocation(){
    if(locationDataJson){
        document.getElementById("iframe_result_search").contentWindow.queryLayerLocation(locationDataJson);
    }
}

//显示检索下拉列表
function showSearchBox(){
    if($("#keywords").val().trim()){
        $(".search-box").show();
        //隐藏专题图层
        $('#projectDirDiv').removeClass("fade in");
        $(".projectDirDiv-arrow").removeClass("arrow");
        //隐藏专题
        $('#projectDirChange').removeClass("fade");
        $(".projectDirChange-arrow").removeClass("arrow");
    }
}

//隐藏检索下拉列表
function hideSearchBox(){
    $(".search-box").hide();//隐藏检索下拉列表
}

//点击隐藏搜索框
$(".search-component-hide").on("click",function(){
    if($("#search_component").width()===272){
        $("#search_component").animate({width:"0px"},500);
        $(".search-component-submit").animate({left:"0px"},500);
        $(".fa-search").toggleClass("active");
        $(".search-component-hide").fadeOut();
    }
})