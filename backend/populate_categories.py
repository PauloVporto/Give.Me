import os
import django
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Category

def slugify(text):
    """Converte texto para slug (remove acentos e caracteres especiais)"""
    text = text.lower()
    # Remove acentos
    replacements = {
        'á': 'a', 'â': 'a', 'ã': 'a', 'à': 'a',
        'é': 'e', 'ê': 'e',
        'í': 'i',
        'ó': 'o', 'ô': 'o', 'õ': 'o',
        'ú': 'u', 'ü': 'u',
        'ç': 'c'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Remove caracteres especiais e substitui espaços por hífens
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

categories = [
    'Eletrônicos',
    'Roupas e Acessórios', 
    'Móveis',
    'Livros',
    'Esportes',
    'Brinquedos',
    'Casa e Decoração',
    'Ferramentas',
    'Outros'
]

for cat_name in categories:
    slug = slugify(cat_name)
    cat, created = Category.objects.get_or_create(
        name=cat_name,
        defaults={'slug': slug}
    )
    if created:
        print(f'✓ Categoria "{cat_name}" criada (slug: {slug})')
    else:
        # Atualiza o slug se estiver vazio
        if not cat.slug:
            cat.slug = slug
            cat.save()
            print(f'→ Categoria "{cat_name}" atualizada com slug: {slug}')
        else:
            print(f'→ Categoria "{cat_name}" já existe (slug: {cat.slug})')

print(f'\nTotal de categorias: {Category.objects.count()}')
