var _currentPoint;
var _currentGraphic;
var _layerAttributues;

//页面加载完成设置iframe的宽高
$(function(){
	document.onreadystatechange = subSomething;//当页面加载状态改变的时候执行这个方法.
	function subSomething() {
		if (document.readyState == "complete") {//当页面加载状态 为完成 
			self.$("#iframe_left_content").removeClass("iframe-hide");
		}
	}
	 //实例化bookmark类
	parent.mapObject.initMapBookMark();
})

//关闭检索窗口
function closeDivisionWindow(){
	//清除渲染的图形
	parent.clearMapGraphicIdentfy();
	//关闭iframe
	parent.removeIframe("identfy");
	
}
//清除结果
function clearResult(){
	$(".layerdir_tree_list").html("<li class='list_result_all' onclick='showAllInfo()'>全部结果(<span>0</span>)</li>");
	$("#queryDiv").html("");
	$("#searchResultCount").text("0");
	//清除渲染的图形
	parent.clearMapGraphicIdentfy();
	parent.closeGraphicAnime();
	/*//清除结果
	identfyData.splice(0, identfyData.length);*/
	//隐藏分页
	$(".paginationCss").hide();
	identfyData=null;
}

//分页
var identfyData=null;
function loadData(dataJson){
	identfyData=dataJson;
	initPagination(dataJson,5,layerIdentfyHtml);
}


//渲染详情信息头部及图层列表部分
var IdentfyHtml="";
function layerIdentfyHtml (layerAttributues) {
	if(!layerAttributues || layerAttributues.length == 0){
		IdentfyHtml="<p class='search-result'>共<span id='searchResultCount'>0</span>条结果<i style='color:#3385ff;cursor:pointer;margin-left:10px;' onclick='clearResult()'>清除结果</i></p><ul class='layerdir_tree_list'><li class='list_result_all' onclick='showAllInfo()'>全部结果(<span>0</span>)</li></ul>\
			<div id='queryDiv' class='queryDiv' style='margin:0 10px 5px;'><table id='queryTable' class='queryTable'><tbody></tbody></table></div>";
		document.getElementById("panel-body-content").innerHTML = IdentfyHtml;
		return;
	}
	
	IdentfyHtml = "";
	//获取图层信息总数
	var sum=0;
	for (var i=0;i<layerAttributues.length;i++){			
		sum = sum+ layerAttributues[i].layerInfo.length;
		IdentfyHtml="<p class='search-result'>共<span id='searchResultCount'>"+sum+"</span>条结果<i style='color:#3385ff;cursor:pointer;margin-left:10px;' onclick='clearResult()'>清除结果</i></p><ul class='layerdir_tree_list'><li class='list_result_all' onclick='showAllInfo()'>全部结果(<span>"+sum+"</span>)</li>"
	}
	
	 //获取各个图层的名称及总数	
	for (var i=0;i<layerAttributues.length;i++){
		IdentfyHtml+="<li class='list_result' data_id='"+layerAttributues[i].layerId+"' onclick='identfyClassify(this)'>"+layerAttributues[i].layerName + "(<span>"+ layerAttributues[i].layerInfo.length +"</span>)</li>"
	}
	IdentfyHtml+="</ul>"
	//渲染详细信息
    layerIdentfyText(layerAttributues);		
}

//渲染详情信息详细信息
function layerIdentfyText(layerAttributues){
	_layerAttributues = layerAttributues;
	var IdentfyText="<div id='queryDiv' class='queryDiv' style='margin:0 10px 5px;'><table id='queryTable' class='queryTable'><tbody>";
	for (var j=0;j<layerAttributues.length;j++){
		IdentfyText+="<tr><td><div class='record'id='record_"+j+"'><div style='overflow:hidden;' class='aQueryRes'>"
    	for(var i=0;i<layerAttributues[j].layerInfo.length;i++){
    		var markValue=layerAttributues[j].layerInfo[i].labelField;
    		$.each(layerAttributues[j].layerInfo[i].showIdentfyData,function(k,item){
    			if(layerAttributues[j].layerInfo[i].labelField == item.field_name){
    				markValue=item.field_value;
    				return false;
    			}
    		});
    		IdentfyText+="<i class='fa fa-map-marker  bigger-120' style='color:#ef300f;'></i><a class='aQueryMark' onclick='redirectInfo("+j+","+i+",\""+markValue+"\")'>"+markValue+"</a>"
    		IdentfyText+="</div><div class='showAtt'>"
			if(j==0){
				IdentfyText+="<a style='color:#00c;padding-left:5px;' class='info-show info-toggle' onclick='showAtt(this)'>\
								<i class='fa fa-eye-open  bigger-120' style='color:#1fdc14;'></i>\
								<span class='info' style='text-decoration:underline;'>隐藏详细信息<span>\
							</a>"
			}else{
				IdentfyText+="<a style='color:#00c;padding-left:5px;' class='infon-hide info-toggle' onclick='showAtt(this)'>\
								<i class='fa fa-eye-open  bigger-120' style='color:#1fdc14;'></i>\
								<span class='info' style='text-decoration:underline;'>显示详细信息<span>\
							</a>"
			}
			IdentfyText+='<a style="margin-left:10px;color:#00c;" onclick="toAddBookMark('+ j +','+ i +');">'+   
							'<i class="fa fa-star-empty bigger-130" style="color:#f1be21;"></i>'+
							'<span style="text-decoration:underline;">保存标注</span></a>'+
							'<a style="margin-left:10px;color:#00c;" onclick="exportShape('+ j +','+ i +');">'+   //exportShape(0)
							'<i class="fa fa-export  bigger-120" style="color:#1a7ed4;"></i>'+
							'<span style="text-decoration:underline;">导出图形</span></a></div>'+
							'<div style="padding-top:5px;" class="result-content">\
							<table id="div6_1" cellspacing="0" cellpadding="0" class="showTableCls"><tbody>';
			for(var k=0;k<layerAttributues[j].layerInfo[i].showIdentfyData.length;k++){
				 var field_value = layerAttributues[j].layerInfo[i].showIdentfyData[k].field_value;
				 if(!field_value)field_value = "";
				 IdentfyText+="<tr><td class='td1'>"+layerAttributues[j].layerInfo[i].showIdentfyData[k].field_name_cn+"</td><td class='td2'><span>"+ field_value +"</span></td></tr>"
			}
			IdentfyText+="</tbody></table></div>"
    	}	
	}
	IdentfyText+="</tr></td></div></tbody></table></div>"	
	document.getElementById("panel-body-content").innerHTML=IdentfyHtml+IdentfyText;
	//当数据大于10条显示分页
	if(layerAttributues.length>10){
		$(".paginationCss").show();
	}
	
}

//是否显示内容表格
function showAtt(that){
	if($(that).hasClass("info-show")){
		//全部的隐藏表格，信息改为显示
		$(".info-toggle").toggleClass("info-hide");
		$(".info-toggle").removeClass("info-show");
		$(".result-content").hide();		
		$(".info-toggle span").text("显示详细信息");
		//隐藏当前点击的
		$(that).parent('.showAtt').next().hide();
		$(that).find("span").text("显示详细信息");
	}else{		
		//全部的隐藏表格，信息改为显示
		$(".info-toggle").toggleClass("info-hide");
		$(".info-toggle").removeClass("info-show");
		$(".result-content").hide();		
		$(".info-toggle span").text("显示详细信息");
		//显示当前点击的
		$(that).toggleClass("info-show info-hide");
		$(that).parent('.showAtt').next().show();
		$(that).find("span").text("隐藏详细信息");		
	}	
}

//点击根据图层显示内容
function identfyClassify(that){
	var identfyDataArr=new Array();
	var thatId= $(that).attr("data_id");
	for(var i=0;i<identfyData.length;i++){
		if(identfyData[i].layerId==thatId){
			identfyDataArr.push(identfyData[i]);
		}
	}
	layerIdentfyText(identfyDataArr);
}

//点击显示全部结果
function showAllInfo(){
	layerIdentfyHtml (identfyData);
}

//点击内容title，弹出窗口图层字段信息
function redirectInfo(j,i,markValue){
	parent.identfyHighLightGraphic(markValue, _layerAttributues[j].layerInfo[i].showIdentfyData,_layerAttributues[j].layerInfo[i].geometry);
}

//保存标注
function addBookMark(j, i){//user_id, project_id,
	var bookMark = parent.mapObject.bookMark;
	var xmmc = _layerAttributues[j].layerInfo[i].showIdentfyData[2].field_value;//项目名称
	var jcdw = _layerAttributues[j].layerInfo[i].showIdentfyData[3].field_value;//建设单位
	var geometry = _layerAttributues[j].layerInfo[i].geometry;
	var geometryJson = null;
	var style = null;
	if(geometry.type == "point"){
		geometryJson = bookMark._geometryUtil.pointToWKT(geometry);
	}else if(geometry.type == "polyline"){
		geometryJson = bookMark._geometryUtil.lineToWKT(geometry);
	}else if(geometry.type == "polygon"){
		geometryJson = bookMark._geometryUtil.polygonToWKT(geometry);
		style = bookMark._Style.polygon;
	}
	
	var user_id = parent.userId;
	var project_id = parent.currentMapParam.id;
	bookMark.otherAddBookMark(null,xmmc, jcdw, user_id, project_id, geometryJson, style);
	parent.showMessage("保存标注成功",1);
}

//导出空间图形
function exportShape(m,n){
	//添加列名
	var fields = [];
	//图层
	var features = [];
	var index_=0;
	for(var key in identfyData){
		var item = identfyData[key];
		if(item !=null){
			var code = key;
			var graphicArr = item.layerInfo;
			if(graphicArr!=null && graphicArr.length>0){
				features = features.concat(graphicArr);
				for(var i = 0;i<graphicArr[0].showIdentfyData.length;i++){
					var attributes = graphicArr[0].showIdentfyData[i];
				}
				//封装属性
				if(index_ == 0){
					for(var att in attributes){
						var fieldObj = new Object();
						var length = att.replace(/[^\x00-\xff]/g, '__').length;
						if(length <=10){
							fieldObj.name = att;
							fieldObj.type = "esriFieldTypeString";
							if(att!="unique"){
								fieldObj.alias = "OBJECTID";
							}
							fieldObj.length = 50;
							fields.push(fieldObj);
						}
					}
				}
			}
		}
		index_ ++;
	}
	if(features.length==0){
		parent.showMessage("无空间信息！",2);
		return ;
	}
	var field=identfyData[m].layerInfo[n].labelField;
	var arr=identfyData[m].layerInfo[n].showIdentfyData
	var markName="";
	for(var k=0;k<arr.length;k++){
		if(arr[k].field_name == field){
			markName=arr[k].field_value;
			break;
		}
	}
	
	//导出文件参数
	var params = {
		fileName:identfyData[m].layerName+"-"+markName+"-"+new Date().getTime(),
		features: [identfyData[m].layerInfo[n]],//features,
		fields: fields,
		geometryType: "esriGeometryPolygon",
		f: "json"
	};
	var msgIndex = parent.layer.msg("正在导出，请稍后....",{time:0,offset: parent.layerInfoTop+"px"});//不会自动关闭
	//导出空间文件
	parent.SystemInfo.exportShape(params, parent.dojo.hitch(this,function(r){	
    	//关闭等待导出等待提示
		parent.layer.close(msgIndex);
    }),parent.dojo.hitch(this,function(r){
    	parent.showMessage(r, 2);
    }));
}

//打开地图标注popup
function toAddBookMark(j, i){
	var mapView = parent.getMapView();
	//关闭地图popup
	mapView.popup.close();
	//获取geometry和构造attributes
	var geometry = _layerAttributues[j].layerInfo[i].geometry;
	var field=_layerAttributues[j].layerInfo[i].labelField;
	var arr=_layerAttributues[j].layerInfo[i].showIdentfyData
	var markName="";
	for(var k=0;k<arr.length;k++){
		if(arr[k].field_name == field){
			markName=arr[k].field_value;
			break;
		}
	}
	var layerName = _layerAttributues[j].layerName+"-"+markName;
	var attributes = {bk_name:layerName};
	//构造graphic
	var graphic = parent.geometryToGraphic(geometry, attributes);
	//获取bookMark对象
	var bookMark = parent.mapObject.bookMark;
	graphic = bookMark._buildBookMarkPopup(graphic, layerName);
	
	if(!graphic){
		parent.showMessage("标注内容异常,定位失败!", 2);
		return;
	}
	//通过mapobject中bookMark对象的图形工具方法获取图形的中心点以及定位
	parent.mapObject.bookMark._geometryUtil.getGeometryCenterByURL(graphic.geometry, function(mapPoint){
		//设置投影
		mapPoint.spatialReference = mapView.spatialReference;
		//定位
		mapView.goTo({
			target: mapPoint,
			zoom: mapView.zoom
		},{
			animate: false
		});
		//打开popup
		mapView.popup.dockOptions = {
        	buttonEnabled: false
        };
		mapView.popup.open({
            title: graphic.popupTemplate.title,
            content: graphic.popupTemplate.content,
            location: mapPoint
        });
	});
	//获取地图标记对象
	parent._bookMarkObj = parent.mapObject.bookMark;
	
}

/**
 * 获取dojo对象
 * @returns
 */
function getDojo(){
	return parent.dojo;
}