package com.guodi.common.utils;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/** 
 * 说明：读取Propety属性文件
 * 修改时间：2017年6月6日
 * @version
 */
public class PropetyUtil{
	private static Log logger = LogFactory.getLog(PropetyUtil.class);
		
	
	/**读取配置文件
	 * @return
	 * @throws IOException
	 */
	public static Properties getPprVue(String pprName) {
		InputStream inputStream = PropetyUtil.class.getClassLoader().getResourceAsStream(pprName);
		Properties p = new Properties();
		try {
			p.load(inputStream);
			inputStream.close();
		} catch (IOException e) {
			//读取配置文件出错
			e.printStackTrace();
		}
		return p;
	}
}