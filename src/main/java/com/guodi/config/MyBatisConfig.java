package com.guodi.config;

import com.alibaba.druid.filter.Filter;
import com.alibaba.druid.filter.stat.StatFilter;
import com.alibaba.druid.pool.DruidDataSource;
import com.guodi.common.pager.PageHelper;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Scope;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;


@Configuration(value = "mybatisConfig")
@EnableTransactionManagement
@MapperScan(basePackages = { "com.guodi.**.mapper"}, sqlSessionFactoryRef = "sqlSessionFactoryForPrimary")
@ConfigurationProperties(prefix="spring.datasource-primary")
public class MyBatisConfig {
	private String url;
	private String driverClassName;
	private String username;
	private String password;
	private String dialect;
	private String publicKey;
	private int min_idle;
	private int max_idle;
	private int max_active;
	private int initial_size;
	private String validation_query;
	private boolean test_on_borrow;
	public void setUrl(String url) {
		this.url = url;
	}

	public void setDriverClassName(String driverClassName) {
		this.driverClassName = driverClassName;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void setPublicKey(String publicKey) {
		this.publicKey = publicKey;
	}

	public void setMin_idle(int min_idle) {
		this.min_idle = min_idle;
	}

	public void setMax_idle(int max_idle) {
		this.max_idle = max_idle;
	}

	public void setMax_active(int max_active) {
		this.max_active = max_active;
	}

	public void setInitial_size(int initial_size) {
		this.initial_size = initial_size;
	}

	public void setValidation_query(String validation_query) {
		this.validation_query = validation_query;
	}

	public void setTest_on_borrow(boolean test_on_borrow) {
		this.test_on_borrow = test_on_borrow;
	}


	public Filter getStatFilter(){
		StatFilter sf = new StatFilter();
		sf.setLogSlowSql(true);
		sf.setSlowSqlMillis(1);
		return sf;
	}

	@Bean()
	@Primary
	public DataSource primaryDataSource() {
		DruidDataSource dds = null;
		try {
			dds = new DruidDataSource();
			dds.setUrl(url);
			dds.setUsername(username);
			dds.setPassword(password);
			setDriverClassName(driverClassName);
			dds.setMinIdle(min_idle);
			dds.setMaxActive(max_active);
			dds.setInitialSize(initial_size);
			dds.setValidationQuery(validation_query);
//			dds.setValidationQuery("SELECT 1 from DUAL");
			dds.setTestOnBorrow(test_on_borrow);
			dds.setFilters("log4j");
			List<Filter> filterList = new ArrayList<Filter>();
			filterList.add(getStatFilter());
			dds.setProxyFilters(filterList);
			/*保证空闲5分钟不会被断开*/
			dds.setMinEvictableIdleTimeMillis(300000);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return dds;
	}

	public Connection getConnect() {
		Connection conn = null;
		try {
			conn = primaryDataSource().getConnection();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return conn;
	}

	@Bean
	@Primary
	public JdbcTemplate getJdbcTemplate() {
		JdbcTemplate jdbcTemplate = new JdbcTemplate(primaryDataSource());
		return jdbcTemplate;
	}
	@Bean(name="sqlSessionTemplate",destroyMethod="close")
	@Scope("prototype")
	public SqlSessionTemplate  getSqlSessionTemplate()throws Exception {
		SqlSessionTemplate jdbcTemplate = new SqlSessionTemplate(sqlSessionFactoryForPrimary());
		return jdbcTemplate;
	}
	@Bean(name="sqlSessionFactoryForPrimary")
	public SqlSessionFactory sqlSessionFactoryForPrimary() throws Exception {
		SqlSessionFactoryBean ssfb = new SqlSessionFactoryBean();
		ssfb.setDataSource(primaryDataSource());
		//加入扫描Mapper.xml文件
		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		ssfb.setConfigLocation(resolver.getResource("classpath:mybatis/mybatis-config.xml"));
		ssfb.setMapperLocations(resolver.getResources("classpath*:mybatis/**/"+dialect+"/*Mapper.xml"));
		// 分页插件
		PageHelper pageHelper = new PageHelper();
		Properties properties = new Properties();
		properties.setProperty("dialect", dialect);
		properties.setProperty("reasonable", "true");
		pageHelper.setProperties(properties);
		// 添加插件
		ssfb.setPlugins(new Interceptor[] { pageHelper });
		return ssfb.getObject();
	}	
	
    public DataSourceTransactionManager transactionManagerForPrimary() {
        return new DataSourceTransactionManager(primaryDataSource());  
    }

	public String getDialect() {
		return dialect;
	}

	public void setDialect(String dialect) {
		this.dialect = dialect;
	}
}
