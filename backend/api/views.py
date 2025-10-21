from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Item, Category, City, ItemPhoto
from .serializers import UserSerializer, ItemSerializer, ItemListSerializer


class CreateUserView(generics.CreateAPIView):
    name = "Cadastro de Usuário"
    http_method_names = ["post"]
    description = "Endpoint for creating a new user."
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ItemListCreateView(generics.ListCreateAPIView):
    """
    GET /items - Lista todos os items (público)
    POST /items - Cria um novo item (autenticado)
    """
    name = "Items List/Create"
    description = "List all items or create a new item"
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ItemSerializer
        return ItemListSerializer
    
    def get_queryset(self):
        # Para GET: retorna todos os items ativos
        # Para POST: retorna items do usuário (usado para validação)
        if self.request.method == 'GET':
            return Item.objects.filter(listing_state='active').select_related('user', 'category', 'city')
        return Item.objects.filter(user=self.request.user)
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /items/:id - Detalhes do item (público)
    PUT /items/:id - Atualiza item (somente dono)
    DELETE /items/:id - Remove item (somente dono)
    """
    name = "Item Detail"
    description = "Get, update or delete a specific item"
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ItemSerializer
        return ItemSerializer
    
    def get_queryset(self):
        if self.request.method == 'GET':
            # Para GET: qualquer item ativo
            return Item.objects.filter(listing_state='active').select_related('user', 'category', 'city')
        else:
            # Para PUT/DELETE: somente items do usuário
            return Item.objects.filter(user=self.request.user)
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        """GET /items/:id - Detalhes públicos do item"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """PUT /items/:id - Atualiza item (somente dono)"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """DELETE /items/:id - Remove item (somente dono)"""
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

