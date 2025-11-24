from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Category, City, Favorite, Item, ItemPhoto, Notification, UserProfile
from .services import create_supabase_user, upload_item_photo


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name", "state"]


class ItemPhotoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ItemPhoto
        fields = ["id", "image", "url", "position", "created_at"]
        read_only_fields = ["id", "url", "created_at"]

    def get_url(self, obj):
        if obj.image:
            if isinstance(obj.image, str):
                return obj.image
            else:
                return None
        return obj.url or ""


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "reference_id",
            "message",
            "is_read",
            "created_at",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "photo_url",
            "city",
            "bio",
            "notifications_enabled",
            "supabase_user_id",
        ]
        read_only_fields = ["supabase_user_id"]


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
        password = validated_data.get("password")
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")

        validated_data["username"] = email

        try:
            supabase_user_id = create_supabase_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            user = User.objects.create_user(**validated_data)
            UserProfile.objects.create(user=user, supabase_user_id=supabase_user_id)
        except Exception as e:
            raise serializers.ValidationError(
                {"email": "Erro ao criar conta. Tente novamente ou contate o suporte."}
            )
        return user


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source="userprofile", required=False)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "password", "profile"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("userprofile", {})
        password = validated_data.pop("password", None)

        if "email" in validated_data:
            instance.username = validated_data["email"]
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
                    notification_type="profile",
                    message="Seu perfil e dados básicos foram atualizados!",
                )
        return user


class ItemSerializer(serializers.ModelSerializer):
    owner_supabase_user_id = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    city = CitySerializer(read_only=True)
    # city_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    city_name = serializers.CharField(write_only=True, required=False)
    city_state = serializers.CharField(write_only=True, required=False)
    photos = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    user = serializers.CharField(source="user.first_name", read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    photos_id = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            "id",
            "title",
            "user",
            "owner_supabase_user_id",
            "description",
            "category",
            "category_name",
            "city",
            "city_name",
            "city_state",
            "status",
            "listing_state",
            "created_at",
            "updated_at",
            "photos",
            "images",
            "type",
            "price",
            "trade_interest",
            "uploaded_photos",
            "photos_id",
        ]
        read_only_fields = [
            "user",
            "id",
            "created_at",
            "updated_at",
            "city",
            "owner_supabase_user_id",
        ]

    def get_owner_supabase_user_id(self, obj):
        try:
            return obj.user.userprofile.supabase_user_id
        except (AttributeError, UserProfile.DoesNotExist):
            return None

    def get_photos(self, obj):
        return [photo.image for photo in obj.photos.all().order_by("position")]

    def get_photos_id(self, obj):
        return [photo.id for photo in obj.photos.all().order_by("position")]

    def get_images(self, obj):
        return self.get_photos(obj)

    @transaction.atomic
    def create(self, validated_data):
        uploaded_photos = validated_data.pop("uploaded_photos", [])
        city_name = validated_data.pop("city_name", None)
        city_state = validated_data.pop("city_state", None)

        if city_name and city_state:
            city, created = City.objects.get_or_create(name=city_name, state=city_state)
            validated_data["city"] = city

        item = Item.objects.create(**validated_data)

        for index, photo_file in enumerate(uploaded_photos, start=1):
            try:
                filename = f"items/{item.id}_{photo_file.name}"
                image_url = upload_item_photo(photo_file, filename)

                ItemPhoto.objects.create(item=item, image=image_url, position=index)

            except Exception as e:
                raise serializers.ValidationError(
                    {"photos": f"Erro no upload para Supabase: {e}"}
                )

        return item


class FavoriteSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "item", "item_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
