package com.guodi.buss.service.user;

import com.guodi.buss.persistence.entity.SysUser;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @描述：用户接口
 * @作者：彭辉
 * @时间：2019/2/16 15:59
 */
public interface SysUserService {

    /**
     * @描述：保存
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public String save(SysUser sysUser);

    /**
     * @描述：修改
     * @作者：彭辉
     * @时间：2019/2/16 15:59
     */
    public String update(SysUser sysUser);


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
     * @时间：2019/2/25 11:18
     */
    public List<SysUser> listByOrgId(String orgId);

    /**
     * @描述：根据用户id数组查询
     * @作者：彭辉
     * @时间：2019/2/25 11:18
     */
    public List<SysUser> listByUserIds(String[] ids);
}
