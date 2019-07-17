package com.guodi.common.utils;

import java.sql.Clob;

/**
 * @描述：Clob转换String工具类
 * @作者：彭辉
 * @时间：2019/3/14 11:25
 */
public class ClobUtil {

	/**
	 * @描述：将Clob转换成String
	 * @作者：彭辉
	 * @时间：2019/3/14 11:25
	 */
	public static String clobToString(Clob clob) throws Exception {
		if (clob == null) {
			return "";
		}
		String result = clob.getSubString((long)1,(int)clob.length());
		return result;
	}
}
