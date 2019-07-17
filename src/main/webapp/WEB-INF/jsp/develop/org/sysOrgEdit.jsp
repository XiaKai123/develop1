<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@include file="../../common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
    <base href="<%=basePath%>">
    <title>部门编辑</title>
    <%@include file="../../common/css.jsp"%>
    <style type="text/css">
        input,select{
            width:98% !important;
        }
    </style>
</head>
<body>
<form name="dataForm" id="dataForm" method="post">
    <table class="table table-striped table-bordered table-hover" style="margin:0px;">
        <input type="hidden" name="id" id="id" value="${sysOrg.id}"/>
        <tr>
            <td style="width:80px;text-align: right;">部门名称:<span class="required-hint">*</span></td>
            <td>
                <input type="text" class="form-control" id="name" name="name" value="${sysOrg.name}" placeholder="请输入部门名称">
            </td>
            <td style="width:80px;text-align: right;">部门编号:<span class="required-hint">*</span></td>
            <td>
                <input type="text" class="form-control" id="code" name="code" value="${sysOrg.code}" placeholder="请输入部门编号">
            </td>
        </tr>

        <tr>
            <td colspan="4" style="text-align: center;">
                <button type="button" class="btn btn-outline btn-primary btn-ms" onclick="save()">保存</button>&nbsp;
                <button type="button" class="btn btn-outline btn-danger btn-ms" onclick="closeLayer()">取消</button>
            </td>
        </tr>
    </table>
</form>

<%@ include file="../../common/edit.jsp" %>
<script src="static/develop/sysOrgEdit.js"></script>
</body>
</html>
