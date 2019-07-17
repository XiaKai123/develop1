/**
 * 
 */
define([
    "widget/MapCustom",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/tasks/FindTask",
	"esri/tasks/support/FindParameters",
	"esri/tasks/IdentifyTask",
	"esri/tasks/support/IdentifyParameters"
], function (
	Custom,
	QueryTask,
	Query,
	FindTask,
	FindParameters,
	IdentifyTask,
	IdentifyParameters
) {
	'use strict';
	
	var MapQuery = Custom.createSubclass({
        declaredClass: "esri.custom._MapQuery",
        normalizeCtorArgs: function () {
        },
        /**
         * 根据条件进行要素查询
         * @queryUrl			地址：http://192.168.1.228:6080/arcgis/rest/services/ghsj/spsj/MapServer/0
         * @queryWhere			查询条件：xmmc=海口
         * @geometry			图形过滤(可为空)
         * @isReturnGeometry	是否返回Geometry：true/false
         * @callback			回调函数
         */
        query: function(queryUrl,queryWhere,geometry,isReturnGeometry,callback,errback){
        	var queryTask = new QueryTask({
        	    url: queryUrl
        	});
        	if(queryWhere){
        		queryWhere = "1=1 and " + queryWhere;
        	}else{
        		queryWhere = "1=1";
        	}
        	
        	var query = new Query();
        	query.returnGeometry = isReturnGeometry;
        	query.outFields = ["*"];
        	query.where = queryWhere;
        	if(geometry){
        		query.geometry = geometry;
        	}
        	if(typeof errback == "undefined"){
                queryTask.execute(query).then(callback);
			}else{
                queryTask.execute(query).then(callback,errback);
			}

        },
        /**
         * 根据条件检索要素
         * @searchUrl			地址：http://192.168.1.228:6080/arcgis/rest/services/ghsj/spsj/MapServer
         * @searchFields		检索字段(数组)：['xmmc','xmbh']
         * @searchText			检索值
         * @layerIds			图层id(数组)：[0,1,2]
         * @isReturnGeometry	是否返回Geometry：true/false
         */
        find: function(searchUrl,searchFields,searchText,layerIds,isReturnGeometry){
        	var findTask = new FindTask({
        	    url: searchUrl
        	});
        	
        	var params = new FindParameters();
        	params.layerIds = layerIds;
        	params.searchFields = searchFields;
        	params.searchText = searchText;
        	params.returnGeometry = isReturnGeometry;
        	findTask.execute(params).then(function(results){
        		return results;
        	});
        },
        /**
         * 点、线、面要素识别
         * @identifyUrl			地址：http://192.168.1.228:6080/arcgis/rest/services/ghsj/spsj/MapServer
         * @geometry			要素对象
         * @layerIds			图层id(数组)：[0,1,2]
         * @isReturnGeometry	是否返回Geometry：true/false
         */
        identify: function(identifyUrl,geometry,layerIds,isReturnGeometry){
        	var identifyTask = new IdentifyTask({
        	    url: identifyUrl
        	});
        	
        	var params = new IdentifyParameters();
        	params.geometry = geometry;
        	params.layerIds = layerIds;
        	params.returnGeometry = isReturnGeometry;
        	identifyTask.execute(params).then(function(results){
        		return results;
        	});
        }
	});
	return MapQuery;
});