<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
	<title>主题风格</title>
	<style>
		#theme_style {
			position: absolute;
			right: -43px;
			top: 35px;
			z-index: 9999999;
			width: 130px;
		}
		.icon-tabshouqi {
			display: none;
			position: absolute;
			font-size: 20px;
			color: #fff;
			top: -24px;
			left: 53px;
		}
		.change-style {
			display: none;
			width: 100%;
			padding: 10px 5px;
			background-color: #fff;
			-moz-border-radius: 8px;
			-webkit-border-radius: 8px;
			border-radius: 8px;
			box-shadow: 0px 5px 32px 0px rgba(81, 79, 79, 0.21);
		}
		.change-style li {
			position: relative;
			width: 100%;
			height: 32px;
			line-height: 32px;
			margin: 0;
			padding: 0;
			color: #666;
			transition: color .3s;
			text-align: center;
			border-radius: 6px;
		}
		.change-style li:hover {
			top: -2px;
			box-shadow: 0 4px 16px rgba(79, 79, 79, 0.1);
			color: #0daaf6;
		}
	</style>
	<script type="text/javascript">  
	    var rootPath = '<%=basePath%>';  
	</script>
</head>
<body>
	<div id="theme_style">
		<i class="iconfont icon-tabshouqi"></i>
		<ul class="change-style">
			<li class="change-user-info" onclick="editUserInfo()">修改登录密码</li>
			<%--<li class="dark-style">炫黑高雅主题</li>
			<li class="white-style">简约时尚主题</li>
			<li class="blue-style">浅蓝经典主题</li>
			<li class="dark-blue-style">深蓝经典主题</li>--%>
		</ul>
	</div>
</body>

<script type="text/javascript">
	function editUserInfo() {
		layer.open({
	  		type: 2,
	  		offset: ['20%'],
	  		title :"修改密码",
	  		area: ["480px", "270px"],
	  		fixed: false, //不固定
	  		resize: false, //禁止拉伸
	  		maxmin: false,
	  		content: rootPath + "SysUser/toEditPwd?id=${param.userId}&token=" + localStorage.getItem("token")
		});
	}
</script>
</html>
