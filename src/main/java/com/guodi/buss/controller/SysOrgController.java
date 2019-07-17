package com.guodi.buss.controller;


import com.guodi.buss.persistence.entity.SysOrg;
import com.guodi.buss.persistence.entity.SysUser;
import com.guodi.buss.service.user.SysOrgService;
import com.guodi.common.BaseController;
import com.guodi.common.entity.AjaxResult;
import com.guodi.common.pager.Page;
import com.guodi.common.utils.MD5;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
* @描述: 用户部门信息表
* @作者: 郑坚侠
* @日期: 2019/6/19 10:29
**/

@Controller
@RequestMapping("/SysOrg")
public class SysOrgController extends BaseController {


    @Resource
    private SysOrgService sysOrgService;

     /**
     * @描述: 部门列表查询
     * @作者: 郑坚侠
     * @日期: 2019/6/21 18:15
     **/
    @RequestMapping("/toList")
    public ModelAndView toList(SysOrg sysOrg) {
        List<SysOrg> list = sysOrgService.listOrgUser();

        ModelAndView mv = new ModelAndView();
        mv.setViewName("develop/org/sysOrgList");
        return mv;
    }

    /**
    * @描述: 根据实体属性检索
    * @作者: 郑坚侠
    * @日期: 2019/6/23 9:09
    **/

    @RequestMapping("/listByEntity")
    @ResponseBody
    public AjaxResult listByEntity(SysOrg sysOrg) {
        AjaxResult ajaxResult = new AjaxResult(true);
        // 分页查询
        this.startPage();
        // 根据实体属性检索
        Page page = (Page)sysOrgService.listByEntity(sysOrg);
        List<SysOrg> userList = page.getBootStrapPage().getPageData();
        ajaxResult.setData(page.getBootStrapPage());
        return ajaxResult;
    }

    /**
    * @描述: 新增
    * @作者: 郑坚侠
    * @日期: 2019/6/21 19:18
    **/
    @RequestMapping("/toAdd")
    public ModelAndView toAdd(SysOrg sysOrg) {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("develop/org/sysOrgEdit");
        return mv;
    }


    /**
    * @描述: 保存
    * @作者: 郑坚侠
    * @日期: 2019/6/23 9:10
    **/

    @RequestMapping("/save")
    @ResponseBody
    public AjaxResult save(SysOrg sysOrg) {
        AjaxResult ajaxResult = new AjaxResult(true);
        sysOrg.setId(UUID.randomUUID().toString());
        sysOrg.setCreateTime(new Date());
        sysOrgService.save(sysOrg);
        return ajaxResult;
    }


    /**
    * @描述: 编辑
    * @作者: 郑坚侠
    * @日期: 2019/6/23 9:10
    **/

    @RequestMapping("/toEdit")
    public ModelAndView toEdit(SysOrg sysOrg) {
        ModelAndView mv = new ModelAndView();
        // 根据id查询用户信息
        sysOrg = sysOrgService.findById(sysOrg.getId());
        mv.addObject("sysOrg", sysOrg);
        mv.setViewName("develop/org/sysOrgEdit");
        return mv;
    }

    /**
    * @描述: 修改
    * @作者: 郑坚侠
    * @日期: 2019/6/23 9:10
    **/
    @RequestMapping("/update")
    @ResponseBody
    public AjaxResult update(SysOrg sysOrg) {
        AjaxResult ajaxResult = new AjaxResult(true);
        sysOrgService.update(sysOrg);
        return ajaxResult;
    }

    /**
    * @描述: 逻辑删除
    * @作者: 郑坚侠
    * @日期: 2019/6/24 8:57
    **/
    @RequestMapping("/delete")
    @ResponseBody
    public AjaxResult delete(SysOrg sysOrg) {
        AjaxResult ajaxResult = new AjaxResult(true);
        //sysOrg.setModifier("test");
        sysOrgService.delete(sysOrg);
        return ajaxResult;
    }

}