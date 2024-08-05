from django.http import HttpResponse

def index(request):
    line1 = '<h1 style = "text-align: center">傻逼百科！</h1>'

    return HttpResponse(line1)
