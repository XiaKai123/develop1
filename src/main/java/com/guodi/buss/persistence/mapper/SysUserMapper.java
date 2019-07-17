package com.guodi.buss.persistence.mapper;

import com.guodi.buss.persistence.entity.SysUser;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @描述：用户表(SysUser)数据库访问层
 * @作者：彭辉
 * @时间：2019/2/16 16:05
 */
public interface SysUserMapper {

    /**
     * @描述：保存
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public void save(SysUser sysUser);

    /**
     * @描述：修改
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public void update(SysUser sysUser);

    /**
     * @描述：根据id修改密码
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public void updatePwdById(SysUser sysUser);

    /**
     * @描述：根据id修改状态
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public void updateStatusById(SysUser sysUser);

    /**
     * @描述：根据id修改所属应用
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public void updateAppCodeById(@Param("ids") String[] ids, @Param("appCode") String appCode, @Param("modifier") String modifier);

    /**
     * @描述：根据id查询
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public SysUser findById(String id);

    /**
     * @描述：根据登录名查询
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public SysUser findByLoginName(String loginName);

    /**
     * @描述：根据实体属性检索
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public List<SysUser> listByEntity(SysUser sysUser);

    /**
     * @描述：根据机构id查询用户(不递归)
     * @作者：彭辉
     * @时间：2019/2/25 11:15
     */
    public List<SysUser> listByOrgId(String orgId);

    /**
     * @描述：根据用户id数组查询
     * @作者：彭辉
     * @时间：2019/2/25 11:18
     */
    public List<SysUser> listByUserIds(String[] ids);

}