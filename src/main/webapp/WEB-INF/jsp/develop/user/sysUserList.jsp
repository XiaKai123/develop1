<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@include file="../../common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
    <base href="<%=basePath%>">
    <title>用户管理</title>
    <%@include file="../../common/css.jsp"%>
    <style type="text/css">
        .row>div {
            padding:0px;
        }
        h4 {
            border-bottom: 1px solid #d0d6da;
            padding-bottom: 10px;
            margin: 0px 0px 10px 0px;
        }
    </style>
</head>
<body>
    <div class="custom-container">
        <div class="custom-content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-xs-9">
                        <h4 style="padding-left:10px;">用户管理</h4>
                        <div style="padding-left:10px;">
                            <table style="margin-bottom: 5px;">
                                <tr>
                                    <td>
                                        <!-- 用户id、机构id，用于点击机构树节点，检索用户列表 -->
                                        <input type="hidden" id="userId" name="userId"/>
<%--
                                        <input type="hidden" id="orgIds" name="orgIds"/>
--%>
                                        <div class="input-group">
                                            <input type="text" class="form-control" name="name" id="name" placeholder="检索..."  style="height:29px;" autocomplete="off">
                                            <span class="input-group-btn">
                                                <button class="btn btn-primary btn-xs" onclick="refreshTable()" style="padding:5px 10px;"><i class="icon wb-search" aria-hidden="true"></i></button>
                                            </span>
                                        </div>
                                    </td>
                                    <td style="padding:0px 6px;">
                                        <select id="status" class="form-control" onchange="refreshTable()" style="height:29px;padding:0px 15px;">
                                            <option value="">状态</option>
                                            <option value="1">启用</option>
                                            <option value="0">注销</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button type="button" id="addBtn" onclick="toAdd()" class="btn btn-outline btn-success btn-ms">新增</button>
                                    </td>
                                    <td style="padding-left: 1px;">
                                        &nbsp;<button type="button" id="logoutBtn" onclick="updateStatus(null, 0)" class="btn btn-outline btn-danger btn-ms">注销</button>
                                    </td>
                                    <td style="padding-left: 1px;">
                                        &nbsp;<button type="button" id="restoreBtn" onclick="updateStatus(null, 1)" class="btn btn-outline btn-primary btn-ms">恢复注销</button>
                                    </td>
                                    <td>
                                        <div class="checkbox-custom checkbox-primary" style="margin: 3px 0px 0px 15px;"><input type="checkbox" name="cascade" id="cascade" checked="checked" onchange="refreshTable()"/><label style="padding-left:4px;">级联显示</label></div>
                                    </td>
                                </tr>
                            </table>
                            <div style="height:calc(100% - 80px);overflow:auto;">
                                <table class="table table-striped table-bordered table-hover" id="dataTable"></table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <%@include file="../../common/list.jsp"%>
    <script type="text/javascript" src="static/develop/sysUserList.js"></script>
</body>
</html>
