package com.guodi.buss.persistence.entity;

import org.apache.ibatis.type.Alias;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * @描述：用户实体类
 * @作者：彭辉
 * @时间：2019/2/16 14:37
 */
@Alias("SysUserType")
public class SysUser{
    private static final long serialVersionUID = 136118894557623184L;

    private String id;              // 主键id
    private String loginName;       // 登录名
    private String password;        // 密码
    private String name;            // 姓名
    private String position;        // 岗位
    private String sex;             // 性别
    private String tel;             // 电话
    private String address;         // 地址
    private String email;           // 邮箱
    private String cardType;        // 证件类型
    private String idcard;          // 身份证号
    private String nation;          // 民族
    private String politic;         // 政治面貌
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date bornTime;          // 出生日期
    private String education;       // 教育程度
    private String remark;          // 备注
    private Object errorCount;      // 登录错误次数
    private String status;          // 状态(0：注销，1：正常)
    private String canceledReason;  // 注销原因
    private Date lockTime;          // 锁定时间
    private String memo1;           // 备用1
    private String memo2;           // 备用2
    private Object memo3;           // 备用3
    private String appCode;         // 应用系统id
    private String creator;         // 创建人
    private Date createTime;        // 创建时间
    private String modifier;        // 修改人
    private Date modifyTime;        // 修改时间

    private String orgIds;          // 机构id
    private String orgNames;        // 机构名称

    private String groupIds;         // 用户组id
    private String groupNames;         // 用户组名称


    public String getId() {
        return id;
    }


    public void setId(String id) {
        this.id = id;
    }


    public String getLoginName() {
        return loginName;
    }


    public void setLoginName(String loginName) {
        this.loginName = loginName;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getIdcard() {
        return idcard;
    }

    public void setIdcard(String idcard) {
        this.idcard = idcard;
    }

    public String getNation() {
        return nation;
    }

    public void setNation(String nation) {
        this.nation = nation;
    }

    public String getPolitic() {
        return politic;
    }

    public void setPolitic(String politic) {
        this.politic = politic;
    }

    public Date getBornTime() {
        return bornTime;
    }

    public void setBornTime(Date bornTime) {
        this.bornTime = bornTime;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Object getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(Object errorCount) {
        this.errorCount = errorCount;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }

    public String getCanceledReason() {
        return canceledReason;
    }

    public void setCanceledReason(String canceledReason) {
        this.canceledReason = canceledReason;
    }

    public Date getLockTime() {
        return lockTime;
    }

    public void setLockTime(Date lockTime) {
        this.lockTime = lockTime;
    }

    public String getMemo1() {
        return memo1;
    }

    public void setMemo1(String memo1) {
        this.memo1 = memo1;
    }

    public String getMemo2() {
        return memo2;
    }

    public void setMemo2(String memo2) {
        this.memo2 = memo2;
    }

    public Object getMemo3() {
        return memo3;
    }

    public void setMemo3(Object memo3) {
        this.memo3 = memo3;
    }


    public String getAppCode() {
        return appCode;
    }


    public void setAppCode(String appCode) {
        this.appCode = appCode;
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

    public String getOrgIds() {
        return orgIds;
    }

    public void setOrgIds(String orgIds) {
        this.orgIds = orgIds;
    }

    public String getOrgNames() {
        return orgNames;
    }

    public void setOrgNames(String orgNames) {
        this.orgNames = orgNames;
    }

    public String getGroupIds() {
        return groupIds;
    }

    public void setGroupIds(String groupIds) {
        this.groupIds = groupIds;
    }

    public String getGroupNames() {
        return groupNames;
    }

    public void setGroupNames(String groupNames) {
        this.groupNames = groupNames;
    }
}