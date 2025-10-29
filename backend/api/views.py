from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, City, Item, ItemPhoto, UserProfile
from .serializers import (
    CategorySerializer,
    CitySerializer,
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
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
        # Captura múltiplas imagens do request
        photos = self.request.FILES.getlist('photos')
        try:
            serializer.save(user=self.request.user, uploaded_photos=photos)
        except Exception as e:
            import traceback
            print(f"Erro ao criar item: {str(e)}")
            print(traceback.format_exc())
            raise
    
class DeleteItemView(generics.DestroyAPIView):
    name = "Delete Item"
    http_method_names = ["delete"]
    description = "Endpoint for deleting an item."
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Item.objects.filter(user=user)

class UpdateItemView(generics.UpdateAPIView):
    name = "Update Item"
    http_method_names = ["put", "patch"]
    description = "Endpoint for updating an item."
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

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
        user = self.request.user
        return Item.objects.filter(user=user)
    
class ReadItemsView(generics.ListAPIView):
    name = "Read Items"
    http_method_names = ["get"]
    description = "Endpoint for reading all items."
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Item.objects.all()
    
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response({"error": "Perfil não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    name = "User and Profile Update"
    http_method_names = ["get", "put", "patch"]
    serializer_class = UserSerializer 
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user
    
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer 
    permission_classes = [AllowAny]


class ListCategoriesView(generics.ListAPIView):
    """Lista todas as categorias disponíveis"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
class CreateCategoryView(generics.CreateAPIView):
    """Cria uma nova categoria"""
    name = "Create Category"
    http_method_names = ["post"]
    description = "Endpoint for creating a new category."
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.all()
    
    def perform_create(self, serializer):
        serializer.save()


class ListCitiesView(generics.ListAPIView):
    """Lista todas as cidades disponíveis"""
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_item_photos(request, item_id):
    try:
        item = Item.objects.get(id=item_id, user=request.user)
    except Item.DoesNotExist:
        return Response(
            {"error": "Item não encontrado ou você não tem permissão."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    photos = request.FILES.getlist('photos')
    
    if not photos:
        return Response(
            {"error": "Nenhuma foto foi enviada."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    current_count = item.photos.count()
    max_photos = 6
    
    if current_count >= max_photos:
        return Response(
            {"error": f"Este item já tem o máximo de {max_photos} fotos."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    available_slots = max_photos - current_count
    photos_to_upload = photos[:available_slots]
    
    created_photos = []
    for index, photo in enumerate(photos_to_upload, start=current_count + 1):
        item_photo = ItemPhoto.objects.create(
            item=item,
            image=photo,
            position=index
        )
        created_photos.append(item_photo)
    
    serializer = ItemPhotoSerializer(created_photos, many=True)
    
    return Response({
        "message": f"{len(created_photos)} foto(s) adicionada(s) com sucesso.",
        "photos": serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_item_photo(request, photo_id):
    try:
        photo = ItemPhoto.objects.get(id=photo_id, item__user=request.user)
        photo.delete()
        return Response(
            {"message": "Foto deletada com sucesso."},
            status=status.HTTP_204_NO_CONTENT
        )
    except ItemPhoto.DoesNotExist:
        return Response(
            {"error": "Foto não encontrada ou você não tem permissão."},
            status=status.HTTP_404_NOT_FOUND
        )
