from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Item, Category, City, ItemPhoto

class UserSerializer(serializers.ModelSerializer):
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
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'state']


class ItemPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPhoto
        fields = ['id', 'url', 'position', 'created_at']


class ItemListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de items (dados básicos)"""
    category = CategorySerializer(read_only=True)
    city = CitySerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    photos = ItemPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'city', 
            'status', 'listing_state', 'user', 'photos', 
            'created_at', 'updated_at'
        ]


class ItemSerializer(serializers.ModelSerializer):
    """Serializer completo para detalhes e criação de items"""
    category = CategorySerializer(read_only=True)
    city = CitySerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    photos = ItemPhotoSerializer(many=True, read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=True)
    city_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'category_id',
            'city', 'city_id', 'status', 'listing_state', 'user', 
            'photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Remove os campos write_only antes de criar
        category_id = validated_data.pop('category_id')
        city_id = validated_data.pop('city_id', None)
        
        # Busca as instâncias
        category = Category.objects.get(id=category_id)
        city = City.objects.get(id=city_id) if city_id else None
        
        # Cria o item
        item = Item.objects.create(
            category=category,
            city=city,
            **validated_data
        )
        return item

    def update(self, instance, validated_data):
        # Atualiza category e city se fornecidos
        if 'category_id' in validated_data:
            category_id = validated_data.pop('category_id')
            instance.category = Category.objects.get(id=category_id)
        
        if 'city_id' in validated_data:
            city_id = validated_data.pop('city_id')
            instance.city = City.objects.get(id=city_id) if city_id else None
        
        # Atualiza os outros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance