/**
 * 后台读取运维配置信息
 */
var SystemInfo = (function(){
    return {
        /**
         * 通过用户ID获取该用户下专题信息
         * @param {Object} userId
         * @param {Object} callback
         * @param {Object} errback
         */
        getProjectListByUserId: function(userId,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath+"rest/MapProjectUserRest/listByUserId?userId="+ userId +"&token="+localStorage.token+ "&d="+ new Date().getTime(),
                headers: { 'Content-Type': "application/json" },
                success: function(r){
                    var resp = JSON.parse(r);
                    if(resp.success){
                        if(callback){
                            //临时设置坐标系，接口正常后记得改回
                            var projectList=resp.data;
                            for(var i=0;i<projectList.length;i++){
                                // projectList[i].map_refernce=mapRefernce;
                            }
                            callback(projectList);
                        }
                    }else{
                        showMessage(resp.respMessage,2);
                    }
                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 获取父节点id获取专题图层树
         */
        getProjectDirTreeByParentId: function(parent_id,userId,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath + "rest/MapProjectDirRest/listTreeByProjectIdAndUserId?"+ "projectId=" + parent_id + "&userId="+ userId +"&token="+localStorage.token+"&d="+ new Date().getTime(),
                success: function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage,2);

                    }

                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 根据图层id查询图层字段
         * @layer_id	图层id
         */
        getLayerFieldByLayerId: function(layer_id,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath + "rest/MapLayerFieldRest/listByLayerId?layerId=" + layer_id + "&token="+localStorage.token+"&d="+ new Date().getTime(),
                success: function(r){
                    var resp = eval('(' + r + ')');
                    var fields={};
                    if(resp.success){
                        fields=resp.data;
                    }else{
                        showMessage(resp.respMessage,2);
                        return;
                    }
                    //返回显示字段数据集
                    var showFields = SystemInfo.returnLayerFieldCallbck(fields);
                    callback(showFields);
                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 根据专题图层id查询图层字段
         * @dir_id	专题图层id
         */
        getProjectLayerFieldByDirId: function(dir_id,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath + "rest/MapProjectLayerFieldRest/listByProjectLayerId?projectLayerId=" + dir_id + "&token="+localStorage.token+"&d="+ new Date().getTime(),
                success: function(r){
                    var resp = eval('(' + r + ')');
                    var fields={};
                    if(resp.success){
                        fields=resp.data;
                    }else{
                        showMessage(resp.respMessage,2);
                        return;
                    }

                    //返回显示字段数据集
                    var showFields = SystemInfo.returnLayerFieldCallbck(fields);
                    callback(showFields);
                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 处理返回显示字段数据集
         */
        returnLayerFieldCallbck: function(fieldData){
            //返回显示字段数组
            var showFields = new Array();
            for(var i = 0; i < fieldData.length; i++){
                if(fieldData[i].is_show == 0){
                    //移除不显示字段
                    fieldData.splice(i,1);
                    i--;
                    continue;
                }
                var fieldJson = {"field_name":fieldData[i].field_name, "field_name_cn":fieldData[i].field_name_cn, "field_unit":fieldData[i].field_unit, "is_show":fieldData[i].is_show, "is_label":fieldData[i].is_label};
                showFields.push(fieldJson);
            }
            return showFields;
        },
        /**
         * 写入日志
         * @logSystemKey	系统key
         * @logMenuKey		菜单key
         * @logFuncKey		功能key
         * @classPath		操作方法路径
         * @detail			操作详情
         * @result			操作结果
         * @callback		成功回调函数
         * @errback			失败回调函数
         */
        insertLog: function(logSystemKey,logMenuKey,logFuncKey,classPath,detail,result,callback,errback){
            var logJson = new Object();
            logJson.user_id = userId;
            logJson.log_system_key = logSystemKey;
            logJson.log_menu_key = logMenuKey;
            logJson.log_func_key = logFuncKey;
            logJson.class_path = classPath;
            logJson.detail = detail;
            logJson.result = result;

            GuoDi.Map.Request.POST({
                url: rootPath + "/rest/system/log/insertLog?logJson=" + encodeURI(JSON.stringify(logJson)) + "&token="+localStorage.token+"&d="+ new Date().getTime(),
                success: function(r){
                    var result = eval('(' + r + ')');
                    if(callback){
                        callback(result);
                    }
                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 删除标注
         * @param {Object} proId
         * @param {Object} userId
         * @param {Object} callback
         * @param {Object} errback
         */
        removeMapMark : function(id,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath +  "rest/MapBookMark/deleteById?id=" + id +"&token="+localStorage.token+"&d=" + new Date().getTime()+"&token="+localStorage.token,
                success: function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage,2);
                    }
                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });

        },
        /**
         * 添加标注
         * @param {Object} proId
         * @param {Object} userId
         * @param {Object} callback
         * @param {Object} errback
         */
        saveMapMark : function(result,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath+"rest/MapBookMark/saveBookMark?d="+ new Date().getTime()+"&token="+localStorage.token,
                headers: { 'Content-Type': "application/json" },
                data: encodeURI(dojo.toJson(result)),//记得要对传输内容进行编码不然传输的时候会出现乱码,在后台再解码
                success: dojo.hitch(this, function(r){
                    var resp=JSON.parse(r);
                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage, 2);
                    }

                }),
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });

        },
        /**
         * 导出shap
         */
        exportShape : function(result,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath+"rest/MapSoeRest/createShapeFile?d="+ new Date().getTime()+"&token="+localStorage.token,
                headers: { 'Content-Type': "application/json" },
                data: encodeURI(dojo.toJson(result)),
                success: dojo.hitch(this, function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        window.location.href=rootPath +"rest/MapSoeRest/Downloadfile?param="+encodeURI(encodeURI(JSON.stringify(resp.data))) +"&token="+localStorage.token;
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage, 2);
                    }
                }),
                failure: function(r){
                    showMessage("数据量太大无法导出图形文件！", 2);
                    var resp = eval('(' + r + ')');
                    if(errback){
                        errback(resp.respMessage);
                    }
                }
            });
        },
        /**
         * 控制线分析
         */
        geoControlLineAnalysis : function(result,callback,errback) {
            GuoDi.Map.Request.POST({
                url: rootPath +"rest/MapSoeRest/controlLineAnalysis?d="+ new Date().getTime()+"&token="+localStorage.token,
                headers: { 'Content-Type': "application/json" },
                data: encodeURI(dojo.toJson(result)),
                success: dojo.hitch(this, function(r){
                    var resp;
                    if(Object.prototype.toString.call(r) !== "[object Object]"){
                        resp=JSON.parse(r);
                    }

                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage("控制线分析结果异常！",2);
                    }

                }),
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 根据用户Id获取查询图层的字段信息
         */
        getUserLayersFields:function(userId, layerIds, callback, scope) {
            var tUrl =  rootPath +"rest/MapLayerFieldRest/getUserLayersFields?d="+ new Date().getTime()+"&token="+localStorage.token;
            var params = {
                projectId: mapProject.currentMapParam.id,
                layerIds: layerIds,
                userId: userId
            }
            this.queryData(tUrl, params, callback, scope, "POST");
        },
        /**
         * 获取用户关联区域范围
         */
        /*getUserDivisionExtent:function(geometryArr, geometryType, callback, scope) {
            var tUrl =  "/rest/getGeometryExtent?d="+ new Date().getTime();
            var params = {
                  geometryArray: dojo.toJson(geometryArr),
                  geometryType: geometryType,
                  f: "json"
            }
            this.queryData(tUrl, params, callback, scope, "POST");
        },*/

        /**
         * 查询
         */
        queryData:function(url, params, callback, scope, method, errback) {
            GuoDi.Map.Request.POST({
                url: url,//+"&projectId="+params.projectId+"&layerIds="+params.layerIds+"&userId="+params.userId,
                headers: { 'Content-Type': "application/json" },
                data: encodeURI(dojo.toJson(params)),
                success: dojo.hitch(this, function(r){
                    var resp=JSON.parse(r);
                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage,2);
                    }

                }),
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         * 前端展示，根据project_id、user_id获取图层树
         * @layer_id	图层id
         */
        getProjectDirTree: function(project_id,user_id,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath + "rest/MapProjectDirRest/listTreeByProjectIdAndUserId?projectId=" + project_id + "&userId=" + user_id +"&token="+localStorage.token+"&d="+ new Date().getTime(),
                success: function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage,2);

                    }
                },
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        /**
         *
         */
        getUnionGeometry: function(params,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath +"rest/MapSoeRest/getUnionGeometry?d="+ new Date().getTime()+"&token="+localStorage.token,
                headers: { 'Content-Type': "application/json" },
                data: encodeURI(dojo.toJson(params)),//记得要对传输内容进行编码不是传输的时候会出现乱码,在后台再解码
                success: dojo.hitch(this, function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        if(callback){
                            callback(resp.data);
                        }
                    }else{
                        showMessage(resp.respMessage,2);
                    }
                }),
                failure: function(r){
                    if(errback){
                        errback(r.respMessage);
                    }
                }
            });
        },
        exportExcel: function(params,callback,errback){
            GuoDi.Map.Request.POST({
                url: rootPath +"rest/MapSoeRest/exportExcel?d="+ new Date().getTime()+"&token="+localStorage.token,
                headers: { 'Content-Type': "application/json" },
                data: encodeURI(dojo.toJson(params)),//记得要对传输内容进行编码不是传输的时候会出现乱码,在后台再解码
                success: dojo.hitch(this, function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        window.location.href=rootPath +"rest/MapSoeRest/Downloadfile?param="+encodeURI(encodeURI(JSON.stringify(resp.data)))+"&token="+localStorage.token;
                    }else{
                        showMessage(resp.respMessage,2);
                    }
                    if(callback){
                        callback(resp);
                    }
                }),
                failure: function(r){
                    var resp = eval('(' + r + ')');
                    if(errback){
                        showMessage(resp.respMessage,2);
                        errback(resp.respMessage);
                    }
                }
            });
        },
        /**
         * 调用失败
         */
        getDivsionTree: function(params,callback,errback){
            GuoDi.Map.Request.GET({
                url: rootPath +"rest/MapDivisionRest/getDivsionTree?d="+ new Date().getTime()+"&token="+localStorage.token,
                success: function(r){
                    var resp = eval('(' + r + ')');
                    if(resp.success){
                        if(callback){
                            if(Object.prototype.toString.call(resp.data) === '[object String]'){
                                callback(JSON.parse(resp.data));
                            }else{
                                callback(resp.data);
                            }

                        }
                    }else{
                        showMessage(resp.respMessage,2);
                    }
                },
                failure: function(r){
                    var resp = eval('(' + r + ')');
                    if(errback){
                        showMessage(resp.respMessage,2);
                        errback(resp.respMessage);
                    }
                }
            });
        }

    }
})();