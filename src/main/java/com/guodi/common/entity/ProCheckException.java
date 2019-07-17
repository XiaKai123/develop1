package com.guodi.common.entity;

/**
* @描述: 检查的运行时异常。
* @作者: 郝明才
* @日期: 2018/11/13 10:51
**/

public class ProCheckException extends RuntimeException{
   private String message="";
   private String solution="";
   public ProCheckException(String msg){
       message=msg;
   }
   public ProCheckException(String msg,String solution1){
       message=msg;
       solution=solution1;
   }
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }
}
