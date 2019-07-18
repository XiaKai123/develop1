package com.guodi.common;

import com.guodi.common.utils.JsonUtils;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;


@Service("redisServer")
public class RedisServerImpl implements RedisServer {

    @Autowired
    private StringRedisTemplate redisTemplate;

    public <T> void put(String key, T obj) {
        redisTemplate.opsForValue().set(key, JsonUtils.toJson(obj));
    }

    public <T> void put(String key, T obj, int timeout) {
        put(key,obj,timeout,TimeUnit.MINUTES);
    }

    public <T> void put(String key, T obj, int timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, JsonUtils.toJson(obj),timeout,unit);
    }

    public <T> T get(String key, Class<T> cls) {
        return JsonUtils.fromJson(JsonUtils.toJson(redisTemplate.opsForValue().get(key)), cls);
    }

   /* public <E, T extends Collection<E>> T get(String key, Class<E> cls, Class<T> collectionCls) {
        return JsonUtils.fromJson(JsonUtils.toJson(redisTemplate.opsForValue().get(key)), cls, collectionCls);
    }*/

    public <T> T putIfAbsent(String key, Class<T> cls, Supplier<T> supplier) {
        T t=get(key,cls);
        if(null==t){
            t=supplier.get();
            if(null!=t)
                put(key,t);
        }
        return t;
    }

    public <T> T putIfAbsent(String key, Class<T> cls, Supplier<T> supplier, int timeout) {
        T t=get(key,cls);
        if(null==t){
            t=supplier.get();
            if(null!=t)
                put(key,t,timeout);
        }
        return t;
    }

    public <E, T extends Collection<E>> T putIfAbsent(String key, Class<E> cls, Class<T> collectionCls,
                                                      Supplier<T> supplier) {
      /*  T t=get(key,cls,collectionCls);
        if(null==t || t.isEmpty()){
            t=supplier.get();
            if(null!=t && t.size()>0)
                put(key,t);
        }
        return t;*/
      return  null;
    }

    public boolean exists(String key) {
        return redisTemplate.hasKey(key);
    }

    public void del(String key) {
        redisTemplate.delete(key);
    }

    public boolean expire(String key, long timeout, TimeUnit unit) {
        return redisTemplate.expire(key, timeout, unit);
    }

    public boolean expire(String key, long timeout) {
        return redisTemplate.expire(key, timeout, TimeUnit.MINUTES);
    }

    public void put(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public void put(String key, String value, int timeout) {
        put(key,value,timeout,TimeUnit.MINUTES);
    }

    public void put(String key, String value, int timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    public String get(String key) {
        return (String) redisTemplate.opsForValue().get(key);
    }

    public void putHash(String key, Map<Object,Object> m) {
        redisTemplate.opsForHash().putAll(key, m);
    }

    public Map<Object, Object> getHash(String key) {
        try{
            return redisTemplate.opsForHash().entries(key);
        }catch(Exception e){
            return null;
        }

    }
    public String publish(){
        int m = 0;
        int index = m;
        for(int i=m;i<index+10;i++){
            redisTemplate.convertAndSend("mytopic", "这是我发第"+i+"条的消息啊");
        }
        return "结束";
    }


}