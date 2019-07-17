package com.guodi.constant;

import java.util.HashMap;
import java.util.Map;

/**
 * @author: wucan
 * 修改日期：2017/6/2
*/
public class Const {
	public static final String PLATAPP = "upms";//运维系统编码

	public static final String SERVICE_REGISTER_AUTH_UUID = "1QAZXSW23EDCVFR45TGBNHY67UJMIOPKL";//在线服务授权唯一标识
	
	public static final String TRUE = "T";
	public static final String FALSE = "F";
	public static final String CONFIG_PROPERTIES = "config.properties";			//properties配置文件名称

	public static final String ADMIN_USER_ID = "1";				//管理员USER_ID

	//接口请求返回结果编码
	public static final int REQUEST_CODE_SUCCESS = 200;			//请求成功
	public static final int REQUEST_CODE_CLOSE = 401;				//接口已关闭
	public static final int REQUEST_CODE_BAD = 400;				//语义/参数错误
	public static final int REQUEST_CODE_UNKNOWN = 404;			//未知接口
	public static final int REQUEST_CODE_TIMEOUT = 408;			//请求超时
	public static final int REQUEST_CODE_ERROR = 500;				//系统错误
	public static final int REQUEST_CODE_PARAM_ERROR = 506;		//保留编码，暂未使用
	public static final int REQUEST_CODE_OPERATION_FAILURE = 507;	//操作失败
	public static final int REQUEST_CODE_UNDEFINED = 508;			//自定义消息


	//接口请求返回结果编码对应消息
	public static final Map<Integer, String> REQUEST_MSG_MAP = new HashMap<Integer, String>();
	static {
		REQUEST_MSG_MAP.put(REQUEST_CODE_SUCCESS, "请求成功");
		REQUEST_MSG_MAP.put(REQUEST_CODE_CLOSE, "接口已关闭");
		REQUEST_MSG_MAP.put(REQUEST_CODE_BAD, "语义/参数错误");
		REQUEST_MSG_MAP.put(REQUEST_CODE_UNKNOWN, "未知接口");
		REQUEST_MSG_MAP.put(REQUEST_CODE_TIMEOUT, "请求超时");
		REQUEST_MSG_MAP.put(REQUEST_CODE_ERROR, "系统错误");
//		REQUEST_MSG_MAP.put(REQUEST_CODE_PARAM_ERROR, "参数错误");
		REQUEST_MSG_MAP.put(REQUEST_CODE_OPERATION_FAILURE, "操作失败");
	}
	
}
