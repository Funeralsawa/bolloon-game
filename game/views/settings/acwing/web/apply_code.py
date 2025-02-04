from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = '6916'
    redirect_uri = quote("https://app6916.acapp.acwing.com.cn/settings/acwing/web/receive_code/")  # 打包url替换特殊字符
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200) #有效期2小时
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': 'success',
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state),

    })
