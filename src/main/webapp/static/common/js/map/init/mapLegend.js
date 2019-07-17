/**
 * @描述：Map图例js
 * @作者：彭辉
 * @时间：2019/3/27 17:29
 */
// 存储叠加的图层数组
$(function(){
    // 初始化”图层透明度“滑动取值控件
    $('#layerAlpha').jRange({
        from: 0, // 开始于
        to: 1, // 结束于
        step: 0.01, // 一次滑动多少
        scale: [0,1],  // 分割点
        format: '%s',  // 格式化格式
        width: 110, // 宽度
        showLabels: true, // 是否显示滑动条下方的尺寸标签
        showScale: false,  // 是否显示滑块上方的数值标签
        isRange:false  // 是否选取范围,
    });
    $("#layerAlpha").change(function(e){
        if(!currentProjectLayerId){
            return;
        }

        // 根据图层id获取当前图层对象
        var layerObj = null;
        if(parent.multiScreenPower == 0){// 多屏下
            layerObj = parent.multiMapInit._myMap.findLayerById(currentProjectLayerId);
        }else{
            layerObj = parent.mapObject._myMap.findLayerById(currentProjectLayerId);
        }
        if(layerObj){
            layerObj.opacity = e.currentTarget.value;
        }
    });
    $("#legend-content .slider-container").css("margin-top",-11);
});

// 添加图层图例(projectObj:专题object，isChecked:是否叠加)
function loadLayerLegend(isChecked, projectObj){
    if(!projectObj){
        parent.showMessage("叠加图层图例失败！", 2);
        return;
    }else if(projectObj.pd.layer_type == "layer_type_dt" && projectObj.pd.load_type == "layer_load_tiled"){
        // 不添加电子地图图例
        return;
    }

    var layerUrl = projectObj.pd.layer_url + "/legend?f=pjson";
    GuoDi.Map.Request.POST({
        url: layerUrl,
        success: function(r){
            var legendJson = eval('(' + r + ')');
            drawLayerLegend(projectObj, legendJson, isChecked);
        },
        failure: function(r){
            parent.showMessage("叠加图层图例失败！",2);
        }
    });
}

// 渲染图例(projectObj:专题object，legendJson：图例数据集，isChecked:是否叠加)
function drawLayerLegend(projectObj, legendJson, isChecked){
    if(!isChecked){
        // 取消选中专题图层, 则移除图例
        $("#legend-"+projectObj.id).remove();
    }else{
        // 获取图层数组
        var layers = legendJson.layers;
        if(!layers || layers.length == 0){
            return;
        }
        var layerLegendHtml = '<div class="mapLegend-container" id="legend-'+projectObj.id+'"><p class="legend-list-title">'+projectObj.pd.layer_name+'</p><ul class="mapLegend-ul">';
        // 拼接图例html
        for(var i = 0; i < layers.length; i++){
            if(layers[i].layerId != projectObj.pd.layer_table){
                continue;
            }
            // 获取图例数组
            var legendArray = layers[i].legend;
            // 拼接图例
            for(var j = 0; j < legendArray.length; j++){
                var legendObj = legendArray[j];
                layerLegendHtml += '<li><img class="legend-color" src="data:'+legendObj.contentType+';base64,'+legendObj.imageData+'"/><span class="legend-name" title="'+legendObj.label+'">'+legendObj.label+'</span></li>';
            }
            layerLegendHtml += '</ul>';
        }
        layerLegendHtml += '</div>';

        // 将图例插入起始位置
        $(".mapLegend-list").prepend(layerLegendHtml);
    }
    // // 设置图层图例下边框虚线、最后一个不显示
    $(".mapLegend-container").css("border-bottom", "1px dashed #d4d4d4");
    $(".mapLegend-container").last().css("border-bottom-width", "0px");
}

// 折叠/展开 图例
function legendFolding(){
    // 注：多屏标识放入if判断，目前暂时未定
    if(false){// 多屏
        if($(".layer-title .icon-close").length > 0){// 折叠
            $(".mapLegend").animate({height:"22px",width:"51px"}, function(){
                // 替换图标
                $(".layer-title .icon-close").removeClass("iconfont icon-close").addClass("fa fa-expand");
                // 隐藏“图例”文本
                $(".mapLegend-title").addClass("hide");
                // 显示展开“图例”文本
                $("#foldLegendTitle").removeClass("hide");
                // 设置折叠“图例”背景颜色、图标颜色
                $(".mapLegend").css("background-color", "#338ee8");
                $(".layer-title").css({"color":"#fff", "padding-top":"6px"});
            });

            if($("#tool-menu-container").hasClass("open")){
                // 设置比例尺左边距
                $("#mapxydiv").animate({left:"480px"});
            }else{
                if($("#aside-menu").css("left") == "0px") {
                    // 设置比例尺左边距
                    $("#mapxydiv").animate({left:"145px"});
                }else{
                    // 设置比例尺左边距
                    $("#mapxydiv").animate({left: "65px"});
                }
            }
            // 隐藏图例内容
            $(".mapLegend-list").addClass("hide");
        }else{// 展开
            $(".mapLegend").animate({height:"180px",width:"170px"}, function(){
                // 替换图标
                $(".layer-title .fa-expand").removeClass("fa fa-expand").addClass("iconfont icon-close");
            });
            // 显示“图例”文本
            $(".mapLegend-title").removeClass("hide");
            // 隐藏展开“图例”文本
            $("#foldLegendTitle").addClass("hide");
            // 设置展开“图例”背景颜色、图标颜色
            $(".layer-title").css({"color":"#616161", "padding-top":"6px"});
            $(".mapLegend").css("background-color", "#fff");

            if($("#tool-menu-container").hasClass("open")){
                // 设置比例尺左边距
                $("#mapxydiv").animate({left:"600px"});
            }else{
                if($("#aside-menu").css("left") == "0px") {
                    // 设置比例尺左边距
                    $("#mapxydiv").animate({left:"265px"});
                }else{
                    // 设置比例尺左边距
                    $("#mapxydiv").animate({left:"185px"});
                }
            }
            // 显示图例内容
            $(".mapLegend-list").removeClass("hide");
        }
    }else{
        if($(".layer-title .icon-close").length > 0){// 折叠
            $(".mapLegend").animate({height:"22px",width:"51px"}, function(){
                // 替换图标
                $(".layer-title .icon-close").removeClass("iconfont icon-close").addClass("fa fa-expand");
                // 隐藏“图例”文本
                $(".mapLegend-title").addClass("hide");
                // 显示展开“图例”文本
                $("#foldLegendTitle").removeClass("hide");
                // 设置折叠“图例”背景颜色、图标颜色
                $(".mapLegend").css("background-color", "#338ee8");
                $(".layer-title").css({"color":"#fff", "padding-top":"6px"});
            });

            if($("#tool-menu-container").hasClass("open")){
                // 设置比例尺左边距
                $("#mapxydiv").animate({left:"480px"});
            }else{
                // 设置比例尺左边距
                $("#mapxydiv").animate({left:"145px"});
            }
            // 隐藏图例内容
            $(".mapLegend-list").addClass("hide");
        }else{// 展开
            $(".mapLegend").animate({height:"180px",width:"170px"}, function(){
                // 替换图标
                $(".layer-title .fa-expand").removeClass("fa fa-expand").addClass("iconfont icon-close");
            });
            // 显示“图例”文本
            $(".mapLegend-title").removeClass("hide");
            // 隐藏展开“图例”文本
            $("#foldLegendTitle").addClass("hide");
            // 设置展开“图例”背景颜色、图标颜色
            $(".layer-title").css({"color":"#616161", "padding-top":"7px"});
            $(".mapLegend").css("background-color", "#fff");

            if($("#tool-menu-container").hasClass("open")){
                // 设置比例尺左边距
                $("#mapxydiv").animate({left:"600px"});
            }else{
                // 设置比例尺左边距
                $("#mapxydiv").animate({left:"265px"});
            }
            // 显示图例内容
            $(".mapLegend-list").removeClass("hide");
        }
    }
}

