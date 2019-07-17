package com.guodi.buss.controller;

import com.guodi.buss.persistence.entity.SysUser;
import com.guodi.buss.persistence.entity.SysOrg;
import com.guodi.buss.service.user.SysOrgService;
import com.guodi.buss.service.user.SysUserService;
import com.guodi.common.BaseController;
import com.guodi.common.entity.AjaxResult;
import com.guodi.common.pager.Page;
import com.guodi.common.utils.MD5;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import java.util.List;

/**
 * @描述：用户管理
 * @作者：彭辉
 * @时间：2019/2/16 16:08
 */
@Controller
@RequestMapping("/SysUser")
public class SysUserController extends BaseController {

    @Resource
    private SysUserService sysUserService;

    /**
     * @描述：用户列表管理
     * @作者：彭辉
     * @时间：2019/2/16 16:13
     */
    @RequestMapping("/toList")
    public ModelAndView toList() {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("develop/user/sysUserList");
        return mv;
    }

    /**
     * @描述：新增
     * @作者：彭辉
     * @时间：2019/2/16 17:00
     */
    @RequestMapping("/toAdd")
    public ModelAndView toAdd(SysUser sysUser) {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("develop/user/sysUserEdit");
        return mv;
    }

    /**
     * @描述：保存
     * @作者：彭辉
     * @时间：2019/2/20 15:26
     */
    @RequestMapping("/save")
    @ResponseBody
    public AjaxResult save(SysUser sysUser) {
        AjaxResult ajaxResult = new AjaxResult(true);
        // 密码加密
        sysUser.setPassword(MD5.md5(sysUser.getPassword()));
        sysUser.setId(sysUser.getOrgIds());
        sysUserService.save(sysUser);
        return ajaxResult;
    }

    /**
     * @描述：编辑
     * @作者：彭辉
     * @时间：2019/2/16 17:00
     */
    @RequestMapping("/toEdit")
    public ModelAndView toEdit(SysUser sysUser) {
        ModelAndView mv = new ModelAndView();
        // 根据id查询用户信息
        sysUser = sysUserService.findById(sysUser.getId());

        mv.addObject("sysUser", sysUser);
        mv.setViewName("develop/user/sysUserEdit");
        return mv;
    }

    /**
     * @描述：修改
     * @作者：彭辉
     * @时间：2019/2/20 15:26
     */
    @RequestMapping("/update")
    @ResponseBody
    public AjaxResult update(SysUser sysUser) {
        AjaxResult ajaxResult = new AjaxResult(true);
        sysUser.setModifier("test");
        sysUserService.update(sysUser);
        return ajaxResult;
    }

    /**
     * @描述：根据实体属性检索
     * @作者：彭辉
     * @时间：2019/2/20 15:26
     */
    @RequestMapping("/listByEntity")
    @ResponseBody
    public AjaxResult listByEntity(SysUser sysUser) {
        System.out.println("eeeeeeeeee");
        AjaxResult ajaxResult = new AjaxResult(true);
        // 分页查询
        this.startPage();
        // 根据实体属性检索
        Page page = (Page)sysUserService.listByEntity(sysUser);
        List<SysUser> userList = page.getBootStrapPage().getPageData();
        ajaxResult.setData(page.getBootStrapPage());
        return ajaxResult;
    }

    /**
     * @描述：校验登录名是否存在
     * @作者：彭辉
     * @时间：2019/2/20 15:26
     */
    @RequestMapping("/hasLoginName")
    @ResponseBody
    public AjaxResult hasLoginName(SysUser sysUser) {
        AjaxResult ajaxResult = new AjaxResult(true);
        // 根据登陆名查询
        SysUser user = sysUserService.findByLoginName(sysUser.getLoginName());
        if(user != null && !user.getId().equals(sysUser.getId())){
            ajaxResult.setData(true);
        }else{
            ajaxResult.setData(false);
        }
        return ajaxResult;
    }
}
