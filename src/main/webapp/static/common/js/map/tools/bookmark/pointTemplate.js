/**
 * 点标注
 */

window.onload = function(){
	initIconList();
	document.getElementById('selectedImage').src = icon;
	$('#bk_name').val(bk_name);
	$('#bk_content').val(bk_content);
	$('#project_id').val(project_id);
	$('#user_id').val(userId);
	$('#id').val(id);
}

//初始化点样式列表
function initIconList(){
	var tempHtml = "<tr align='center'>";
	var iconList = ["red_A.png","red_B.png","red_C.png","red_D.png","red_E.png","red_F.png","red_G.png","red_H.png","blue_A.png","blue_B.png","blue_C.png","blue_D.png","blue_E.png","blue_F.png","blue_G.png","blue_H.png","flag.png","bomb.png","cake.png","cup.png","eye.png","house.png","car.png","catholictemple.png"];
	$.each(iconList, function(i,icon){
		if(i%8==0){
			tempHtml +="</tr>";
			tempHtml += "<tr align='center'>";
			tempHtml += "<td onmouseover='trOnMouseOver(this)' onmouseout='trOnMouseOut(this)'>";
			tempHtml += "<img style='cursor: pointer;'  width='23px'  height='23px'  src='static/map/images/location/"+ icon +"' onclick='selectImage(this.src)'/>";
			tempHtml += "</td>";
		}else{
			tempHtml += "<td onmouseover='trOnMouseOver(this)' onmouseout='trOnMouseOut(this)'>";
			tempHtml += "<img style='cursor: pointer;'  width='23px'  height='23px'  src='static/map/images/location/"+ icon +"' onclick='selectImage(this.src)'/>";
			tempHtml += "</td>";
		}
	});
	if(iconList.length%8==0){
		tempHtml +="<tr>";
	}
	tempHtml += "<tr>";
	tempHtml += "<td colspan='8'  align='right'>";
	tempHtml += "<a class='btn btn-purple btn-xs' onclick='showLabelChange()'>返回</a>";
	tempHtml += "</td>";
	tempHtml += "</tr>"; 
	$("#imageSelect").html(tempHtml);
}

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

//选择图片
function selectImage(src){
	document.getElementById('selectedImage').src = src;
	//返回标注表单
	showLabelChange();
	//更新graphic的symbol
	getMapWindow("mapDiv")._bookMarkObj.updatePointSymbol(src, id);
}

//图标经过样式
function trOnMouseOver(o){
	o.style.backgroundColor = '#87CEFF';
}

//图标移过样式
function trOnMouseOut(o){
    o.style.backgroundColor = '#ffffff';
}

//保存点标记信息
function savePointMarkInfo(){
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

//删除点标注
function deletePoint(){
	var confirmIndex = getMapWindow("mapDiv").layer.confirm('确定删除该标注？', {
		offset: '61px',
		btn: ['确定','关闭'] //按钮
	}, function(){
	  var bookMarkId = $("#id").val();
	  getMapWindow("mapDiv")._bookMarkObj.deleteMapGraphic(bookMarkId);
	  var bookMarkIframe = getMapWindow("mapDiv").document.getElementById('iframe_result_bookmark').contentWindow;
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