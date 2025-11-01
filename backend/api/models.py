import uuid

from django.contrib.auth.models import User
from django.db import models


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(unique=True, null=False)
    slug = models.TextField(unique=True, null=False)

    def __str__(self):
        return self.name


class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(null=False)
    state = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.state})" if self.state else self.name


class Item(models.Model):

    STATUS_CHOICES = [("new", "Novo"), ("used", "Usado")]
    LISTING_STATE_CHOICES = [("active", "Ativo"), ("inactive", "Inativo")]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    title = models.TextField()
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="items"
    )
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, null=False)
    listing_state = models.CharField(
        max_length=20, choices=LISTING_STATE_CHOICES, default="active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ItemPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to='items/%Y/%m/%d/', null=True, blank=True)
    url = models.TextField(null=True, blank=True)  # Mantém para compatibilidade com URLs externas
    position = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def get_url(self):
        """Retorna a URL da imagem (local ou externa)"""
        if self.image:
            return self.image.url
        return self.url or ''


class UserProfile(models.Model):
    # Ligação 1 para 1 com o User. Se o user for deletado, o perfil também é.
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    photo_url = models.TextField(null=True, blank=True)
    City = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    Bio = models.CharField(max_length=255, null=True, blank=True)
    notifications_enabled = models.BooleanField(default=True)
    supabase_user_id = models.UUIDField(unique=True, null=True, blank=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class Notification(models.Model):
    NOTIFICATION_TYPE = [
        ("profile", "Perfil"),
        ("item", "Item"),
        ("system", "Sistema"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE)
    reference_id = models.UUIDField(null=True, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
