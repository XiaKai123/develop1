<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@include file="../../common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
    <base href="<%=basePath%>">
    <title>部门管理</title>
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
                        <h4 style="padding-left:10px;">部门管理</h4>
                        <div style="padding-left:10px;">
                            <table style="margin-bottom: 5px;">
                                <tr>
                                    <td>
                                        <div class="input-group">
                                            <input type="text" class="form-control" name="name" id="name" placeholder="检索..."  style="height:29px;" autocomplete="off">
                                            <span class="input-group-btn">
                                                <button class="btn btn-primary btn-xs" onclick="refreshTable()" style="padding:5px 10px;"><i class="icon wb-search" aria-hidden="true"></i></button>
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button type="button" id="addBtn" onclick="toAdd()" class="btn btn-outline btn-success btn-ms">新增</button>
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
    <script type="text/javascript" src="static/develop/sysOrgList.js"></script>
</body>
</html>
