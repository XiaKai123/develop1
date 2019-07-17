/**
 * @描述：用户编辑js
 * @作者：郑坚侠
 * @时间：2019/2/20 17:39
 */
$(function(){
    // 初始化日期控件(出生日期)
    laydate.render({
        elem: '#bornTime'
    });
});

function formValidation() {
    if (!$("#name").val()) {
        layer.tips("请输入部门名称", "#name", {
            tips: [3, '#78BA32']
        });
        $("#name").focus();
        return false;
    }else if (!$("#code").val()) {
        layer.tips("请输入部门编号", "#code", {
            tips: [3, '#2717aa']
        });
        $("#code").focus();
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
    var url = rootPath + "SysOrg/save";
    if($("#id").val()){
        operator = "修改";
        url = rootPath + "SysOrg/update";
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
                // 关闭弹出窗口
                closeLayer();
                // 刷新列表
                parent.refreshTable();
            }else{
                showMessage(operator + "失败！", 2);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            showMessage(operator + "失败！", 2);
        }
    });
}
