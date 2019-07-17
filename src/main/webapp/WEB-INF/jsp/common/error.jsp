<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="taglibs.jsp"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<html>
<head>
	<meta charset="UTF-8">
	<title>错误页面</title>

	<%@ include file="css.jsp"%>
	<style type="text/css">
		.error_main{
			width:130px;
			height:200px;
			display:block;
			float: left;
			<%--background:url(${ctx}/custom/image/error_bg2.png) no-repeat;--%>
			background-position:-100px -100px;
			font-size:40px;
		}
		.infoMessge{
			float: left;
			font-size:30px;
			padding-top:20px;
			color: rgb(144,144,144)
		}
	</style>
</head>
<body style="background-color: white">
	<div>
		<div id="wSysErrorSummary" style="float: left"><div class="error_main"></div><div class="infoMessge">${result.message}</div></div>
		<textarea id="wSysErrorDetail" style="display:none;width:100%;height:100%;">
		${result.detailMsg}
		</textarea>
	</div>

	<%@ include file="list.jsp"%>
</body>
</html>