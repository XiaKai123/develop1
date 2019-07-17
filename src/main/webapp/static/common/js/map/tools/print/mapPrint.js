/**
* @描述：地图工具打印功能js
* @作者：邹艺
* @日期：2019/4/19 9:58
**/
$(function(){
    if($("#printMap").length > 0) {
        $("#printMap").unbind("click").click(function () {
            printMap();
        });
    }

})

function printMap(){
    if (window.screen) {
        var fulls = '';
        var ah = screen.availHeight - 30;
        var aw = screen.availWidth - 10;
        fulls += ",height=" + ah;
        fulls += ",innerHeight=" + ah;
        fulls += ",width=" + aw;
        fulls += ",innerWidth=" + aw;
        fulls += ",menubar=yes";
        fulls += ",resizable";
    } else {
        fulls += ",resizable"; // 对于不支持screen属性的浏览器，可以手工进行最大化。 manually
    }
    var w,h=0;
    if(window.screen.width < 1360){
        w=700;
    }else if(window.screen.width < 1600){
        w=900;
    }else if(window.screen.width < 2000){
        w=1200;
    }else{
        w=1600;
    }
    if(window.screen.height < 700){
        h=350;
    }else if(window.screen.height < 800){
        h=500;
    }else if(window.screen.height < 1000){
        h=600;
    }else{
        h=800;
    }

    printMapDialog = new WinDialog();
    printMapDialog.ID = "printMapDialog";
    printMapDialog.Top="87%";
    printMapDialog.Modal = false;
    printMapDialog.Width = w;
    printMapDialog.Height = h;
    printMapDialog.IsMaximize = true;
    //printMapDialog.Folding = true;

    printMapDialog.Title = "打印";
    printMapDialog.IsMaximize=true;
    printMapDialog.Url = rootPath+'/Map/toPrint'+"?token="+localStorage.token;
    if(showTop != "false"){
        printMapDialog.showHeadHeight=0;
    }
    //关闭函数
    printMapDialog.CancelEvent = function(){
        if(printMapDialog)
            printMapDialog.close();
    };
    printMapDialog.show();
    var dialog = getWinDialog(printMapDialog);
    if($("#operationBtn_printMapDialog .icon-zuidahua").attr("title") == "最大化"){
        var that = $("#operationBtn_printMapDialog .icon-zuidahua");
        try{
            top.window.document;
            if(!showTop || showTop == "false"){
                dialog.resizeWindow(that[0],"printMapDialog");//最大化,非运维中
            }else{
                dialog.resizeWindow(that[0],"printMapDialog",headNavHeight);//运维中
            }
        }catch(e){
            dialog.resizeWindow(that[0],"printMapDialog",headNavHeight);//运维中
            ;
        }
    }
}