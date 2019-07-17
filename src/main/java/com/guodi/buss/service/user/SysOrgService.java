package com.guodi.buss.service.user;

import com.guodi.buss.persistence.entity.SysOrg;
import com.guodi.buss.persistence.entity.SysUser;

import java.util.List;

/**
* @描述: 部门接口
* @作者: 郑坚侠
* @日期: 2019/6/19 9:35
**/

public interface SysOrgService {

    /**
    * @描述: 根据实体属性检索
    * @作者: 郑坚侠
    * @日期: 2019/6/19 9:38
    **/
    public List<SysOrg> listByEntity(SysOrg sysOrg);

    /**
     * @描述：保存
     * @作者：郑坚侠
     * @时间：2019/2/16 15:59
     */
    public String save(SysOrg sysOrg);

    /**
    * @描述: 根据id查询
    * @作者: 郑坚侠
    * @日期: 2019/6/21 19:02
    **/
    public SysOrg findById(String id);

    /**
    * @描述: 修改
    * @作者: 郑坚侠
    * @日期: 2019/6/21 19:04
    **/
    public String update(SysOrg sysOrg);

    /**
    * @描述: 逻辑删除
    * @作者: 郑坚侠
    * @日期: 2019/6/24 9:00
    **/
    public String delete(SysOrg sysOrg);

    public List<SysOrg> listOrgUser();
}
