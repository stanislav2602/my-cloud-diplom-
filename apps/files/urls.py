from django.urls import path
from . import views

app_name = 'files'

urlpatterns = [
    path('', views.FileListView.as_view(), name='file_list'),
    path('upload/', views.FileUploadView.as_view(), name='file_upload'),
    path('<int:file_id>/delete/', views.FileDeleteView.as_view(), name='file_delete'),
    path('<int:file_id>/rename/', views.FileRenameView.as_view(), name='file_rename'),
    path('<int:file_id>/comment/', views.FileCommentView.as_view(), name='file_comment'),
    path('<int:file_id>/download/', views.FileDownloadView.as_view(), name='file_download'),
    path('public/<uuid:token>/', views.PublicFileDownloadView.as_view(), name='public_download'),
]
