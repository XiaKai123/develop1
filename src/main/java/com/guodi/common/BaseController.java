package com.guodi.common;

import com.guodi.common.dao.IConvertService;
import com.guodi.common.entity.AjaxResult;
import com.guodi.common.entity.PageData;
import com.guodi.common.entity.ProCheckException;
import com.guodi.common.pager.PageHelper;
import com.guodi.common.utils.JsonUtils;
import com.guodi.common.utils.SpringContextUtil;
import com.guodi.common.utils.UuidUtil;
import org.apache.commons.lang.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @description: controler基类
 * @author: 郝明才
 * @date: 2018/10/24 16:31
 */
public class BaseController {


    // 存储实体转Map 待转字段key集合
    public Map<String,String> keys = new HashMap<>();

    /**
     * @描述：获取HttpServletRequest对象
     * @作者：彭辉
     * @时间：2019/4/15 11:46
     */
    public HttpServletRequest getRequest() {
        HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
        return request;
    }

    /**
     * @描述：HttpServletResponse
     * @作者：彭辉
     * @时间：2019/4/15 11:46
     */
    public HttpServletResponse getResponse() {
        HttpServletResponse response = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getResponse();
        return response;
    }

    /**
     * @描述：获取PageData对象
     * @作者：彭辉
     * @时间：2019/1/14 9:21
     */
    public PageData getPageData(){
        return new PageData(this.getRequest());
    }

    /**
     * @描述：获取32位UUID
     * @作者：彭辉
     * @时间：2019/4/15 11:44
     */
    public String get32UUID(){
        return UuidUtil.get32UUID();
    }


    /**
     * @描述：获取访问系统IP地址
     * @作者：彭辉
     * @时间：2019/4/15 11:44
     */
    public String getRemortIP() {
        HttpServletRequest request = this.getRequest();
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unkown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unkown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unkown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 0:0:0:0:0:0:0:1是属于ipv6(服务器和客户端都在同一台电脑上才会出现, hosts配置文件的问题)
        if("0:0:0:0:0:0:0:1".equals(ip)){
            ip = "127.0.0.1";
        }
        return ip;
    }

    public void startPage(){
        Object pageNum=getRequest().getParameter("currentIndex").toString();//前台传来的是当前记录起始索引,后台要变成页码数
        int currentIndex = new Integer(pageNum.toString());
        Object showCountO=getRequest().getParameter("showCount");
        int showCount = new Integer(showCountO.toString());
        PageHelper.startPage((currentIndex==0?1:currentIndex/showCount+1),(showCount==0?10: showCount));
    }
    /**
     * 简要说明：所有控制器抛出的异常处理
     * 编写者：郝明才
     * 创建时间：2016年7月7日 上午10:46:16
     * @param ex 异常
     * @return 提示信息
     */
    @ExceptionHandler
    public String  exp(HttpServletRequest request, Exception ex) {
        // 获取调用的类名、方法名
        String className = this.getClass().getName();
        String methodName = request.getRequestURI().split("/")[2];

        // 截取过长异常信息
        String errorMsg = (StringUtils.isNotBlank(ex.getMessage()) && ex.getMessage().length() > 1000) ? ex.getMessage().substring(0, 1000) : ex.getMessage();
        // 获取上一级的方法堆栈
        StackTraceElement stet = ex.getStackTrace()[0];

        String mv="/frame/common/errorPage";
        AjaxResult result=new AjaxResult(false);
        boolean isAjax=false;
        if(StringUtils.isEmpty(request.getHeader("X-Requested-With"))){
            isAjax="XMLHttpRequest".equals(request.getParameter("XRequestedWith"));
        }else{
            isAjax="XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
        }
        String ajaxFlag=null==request.getParameter("ajax")?"false":request.getParameter("ajax");
        isAjax=isAjax||ajaxFlag.equalsIgnoreCase("true");
        if(ex instanceof ProCheckException){
            result.setMessage(ex.getMessage()+"  指引："+((ProCheckException)ex).getSolution());
            // 根据不同错误转向不同页面
        }else{//代码及系统级别错误处理。
            ex.printStackTrace();
            String requestUrl=request.getRequestURL().toString();

            StringWriter sw = new StringWriter();
            ex.printStackTrace(new PrintWriter(sw, true));
            String detailMsg=sw.toString();
            if(detailMsg!=null&&detailMsg.toLowerCase().contains("timeout")){
                result.setMessage("系统繁忙，请稍后重试！");
                result.setDetailMsg(result.getMessage()+"\n发送请求："+requestUrl+"\n返回错误信息：\n"+detailMsg);
            }else{
                result.setMessage("系统发生内部错误！");
                result.setDetailMsg(result.getMessage()+"\n发送请求："+requestUrl+"\n返回错误信息：\n"+detailMsg);
            }
            getResponse().setStatus(500);
            // 根据不同错误转向不同页面
        }
        if(isAjax){
            try {
                getResponse().getWriter().write(JsonUtils.toJson(result));
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
        request.setAttribute("result", result);
        return mv;
    }
}
