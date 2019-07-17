// 清空浏览器自动记录之前输入的值
$("form").attr("autocomplete", "off");

// 打开窗体(title：标题，offset：上边距，erea：宽高，url：访问地址，id：id标识)
function openLayerWindow(title, url, area, offset, id, isMax){
    // 处理offset为空
    if(!offset){
        offset = "20%";
    }
    // 给访问地址添加token身份校验
    if(url.indexOf("?") != -1){
        url += "&token=" + localStorage.getItem("token");
    }else{
        url += "?token=" + localStorage.getItem("token");
    }
    // 处理是否最大化参数值
    if(!isMax){
        isMax = false;
    }else{
        isMax = true;
    }
    top.layer.open({
        id: id,
        title :title,
        type: 2,
        offset: offset,
        area: area,
        fixed: false,
        resize: false,
        maxmin: isMax,
        content: url
    });
}

// 显示提示信息 1-成功,2-失败,8-提示
function showMessage(message, icon){
    top.layer.msg(message, {time:2000,icon: icon,offset: '61px'});
}

// 显示加载信息
function openLoadMsg(message, time){
    if(!time){
        // 默认加载提示不自动关闭
        time = 0;
    }
    top.layer.msg(message, {time:time, offset:"40%"});
}

// 关闭加载信息
function closeLoadMsg(layerIndex){
    top.layer.close(layerIndex);
};

// 设置ajax提交参数token
$.ajaxSetup({
    timeout:900000,
    data:{
        "token":localStorage.getItem("token") == null ? "" : localStorage.getItem("token")
    }
});