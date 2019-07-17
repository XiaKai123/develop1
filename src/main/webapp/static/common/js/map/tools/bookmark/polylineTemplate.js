//更换图标
function showImageChange(){
	document.getElementById('layerTable').style.display = 'none';
	document.getElementById('imageSelect').style.display = 'block';
}
//返回表单
function showLabelChange(){
	document.getElementById('layerTable').style.display = 'block';
	document.getElementById('imageSelect').style.display = 'none';
}
//设置线段颜色
function savePolylineStyle(){
	var strokeColor = document.getElementById('strokeColor').value;
	var strokeWeight = document.getElementById('strokeWeight').value;
	var fillOpacity	= document.getElementById('fillOpacity').value;
	var strokeDashstyle = document.getElementById('strokeDashstyle').value;
	var strokeStartarrow = "none";
	var strokeEndarrow 	="none";
	//返回标注表单
	//showLabelChange();
	//更新graphic的symbol
	getMapWindow("mapDiv")._bookMarkObj.updatePolylineSymbol(strokeColor, strokeWeight, fillOpacity, strokeDashstyle, strokeStartarrow, strokeEndarrow, id);
}

window.onload = function(){
	//document.getElementById('selectedImage').src = icon;
	$('#bk_name').val(bk_name);
	$('#bk_content').val(bk_content);
	$('#project_id').val(project_id);
	$('#user_id').val(userId);
	$('#id').val(id);
	
	$('#strokeDashstyle').val(strokeDashstyle);
	//$("#fillOpacity").attr("value", strokeOpacity);
	$("#fillOpacity").val(strokeOpacity);
	$('#strokeWeight').val(strokeWeight);
	$('#strokeColor').val(strokeColor);
	$("#strokeColor").css("background-color",strokeColor);
}

//选择图片
function selectImage(src){
	document.getElementById('selectedImage').src = src;
	//返回标注表单
	showLabelChange();
	//更新graphic的symbol
	getMapWindow("mapDiv")._bookMarkObj.updatePointSymbol(src, id);
}

//保存线标记信息
function savePolylineMarkInfo(){
	//表单校验
	if($("#bk_name").val()==""){
		layer.tips('请输入名称', '#bk_name', {
			tips:[3, '#78BA32']
		});
		$("#bk_name").focus();
	    return false;
	}
	if($("#bk_content").val()==""){
		layer.tips('请输入备注', '#bk_content', {
			tips:[3, '#78BA32']
		});
		$("#bk_content").focus();
	    return false;
	}
	
	//获取标注信息
	$("#user_id").val(getMapWindow("mapDiv").userId);
	$("#project_id").val(getMapWindow("mapDiv").mapProject.currentMapParam.id);
	var id = $("#id").val();
	var bk_name = $("#bk_name").val();
	var bk_content = $("#bk_content").val();
	getMapWindow("mapDiv")._bookMarkObj.saveCurrentFeature(id, bk_name, bk_content,
		getMapWindow("mapDiv").userId, getMapWindow("mapDiv").mapProject.currentMapParam.id);
}

//删除线标注
function deletePolyline(){
	var confirmIndex = getMapWindow("mapDiv").layer.confirm('确定删除该标注？', {
		offset: '61px',
		btn: ['确定','关闭'] //按钮
	}, function(){
	  var bookMarkId = $("#id").val();
	  //删除列表
	  //$("#"+bookMarkId).remove();
		getMapWindow("mapDiv")._bookMarkObj.deleteMapGraphic(bookMarkId);
	  var bookMarkIframe = getMapWindow("mapDiv").document.getElementById('iframe_result_bookmark').contentWindow;
	  //重新计算标注列表高度
	  //bookMarkIframe.subSomething();
	  //刷新标注列表
	  bookMarkIframe.refreshBookMarkList();
	  //消息提醒
		getMapWindow("mapDiv").showMessage("标注删除成功!", 1);
		getMapWindow("mapDiv").layer.close(confirmIndex);
	}, function(){
	  
	});
}

/**
 * 获取dojo
 * @returns
 */
function getDojo(){
	return getMapWindow("mapDiv").dojo;
}

// 获取地图对象所在的div
function getMapWindow(mapDiv){
	var win=null;
	try{
		if(document.getElementById(mapDiv)){
			win=window;
		}else if(window.parent.document.getElementById(mapDiv)){
			win=parent.window;
		}else if(window.parent.parent.document.getElementById(mapDiv)){
			win=parent.parent.window;
		}else if(window.parent.parent.parent.document.getElementById(mapDiv)){
			win=parent.parent.parent.window;
		}else if(window.parent.parent.parent.parent.document.getElementById(mapDiv)){
			win=parent.parent.parent.parent.window;
		}
	}catch(e){
		console.warn(e);
	}
	return win;
}