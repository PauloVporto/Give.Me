from django.contrib import admin
from .models import Item, Category, City, ItemPhoto

# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name', 'slug']

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'state']
    search_fields = ['name', 'state']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'category', 'city', 'status', 'listing_state', 'created_at']
    list_filter = ['status', 'listing_state', 'category', 'city', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(ItemPhoto)
class ItemPhotoAdmin(admin.ModelAdmin):
    list_display = ['item', 'position', 'created_at']
    list_filter = ['created_at']
    search_fields = ['item__title']
