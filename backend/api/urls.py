from django.urls import path
from . import views, image_views

urlpatterns = [
    # Endpoints REST completos
    path("items/", views.ItemListCreateView.as_view(), name="items-list-create"),
    path("items/<uuid:id>/", views.ItemDetailView.as_view(), name="item-detail"),
    
    # Endpoints de upload de imagens
    path("items/<uuid:item_id>/images/", image_views.upload_item_images, name="upload-item-images"),
    path("items/<uuid:item_id>/images/<uuid:photo_id>/", image_views.delete_item_image, name="delete-item-image"),
    path("items/<uuid:item_id>/images/", image_views.get_item_images, name="get-item-images"),
]