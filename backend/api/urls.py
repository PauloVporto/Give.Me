from django.urls import path

from . import views
from .views import (
    CreateCategoryView,
    ListCategoriesView,
    ListCitiesView,
    UserProfileUpdateView,
    UserProfileView,
    SearchItemView,
    delete_item_photo,
    upload_item_photos,
    ListFavoritesView,
    AddFavoriteView,
    RemoveFavoriteView,
    check_favorite,
)

urlpatterns = [
    path("users/profile/", UserProfileView.as_view(), name="user-profile"),
    path("users/profile/update/", UserProfileUpdateView.as_view(), name="user-update"),
    path("items/", views.ReadItemsView.as_view(), name="get-items"),
    path("items/create/", views.CreateItemView.as_view(), name="items-create"),
    path("items/<uuid:pk>/", views.ReadItemView.as_view(), name="item-detail"),
    path("items/update/<uuid:pk>/", views.UpdateItemView.as_view(), name="update-item"),
    path("items/delete/<uuid:pk>/", views.DeleteItemView.as_view(), name="delete-item"),
    path("items/<uuid:item_id>/photos/", upload_item_photos, name="upload-item-photos"),
    path("items/photos/<uuid:photo_id>/", delete_item_photo, name="delete-item-photo"),
    path("categories/", ListCategoriesView.as_view(), name="list-categories"),
    path("categories/create/", CreateCategoryView.as_view(), name="create-category"),
    path("cities/", ListCitiesView.as_view(), name="list-cities"),
    path('search-items/', SearchItemView.as_view(), name='search-items'),
    # Favoritos
    path("favorites/", ListFavoritesView.as_view(), name="list-favorites"),
    path("favorites/add/", AddFavoriteView.as_view(), name="add-favorite"),
    path("favorites/remove/<uuid:item_id>/", RemoveFavoriteView.as_view(), name="remove-favorite"),
    path("favorites/check/<uuid:item_id>/", check_favorite, name="check-favorite"),
]
