from django.shortcuts import render # 在服务器端渲染html文件

def index(request):
    return render(request, "multiends/web.html")
