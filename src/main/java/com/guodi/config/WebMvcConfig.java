package com.guodi.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.HttpPutFormContentFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

@Configuration
@ComponentScan(basePackages = "com.guodi")
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * @描述:注册拦截器
     * @作者:郝明才
     * @最后修改日期: 2018/10/25 15:16
     **/
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //path="/**" 两个星号表示拦截目录下的所有文件，包括子目录下的，一个星号表示拦截目录下的所有文件，但不拦截目录中的子目录中的文件
    }

    /**
     * @return
     */
    @Bean(name = "HttpMethodFilter")
    public FilterRegistrationBean httpMethodFilter() {
        FilterRegistrationBean bean = new FilterRegistrationBean();
        bean.setFilter(new HttpPutFormContentFilter());
        bean.addUrlPatterns("/*");
        return bean;
    }

    //默认打开网页处理
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/login.jsp");
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    }
}
