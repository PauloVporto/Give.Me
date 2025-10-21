import os
import uuid
from typing import Optional, List, Dict, Any
from django.core.files.uploadedfile import UploadedFile
from supabase import create_client, Client
from django.conf import settings


class SupabaseService:
    """Serviço para integração com Supabase (Storage + Database)"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        self.bucket_name = os.getenv('SUPABASE_BUCKET_NAME', 'item-images')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL e SUPABASE_ANON_KEY devem estar configurados no .env")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
    
    def upload_image(self, file: UploadedFile, item_id: str, position: int = 1) -> Optional[str]:
        """
        Faz upload de uma imagem para o Supabase Storage
        
        Args:
            file: Arquivo de imagem
            item_id: ID do item
            position: Posição da imagem (1, 2, 3, etc.)
        
        Returns:
            URL da imagem ou None se houver erro
        """
        try:
            # Gera nome único para o arquivo
            file_extension = file.name.split('.')[-1].lower()
            if file_extension not in ['jpg', 'jpeg', 'png', 'webp']:
                raise ValueError("Formato de arquivo não suportado")
            
            file_name = f"{item_id}/{position}_{uuid.uuid4().hex}.{file_extension}"
            
            # Faz upload para o Supabase Storage
            response = self.supabase.storage.from_(self.bucket_name).upload(
                file_name,
                file.read(),
                file_options={"content-type": file.content_type}
            )
            
            if response:
                # Retorna a URL pública da imagem
                return self.supabase.storage.from_(self.bucket_name).get_public_url(file_name)
            
        except Exception as e:
            print(f"Erro no upload da imagem: {e}")
            return None
    
    def create_item_photo(self, item_id: str, url: str, position: int) -> Optional[Dict[str, Any]]:
        """
        Cria um registro na tabela item_photos do Supabase
        
        Args:
            item_id: ID do item
            url: URL da imagem
            position: Posição da imagem
        
        Returns:
            Dados da foto criada ou None se houver erro
        """
        try:
            photo_data = {
                "item_id": item_id,
                "url": url,
                "position": position
            }
            
            response = self.supabase.table('item_photos').insert(photo_data).execute()
            
            if response.data:
                return response.data[0]
            
        except Exception as e:
            print(f"Erro ao criar registro na tabela item_photos: {e}")
            return None
    
    def get_item_photos(self, item_id: str) -> List[Dict[str, Any]]:
        """
        Busca todas as fotos de um item na tabela item_photos
        
        Args:
            item_id: ID do item
        
        Returns:
            Lista de fotos do item
        """
        try:
            response = self.supabase.table('item_photos').select('*').eq('item_id', item_id).order('position').execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Erro ao buscar fotos do item: {e}")
            return []
    
    def delete_item_photo(self, photo_id: str) -> bool:
        """
        Remove uma foto da tabela item_photos
        
        Args:
            photo_id: ID da foto
        
        Returns:
            True se removida com sucesso, False caso contrário
        """
        try:
            response = self.supabase.table('item_photos').delete().eq('id', photo_id).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Erro ao remover foto da tabela: {e}")
            return False
    
    def delete_image_from_storage(self, image_url: str) -> bool:
        """
        Remove uma imagem do Supabase Storage
        
        Args:
            image_url: URL da imagem a ser removida
        
        Returns:
            True se removida com sucesso, False caso contrário
        """
        try:
            # Extrai o nome do arquivo da URL
            file_name = image_url.split('/')[-1]
            item_folder = image_url.split('/')[-2]
            full_path = f"{item_folder}/{file_name}"
            
            # Remove o arquivo
            response = self.supabase.storage.from_(self.bucket_name).remove([full_path])
            return response is not None
            
        except Exception as e:
            print(f"Erro ao remover imagem do storage: {e}")
            return False
    
    def upload_multiple_images(self, files: List[UploadedFile], item_id: str) -> List[Dict[str, Any]]:
        """
        Faz upload de múltiplas imagens e cria registros na tabela item_photos
        
        Args:
            files: Lista de arquivos de imagem
            item_id: ID do item
        
        Returns:
            Lista de dados das fotos criadas
        """
        photos_created = []
        
        for i, file in enumerate(files, 1):
            # Faz upload da imagem
            url = self.upload_image(file, item_id, i)
            if url:
                # Cria registro na tabela item_photos
                photo_data = self.create_item_photo(item_id, url, i)
                if photo_data:
                    photos_created.append(photo_data)
        
        return photos_created
    
    def delete_all_item_photos(self, item_id: str) -> bool:
        """
        Remove todas as fotos de um item (storage + database)
        
        Args:
            item_id: ID do item
        
        Returns:
            True se todas foram removidas com sucesso
        """
        try:
            # Busca todas as fotos do item
            photos = self.get_item_photos(item_id)
            
            # Remove cada foto
            for photo in photos:
                # Remove do storage
                self.delete_image_from_storage(photo['url'])
                # Remove da tabela
                self.delete_item_photo(photo['id'])
            
            return True
            
        except Exception as e:
            print(f"Erro ao remover todas as fotos do item: {e}")
            return False


# Instância global do serviço
supabase_service = SupabaseService()
