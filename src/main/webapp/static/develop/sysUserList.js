/**
 * @描述：用户管理js
 * @作者：彭辉
 * @时间：2019/2/16 17:10
 */
// orgUserZtree：机构树对象,  树选中节点对象
var orgUserZtree = null, checkTreeNode = null;

$(function(){
    // 加载用户列表
    loadUserList();
});

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
                    url: rootPath + "SysUser/listByEntity",
                    cache : false,  //禁用缓存
                    data: param,    //传入已封装的参数
                    dataType: "json",
                    success: function(result) {
                        if(!result.success){
                            showMessage("加载用户列表数据失败！", 2);
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
                targets:[0,1,2,3,4,5],//指定的列
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
                { title:"姓名",data: "name",defaultContent:"",width:"15%"},
                { title:"登录名",data: "loginName",defaultContent:"",width:"15%"},
                {
                    title: "所属机构", data: "orgNames", defaultContent: "", width: "30%", class: "text-overflow",
                    render: function (data, type, row, meta) {
                        return "<span title='" + data + "'>" + data + "</span>";
                    }
                },
                {
                    title: "状态", data: "status", defaultContent: "", width: "8%", class: "text-center",
                    render: function (data, type, row, meta) {
                        if(data == 1){
                            return '<button type="button" class="btn btn-success btn-xs"><span>启用</span></button>';
                        }else{
                            return '<button type="button" class="btn btn-danger btn-xs"><span>注销</span></button>';
                        }
                    }
                },
                {
                    title:"操作",
                    data : 'operate',
                    bSortable : false,
                    class: "text-center",
                    visible: true,
                    width:"10%",
                    render: function(data, type, row) {
                        var id = row.id;
                        var result = '<button type="button" class="btn btn-icon btn-warning btn-xs btn-outline" title="修改密码" data-toggle="tooltip" data-placement="bottom" onclick="toEditPwd(\''+ id +'\')" style="padding:4px 6px;"><i class="fa fa-lock" aria-hidden="true"></i></button>\
                            <button type="button" class="btn btn-icon btn-primary btn-xs btn-outline" title="编辑" data-toggle="tooltip" data-placement="bottom" onclick="toEdit(\''+ id +'\')"><i class="fa fa-pencil" aria-hidden="true"></i></button>';
                        if(row.status == 1){
                            result += '&nbsp;<button type="button" class="btn btn-icon btn-danger btn-xs btn-outline" title="注销" data-toggle="tooltip" data-placement="bottom"  onclick="updateStatus(\''+ id +'\', 0)"><i class="fa fa-power-off" aria-hidden="true"></i></button>';
                        }else{
                            result += '&nbsp;<button type="button" class="btn btn-icon btn-success btn-xs btn-outline" title="恢复注销" data-toggle="tooltip" data-placement="bottom"  onclick="updateStatus(\''+ id +'\', 1)"><i class="fa fa-play" aria-hidden="true"></i></button>';
                        }
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
        param.status = $("#status").val() ? $("#status").val() : "1";
        param.orgIds = $("#orgIds").val();
        param.id = $("#userId").val();
        param.cascade = $("#cascade").is(":checked");
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

// 新增用户
function toAdd(){
    // 获取当前机构id，如果不是则为空
    var orgId = (checkTreeNode && checkTreeNode.iconSkin == "icon_org") ? checkTreeNode.id : "";

    var url = rootPath + "SysUser/toAdd?orgIds=" + orgId;
    openLayerWindow("新增用户", url, ["800px", "680px"], "10%");
}

// 编辑用户
function toEdit(id){
    var url = rootPath + "SysUser/toEdit?id=" + id;
    openLayerWindow("编辑用户", url, ["800px", "680px"], "10%");
}

// 修改密码
function toEditPwd(id){
    var url = rootPath + "SysUser/toEditPwd?id=" + id;
    openLayerWindow("修改密码", url, ["500px", "265px"]);
}

// 修改状态(启用、注销)
function updateStatus(id, status){
    var tipMsg = status == 1 ? "恢复注销" : "注销";

    if(!id){
        var checkbos = $("input[name='eachRowCheckbox']:checked");
        if(checkbos.length == 0){
            showMessage("请勾选要"+tipMsg+"的用户！", 8);
            return;
        }
        for(var i = 0; i < checkbos.length; i++){
            id = (id ? id + "," + checkbos[i].value : checkbos[i].value);
        }
    }

    parent.layer.confirm("确认"+tipMsg+"吗？", {
        offset: ["30%"],
        btn: ["确定","取消"]
    }, function(){
        $.ajax({
            type: "post",
            url: rootPath + "SysUser/updateStatus",
            data: {"id":id, "status":status},
            dataType: "json",
            success: function (result) {
                if(result.success){
                    // 刷新列表
                    refreshTable();
                    // 刷新机构用户树
                    loadOrgUserTree();
                    showMessage(tipMsg + "成功！", 1);
                }else{
                    showMessage(tipMsg + "失败！", 2);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                showMessage(tipMsg + "失败！", 2);
            }
        });
    }, function(){}
    );
}