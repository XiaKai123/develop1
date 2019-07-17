/**
 * 文件上传通用函数
 * */


//启动文件上传
function startupFileUpload(uploadCallback){
    //文件上传对象
    var shapefileElement=document.getElementById('shapefilelist');
    //监听文件上传变化事件
    shapefileElement.addEventListener('change',function(){
        $(".file-container").addClass("hide-placeholder selected")
        $(".file-container").attr("data-title","");
        $(".remove").addClass("active");
        //调用读取文件接口
        readGeometryFile(this,uploadCallback);

    }, false);
}

//读取文件上传数据
function readGeometryFile(fileInputEl,readCallBack){
    var dataObjArr = [];
    var isTxtfile = false,isShpfile = false, isDwgfile = false;
    var files = fileInputEl.files;
    if(files==null||files.length==0){
        return;
    }
    var name = files[0].name;
    if(name.toUpperCase().indexOf(".TXT")!=-1){
        isTxtfile = true;
    }else if(name.toUpperCase().indexOf(".SHP")!=-1){
        isShpfile = true;
    }else if(name.toUpperCase().indexOf(".DWG")!=-1){
        isDwgfile = true;
    }
    if(isTxtfile||isShpfile||isDwgfile){
        var url = "";
        if(isTxtfile){//txt file
            url = rootPath + "rest/MapSoeRest/loadTxtFile?datatime="+new Date().getTime()+"&token="+localStorage.token;
        }else if(isShpfile){//shap file
            url = rootPath + "rest/MapSoeRest/loadShapeFile?datatime="+new Date().getTime()+"&token="+localStorage.token;
        }else if(isDwgfile){//dwg file
            url = rootPath + "rest/MapSoeRest/loadCadFile?datatime="+new Date().getTime()+"&token="+localStorage.token;
        }
        var formEl=$(fileInputEl).parents("#Form2")[0];
        var formData = new FormData(formEl);
        var msgIndex = getTopWindow().layer.msg("正在解析，请稍后....",{time:0,offset: parent.layerInfoTop+"px"});//不会自动关闭
        $.ajax({
            type:"post",
            url:url,
            dataType: "json",
            data:formData,
            processData: false,
            contentType: false,
            success:function(resp){
                var resultArr={};
                if(!resp.success){
                    showMessage("解析结果异常！", 2);
                    return;
                }else{
                    if(Object.prototype.toString.call(resp.data) === '[object String]'){
                        resultArr=JSON.parse(resp.data);
                    }else{
                        resultArr=resp.data;
                    }
                }
                var obj = new Object();
                for(var i=0;i<resultArr.length;i++){
                    //组装id, 用于树节点/graphic的id
                    //obj.id = dataObjIndex;
                    obj.id =new Date().getTime()+"_"+i;
                    //dataObjIndex++;
                    //名字
                    var fileName = files[i].name;
                    //obj.name = fileName.substring(0,fileName.lastIndexOf("."));
                    obj.name = fileName;
                    //内容
                    //obj.content = eval('('+resultArr[i]+ ')');
                    obj.content = resultArr[i];
                    dataObjArr.push(obj);
                    obj = new Object();
                }
                if(Object.prototype.toString.call(readCallBack) === "[object Function]"){
                    readCallBack(dataObjArr);
                }

                getTopWindow().layer.close(msgIndex);

            },error:function(resp){
                showMessage(resp.respMessage, 2);
            }
        });
    }
}

//geo字符串转graphic
function geoStrToGraphic(dataStr){
    var keytext= dataStr;
    var myPattern = /(\s+)|(\r?\n)/g;
    keytext = keytext.replace(myPattern,"");
    keytext = StringReplaceAll(keytext,"，",",");
    keytext = StringReplaceAll(keytext,"【","[");
    keytext = StringReplaceAll(keytext,"】","]");
    if(keytext==""){
        alert("坐标集为空！");
        return;
    }
    var graphic = null;
    var isDd = false;
    //多面  每一层弄出来
    keytext = StringReplaceAll(keytext,"*","");
    keytext = StringReplaceAll(keytext,"]],[[","]]*[[");//[[[ ]],[[ ]]]  --标准格式
    keytext = StringReplaceAll(keytext,"]][[","]]*[[");//[[[ ]][[ ]]]    --不标准格式
    var polyArray = StringSplit(keytext,"*");
    var pointstr = "";
    for(var p=0;p<polyArray.length;p++){
        pointstr = polyArray[p];
        if(pointstr == ""){
            alert("坐标集为空！");
            break;
            return ;
        }
        //判断点、线、面
        if(pointstr.indexOf("],[")==-1){//单点
            //去除所有【、】
            pointstr = StringReplaceAll(pointstr,"[","");
            pointstr = StringReplaceAll(pointstr,"]","");//最后剩下     数字，数字
            var xyarray = StringSplit(pointstr,",");//X,Y
            graphic = getMapWindow("mapDiv").pointArrGraphic(xyarray);

        }else if(pointstr.indexOf("],[")>-1 && (pointstr.indexOf("[[")==-1 && pointstr.indexOf("]]")==-1)){//多点
            pointstr = StringReplaceAll(pointstr,"],[","*");
            pointstr = StringReplaceAll(pointstr,"[","");
            pointstr = StringReplaceAll(pointstr,"]","");//最后剩下     数字，数字*数字，数字
            var pointstrs = pointstr.split("*");
            var points =new Array();
            for(var i =0;i<pointstrs.length;i++){
                var tPoints = pointstrs[i].split(",");
                if(tPoints.length==2){
                    points.push(tPoints[0]);
                    points.push(tPoints[1]);
                }
            }
            graphic = null;
            //添加多点
            getMapWindow("mapDiv").addMapPointList(points,impLayerId);
            //显示
            //showTxtContent(dataStr);
            isDd = true;

        }else if(pointstr.split("],[").length==2){//单线
            pointstr = StringReplaceAll(pointstr,"],[","*");
            pointstr = StringReplaceAll(pointstr,"[","");
            pointstr = StringReplaceAll(pointstr,"]","");//最后剩下     数字，数字*数字，数字
            var pointStrArray = new Array();
            pointStrArray = pointstr.split("*");
            graphic = getMapWindow("mapDiv").polylineArrGraphic(pointStrArray);

        }else if((pointstr.split("],[").length==3)||(pointstr.split("],[").length>3 && false)){//多线     检查首尾点重复 ？ 还是  检查所有点有无重复
            pointstr = StringReplaceAll(pointstr,"],[","*");
            pointstr = StringReplaceAll(pointstr,"[","");
            pointstr = StringReplaceAll(pointstr,"]","");//最后剩下     数字，数字*数字，数字
            var strArray1 = new Array();
            strArray1 = pointstr.split("*");
            graphic = getMapWindow("mapDiv").polylineArrGraphic(strArray1);

        }else if(pointstr.split("],[").length>3 && true){//单面       检查首尾点重复 ？ 还是  检查所有点有无重复？
            pointstr = StringReplaceAll(pointstr,"],[","*");
            pointstr = StringReplaceAll(pointstr,"[","");
            pointstr = StringReplaceAll(pointstr,"]","");//最后剩下     数字，数字*数字，数字
            var aArray= new Array();
            aArray = pointstr.split("*");
            graphic = getMapWindow("mapDiv").polygonArrGraphic(aArray);

        }else{
            alert("坐标集错误！");
        }
    }
    var resObj = {
        graphic:graphic,
        isDd:isDd
    };
    return resObj;
}

//转数组
function StringSplit(source, find) {
    return source.split(find);
}

//替换字符串
function StringReplaceAll(source, find, replacement) {
    return source.split(find).join(replacement);
}




