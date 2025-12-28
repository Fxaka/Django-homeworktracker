from django.urls import path
from . import views

app_name = 'grades'

urlpatterns = [
    path('record/<int:assignment_id>/', views.record_grade, name='record_grade'),
]