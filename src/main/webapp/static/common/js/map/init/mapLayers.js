/**
 * 专题图层
 */
var _projectAllArray = new Array(), //专题所有数组
    _initLayerArray = new Array(),  //默认显示数组
    _currentNodeObj = null, //图层树当前节点
    currentProjectLayerId = null;// 图层树当前操作图层id
$(function(){
    loadProejctTree();
})

function loadProejctTree(){
    //延迟加载,等待mapProject数据初始化完成
    var timer = window.setInterval(function(){
        if(parent.mapProject.loadReady){
            window.clearInterval(timer);
            initJrange(); //初始化透明度滑动条
            loadProjectDir();
        }
    },300);
}

function initJrange() {
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
        var layerObj = parent.mapObject._myMap.findLayerById(currentProjectLayerId);
        if(layerObj){
            layerObj.opacity = e.currentTarget.value;
        }
    });
    $("#legend-content .slider-container").css("margin-top",-11);
}

/*构造专题图层列表*/
function loadProjectDir(){
    _projectAllArray = parent.mapProject.projectAllArray;
    _initLayerArray = parent.mapProject.initLayerArray;
    //设置弹出框标题
    parent.$(".now-location-nav").html('<span class="one-menu-nav">专题图层</span>');
    //分屏显示关闭专题图层按钮
    if(!parent.multiScreenPower){
        $("#layerdir_close").show();
    }
    //图层树高度
    // $("#projectDirIframeDiv").attr("style","overflow-y:auto;height:"+projectDirIframeDivHeight+"px");
    $("#projectDirIframeDiv").attr("style","overflow-y:auto;height:calc(100% - 60px)");
    //清空列表
    $("#projectDirTable tbody").empty();
    $("#projectTitle").html(parent.mapProject.currentMapParam.project_name);

    var dirHtml = "";//专题图层列表html
    if(_projectAllArray && _projectAllArray.length>0){
        for(var i=0;i<_projectAllArray.length;i++){
            var dirObj = _projectAllArray[i];
            var isMapLengen = '';
            //判断当前是目录还是图层
            if(dirObj.dir_type == 1){
                isMapLengen = 'text_overflow_dir';
            }else{
                isMapLengen = 'text_overflow_lengen';
            }
            dirHtml += "<tr>";
            dirHtml += "<td class='text_overflow' style='vertical-align:middle;padding: 9px 8px 3px 8px;'><div class='"+isMapLengen+"'>";
            if(dirObj.children && dirObj.children.length > 0){//判断是否有子专题目录/图层 来决定添加展开节点图标
                dirHtml += "<i class='icon wb-plus blue' onclick='nodeClick(this,\""+dirObj.id+"\")' style='cursor:pointer;'></i>&nbsp;";
            }else{
                dirHtml += "<i style='margin-left:19px;'></i>&nbsp;";
            }
            dirHtml += "<div class='checkbox-custom checkbox-primary' id='check_node_"+ dirObj.id +"' name='check_dir_"+ dirObj.id +"' style='display: inline-block;margin: 0px 5px 0px 2px;'>" +
                "<input type='checkbox' id='"+ dirObj.id +"' onchange='changeProjectDirNode(this,\""+dirObj.id+"\")' value='"+dirObj.id+"'/><label style='padding-left:0px;'></label></div>";

            if(dirObj.dir_type == 1){//判断是目录还是图层(1：目录，2：图层，3：组合图层)
                dirHtml += "<i class='icon wb-folder orange'></i>&nbsp;";
            }else{
                dirHtml += "<i class='fa fa-file-text blue'></i>&nbsp;";
                dirHtml += "<i class='lengen-opacity' onclick='openOpacityTools(this, \""+dirObj.id+"\")'></i>";
            }
            dirHtml += "<span title='"+dirObj.dir_name+"'>"+dirObj.dir_name+"</span></div></td>";

            //追加子节点
            dirHtml += setChildrenNodes(dirObj.children,dirObj.id,dirObj.parent_id,0) + "</tr>";
        }

        //专题图层列表
        if(_projectAllArray.length==0){
            dirHtml = "<tr><td class='text-center'>没有相关数据！</td></tr>";
        }
        $("#projectDirTable tbody").html(dirHtml);

        //默认显示图层
        for(var i = 0; i < _initLayerArray.length; i++){
            changeProjectDirNode(null,_initLayerArray[i].id);
        }
    }else{
        dirHtml = "<tr><td class='text-center'>没有相关数据！</td></tr>";
        $("#projectDirTable tbody").html(dirHtml);
    }

}

//根据上级专题/目录获取子菜单(children:子专题目录/图层，dirId：专题目录ID，parentId：父专题ID，leftWidth:子专题节点距离左边距,体现出层级关系)
function setChildrenNodes(children,dirId,parentId,leftWidth){
    var childrenHtml = "";//数据结果集
    if(!children){
        return childrenHtml;
    }
    for(var i=0;i<children.length;i++){
        var dirObj = children[i];
        var isMapLengen = '';
        //判断当前是目录还是图层
        if(dirObj.dir_type == 1){
            isMapLengen = 'text_overflow_dir';
        }else{
            isMapLengen = 'text_overflow_lengen';
        }
        childrenHtml += "<tr class='hide parent"+dirId+"'>";
        childrenHtml += "<td class='text_overflow' style='vertical-align: middle;padding: 9px 8px 5px 8px;'><div class='"+isMapLengen+"'><span style='padding-left:"+leftWidth+"px;'></span><img src='static/plugins/assets/images/join.png'/>";
        if(dirObj.children && dirObj.children.length > 0){//判断是否有专题目录/图层来决定添加展开节点图标
            childrenHtml += "<i id='node_"+dirObj.id+"' class='icon wb-plus blue' onclick='nodeClick(this,\""+dirObj.id+"\")' style='cursor:pointer;margin-left:5px;'></i>&nbsp";
        }else{
            childrenHtml += "<i style='margin-left:19px;'></i>&nbsp;";
        }
        var cheboxHtml = "<input type='checkbox' name='checkbox_dir' id='"+ dirObj.id +"' onchange='changeProjectDirNode(this,\""+dirObj.id+"\")' value='"+ dirObj.id +"' />";
        childrenHtml += "<div class='checkbox-custom checkbox-default' id='check_node_"+ dirObj.id +"' name='check_dir_"+ dirObj.id +"' style='display: inline-block;margin: 0px 5px 0px 0px;'>"+ cheboxHtml +"<label style='padding-left:0px;'></label></div>";

        if(dirObj.dir_type == 1){//判断是目录还是图层(1：目录，2：图层，3：组合图层)
            childrenHtml += "<i class='icon wb-folder orange'></i>&nbsp;";
        }else{
            childrenHtml += "<i class='fa fa-file-text blue'></i>&nbsp;";
            childrenHtml += "<i class='lengen-opacity' onclick='openOpacityTools(this, \""+dirObj.id+"\")'></i>";
        }

        childrenHtml +="<span title="+dirObj.dir_name+">"+dirObj.dir_name+"</span></div></td>";
        childrenHtml += setChildrenNodes(dirObj.children,dirObj.id,dirId,leftWidth+23) + "</tr>";
    }
    return childrenHtml;
}

//展开、折叠菜单
function nodeClick(obj,dirId){
    if($(obj).hasClass("icon wb-plus blue")){
        $(obj).removeClass("icon wb-plus blue").addClass("icon wb-minus blue");
        $("#projectDirTable .parent"+dirId ).removeClass("hide");
    }else if($(obj).hasClass("icon wb-minus blue")){
        $(obj).removeClass("icon wb-minus blue").addClass("icon wb-plus blue");
        //当前节点折叠时，同时把该节点下的所有子节点折叠
        recursiveHideProjectDir(_projectAllArray,dirId);
    }
}

//递归隐藏子节点
function recursiveHideProjectDir(projectArray,dirId){
    try{
        resultObj = null;//每次递归时，重新复制为null
        recursiveProjectByDirId(projectArray,dirId);//递归根据dirId获取专题对象
        if($("#node_"+dirId).hasClass("icon wb-minus blue")){
            $("#node_"+dirId).removeClass("icon wb-minus blue").addClass("icon wb-plus blue");
        }
        $("#projectDirTable .parent"+dirId).addClass("hide");
        if(resultObj && resultObj.children && resultObj.children.length > 0){
            for(var i = 0;i < resultObj.children.length; i++){
                recursiveHideProjectDir(resultObj.children,resultObj.id);
            }
        }else{
            for(var i = 0;i < projectArray.length; i++){
                if(projectArray[i].children && projectArray[i].children.length > 0){
                    recursiveHideProjectDir(projectArray[i].children,projectArray[i].id);
                }
            }
        }
    }catch(e){
    }
}

var resultObj = null;//递归获取当前节点
//递归根据dirId获取专题对象
function recursiveProjectByDirId(projectArray,dirId){
    if(projectArray && projectArray.length>0){
        //获取当前节点对象
        for(var i = 0;i < projectArray.length; i++){
            var dirObj = projectArray[i];
            if(dirObj.id == dirId){
                resultObj = dirObj;
                break;
            }
        }
        if(!resultObj){
            for(var j= 0 ;j<projectArray.length; j++){
                recursiveProjectByDirId(projectArray[j].children,dirId);
            }
        }
    }
}

//递归根据dirId获取图层对象
function recursiveProjectsByDirId(projectDirArray,dirId){
    if(!_currentNodeObj && projectDirArray && projectDirArray.length > 0){
        //获取当前节点对象
        for(var i = 0;i < projectDirArray.length; i++){
            var dirObj = projectDirArray[i];
            if(dirObj.id == dirId){
                _currentNodeObj = dirObj;
                break;
            }else if(_currentNodeObj){
                break;
            }
        }
        if(!_currentNodeObj){
            for(var j = 0 ;j < projectDirArray.length; j++){
                recursiveProjectsByDirId(projectDirArray[j].children,dirId);
            }
        }
    }
}

//图层复选框事件
function changeProjectDirNode(obj,dirId){
    //初始化当前节点为空(用于递归查询)
    _currentNodeObj = null;
    //根据图层dirId获取节点对象
    recursiveProjectsByDirId(_projectAllArray,dirId);
    //获取同步叠加图层按钮开关
    var multiScreenAddLayerFlag = parent.multiScreenAddLayerPower;

    if(_currentNodeObj){
        //同步叠加分屏图层
        if(multiScreenAddLayerFlag){
            var currentNodeCheckFlag = document.getElementById(_currentNodeObj.id).checked;
            parent.multiScreenAddLayer(currentNodeCheckFlag, _currentNodeObj);
        }
        //获取当前节点复选框选中状态
        var currentChecked = null;
        if(obj==null && _currentNodeObj){
            currentChecked = true;
            document.getElementById(_currentNodeObj.id).checked=true;
        }else{
            currentChecked = document.getElementById(_currentNodeObj.id).checked;
        }
        var currentObj = document.getElementById("check_node_"+_currentNodeObj.id);
        //var currentCheckboxCss = "checkbox-default";

        //设置当前节点复选框样式
        if(currentChecked){
            $(currentObj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-primary");
        }else{
            $(currentObj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-default");
        }
        if(_currentNodeObj.dir_type != 1){
            if(currentChecked == true){
                $("#"+_currentNodeObj.id).parent().parent().find(".lengen-opacity").show();
            }else{
                $("#"+_currentNodeObj.id).parent().parent().find(".lengen-opacity").hide();
                $(".map-lengen-index").hide();
            }
            //加载图层
            parent.loadLayer(currentChecked, _currentNodeObj);
            //加载图层图例, 变量multiScreenPower 只在分屏js中有定义
            if(parent.multiScreenPower) {
                parent.loadLayerLegend(currentChecked, _currentNodeObj);
            }
        }
        //递归设置当前节点下复选框的选中状态
        recursiveChangeCheckBox(_currentNodeObj.children,currentChecked);

        //获取当前节点的父节点parent_id
        var parent_id = _currentNodeObj.parent_id;
        //递归设置父节点复选框是否选中状态
        recursiveChangeParentCheckBox(parent_id,currentChecked);
    }
}

//递归设置子节点复选框是否选中状态
function recursiveChangeCheckBox(childNodeArray,checked){
    if(!childNodeArray) return;
    for(var i = 0; i < childNodeArray.length; i++){
        var currentObj = document.getElementById(childNodeArray[i].id);
        currentObj.checked = checked;
        if(checked){
            $(currentObj.parentElement).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-primary");
        }else{
            $(currentObj.parentElement).removeClass("checkbox-primary").removeClass("checkbox-default").addClass("checkbox-default");
        }
        if(childNodeArray[i].dir_type != 1){
            if(checked == true){
                $("#"+childNodeArray[i].id).parent().parent().find(".lengen-opacity").show();
            }else{
                $("#"+childNodeArray[i].id).parent().parent().find(".lengen-opacity").hide();
                $(".map-lengen-index").hide();
            }
            //加载图层
            parent.loadLayer(checked, childNodeArray[i]);
            //加载图层图例, 主屏分屏根据自身变量multiScreenPower决定是否加载图例(1:关闭多屏,0:开启多屏)
            if(parent.multiScreenPower) {
                parent.loadLayerLegend(checked, childNodeArray[i]);
            }
        }

        var children = childNodeArray[i].children;
        if(!children) continue;
        if(children.length > 0){
            recursiveChangeCheckBox(children,checked);
        }
    }
}

//递归设置父节点复选框是否选中状态
function recursiveChangeParentCheckBox(parent_id,currentChecked){
    if(parent_id){
        //初始化当前节点为空(用于递归查询)
        _currentNodeObj = null;
        //获取当前节点的父节点对象
        recursiveProjectsByDirId(_projectAllArray,parent_id);
        if(_currentNodeObj){
            //根据当前节点复选框的选中状态设置父节点的选中状态
            var currentNodeChecked = false;
            for(var i = 0; i < _currentNodeObj.children.length; i++){
                var currentObj = document.getElementById(_currentNodeObj.children[i].id);
                if(currentObj.checked){
                    currentNodeChecked = true;
                    break;
                }
            }

            //循环判断子节点是否全选样式
            var currentCheckboxCss = "checkbox-primary";
            for(var i = 0; i < _currentNodeObj.children.length; i++){
                var currentObj = document.getElementById(_currentNodeObj.children[i].id);
                if(!currentChecked){
                    currentCheckboxCss = "checkbox-default";
                    break;
                }else if(!$(currentObj.parentElement).hasClass("checkbox-primary")){
                    currentCheckboxCss = "checkbox-default";
                    break;
                }
            }

            //设置当前节点选中状态
            var obj = document.getElementById("check_node_"+_currentNodeObj.id);
            if(!currentNodeChecked){
                document.getElementById(_currentNodeObj.id).checked = false;
            }else{
                document.getElementById(_currentNodeObj.id).checked = true;
            }

            //设置当前节点复选框样式
            $(obj).removeClass("checkbox-primary").removeClass("checkbox-default").addClass(currentCheckboxCss);
            //递归设置上级节点复选框状态、样式
            recursiveChangeParentCheckBox(_currentNodeObj.parent_id,currentChecked);
        }
    }
}

//关闭专题图层面板
function closeProjectDirPanl(){
    parent.$(".open-menu-list").removeClass("active");
    $('#projectDirDiv', window.parent.document).toggleClass("fade in");
    $(".projectDirDiv-arrow", window.parent.document).toggleClass("arrow");
    $(".wb-list").removeClass("active");
}

$("#linkageBtn").click(function(){
    var flag = $(this).is(":checked");
    if(flag){
        parent.multiScreenAddLayerPower=1;
    }else{
        parent.multiScreenAddLayerPower=0;
    }
});

//阻止事件冒泡
function propagation(){
    if(event.stopPropagation()){
        event.stopPropagation();//阻止事件冒泡
    }else{
        window.event.cancelBubble = true;//ie 阻止事件冒泡
    }
}
//点击其他地方时关闭图层透明度、层级调节框
$(document).bind('click', function () {
    if($(event.target)[0].className != "map-lengen-index" && $(event.target).parents(".map-lengen-index").length == 0){
        $(".map-lengen-index").hide();
    }
});

//点击图层右边操作按钮，弹出图层透明度层级调节框
function openOpacityTools(that, layerId){
    // 阻止事件冒泡
    propagation();
    // 赋值当前专题图层id
    currentProjectLayerId = layerId;

    //获取图层树滚动出去的高度
    var DirScrollTop = $("#projectDirIframeDiv").scrollTop();
    //获取当前点击的源于相对位置
    var offsetY = $(that).offset().top - $('#projectDirIframeDiv').offset().top;
    var offsetX = $(that).offset().left - 166;
    $(".map-lengen-index").css({"display":"block","left":(offsetX)+"px","top":(offsetY-86+DirScrollTop)+"px"});

    // 根据图层id获取当前图层对象
    var layerObj = null;
    if(parent.multiScreenPower == 0){// 多屏下
        layerObj = parent.multiMapInit._myMap.findLayerById(currentProjectLayerId);
    }else{
        layerObj = parent.mapObject._myMap.findLayerById(currentProjectLayerId);
    }
    if(layerObj){
        // 赋值专题图层透明度
        var layerAlpha = layerObj.opacity;
        $('.range-slider').jRange('setValue', layerAlpha + "");
        $("#layerAlpha").attr("data-value",layerAlpha);
        $(".rangeUi-tip").text(layerAlpha);
        $(".rangeUi-pointer").css("left", layerAlpha*100+"%");
        $(".rangeUi-selected").css("width", layerAlpha*100+"%");
    }
}

//显示下拉专题列表
function showLegendList(){
    if($("#hideLegendUL").css("display") == "none"){
        $("#hideLegendUL").show();
    }else{
        $("#hideLegendUL").hide();
    }
}

// 图层上移、下移、置顶、置底
function moveProjectLayer(type) {
    // 获取所有图层数组
    var allLayers = null;
    if(parent.multiScreenPower == 0){// 多屏下
        allLayers = parent.multiMapInit._myMap.allLayers.items;
    }else{
        allLayers = parent.mapObject._myMap.allLayers.items;
    }
    // layerObj：当前图层对象、layerIndex：当前图层对象索引
    var layerObj = null, layerIndex = null;
    for(var i = 0; i < allLayers.length; i++){
        if(allLayers[i].id == currentProjectLayerId){
            layerIndex = i;
            layerObj = allLayers[i];
            break;
        }
    }
    if(!layerObj){
        return;
    }

    // 获取图层显示层级数值
    if(type == "up"){
        layerIndex = layerIndex < allLayers.length-1 ? layerIndex+1 : allLayers.length-1;
    }else if(type == "down"){
        layerIndex = layerIndex >= 1 ? layerIndex-1 : 0;
    }else if(type == "top"){
        layerIndex = allLayers.length-1;
    }else{
        layerIndex = 0;
    }

    // 设置图层层级
    if(parent.multiScreenPower == 0){// 多屏下
        parent.multiMapInit._myMap.reorder(layerObj, layerIndex);
    }else{
        parent.mapObject._myMap.reorder(layerObj, layerIndex);
    }
}