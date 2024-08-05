from django.http import HttpResponse

def index(request):
    line1 = '<h1 style = "text-align: center">傻逼百科！</h1>'
    line2 = '<img src = "https://cdn.luogu.com.cn/upload/image_hosting/lwdtsjz8.png" width = 2000>'
    line3 = '<hr>'
    line4 = '<a href="play/">点击查看泳装钢</a>'
    return HttpResponse(line1 + line4 + line3 + line2)

def play(request):
    line1 = '<h1 style = "text-align: center">泳装钢</h1>'
    line2 = '<img src = "https://cdn.luogu.com.cn/upload/image_hosting/h9xcvvdk.png" width = 2000>'
    line3 = '<hr>'
    line4 = '<a href="/">返回主页面</a>'
    return HttpResponse(line1 + line4 + line3 + line2)
