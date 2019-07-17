<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@include file="../../common/taglibs.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
    <base href="<%=basePath%>">
    <title>用户编辑</title>
    <%@include file="../../common/css.jsp"%>
    <style type="text/css">
        input,select{
            width:98% !important;
        }
    </style>
</head>
<body>
<form name="dataForm" id="dataForm" method="post">
    <!-- 主键ID、应用系统appCode -->
    <input type="hidden" name="id" id="id" value="${sysUser.id}"/>
    <input type="hidden" name="appCode" id="appCode" value="${sysUser.appCode}"/>
    <table class="table table-striped table-bordered table-hover" style="margin:0px;">
        <tr>
            <td style="width:115px;text-align: right;">所属部门:<span class="required-hint">*</span></td>
            <td>

<%--
                    <input type="hidden" name="orgIds" id="orgIds" value="${sysUser.orgIds}"/>
--%>
                <select class="form-control" id="orgIds" name="orgIds">
                    <c:forEach items="${sysOrgList}" var="org">
                        <option value="${org.id}">${org.name}</option>
                    </c:forEach>
                </select>
            </td>
            <td style="width:115px;text-align: right;">状态:<span class="required-hint">*</span></td>
            <td>
                <div class="radio-custom radio-primary" style="float:left;">
                    <input type="radio" name="status" checked="checked" value="1" <c:if test="${sysUser.status == '1'}">checked="checked"</c:if>/>
                    <label style="width:70px;">启用</label>
                </div>
                <div class="radio-custom radio-primary">
                    <input type="radio" name="status" value="0" <c:if test="${sysUser.status == '0'}">checked="checked"</c:if>/>
                    <label>注销</label>
                </div>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">登录名:<span class="required-hint">*</span></td>
            <td>
                <input type="text" class="form-control" id="loginName" name="loginName" value="${sysUser.loginName}" placeholder="请输入登录名" maxlength="50" onblur="hasLoginName()" <c:if test="${sysUser.id != null && sysUser.id != ''}">readonly</c:if>/>
            </td>
            <td style="width:80px;text-align: right;">密码:<span class="required-hint">*</span></td>
            <td>
                <input type="password" class="form-control" id="password" name="password" value="${sysUser.password}" placeholder="请输入密码" maxlength="50" <c:if test="${sysUser.id != null && sysUser.id != ''}">readonly</c:if>/>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">姓名:<span class="required-hint">*</span></td>
            <td>
                <input type="text" class="form-control" id="name" name="name" value="${sysUser.name}" placeholder="请输入姓名" maxlength="50"/>
            </td>
            <td style="width:80px;text-align: right;">岗位:<span class="required-hint">*</span></td>
           <td>
                <select class="form-control" id="position" name="position">

                    <option value=""></option>
                    <option value="1">1</option>
                    <option value="2">2d</option>
                    <option value="3">3</option>

                   <%-- <c:forEach items="${positionList}" var="pst">
                        <option value="${pst.code}" <c:if test="${pst.code == sysUser.position}">selected</c:if>>${pst.text}</option>
                    </c:forEach>--%>
                </select>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">联系方式:<span class="required-hint"></span></td>
            <td>
                <input type="text" class="form-control" id="tel" name="tel" value="${sysUser.tel}" placeholder="请输入联系方式" maxlength="50"/>
            </td>
            <td style="width:80px;text-align: right;">性别:<span class="required-hint"></span></td>
            <td>
                <select class="form-control" id="sex" name="sex">
                    <option value=""></option>
                    <option value="1" <c:if test="${sysUser.sex == 1}">selected</c:if>>男</option>
                    <option value="0" <c:if test="${sysUser.sex == 0}">selected</c:if>>女</option>
                </select>
            </td>
        </tr>
        <tr>
           <%-- <td style="width:80px;text-align: right;">出生日期:<span class="required-hint"></span></td>
            <td>
                <input type="text" class="form-control" id="bornTime" name="bornTime" value="<fmt:formatDate value="${sysUser.bornTime}" pattern="yyyy-MM-dd"/>" />
            </td>--%>
           <td style="width:80px;text-align: right;">电子邮箱:<span class="required-hint"></span></td>
           <td>
               <input type="text" class="form-control" id="email" name="email" value="${sysUser.email}" placeholder="请输入电子邮箱" maxlength="50"/>
           </td>
            <td style="width:80px;text-align: right;">教育程度:<span class="required-hint"></span></td>
            <td>
                <select id="education" name="education" class="form-control">
                    <option value=""></option>
                    <option value="0">小学</option>
                    <option value="1">初中</option>
                    <option value="2">高中</option>
                    <option value="3">大专</option>
                    <option value="4">本科</option>
                    <option value="4">本科以上</option>
                </select>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">证件类型:<span class="required-hint"></span></td>
            <td>
                <select id="cardType" name="cardType" class="form-control">
                    <option value=""></option>
                    <option value="0">身份证</option>
                    <option value="1">居住证</option>
                    <option value="2">军人证</option>
                    <option value="4">护照</option>
                    <option value="6">港澳通行证</option>
                </select>
            </td>
            <td style="width:80px;text-align: right;">身份证号:<span class="required-hint"></span></td>
            <td>
                <input type="text" class="form-control" id="idcard" name="idcard" value="${sysUser.idcard}" placeholder="请输入身份证号" maxlength="20"/>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">民族:<span class="required-hint"></span></td>
            <td>
                <input type="text" class="form-control" id="nation" name="nation" value="${sysUser.nation}" placeholder="请输入民族" maxlength="50"/>
            </td>
            <td style="width:80px;text-align: right;">政治面貌:<span class="required-hint"></span></td>
            <td>
                <input type="text" class="form-control" id="politic" name="politic" value="${sysUser.politic}" placeholder="请输入政治面貌" maxlength="50"/>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">地址:<span class="required-hint"></span></td>
            <td colspan="3">
                <input type="text" class="form-control" id="address" name="address" value="${sysUser.address}" placeholder="请输入地址" maxlength="255" style="width: 99.2% !important;"/>
            </td>
        </tr>
        <tr>
            <td style="width:80px;text-align: right;">备注:<span class="required-hint"></span></td>
            <td colspan="3">
                <textarea rows="5" id="remark" name="remark" class="form-control" style="width:99.2%;">${sysUser.remark}</textarea>
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

<!-- 机构树 -->
<div id="orgTreeDiv" style="position:absolute;top:50px;left:124px;height:260px;width:262px;overflow:auto;background: #fff;border: 1px solid #b5b1b1;display:none;">
    <ul id="orgTree" class="ztree"></ul>
</div>

<%@ include file="../../common/edit.jsp" %>
<script src="static/develop/sysUserEdit.js"></script>
</body>
</html>
