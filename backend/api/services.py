import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from storages.backends.s3boto3 import S3Boto3Storage
from supabase import Client, create_client
from .models import ItemPhoto

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY")
)


@receiver(post_delete, sender=ItemPhoto)
def delete_file_on_itemphoto_delete(sender, instance, **kwargs):
    if instance.image:
        delete_item_photo_service(instance.image)




def create_supabase_user(email, password, first_name="", last_name=""):
    """
    Cria um usuário no Supabase Auth e retorna o UUID.
    Usa a API Admin do Supabase para criar usuário sem confirmação de email.
    """
    try:
        response = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"first_name": first_name, "last_name": last_name},
            }
        )

        if response and response.user:
            return response.user.id

    except Exception as e:
        print(f"ERRO AO CRIAR USUÁRIO NO SUPABASE: {e}")
        raise e


def upload_item_photo(uploaded_file, filename):
    try:
        storage = S3Boto3Storage()
        path = storage.save(filename, uploaded_file)
        print(f"orint do service {path}")
        url = storage.url(path)

        return url
    except Exception as e:
        print(f"ERRO CRÍTICO NO UPLOAD PARA SUPABASE: {e}")
        raise e


def delete_item_photo_service(image_url):
    try:
        storage = S3Boto3Storage()

        base_url = storage.url("")
        path = image_url.replace(base_url, "")
        storage.delete(path)

    except Exception as e:
        print(f"ERRO AO DELETAR FOTO DO STORAGE: {e}")
        raise e
