/**
 * @描述：部门管理js
 * @作者：郑坚侠
 * @时间：2019/2/16 17:10
 */

$(function(){
    // 加载用户列表
    loadUserList();
});
var orgUserZtree = null, checkTreeNode = null;
var $table = $("#dataTable");
// 加载用户列表
function loadUserList(){
    $table.dataTable(
        $.extend(true,{},CONSTANT.DATA_TABLES.DEFAULT_OPTION,CONSTANT.DATA_TABLES.SDOM,{
            ajax : function(data, callback, settings) {
                //封装请求参数
                var param = paramManage.getQueryCondition(data);
                $.ajax({
                    type: "POST",
                    url: rootPath + "SysOrg/listByEntity",
                    cache : false,  //禁用缓存
                    data: param,    //传入已封装的参数
                    dataType: "json",
                    success: function(result) {
                        if(!result.success){
                            showMessage("加载部门列表数据失败！", 2);
                            return;
                        }

                        //封装返回数据
                        var returnData = {};
                        returnData.draw = data.draw;//这里直接自行返回了draw计数器,应该由后台返回
                        returnData.recordsTotal = result.data.total;//总记录数
                        returnData.recordsFiltered = result.data.total;//后台不实现过滤功能，每次查询均视作全部结果
                        returnData.data = result.data.pageData;
                        //调用DataTables提供的callback方法，代表数据已封装完成并传回DataTables进行渲染
                        //此时的数据需确保正确无误，异常判断应在执行此回调前自行处理完毕
                        callback(returnData);
                        //调用tooltip
                        setTimeout(function(){
                            $("[data-toggle='tooltip']").tooltip();
                        },500)
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        showMessage("加载用户列表数据失败！", 2);
                    }
                });
            },
            columnDefs:[{
                orderable:false,//禁用排序
                targets:[0,1,2,3],//指定的列
            }],
            //绑定数据
            columns: [
                {// 复选框单元格
                    title:"<div class='checkbox-custom checkbox-primary'><input type='checkbox' id='checkbox_id_all'/><label style='padding-left:0px;'></label></div>",
                    data : "id",
                    class: "text-center",
                    width: "3%",
                    render: function(data, type, row, meta) {
                        var checkbox = '<div class="checkbox-custom checkbox-primary"><input type="checkbox" name="eachRowCheckbox" value="'+data+'"/><label style="padding-left:0px;"></label></div>';
                        return checkbox;
                    }
                },
                {
                    title:"序号",
                    data : null,
                    width:"5%",
                    class: "text-center",
                    render: function(data, type, row, meta) {
                        // 显示行号
                        var startIndex = meta.settings._iDisplayStart;
                        return startIndex + meta.row + 1;
                    }
                },
                { title:"部门名称",data: "name",defaultContent:"",width:"15%"},
                { title:"编码",data: "code",defaultContent:"",width:"15%"},
                {
                    title:"操作",
                    data : 'operate',
                    bSortable : false,
                    class: "text-center",
                    visible: true,
                    width:"10%",
                    render: function(data, type, row) {
                        var id = row.id;
                        var result = '<button type="button" class="btn btn-icon btn-primary btn-xs btn-outline" title="编辑" data-toggle="tooltip" data-placement="bottom" onclick="toEdit(\''+ id +'\')"><i class="fa fa-pencil" aria-hidden="true"></i></button>\
                            <button type="button" class="btn btn-icon btn-danger btn-xs btn-outline" title="删除" data-toggle="tooltip" data-placement="bottom" onclick="del(\''+ id +'\')"><i class="fa fa-pencil" aria-hidden="true"></i></button>';
                        return result;
                    }
                }
            ]
        })
    ).api();//此处需调用api()方法,否则返回的是JQuery对象而不是DataTables的API对象


    // 全选/全不选
    $('#checkbox_id_all').click(function(){
        $("input[name='eachRowCheckbox']").prop("checked",this.checked);
    });
}
// 用户列表请求参数
var paramManage = {
    getQueryCondition : function(data) {
        var param = {};
        // 关键字检索
        param.name = $("#name").val().trim();
        //组装分页参数
        param.currentIndex = data.start;
        param.showCount = data.length;
        param.sEcho = data.draw;
        return param;
    }
};
// 列表刷新
function refreshTable(){
    // 还原"全选"复选框状态
    $("#checkbox_id_all").attr("checked",false);
    // 刷新列表
    $table.DataTable().ajax.reload();
}

// 新增部门
function toAdd(){
    //var orgId = (checkTreeNode && checkTreeNode.iconSkin == "icon_org") ? checkTreeNode.id : "";
    var url = rootPath + "SysOrg/toAdd";
    openLayerWindow("新增部门", url, ["800px", "380px"], "10%");
}

// 编辑部门
function toEdit(id){
    var url = rootPath + "SysOrg/toEdit?id=" + id;
    openLayerWindow("编辑部门", url, ["800px", "380px"], "10%");
}

// 删除
function del(id){
    if(!id){
        id = "";
        // 获取复选框选中数组
        var checkRows = $("input[name='eachRowCheckbox']:checked");
        for(var i = 0; i < checkRows.length; i++){
            id += checkRows[i].value + ",";
        }
    }
    if(!id){
        showMessage("请选择要删除的记录！", 8);
        return;
    }

    //询问
    parent.layer.confirm('确认删除吗？', {
        offset: ['30%'],
        btn: ['确定','取消'] //按钮
    }, function(){
        $.ajax({
            type: "post",
            url: rootPath + "SysOrg/delete",
            data: {"id":id},
            dataType: "json",
            cache : false,  //禁用缓存
            success: function(result){
                if(result.success){
                    showMessage("删除成功！",1);
                    // 刷新列表
                    refreshTable();
                }else{
                    showMessage("删除失败！",2);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                showMessage("删除失败！",2);
            }
        })
    }, function(){
    });
}
