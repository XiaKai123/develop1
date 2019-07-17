package com.guodi.common.entity;

import java.io.Serializable;

/**
 * @描述：Rest请求返回封装
 * @作者：彭辉
 * @时间：2019/1/19 15:15
 */
public class RestResult implements Serializable {
    private static final long serialVersionUID = 5010491918453384235L;

    private boolean success;    // 返回是否成功
    private Integer respCode;    // 返回状态
    private String respMessage; // 返回消息
    private Object data;        // 返回数据集

    public RestResult() {
    }

    public RestResult(boolean success) {
        this.success = success;
    }

    public RestResult(boolean success, Integer respCode, String respMessage, String body) {
        this.success = success;
        this.respCode = respCode;
        this.respMessage = respMessage;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Integer getRespCode() {
        return respCode;
    }

    public void setRespCode(Integer respCode) {
        this.respCode = respCode;
    }

    public String getRespMessage() {
        return respMessage;
    }

    public void setRespMessage(String respMessage) {
        this.respMessage = respMessage;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
