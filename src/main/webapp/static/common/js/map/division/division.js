var _currentGraphic = null;		//当前显示图形graphic

$(function() {
    // 初始化加载行政区
    loadDistrictCounty();
});

// 初始化加载行政区
function loadDistrictCounty(that, divisionCode, divisionName){
    divisionCode = divisionCode ? divisionCode : "";

    if(that && divisionCode){
    	if(divisionCode.length == 6){
            // 移除区县前选中样式
    		$(".district-content ul li").removeClass("active");

    		// 渲染区县导航栏
            if($("#districtNav").length > 0){
                $("#districtNav").text(divisionName);
            }else{
                $("#nav-title").append("<span id='districtNavContent'><span style='padding:0px 1px 0px 2px;'>></span><span id='districtNav'>"+divisionName+"</span></span>");
            }
            $("#streetNavContent").remove();
            $("#vilageContent").hide();
            $("#villageNavContent").remove();
		}else if(divisionCode.length == 9){
            // 移除街镇选中样式
            $(".street-content ul li").removeClass("active");

            // 渲染街镇导航栏
            if($("#streetNav").length > 0){
                $("#streetNav").text(divisionName);
            }else{
                $("#nav-title").append("<span id='streetNavContent'><span style='padding:0px 1px 0px 2px;'>></span><span id='streetNav'>"+divisionName+"</span></span>");
            }
            $("#villageNavContent").remove();
        }else if(divisionCode.length == 12){
            // 移除行政村选中样式
            $(".village-content ul li").removeClass("active");

            // 渲染行政村导航栏
            if($("#villageNav").length > 0){
                $("#villageNav").text(divisionName);
            }else{
                $("#nav-title").append("<span id='villageNavContent'><span style='padding:0px 1px 0px 2px;'>></span><span id='villageNav'>"+divisionName+"</span></span>");
            }
        }
        // 给当前选中节点添加样式
        $(that).addClass("active");

    	// 加载行政区表格属性数据
        loadDivisionInfo(divisionCode);
	}
    // 根据编码code查询下级行政区划
    GuoDi.Map.Request.POST({
        url: rootPath + "rest/MapDivisionRest/getDivisionByCode?code=" + divisionCode + "&token=" + localStorage.token,
        success: function (result) {
            var resultJson = eval('(' + result + ')');

            // 渲染行政区
            if(resultJson.data && resultJson.data.length > 0){
                var divisionLength = resultJson.data[0].division_code.length;
                // 存储提示文本、行政区渲染className
                var chooseText = null, divisionClassName = null;
            	if(divisionLength == 6){
                    chooseText = "请选择区";
                    divisionClassName = "district-content";
				}else if(divisionLength == 9){
                    chooseText = "请选择街镇";
                    divisionClassName = "street-content";
				}else if(divisionLength == 12){
                    chooseText = "请选择行政村";
                    divisionClassName = "village-content";
				}
                var divisionHtml = '<div class="'+divisionClassName+'"><p>'+chooseText+'</p><ul>';
				for(var i = 0; i < resultJson.data.length; i++){
					var divisionJson = resultJson.data[i];
                    divisionHtml += '<li onclick="loadDistrictCounty(this, \''+divisionJson.division_code+'\', \''+divisionJson.division_name+'\')">'+divisionJson.division_name+'</li>';
				}
                divisionHtml += '</ul></div>';

				if(divisionLength == 6){
                    // 移除区县、街镇、行政村内容
                    $(".district-content").remove();
                    $(".street-content").remove();
                    $(".village-content").remove();
					// 渲染区县
                    $("#divisionDetail").before(divisionHtml);
				}else if(divisionLength == 9){
					// 移除街镇、行政村内容
                    $(".street-content").remove();
					$(".village-content").remove();
                    // 追加渲染街镇
                    $("#divisionDetail").before(divisionHtml);
				}else if(divisionLength == 12){
                    // 移除行政村内容
                    $(".village-content").remove();
                    // 追加渲染行政村
                    $("#divisionDetail").before(divisionHtml);
                }
			}else{
            	if(divisionCode.length == 6){
                    // 移除街镇、行政村内容
                    $(".street-content").remove();
                    $(".village-content").remove();
				}else if(divisionCode.length == 9){
                    // 移除行政村内容
                    $(".village-content").remove();

				}
			}
        }
    });
}


//查询行政区、街镇、村信息
function loadDivisionInfo(divisionCode){
	//加载行政区划详细信息
	GuoDi.Map.Request.POST({
		url: rootPath + "rest/MapDivisionRest/getDivisionInfo?code=" + divisionCode + "&token=" + localStorage.token,
        success: function(result){
        	var r = eval('(' + result + ')');
        	var dataJson={};
        	if(r.success){
        		dataJson=r.data;
        	}else{
        		showMessage("根据编码code查询下级行政区划结果异常！",2);
        		return;
        	}
        	var fieldHtml = "";
        	for(var i = 0; i < dataJson.fieldArray.length; i++){
        		var fieldJson = dataJson.fieldArray[i];
        		if(fieldJson.field_name.indexOf("SHAPE") == -1){
        			var fieldValue = fieldJson.field_value ? fieldJson.field_value : "";
        			fieldHtml += "<tr class='list-of-details'><td class='td-title'>"+fieldJson.field_name_cn+"</td><td class='td-content'>"+fieldValue+"</td></tr>";
        		}
        	}
        	// 渲染行政区属性数据
        	$("#division-table tbody").html(fieldHtml);
        	$("#divisionDetail").show();

        	//移除上一次渲染图形
			getMapWindow("mapDiv").removeMapGraphic("division_graphic_id",null);
        	//渲染行政区划图形
            getMapWindow("mapDiv").simpleDivisionGraphic("division_graphic_id",dataJson.layerUrl,dataJson.where,true);
        }
	});
}

// 清除结果
function clearDivisionResult(){
    // 移除行政区导航栏
	$("#districtNavContent").remove();
	$("#streetNavContent").remove();
	$("#villageNavContent").remove();

	// 移除行政区内容
    $(".street-content").remove();
    $(".village-content").remove();
    // 移除行政区县选中样式
    $(".district-content ul li").removeClass("active");
    // 隐藏行政区表格内容
	$("#divisionDetail").hide();
	//清除检索渲染图形
    getMapWindow("mapDiv").removeMapGraphic("division_graphic_id", null);
}

// 关闭检索窗口
function closeDivisionWindow(){
	// 清除检索渲染图形
    getMapWindow("mapDiv").removeMapGraphic("division_graphic_id", null);
	// 关闭iframe
    getMapWindow("mapDiv").hideLeftIframeContainerAnim();
}