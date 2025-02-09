# 第一个关于django的项目

> 于2024.12.22重启

### 启动https
```
uwsgi --ini scripts/uwsgi.ini
```

### 启动wss
在acweb/目录下运行：  

```
daphne -b 0.0.0.0 -p 5015 acapp.asgi:application
```
