from django.conf.urls import url
from . import views
from django.views.generic.base import RedirectView # need to import this for the rediection of non-existing URLs below

urlpatterns = [
    url(r'^$', views.index),
    url(r'^check$', views.check),
    url(r'^clearsession$', views.clearSession),
    url(r'^belt/(?P<color>.+)$', views.belt), # anything after belt will match and go to views.belt where I will only look for the correct string "yellow", "red", "black"
    url(r'^.*$', RedirectView.as_view(url='/', permanent=False)) # redirect anything not matching one of the above URLs to the index page
]
