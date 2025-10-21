from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.files.uploadedfile import UploadedFile
from .models import Item
from .services import supabase_service


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_item_images(request, item_id):
    """
    POST /items/:id/images - Upload de múltiplas imagens para um item
    """
    try:
        # Busca o item e verifica se o usuário é o dono
        item = get_object_or_404(Item, id=item_id, user=request.user)
        
        # Verifica se há arquivos na requisição
        files = request.FILES.getlist('images')
        if not files:
            return Response(
                {'error': 'Nenhuma imagem foi enviada'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Valida o número máximo de imagens (ex: 5)
        if len(files) > 5:
            return Response(
                {'error': 'Máximo de 5 imagens por item'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove imagens existentes se necessário
        existing_photos = supabase_service.get_item_photos(str(item_id))
        if existing_photos:
            supabase_service.delete_all_item_photos(str(item_id))
        
        # Faz upload das novas imagens e cria registros na tabela item_photos
        photos_created = supabase_service.upload_multiple_images(files, str(item_id))
        
        if not photos_created:
            return Response(
                {'error': 'Falha no upload das imagens'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'message': f'{len(photos_created)} imagens enviadas com sucesso',
            'photos': photos_created
        }, status=status.HTTP_201_CREATED)
        
    except Item.DoesNotExist:
        return Response(
            {'error': 'Item não encontrado ou você não tem permissão'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erro interno: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_item_image(request, item_id, photo_id):
    """
    DELETE /items/:id/images/:photo_id - Remove uma imagem específica
    """
    try:
        # Busca o item e verifica se o usuário é o dono
        item = get_object_or_404(Item, id=item_id, user=request.user)
        
        # Busca a foto na tabela item_photos do Supabase
        photos = supabase_service.get_item_photos(str(item_id))
        photo = next((p for p in photos if p['id'] == photo_id), None)
        
        if not photo:
            return Response(
                {'error': 'Imagem não encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Remove do storage
        supabase_service.delete_image_from_storage(photo['url'])
        
        # Remove da tabela item_photos
        supabase_service.delete_item_photo(photo_id)
        
        return Response(
            {'message': 'Imagem removida com sucesso'}, 
            status=status.HTTP_204_NO_CONTENT
        )
        
    except Item.DoesNotExist:
        return Response(
            {'error': 'Item não encontrado ou você não tem permissão'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erro interno: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_item_images(request, item_id):
    """
    GET /items/:id/images - Lista todas as imagens de um item
    """
    try:
        # Busca o item e verifica se o usuário é o dono
        item = get_object_or_404(Item, id=item_id, user=request.user)
        
        # Busca as fotos na tabela item_photos do Supabase
        photos = supabase_service.get_item_photos(str(item_id))
        
        return Response({
            'photos': photos
        }, status=status.HTTP_200_OK)
        
    except Item.DoesNotExist:
        return Response(
            {'error': 'Item não encontrado ou você não tem permissão'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erro interno: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
