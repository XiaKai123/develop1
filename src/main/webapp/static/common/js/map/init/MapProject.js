/**
 * 专题数据操作处理类!用于初始化专题、获取专题及图层数据
 */
var MapProject = function(userId, currentMapParam) {
	this.projectList = new Array(); //当前用户所有专题
	this.currentMapParam = currentMapParam; //当前专题参数信息
	this.projectAllArray = new Array(); //当前专题所有图层数组
	this.initLayerArray = new Array();  //当前专题地图初始化图层
	this.visibleMapLayers = new Array();//当前地图已叠加的图层
	this.dtyxObj = new Array();      //当前专题底图及影像图层
	this.userId = userId;//当前用户ID，通过参数传递获得
	this.loadReady = false; //专题数据加载完成标识
}

MapProject.prototype.startup=function(){
	this.refreshProject();
};

MapProject.prototype.refreshProject=function(){
	this.initProjectData();
};

/**
 * 初始化专题数据
 */
MapProject.prototype.initProjectData=function(){
	//通过用户ID,调用后台REST服务获取用户专题数据
	SystemInfo.getProjectListByUserId(this.userId,dojo.hitch(this,function(projectList){
		if(!projectList || projectList.length == 0){
			showMessage("该用户暂无专题数据!", 8);
			return;
		}else{
			this.projectList = projectList;
			if(this.currentMapParam == null){  //第一次加载时默认加载第一个专题
				this.currentMapParam = projectList[0];
			}
			if($(".projectDirChange-div").length > 0){
				this.loadProjectList(this.projectList); //加载专题列表
			}
			this.getProjectAllArray(this.currentMapParam.id, userId); //获取当前专题所有图层数据
		}
	}));
};

/**
 * 加载专题列表
 * @param projectList 专题列表
 */
MapProject.prototype.loadProjectList = function(projectList){
	var projectListHtml="";
	//专题列表初始化
	$.each(projectList, function(index,projectObj){
		var projectJson = JSON.stringify(projectObj);
		projectListHtml += "<li class='city-planning' style='cursor:pointer;' onclick='switchProject("+ projectJson +")'>" +
			"<i class='"+ projectObj.project_icon +"'></i>" +
			"<p>"+ projectObj.project_name +"</p></li>";
	});
	$(".projectDirChange-div").html(projectListHtml);

	//鼠标移入弹出专题切换
	$("#zjditu_global_change").mouseover(function(){
		$("#zjditu_global_change").addClass("active");
		$("#projectDirChange").addClass("fade");
		$(".fa-sort-desc").hide();
		$(".fa-sort-asc").show();
		$(".wb-chat-working").toggleClass("active");
		//隐藏检索下拉列表
		$(".search-box").hide();
	})

	//鼠标移除关闭专题切换
	$("#zjditu_global_change").mouseout(function(){
		$("#zjditu_global_change").removeClass("active");
		$("#projectDirChange").removeClass("fade");
		$(".fa-sort-desc").show();
		$(".fa-sort-asc").hide();
		$(".wb-chat-working").toggleClass("active");
		//隐藏检索下拉列表
		$(".search-box").hide();
	})
}

/**
 * 根据project_id、user_id获取专题图层树
 * @param project_id 专题ID
 * @param user_id 用户ID
 */
MapProject.prototype.getProjectAllArray=function(project_id,userId){
	if(project_id == null){
		return;
	}
	//调用后台REST服务获取专题下所有图层信息
	SystemInfo.getProjectDirTree(project_id,userId,dojo.hitch(this,function(allLayers){
		if(allLayers && allLayers.length > 0){
			//加载当前专题图层树
			this.projectAllArray = allLayers;
			//对所有图层进行初始化分类
			this.recursionBottomLayer(allLayers);
			this.loadReady = true;
			//叠加地图及默认显示图层
			this.loadVisibleLayers();
		}else{
			showMessage("获取专题图层数据异常！", 2);
		}
	}))
}

/**
 * @描述：递归查找底图/影像图/默认显示专题图层
 * @param layerArray 专题所有图层
 **/
MapProject.prototype.recursionBottomLayer = function(layerArray){
	if(layerArray && layerArray.length > 0){
		for(var i = 0; i < layerArray.length; i++){
			if(layerArray[i].pd && layerArray[i].pd.layer_type == "layer_type_yxt"){//影像图
				this.dtyxObj.push({
					layer_type:"layer_type_yxt",
					layerObj:layerArray[i]
				});
			}else if(layerArray[i].pd && layerArray[i].pd.layer_type == "layer_type_dt"){//图层类型layer_type=6为底图
				this.initLayerArray.unshift(layerArray[i]);//将底图放到数组开头，最先加载
				this.dtyxObj.push({
					layer_type:"layer_type_dt",
					layerObj:layerArray[i]
				});
			}else if(layerArray[i].dir_type == 2 && layerArray[i].is_show == 1){//渲染属性is_show=1默认显示图层
				this.initLayerArray.push(layerArray[i]);
				this.visibleMapLayers.push(layerArray[i]);
			}
			this.recursionBottomLayer(layerArray[i].children);
		}
	}
}

/**
 * @描述：加载默认显示图层
 **/
MapProject.prototype.loadVisibleLayers = function(){
	//判断有无加载图层树,没有图层树则加载专题默认图层
	var layerTreeIframe = $("#one-menu-container iframe");
	if(layerTreeIframe.length > 0 && layerTreeIframe[0].contentWindow && layerTreeIframe[0].contentWindow.$("#projectDirIframeDiv").length > 0){
		console.log("重新加载专题图层树");
		layerTreeIframe[0].contentWindow.loadProejctTree();
	}else{
		mapObject.setMapOptions(this.currentMapParam);
		for (var i=0;i<this.initLayerArray.length;i++){
			loadLayer(true, this.initLayerArray[i]);
		}
	}
}

/**
 * 切换专题
 * @param projectObj 专题对象
 */
function switchProject(projectObj) {
	$("#mapDiv").empty();
	$(".mapLegend-list").empty();
	mapInit(projectObj);

	//专题图层切换后关闭
	hideLeftIframeContainerAnim();
	clickChange();
	//关闭标注
	//clearMap('bookmark');
	//关闭多屏
	quitMoreScreen();
}

//点击专题关闭专题切换
function clickChange(){
	$("#zjditu_global_change").removeClass("active");
	$("#projectDirChange").removeClass("fade");
	$(".fa-sort-desc").show();
	$(".fa-sort-asc").hide();
	$(".wb-chat-working").toggleClass("active");
}
