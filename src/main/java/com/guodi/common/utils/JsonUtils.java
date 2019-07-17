package com.guodi.common.utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * JSON工具类
 */
public class JsonUtils {
	
	private static JsonMapper mapper = JsonMapper.nonEmptyMapper();
	
	/**
	 * 将JAVA对象转换为JSON字符串
	 * @param data
	 * @return
	 */
	public static String toJson(final Object data){
		return mapper.toJson(data);
	}
	
	/**
	 * 将JAVA对象转换为JSON字符串
	 * @param functionName
	 * @param data
	 * @return
	 */
	public static String toJsonP(final String functionName, final Object data){
		return mapper.toJsonP(functionName, data);
	}

	/**
	 * 将JSON字符串转换为JAVA对象
	 * @param jsonString
	 * @param beanClass
	 * @return
	 * @throws Exception 
	 */
	public static <T> T fromJson(final String jsonString, final Class<T> beanClass) {
		return mapper.fromJson(jsonString, beanClass);
	}
	
	/**
	 * 将JSON字符串转化为字符串列表
	 * @param jsonString
	 * @return
	 */
	public static List<String> listFromJson(final String jsonString) {
		return mapper.fromJson(jsonString, List.class);
	}
	
	
	/**
	 * 将JSON字符串转换为多个JAVA对象
	 * @param <T>
	 * @param jsonString
	 * @param beanClass List中的对象class
	 * @return
	 * @throws Exception
	 */
	public static <T> List<T> listFromJson(final String jsonString, final Class<T> beanClass) {
		return mapper.fromJsonList(jsonString, beanClass);
	}
	
	/**
	 * 将JSON字符串转换为MAP对象
	 * @param jsonString
	 * @return
	 */
	public static Map<String, Object> mapFromJson(final String jsonString) {
		return mapper.fromJson(jsonString, HashMap.class);
	}
	
	/**
	 * 判断JSON字符串是否为数组的
	 * @param jsonString
	 * @return
	 */
	public static boolean isArrayJson(final String jsonString){
		boolean result = false;
		
		if(jsonString != null && jsonString.trim().length() > 0){
			
			int length = jsonString.length();
			String firstChar = jsonString.substring(0, 1);	//首字符
			String lastChar = jsonString.substring(length - 1, length);	//最后一个字符
			
			if(firstChar.equals("[") && lastChar.equals("]"))
				result = true;
		}
		
		return result;
	}
	
	/**
	 * 根据指定JSON字符串判断是否封装了多个对象
	 * @param jsonString
	 * @return 返回1表示为对象数组，0表示为对象，-1表示非JSON字符串
	 */
	public static int existBeansFromJson(final String jsonString){
		if(isArrayJson(jsonString))
			return 1;
		else if(isObjectJson(jsonString))
			return 0;
		else
			return -1;
	}
	
	/**
	 * 判断JSON字符串是否为对象的
	 * @param jsonString
	 * @return
	 */
	public static boolean isObjectJson(final String jsonString){
		boolean result = false;
		
		if(jsonString != null && jsonString.trim().length() > 0){
			
			int length = jsonString.length();
			String firstChar = jsonString.substring(0, 1);	//首字符
			String lastChar = jsonString.substring(length - 1, length);	//最后一个字符
			
			if(firstChar.equals("{") && lastChar.equals("}"))
				result = true;
		}
		
		return result;
	}
}


