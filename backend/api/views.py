import traceback

from api.permissions import IsAdmin, IsAdminOrOwner, IsOwner
from django.contrib.auth.models import User
from rest_framework import filters, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, City, Favorite, Item, ItemPhoto, UserProfile
from .serializers import (
    CategorySerializer,
    CitySerializer,
    FavoriteSerializer,
    ItemPhotoSerializer,
    ItemSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    UserSerializer,
)


class CreateUserView(generics.CreateAPIView):
    name = "Cadastro de Usuário"
    http_method_names = ["post"]
    description = "Endpoint for creating a new user."
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]


class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]


class CreateItemView(generics.CreateAPIView):
    name = "Create Item"
    http_method_names = ["post"]
    description = "Endpoint for creating a new item."
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(user=user)

    def perform_create(self, serializer):
        photos = self.request.FILES.getlist("photos")
        try:
            serializer.save(user=self.request.user, uploaded_photos=photos)
        except Exception as e:
            print(f"Erro ao criar item: {str(e)}")
            print(traceback.format_exc())
            raise


class DeleteItemView(generics.DestroyAPIView):
    name = "Delete Item"
    http_method_names = ["delete"]
    description = "Endpoint for deleting an item."
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(user=user)


class UpdateItemView(generics.UpdateAPIView):
    name = "Update Item"
    http_method_names = ["put", "patch", "get"]
    description = "Endpoint for updating an item."
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(user=user)


class ReadItemView(generics.RetrieveAPIView):
    name = "Read Item"
    http_method_names = ["get"]
    description = "Endpoint for reading an item."
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        #     user = self.request.user
        #     return Item.objects.filter(user=user)
        return Item.objects.all()


class ReadItemsView(generics.ListAPIView):
    name = "Read Items"
    http_method_names = ["get"]
    description = "Endpoint for reading all items."
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Item.objects.all()


class MyItemsView(generics.ListAPIView):
    name = "My Items"
    http_method_names = ["get"]
    description = "Endpoint for reading items of authenticated user."
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(user=user).order_by("-created_at")


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Perfil não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    name = "User and Profile Update"
    http_method_names = ["get", "put", "patch"]
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_object(self):
        return self.request.user


class ListCategoriesView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class CreateCategoryView(generics.CreateAPIView):
    name = "Create Category"
    http_method_names = ["post"]
    description = "Endpoint for creating a new category."
    serializer_class = CategorySerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Category.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class ListCitiesView(generics.ListAPIView):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [AllowAny]


class SearchItemView(generics.ListAPIView):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ["title"]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsOwner])
def upload_item_photos(request, item_id):
    try:
        item = Item.objects.get(id=item_id, user=request.user)
    except Item.DoesNotExist:
        return Response(
            {"error": "Item não encontrado ou você não tem permissão."},
            status=status.HTTP_404_NOT_FOUND,
        )

    photos = request.FILES.getlist("photos")

    if not photos:
        return Response(
            {"error": "Nenhuma foto foi enviada."}, status=status.HTTP_400_BAD_REQUEST
        )

    current_count = item.photos.count()
    max_photos = 6

    if current_count >= max_photos:
        return Response(
            {"error": f"Este item já tem o máximo de {max_photos} fotos."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    available_slots = max_photos - current_count
    photos_to_upload = photos[:available_slots]

    created_photos = []
    for index, photo in enumerate(photos_to_upload, start=current_count + 1):
        item_photo = ItemPhoto.objects.create(item=item, image=photo, position=index)
        created_photos.append(item_photo)

    serializer = ItemPhotoSerializer(created_photos, many=True)

    return Response(
        {
            "message": f"{len(created_photos)} foto(s) adicionada(s) com sucesso.",
            "photos": serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsOwner])
def delete_item_photo(request, photo_id):
    try:
        photo = ItemPhoto.objects.get(id=photo_id, item__user=request.user)
        photo.delete()
        return Response(
            {"message": "Foto deletada com sucesso."}, status=status.HTTP_204_NO_CONTENT
        )
    except ItemPhoto.DoesNotExist:
        return Response(
            {"error": "Foto não encontrada ou você não tem permissão."},
            status=status.HTTP_404_NOT_FOUND,
        )


class ListFavoritesView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by("-created_at")


class AddFavoriteView(generics.CreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        item_id = request.data.get("item_id")

        existing_favorite = Favorite.objects.filter(
            user=request.user, item_id=item_id
        ).first()

        if existing_favorite:
            serializer = self.get_serializer(existing_favorite)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)


class RemoveFavoriteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def delete(self, request, item_id):
        try:
            favorite = Favorite.objects.get(user=request.user, item_id=item_id)
            favorite.delete()
            return Response(
                {"message": "Item removido dos favoritos."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Favorite.DoesNotExist:
            return Response(
                {"error": "Favorito não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_favorite(request, item_id):
    is_favorited = Favorite.objects.filter(user=request.user, item_id=item_id).exists()
    return Response({"is_favorited": is_favorited})
