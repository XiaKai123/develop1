package com.guodi.common;

import redis.clients.jedis.Jedis;

/**
 * @Author: qlq
 * @Description
 * @Date: 22:34 2018/10/9
 */
public class MessageConsumer implements Runnable {
    public static final String MESSAGE_KEY = "message:queue";
    private volatile int count;

    public void consumerMessage() {
        Jedis jedis = JedisPoolUtils.getJedis();
        String message = jedis.rpop(MESSAGE_KEY);
        System.out.println(Thread.currentThread().getName() + " consumer message,message=" + message + ",count=" + count);
        count++;
    }

    @Override
    public void run() {
        while (true) {
            consumerMessage();
        }
    }

    public static void main(String[] args) {
        MessageConsumer messageConsumer = new MessageConsumer();
        Thread t1 = new Thread(messageConsumer, "thread6");
        Thread t2 = new Thread(messageConsumer, "thread7");
        t1.start();
        t2.start();
    }
}