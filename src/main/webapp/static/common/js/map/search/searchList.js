/**
 * 项目检索js
 */

//当前定位图形graphic
var _currentCenterGraphic = null,//当前中心点定位图形graphic
	_currentGraphic = null,		//当前高亮显示图形graphic
	_graphicsLayer = null,		//当前图层
	_layerId = null,			//图层id
	_indexFieldValue = null;	//检索字段值

//窗口加载事件
window.onload = searchResult;
//检索列表(isDirect--图形是否直接定位)
function searchResult(){
	var keywords = parent.$("#keywords").val().trim();
	var searchPath = rootPath + "rest/map/searchIndex/searchByKeyWords?keywords="+encodeURI(keywords)+"&returnCount=0&d=" + new Date().getTime();
	GuoDi.Map.Request.POST({
        url: searchPath,
        success: function(r){
        	var resp = eval('(' + r + ')');
        	var dataJson={};
        	if(resp.success){
        		dataJson=resp.data;
        	}else{
        		showMessage("检索列表结果异常！",2);
        		return;
        	}
			//初始化列表数据
			initPagination(dataJson.list,10,loadData);
			//检索结果记录数
			$("#searchResultCount").text(dataJson.count);
			//显示iframe
			self.parent.$("#iframe_result_search").removeClass("iframe-hide");
			//设置检索列表iframe、table内容高度
			//setResultSearchHeight();
			
			//高亮定位、显示图形(只有检索直接定位时有效)
			parent.directResultLocation();
		},
        failure: function(r){
        	showMessage("检索列表加载失败！",2);
		}
	});
}

//设置检索列表iframe、table内容高度
/*function setResultSearchHeight(){
	//获取检索列表内容高度
	var height = $("#search-table").find("tbody").css("height");
	height = parseInt(height.substring(0,height.indexOf("px")));
	//设置iframe高度
	parent.document.getElementById("iframe_result_search").style.height = (height + 125) + "px";
	
	if(parent.document.body.clientHeight-193-47 < height){
		//设置页面高度、宽度
		document.getElementById("project-list-content").style.height = (parent.document.body.clientHeight-193-47) + "px";
	}else{
		//设置页面高度、宽度
		document.getElementById("project-list-content").style.height = height + "px";
	}
}*/

//加载列表数据
function loadData(dataArray){
	if(dataArray && dataArray.length > 0){
		//检索项目定位
		parent.searchResultLocation(dataArray);
		
		var resultHtml = "";
		var positionX = 0;//检索结果列表图标X轴截取数值
		for(var i = 0; i < dataArray.length; i++){
			if(i > 0){
				positionX -= 18;
			}
			resultHtml += "<tr><td onmouseover='searchMouseHandler(\"over\","+positionX+","+i+")' onmouseout='searchMouseHandler(\"out\","+positionX+","+i+")'><div class='project-content'><div class='project-name'><span id='search_img_"+i+"' class='search_image' style='background-position:"+positionX+"px -139px;'></span></div>\
			<div style='margin-top:14px;margin-left:30px;cursor:pointer;' onclick='queryLayerLocation(this,"+JSON.stringify(dataArray[i])+")'><div class='search-project'>"+dataArray[i].index_field_value+"</div>"+dataArray[i].show_field_value+"</div></div></td></tr>";
		}
		//渲染检索列表html
		$("#project-list-content tbody").html(resultHtml);
	}else{
		//检索结果为空
		$("#project-list-content tbody").html("");
	}
}

//具体项目定位
function queryLayerLocation(that,dataObj){
	$(".search-project").removeClass("active");
	$(that).find(".search-project").addClass("active");
	//字段赋值
	_layerId = dataObj.layer_id;
	_indexFieldValue = dataObj.index_field_value;
	//拼接where查询条件
	var whereStr = dataObj.primary_field + "=" + dataObj.primary_field_value;
	//项目定位
	parent.searchResultDetail(dataObj.layer_url,whereStr,dataObj.primary_field_value);
}

//清除结果
function clearResult(){
	//赋值检索结果记录总数为0
	$("#searchResultCount").text(0);
	//清空列表数据
	initPagination(null,10,loadData);
	$("#project-list-content tbody").html("");
	//清除检索渲染图形
	parent.clearMapGraphicSearch();
	parent.closeGraphicAnime();
	//隐藏分页
	$(".paginationCss").hide();
}

//检索检索鼠标移入改变图标
function searchMouseHandler(type,positionX,index){
	if(type == "over"){
		$("#search_img_"+index).css("backgroundPosition",positionX+"px -166px");
	}else{
		$("#search_img_"+index).css("backgroundPosition",positionX+"px -139px");
	}
}

//关闭检索窗口
function closeSearchWindow(){
	//清除检索渲染图形
	clearMapGraphicSearch();
	parent.closeGraphicAnime();
	//关闭iframe
	parent.removeIframe("search");
}

//清除检索渲染图形
function clearMapGraphicSearch(){
	var _mapView = getMapWindow("mapDiv").mapObject._mapView;
	//关闭弹出窗口
	_mapView.popup.close();
	//循环删除上一次检索列表定位图形
	for(var i = 0; i < _mapView.graphics.items.length; i++){
		var graphic = _mapView.graphics.items[i];
		if(graphic.id.indexOf("search_") != -1){
			_mapView.graphics.remove(graphic);
			i--;
		}
	}
	if(_highLightInterval){
		//移除高亮显示setInterval
		window.clearInterval(_highLightInterval);
	}
	//移除定位图形
	var graphicsLayer = _mapView.map.findLayerById("searchResultDetail_graphicLayer");
	if(graphicsLayer){
		graphicsLayer.removeAll();
	}
	closeGraphicAnime();
}