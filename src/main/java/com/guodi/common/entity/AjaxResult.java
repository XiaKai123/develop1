package com.guodi.common.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.guodi.constant.ReturnConstant;

import java.io.Serializable;

/**
* @描述:AJAX请求返回封装
* @作者:郝明才
* @最后修改日期:2018/10/25 15:51
**/

public class AjaxResult implements Serializable{
	private static final long serialVersionUID = 5990701580664511688L;
	//是否成功
	private boolean success = true;

	//状态标示
	private String ackCode;
	//前台消息标示
	private String message;
	//前台消息标示
	private String detailMsg;

	@JsonInclude(Include.NON_NULL) //对象为NUll时Json不返回
	private Object data;
	
	public AjaxResult(){}
	
	/**
	 * 只传成功标识的构造器
	 * @param success
	 */
	public AjaxResult(boolean success){
		this.success=success;
	}
	
	/**
	 * 成功标示、消息构造器
	 * @param success
	 * @param message
	 */
	public AjaxResult(boolean success, String message){
		this(success);
		this.message = message;
	}
	public AjaxResult(Object data){
		this(true);
		this.data = data;
	}

	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}

	public String getAckCode() {
		return ackCode;
	}

	public void setAckCode(String ackCode) {
		this.ackCode = ackCode;
		if("".equals(ackCode)){
			setSuccess(false);
		}
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		if(success){
			ackCode = ReturnConstant.ACK_SUCCESS;
		}else{
			ackCode = ReturnConstant.ACK_FAILURE;
		}
		this.success = success;
	}

	public String getDetailMsg() {
		return detailMsg;
	}

	public void setDetailMsg(String detailMsg) {
		this.detailMsg = detailMsg;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

	public void setRestFullMsg(String msg){
		this.message =msg;
	}
}
