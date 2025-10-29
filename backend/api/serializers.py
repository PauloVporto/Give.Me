from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Category, City, Item, ItemPhoto, Notification, UserProfile


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'state']


class ItemPhotoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemPhoto
        fields = ['id', 'image', 'url', 'position', 'created_at']
        read_only_fields = ['id', 'url', 'created_at']
    
    def get_url(self, obj):
        return obj.get_url()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'reference_id', 'message', 'is_read', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["photo_url",'City','Bio','notifications_enabled'] 

class UserCreateSerializer(serializers.ModelSerializer): 
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )  
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }
    def create(self, validated_data):
        email = validated_data.get("email")
        validated_data["username"] = email
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', required=False) 
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "password", "profile"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        password = validated_data.pop('password', None)
        
        if 'email' in validated_data:
            instance.username = validated_data['email']
        if password:
            instance.set_password(password)

        user = super().update(instance, validated_data) 
        if profile_data:
            profile_instance = user.userprofile 
            
            for attr, value in profile_data.items():
                setattr(profile_instance, attr, value)
            
            profile_instance.save()
        
            if profile_instance.notifications_enabled:
                Notification.objects.create(
                    user=user,
                    notification_type='profile',
                    message='Seu perfil e dados básicos foram atualizados!'
                )
        return user
    
class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    city = CitySerializer(read_only=True)
    city_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    photos = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()  # Para compatibilidade com o frontend
    type = serializers.CharField(write_only=True, required=False, default='Trade')  # Sell, Trade, ou Donation
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Item
        fields = ['id', 'title', 'description', 'category', 'category_name', 
                 'city', 'city_id', 'status', 'listing_state', 'created_at', 
                 'updated_at', 'photos', 'images', 'type', 'uploaded_photos']
        read_only_fields = ['user', 'id', 'created_at', 'updated_at', 'city']

    def get_photos(self, obj):
        return [photo.get_url() for photo in obj.photos.all().order_by('position')]
        
    def get_images(self, obj):
        # Para manter compatibilidade com o frontend que espera 'images'
        return self.get_photos(obj)

    def create(self, validated_data):
        # Remover campos que não pertencem ao modelo Item
        uploaded_photos = validated_data.pop('uploaded_photos', [])
        validated_data.pop('type', None)  # Remove 'type' pois não está no modelo
        city_id = validated_data.pop('city_id', None)
        
        # Se city_id foi fornecido, buscar o objeto City
        if city_id:
            try:
                from .models import City
                validated_data['city'] = City.objects.get(id=city_id)
            except City.DoesNotExist:
                validated_data['city'] = None
        else:
            # Se não tem city_id, remover city do validated_data (pode vir como string do frontend)
            validated_data.pop('city', None)
        
        item = Item.objects.create(**validated_data)
        
        # Criar ItemPhoto para cada imagem enviada
        for index, photo in enumerate(uploaded_photos, start=1):
            ItemPhoto.objects.create(
                item=item,
                image=photo,
                position=index
            )
        
        return item



