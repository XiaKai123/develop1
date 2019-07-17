package com.guodi.common.dao;

import java.util.List;
import java.util.Map;

/**
 * @description:编码到值转换类
 * @author:郝明才
 * @date:2018/10/26 16:21
 **/
public interface IConvertService {
    /**
     * @描述:获取子项的值
     * @入参: type：编码类型如：SEX code:1
     * @出参:
     * @作者:郝明才
     * @最后修改日期:   2018/10/25 10:32
     **/
    public String getText(String type, String code);
    /**
     * @描述:批量转码
     * @入参:  list:格式如[{typeCode：'SEX',itemCode:'1'},{typeCode：'SEX',itemCode:'0'}]
     * @出参:
     * @作者:郝明才
     * @最后修改日期:   2018/10/25 10:15
     **/
    public Map<String,String> getTexts(List<Map<String, String>> list);
    /**
     * @描述:编码实体转值
     * @入参: T t：待转实体, Map<String, String> keys：待转字段
     * @作者: 郝明才
     * @日期: 2018/10/26 16:09
     **/
    public <T> T toEntity(T t, Map<String, String> keys);
    /**
     * @描述:编码实体或Map转值Map
     * @入参: T t：待转实体, Map<String, String> keys：待转字段
     * @作者: 郝明才
     * @日期: 2018/10/26 16:09
     **/
    <T> Map<String, Object> toMap(T t, Map<String, String> keys);

    /**
     * @描述:编码实体或Map List转值Map List
     * @入参: tList：待转实体列表, Map<String, String> keys：待转字段
     * @作者: 郝明才
     * @日期: 2018/10/26 16:09
     **/
    List<Map<String, String>> toMapList(List tList, Map<String, String> keys);

    /**
     * @描述:编码实体List转值实体List
     * @入参: tList：待转实体列表, Map<String, String> keys：待转字段
     * @作者: 郝明才
     * @日期: 2018/10/26 16:09
     **/
    <T> List toEntityList(List tList, Map<String, String> keys);

    /**
     * @描述:编码转值
     * @入参: typeCode字典类型，itemCode编码
     * @作者: 郝明才
     * @日期: 2018/10/26 16:09
     **/
    String toValue(String typeCode, String itemCode);

    /**
    * @描述:默认日期转换格式改变
    * @入参: format：格式如'yyyy-MM-dd HH:mm'
    * @出参:
    * @作者: 郝明才
    * @日期: 2018/10/29 9:23
    **/
    void setDateFormat(String format);
}
