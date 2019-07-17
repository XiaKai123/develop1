/**
 * 地图工具标注功能js
 */
var bookMarkObj; //地图标注对象
$(function(){
	//加载标注列表
	initBookMarkList();
    getMapWindow("mapDiv").mapObject.initMapBookMark();//初始化地图标记工具
    bookMarkObj = getMapWindow("mapDiv").mapObject.bookMark;//获取地图标记对象
})

/**
 * 
 * @param color 背景颜色
 * @param drawType 动作类型
 * @param obj 当前点击对象
 */
function bookMark(color,drawType,obj){
	var colorArr=['#69aa46','#337ab7','#fd9d37','#52d8ef','#f96868'];
	$(".scope-list").removeClass("active");
	$(obj).addClass("active")
	//开启地图标注
	getMapWindow("mapDiv").mapBookMarkDraw(drawType);
}

//工具返回点击前样式
function recoverClickBeforeStyle(node, color){
	$("#"+node).attr("style","background-color:#fff").find("i").css("color",color);
}

//页面加载完成设置iframe的宽高
document.onreadystatechange = subSomething;//当页面加载状态改变的时候执行这个方法. 
function subSomething() {
		if (document.readyState == "complete") {//当页面加载状态 为完成 
			self.parent.$("#iframe_result_bookmark").removeClass("iframe-hide");
		}
}

//初始化标记列表   
function initBookMarkList(){
	var user_id = getMapWindow("mapDiv").userId;
	var project_id = getMapWindow("mapDiv").mapProject.currentMapParam.id;
	var keywords = "";//预留做列表搜索
	$.ajax({
		type: "post",
		url: rootPath+"rest/MapBookMark/listBookMark"+"?token="+localStorage.token,
		data: {"userId":user_id, "projectId":project_id, "keywords": keywords},
		dataType: "json",
		success: function(resp){
			//初始化列表数据
			if(resp.success){
                var bklist;
                if(Object.prototype.toString.call(resp.data) === '[object String]'){
                    bklist=JSON.parse(resp.data);
                }else{
                    bklist=resp.data;
                }

				bklist = bklist.filter(function (bk) {
					// 注意：IE9以下的版本没有trim()方法
					if($.trim(bk.geometry_text) == "" || $.trim(bk.geometry_text).length <10){
						return false;
					}else{
						return true;
					}
				});
                initPagination(bklist,10,buildBookMarkList);
			}else{
				;
			}
			
		},
		error: function(data){
			console.log("列表初始化失败！");
		}
	});
}   

/**
 * 构建标记列表
 * @param bookMarkList 标记列表记录
 */
function buildBookMarkList(bookMarkList) {
	if(bookMarkList && bookMarkList.length>0){
		$("#bookMarkRecord").empty();
		var bookMarkHtml = "";
		var geometryTypeIcon = "";
		$.each(bookMarkList, function(i, bookmark) {
			//将wkt字符串拼成几何对象
			var geometry = getMapWindow("mapDiv").mapObject.bookMark._geometryUtil.wktToGeometry(JSON.stringify(bookmark.geometry_text));
			if(!geometry){
				return true;
			}
			if(geometry.type == "point"){
				geometryTypeIcon = "iconset0391";
			}else if(geometry.type == "polyline"){
				geometryTypeIcon = "zhexiantu";
			}else if(geometry.type == "polygon"){
				geometryTypeIcon = "mianji";
			}
			
			bookMarkHtml += "<tr onclick='locationBookMark(\""+ bookmark.id +"\")' id="+ bookmark.id +">";
			bookMarkHtml += "<td class='padding-bottom padding-top' width='10%'>&nbsp";
			bookMarkHtml += "<i class='icon iconfont icon-"+ geometryTypeIcon +"' aria-hidden='true' style='width:23px;height:25px';></i>";
			bookMarkHtml += "</td>";
			/*bookMarkHtml += "<td width='60%' style='color:#666666;font-size:13px;padding-left:15px' align='left' class='padding-top'>名称:<span name='bk_name'>"+ bookmark.bk_name +"<span><br/>内容:<span name='bk_content'>"+ bookmark.bk_content +"</span></td>";
			bookMarkHtml += "<td class='padding-bottom padding-top' width='30%'>";*/
			bookMarkHtml += "<td width='70%' style='color:#666666;font-size:13px;padding-left:15px' align='left' class='padding-top'>名称:"+ bookmark.bk_name +"<br/>备注:"+ bookmark.bk_content +"</td>";
			bookMarkHtml += "<td class='padding-bottom padding-top' width='20%' align='center'>";
			bookMarkHtml += "<button type='button' style='padding:4px 1px 4px 3px;' class='btn btn-icon btn-success btn-xs btn-outline' onclick='exportShape(\""+ bookmark.id +"\")' data-toggle='tooltip' data-placement='bottom' title='导出'>";
			bookMarkHtml += "<i class='fa fa-sign-out bigger-120' aria-hidden='true'></i>";
			bookMarkHtml += "</button>";
			/*bookMarkHtml += "<button type='button' class='btn btn-icon btn-primary btn-xs btn-outline' title='' onclick='locationBookMark(\""+ bookmark.id +"\")' data-toggle='tooltip' data-placement='bottom' data-original-title='编辑'>";
			bookMarkHtml += "<i class='fa fa-pencil' aria-hidden='true'></i>";
			bookMarkHtml += "</button>";*/
			bookMarkHtml += "<button type='button' class='btn btn-icon btn-danger btn-xs btn-outline' onclick='deleteBookMark(\""+ bookmark.id +"\")' data-toggle='tooltip' data-placement='bottom' title='删除'>";
			bookMarkHtml += "<i class='fa fa-trash-o' aria-hidden='true'></i>";
			bookMarkHtml += "</button>";
			bookMarkHtml += "</td></tr>";
		});
	}else{//为空
		$("#bookMarkRecord").empty().append("<span style='margin-left:35%;'>暂无标注记录</span>");
	}
	$("#bookMarkRecord").html(bookMarkHtml);
	//subSomething();
	bookMarkObj.initAllBookMarkData(bookMarkList);
}

//标记是否显示
$("#make-show").click(function(){
	var isCheck = $(this).is(":checked")
	getMapWindow("mapDiv")._bookMarkObj.bookMarkIsShow(isCheck);
});

//定位标注
function locationBookMark(id){
	getMapWindow("mapDiv")._bookMarkObj.locationBookMark(id);
}

//删除
function deleteBookMark(id){
	var confirmIndex =
        getTopWindow().layer.confirm('确定删除该标注？', {
		offset: '61px',
		btn: ['确定','关闭'] //按钮
	}, function(){
			getMapWindow("mapDiv")._bookMarkObj.deleteMapGraphic(id);
	  //刷新
	 // refreshBookMarkList();
	  getTopWindow().layer.close(confirmIndex);
	}, function(){
	  
	});
}

//导出标注shap
function exportShape(id){
	if(event.stopPropagation()){
	    event.stopPropagation();//阻止事件冒泡
		getMapWindow("mapDiv")._bookMarkObj.exportShape(id);
    }else{
        window.event.cancelBubble = true;//ie 阻止事件冒泡
		getMapWindow("mapDiv")._bookMarkObj.exportShape(id);
    }
}

function getHexBackgroundColor(obj) {
    var rgb = $(obj).css('background-color');
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {return ("0" + parseInt(x).toString(16)).slice(-2);}
    return rgb= "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

/**
 * 刷新BookMarkList
 */
function refreshBookMarkList(){
	var t = window.setTimeout(getDojo().hitch(this,function(){
        window.clearTimeout(t);
        
        var user_id = getMapWindow("mapDiv").userId;
        var project_id = getMapWindow("mapDiv").mapProject.currentMapParam.id;
        var keywords = "";//预留做列表搜索
        $.ajax({
        	type: "post",
        	url: rootPath+"rest/MapBookMark/listBookMark"+"?token="+localStorage.token,
    		data: {"userId":user_id, "projectId":project_id, "keywords": keywords},
        	async: false,
        	dataType: "json",
        	success: function(resp){
        		var data;
        		if(resp.success){
        			return;
        		}else{
        			data=resp.data;
        		}
        		//初始化列表数据
        		var bookMarkList = data;
        		initPagination(bookMarkList, 10 , function(resData){
        			if(resData && resData.length>0){
        				$("#bookMarkRecord").empty();
        				var bookMarkHtml = "";
        				var geometryTypeIcon = "";
        				$.each(resData, function(i, bookmark) {
        					//将wkt字符串拼成几何对象
        					if($.trim(bookmark.geometry_text) == ""){
        						return true;
        					}
        					if(Object.prototype.toString.call(bookmark.geometry_text) === "[object Object]"){
        						bookMark.geometry_text=JSON.stringify(bookMark.geometry_text);
        				 	}
        					var geometry = getMapWindow("mapDiv").mapObject.bookMark._geometryUtil.wktToGeometry(bookmark.geometry_text);
        					if(geometry.type == "point"){
        						geometryTypeIcon = "iconset0391";
        					}else if(geometry.type == "polyline"){
        						geometryTypeIcon = "zhexiantu";
        					}else if(geometry.type == "polygon"){
        						geometryTypeIcon = "mianji";
        					}
        					
        					bookMarkHtml += "<tr onclick='locationBookMark(\""+ bookmark.id +"\")' id="+ bookmark.id +">";
        					bookMarkHtml += "<td class='padding-bottom padding-top' width='10%'>&nbsp";
        					bookMarkHtml += "<i class='icon iconfont icon-"+ geometryTypeIcon +"' aria-hidden='true' style='width:23px;height:25px';></i>";
        					bookMarkHtml += "</td>";
        					/*bookMarkHtml += "<td width='60%' style='color:#666666;font-size:13px;padding-left:15px' align='left' class='padding-top'>名称:<span name='bk_name'>"+ bookmark.bk_name +"<span><br/>内容:<span name='bk_content'>"+ bookmark.bk_content +"</span></td>";
						bookMarkHtml += "<td class='padding-bottom padding-top' width='30%'>";*/
        					bookMarkHtml += "<td width='70%' style='color:#666666;font-size:13px;padding-left:15px' align='left' class='padding-top'>名称:"+ bookmark.bk_name +"<br/>内容:"+ bookmark.bk_content +"</td>";
        					bookMarkHtml += "<td class='padding-bottom padding-top' width='20%' align='center'>";
        					bookMarkHtml += "<button type='button' style='padding:4px 1px 4px 3px;' class='btn btn-icon btn-success btn-xs btn-outline' onclick='exportShape(\""+ bookmark.id +"\")' data-toggle='tooltip' data-placement='bottom' title='导出'>";
        					
        					bookMarkHtml += "<i class='fa fa-sign-out bigger-120' aria-hidden='true'></i>";
        					bookMarkHtml += "</button>";
        					/*bookMarkHtml += "<button type='button' class='btn btn-icon btn-primary btn-xs btn-outline' title='' onclick='locationBookMark(\""+ bookmark.id +"\")' data-toggle='tooltip' data-placement='bottom' data-original-title='编辑'>";
						bookMarkHtml += "<i class='fa fa-pencil' aria-hidden='true'></i>";
						bookMarkHtml += "</button>";*/
        					bookMarkHtml += "<button type='button' class='btn btn-icon btn-danger btn-xs btn-outline' onclick='deleteBookMark(\""+ bookmark.id +"\")' data-toggle='tooltip' data-placement='bottom' title='删除'>";
        					bookMarkHtml += "<i class='fa fa-trash-o' aria-hidden='true'></i>";
        					bookMarkHtml += "</button>";
        					bookMarkHtml += "</td></tr>";
        				});
        			}else{//为空
        				$("#bookMarkRecord").empty().append("<span style='margin-left:35%;'>暂无标注记录</span>");
        			}
        			$("#bookMarkRecord").html(bookMarkHtml);
        		});
        	},
        	error: function(data){
        		console.log("列表初始化失败！");
        	}
        });
    }),500);
	
}

/**
 * 获取dojo
 * @returns
 */
function getDojo(){
	return getMapWindow("mapDiv").dojo;
}