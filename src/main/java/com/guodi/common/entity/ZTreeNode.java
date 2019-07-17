package com.guodi.common.entity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * @描述：ztree插件实体类
 * @作者：彭辉
 * @时间：2019/1/11 11:19
 */
public class ZTreeNode implements Serializable {
    private static final long serialVersionUID = -8995432190410965350L;

    private String id;                  // 节点id
    private String name;                // 节点名称
    private String pId;                 // 父节点id
    private String icon;                // 自定义节点图标路径
    private String iconSkin;            // 自定义节点图标ClassName
    private String url;                 // 节点链接url
    private boolean isParent = false;   // 是否为父节点true/false
    private boolean open = false;       // 节点展开true/折叠false
    private boolean checked = false;    // 节点checkBox/radio的勾选状态
    private PageData pd;                // 自定义数据集map

    // 子节点集合
    private List<ZTreeNode> children = new ArrayList<ZTreeNode>();

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

    public String getpId() {
        return pId;
    }

    public void setpId(String pId) {
        this.pId = pId;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getIconSkin() {
        return iconSkin;
    }

    public void setIconSkin(String iconSkin) {
        this.iconSkin = iconSkin;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean getIsParent() {
        return isParent;
    }

    public void setIsParent(boolean isParent) {
        this.isParent = isParent;
    }

    public boolean isOpen() {
        return open;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public PageData getPd() {
        return pd;
    }

    public void setPd(PageData pd) {
        this.pd = pd;
    }

    public List<ZTreeNode> getChildren() {
        return children;
    }

    public void setChildren(List<ZTreeNode> children) {
        this.children = children;
    }
}
