package com.guodi.common.utils;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * 作者：郝明才
 * 时间：20181018
 * spring bean获取器
 * 作用：可以不通过注入方式，获取bean
 */
@Component
public class SpringContextUtil implements ApplicationContextAware {  
    // Spring应用上下文环境  
    private static ApplicationContext applicationContext;  
    /** 
     * 实现ApplicationContextAware接口的回调方法，设置上下文环境 
     *  
     * @param applicationContext 
     */  
    public void setApplicationContext(ApplicationContext applicationContext) {  
        SpringContextUtil.applicationContext = applicationContext;  
    }  
    /** 
     * @return ApplicationContext 
     */  
    public static ApplicationContext getApplicationContext() {  
        return applicationContext;  
    }  
    /** 
     * 获取对象 
     *  
     * @param name 
     * @return Object
     * @throws BeansException 
     */  
    public static Object getBean(String name) throws BeansException {
        return applicationContext.getBean(name);  
    }  
    /**
     * 获取对象
     *
     * @param className
     * @return Object
     * @throws BeansException
     */
    public  static <T> Object getBean(Class className) throws BeansException {
        return applicationContext.getBean(className);
    }
}

