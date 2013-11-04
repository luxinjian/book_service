##书库模型安装
###所需环境
1. sails v0.9.4
2. postgresql 9.3rc1

###安装步骤
1. 创建所需数据库  
`$ /path/to/pgsql/ bin/createdb bookhub  （例如 /usr/local/pgsql bin/createdb bookhub` 
2. 下载源码  
`$ git clone git@github.com:luxinjian/book_service.git` 
3. 进入项目目录并安装组件  
`$ cd book_service`  
`book_service$ npm`
3. 启动项目  
`book_service$ sails lift` 
4. 浏览器访问  
<http://localhost:3000>
