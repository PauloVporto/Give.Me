"""
Script para limpar favoritos duplicados do banco de dados
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Favorite
from django.db.models import Count

def clean_duplicate_favorites():
    """Remove favoritos duplicados mantendo apenas o mais recente"""
    
    print("Buscando favoritos duplicados...")
    
    # Encontrar duplicatas (mesmo user e item)
    duplicates = (
        Favorite.objects.values('user_id', 'item_id')
        .annotate(count=Count('id'))
        .filter(count__gt=1)
    )
    
    if not duplicates:
        print("✅ Nenhuma duplicata encontrada!")
        return
    
    print(f"❌ Encontradas {len(duplicates)} duplicatas")
    
    total_deleted = 0
    
    for dup in duplicates:
        user_id = dup['user_id']
        item_id = dup['item_id']
        
        # Buscar todos os favoritos duplicados
        favorites = Favorite.objects.filter(
            user_id=user_id,
            item_id=item_id
        ).order_by('-created_at')
        
        # Manter apenas o mais recente (primeiro da lista)
        to_keep = favorites.first()
        to_delete = favorites.exclude(id=to_keep.id)
        
        count = to_delete.count()
        to_delete.delete()
        
        total_deleted += count
        print(f"  - Removidas {count} duplicatas para user={user_id}, item={item_id}")
    
    print(f"\n✅ Limpeza concluída! Total removido: {total_deleted} favoritos duplicados")

if __name__ == '__main__':
    clean_duplicate_favorites()
