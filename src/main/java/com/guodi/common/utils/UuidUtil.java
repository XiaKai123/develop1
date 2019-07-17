package com.guodi.common.utils;

import java.util.UUID;

/**
 * @description: 获取32位UUID
 * @author: 彭辉
 * @date: 2018/10/24 16:44
 */
public class UuidUtil {

    public static String get32UUID() {
        String uuid = UUID.randomUUID().toString().trim().replaceAll("-", "");
        return uuid;
    }

    public static void main(String[] args) {
        System.out.println(get32UUID());
    }
}
