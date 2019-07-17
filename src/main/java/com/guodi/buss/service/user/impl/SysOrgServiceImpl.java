package com.guodi.buss.service.user.impl;

import com.guodi.buss.persistence.entity.SysOrg;
import com.guodi.buss.persistence.entity.SysUser;
import com.guodi.buss.persistence.mapper.SysOrgMapper;
import com.guodi.buss.service.user.SysOrgService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * @描述：用户接口实现类
 * @作者：彭辉
 * @时间：2019/2/16 16:04
 */
@Service("sysUser2orgService")
public class SysOrgServiceImpl implements SysOrgService {

    @Resource
    private SysOrgMapper mapper;

    @Override
    public List<SysOrg> listByEntity(SysOrg sysOrg) {
        return mapper.listByEntity(sysOrg);
    }
    @Override
    public String update(SysOrg sysOrg) {
        mapper.update(sysOrg);
        return sysOrg.getId();
    }
    @Override
    public String save(SysOrg sysOrg) {
        mapper.save(sysOrg);
        return sysOrg.getId();
    }
    @Override
    public SysOrg findById(String id) {
        return mapper.findById(id);
    }
    @Override
    public String delete(SysOrg sysOrg){
        mapper.delete(sysOrg.getId());
        return sysOrg.getId();
    }
    @Override
    public List<SysOrg> listOrgUser(){
        return mapper.listOrgUser();
    }

}
