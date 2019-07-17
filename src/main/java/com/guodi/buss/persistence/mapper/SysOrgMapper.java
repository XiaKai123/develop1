package com.guodi.buss.persistence.mapper;

import com.guodi.buss.persistence.entity.SysOrg;
import com.guodi.buss.persistence.entity.SysUser;

import java.util.List;

/**
* @描述: 用户部门表数据库访问层
* @作者: 郑坚侠
* @日期: 2019/6/19 9:44
**/

public interface SysOrgMapper {
    /**
    * @描述: 查询
    * @作者: 郑坚侠
    * @日期: 2019/6/19 9:46
    **/
    List<SysOrg> listByEntity(SysOrg sysOrg);

    /**
     * @描述：根据id查询
     * @作者：郑坚侠
     * @时间：2019/2/16 15:59
     */
    public SysOrg findById(String id);

    /**
     * @描述：修改
     * @作者：郑坚侠
     * @时间：2019/2/16 15:59
     */
    public void update(SysOrg sysOrg);

    /**
    * @描述: 保存
    * @作者: 郑坚侠
    * @日期: 2019/6/21 19:25
    **/
    public void save(SysOrg sysOrg);

    /**
    * @描述: 删除
    * @作者: 郑坚侠
    * @日期: 2019/6/24 9:04
    **/
    public void delete(String id);

    public List<SysOrg> listOrgUser();

}
