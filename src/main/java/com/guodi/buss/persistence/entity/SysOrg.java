package com.guodi.buss.persistence.entity;

import java.util.Date;
import java.util.List;

/**
* @描述:
* @作者: 郑坚侠
* @日期: 2019/6/18 18:05
**/
public class SysOrg {
    private String id;              // 主键id
    private String name;          //名字
    private String code;          //名字

    private String creator;         // 创建人
    private Date createTime;        // 创建时间
    private String modifier;        // 修改人
    private Date modifyTime;        // 修改时间
    private List<SysUser> sysUserList;//订单所包含的订单明细集合

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public String getModifier() {
        return modifier;
    }

    public void setModifier(String modifier) {
        this.modifier = modifier;
    }

    public Date getModifyTime() {
        return modifyTime;
    }

    public void setModifyTime(Date modifyTime) {
        this.modifyTime = modifyTime;
    }

    public List<SysUser> getSysUserList() {
        return sysUserList;
    }

    public void setSysUserList(List<SysUser> sysUserList) {
        this.sysUserList = sysUserList;
    }
}
