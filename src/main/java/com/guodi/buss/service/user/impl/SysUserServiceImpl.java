package com.guodi.buss.service.user.impl;

import com.guodi.buss.persistence.entity.SysUser;
import com.guodi.buss.persistence.mapper.SysUserMapper;
import com.guodi.buss.service.user.SysUserService;
import com.guodi.common.constant.FrameConst;
import com.guodi.common.utils.UuidUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * @描述：用户接口实现类
 * @作者：彭辉
 * @时间：2019/2/16 16:04
 */
@Service("sysUserService")
public class SysUserServiceImpl implements SysUserService {

    @Resource
    private SysUserMapper mapper;

    @Override
    public String save(SysUser sysUser) {
        // 保存用户
        mapper.save(sysUser);
        return sysUser.getId();
    }

    @Override
    public String update(SysUser sysUser) {
        // 修改用户信息
        mapper.update(sysUser);
        return sysUser.getId();
    }

    public SysUser findById(String id) {
        return mapper.findById(id);
    }

    @Override
    public SysUser findByLoginName(String loginName) {
        return mapper.findByLoginName(loginName);
    }

    @Override
    public List<SysUser> listByEntity(SysUser sysUser) {
        return mapper.listByEntity(sysUser);
    }

    @Override
    public List<SysUser> listByOrgId(String orgId) {
        return mapper.listByOrgId(orgId);
    }

    @Override
    public List<SysUser> listByUserIds(String[] ids) {
        return mapper.listByUserIds(ids);
    }
}
