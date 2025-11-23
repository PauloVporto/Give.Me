import uuid

from django.contrib.auth.models import User
from django.db import models


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(unique=True, null=False)
    slug = models.TextField(unique=True, null=False)

    class Meta:
        db_table = "category"

    def __str__(self) -> str:
        return str(self.name)


class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(null=False)
    state = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "city"

    def __str__(self) -> str:
        return f"{self.name} ({self.state})" if self.state else self.name


class Item(models.Model):
    STATUS_CHOICES = [("new", "Novo"), ("used", "Usado")]
    LISTING_STATE_CHOICES = [("active", "Ativo"), ("inactive", "Inativo")]
    TYPE_CHOICES = [("Sell", "Venda"), ("Donation", "Doação"), ("Trade", "Troca")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    title = models.TextField()
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="Sell")
    price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )  # Preço para items do tipo Sell
    trade_interest = models.TextField(
        null=True, blank=True
    )  # Campo para interesse de troca
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

    class Meta:
        db_table = "item"

    def __str__(self):
        return str(self.title)


class ItemPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="photos")
    image = models.CharField(max_length=500)
    url = models.TextField(null=True, blank=True)
    position = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "itemphoto"

    def get_url(self):
        if self.image:
            return self.image.url
        return self.url or ""


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    photo_url = models.TextField(null=True, blank=True)
    city = models.ForeignKey(
        City, on_delete=models.SET_NULL, null=True, blank=True, db_column="city_id"
    )
    bio = models.CharField(max_length=255, null=True, blank=True, db_column="bio")
    notifications_enabled = models.BooleanField(default=True)
    supabase_user_id = models.UUIDField(unique=True, null=True, blank=True)

    class Meta:
        db_table = "userprofile"  # ← versão mantida

    def __str__(self) -> str:
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


class Favorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    item = models.ForeignKey(
        Item, on_delete=models.CASCADE, related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "favorite"
        unique_together = (
            "user",
            "item",
        )  # Cada usuário pode favoritar um item apenas uma vez

    def __str__(self):
        return f"{self.user.username} - {self.item.title}"
