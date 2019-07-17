/**
 * @描述：用户编辑js
 * @作者：彭辉
 * @时间：2019/2/20 17:39
 */
$(function(){
    // 初始化日期控件(出生日期)
    laydate.render({
        elem: '#bornTime'
    });
});


// 校验登录名是否存在
function hasLoginName(){
    if(!$("#loginName").val().trim()){
        return false;
    }

    var isExists = false;
    $.ajax({
        type: "post",
        url: rootPath + "SysUser/hasLoginName",
        data: {"id":$("#id").val(), "loginName":$("#loginName").val().trim()},
        dataType: "json",
        async: false,
        success: function (result) {
            if(result.success){
                if(result.data){
                    isExists = true;

                    layer.tips("该登录名已存在", "#loginName", {
                        tips: [3, '#78BA32']
                    });
                    $("#loginName").select();
                    $("#loginName").focus();
                }
            }else{
                showMessage("校验登录名失败！", 2);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            showMessage("校验登录名失败！", 2);
        }
    });
    return isExists;
}

// 表单校验
function formValidation() {
 /*   if (!$("#orgIds").val().trim()) {
        layer.tips("请选择所属机构", "#orgNames", {
            tips: [3, '#78BA32']
        });
        return false;
    } else */if (!$("#loginName").val()) {
        layer.tips("请输入登录名", "#loginName", {
            tips: [3, '#78BA32']
        });
        $("#loginName").focus();
        return false;
    } else if (hasLoginName()) {
        // 校验登录名是否存在
        return false;
    } else if (!$("#password").val().trim()) {
        layer.tips("请输入密码", "#password", {
            tips: [3, '#78BA32']
        });
        $("#password").focus();
        return false;
    } else if (!$("#name").val().trim()) {
        layer.tips("请输入姓名", "#name", {
            tips: [3, '#78BA32']
        });
        $("#name").focus();
        return false;
    } else if (!$("#position").val().trim()) {
        layer.tips("请选择岗位", "#position", {
            tips: [3, '#78BA32']
        });
        return false;
    }
    return true;
}

// 保存
function save(){
    // 表单校验
    if(!formValidation()){
        return;
    }

    // 根据id判断新增或修改
    var operator = "保存";
    var url = rootPath + "SysUser/save";
    if($("#id").val()){
        operator = "修改";
        url = rootPath + "SysUser/update";
    }

    var formData = $("#dataForm").serialize() + "&token=" + localStorage.getItem("token");
    $.ajax({
        type: "post",
        url: url,
        data: formData,
        dataType: "json",
        success: function (result) {
            if(result.success){
                showMessage(operator + "成功！", 1);
                // 刷新列表
                cw.refreshTable();
                // 关闭弹出窗口
                closeLayer();
            }else{
                showMessage(operator + "失败！", 2);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            showMessage(operator + "失败！", 2);
        }
    });
}