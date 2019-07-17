<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<script src="static/plugins/jquery/jquery.min.js"></script>
<script src="static/plugins/bootstrap/js/bootstrap.js"></script>

<!-- layer弹出窗口、laydate日期控件插件 -->
<script src="static/plugins/layer/layer.js"></script>
<script src="static/plugins/laydate/laydate.js"></script>

<!-- 填充表单js -->
<script src="static/common/js/formSet.js"></script>
<!-- 框架公用方法js -->
<script src="static/common/js/frame.js"></script>

<!-- zTree插件 -->
<script src="static/plugins/ztree3/js/jquery.ztree.core.js"></script>
<script src="static/plugins/ztree3/js/jquery.ztree.excheck.js"></script>
<script src="static/plugins/ztree3/js/jquery.ztree.exedit.js"></script>
<script src="static/plugins/ztree3/js/jquery.ztree.exhide.js"></script>
<!-- zTree检索js -->
<script src="static/plugins/ztree3/js/fuzzysearch.js"></script>

<script type="text/javascript">
    //获取正在打开的tab
    var getActiveTab = function() {
        return $("div[class='tab-pane active']").find("iframe")[0].contentWindow;
    }
    try {
        //获取当前选中的Tab
        var cw = parent.getActiveTab();

    } catch (e) {
        console.log(e)
    }
    //获取frame下标
    var layerIndex = parent.layer.getFrameIndex(window.name);
    //关闭窗口
    function closeLayer(){
        parent.layer.close(layerIndex);
    }
</script>