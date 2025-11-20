from storages.backends.s3boto3 import S3Boto3Storage
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import ItemPhoto


@receiver(post_delete, sender=ItemPhoto)
def delete_file_on_itemphoto_delete(sender, instance, **kwargs):
    if instance.image:
        delete_item_photo(instance.image)


def upload_item_photo(uploaded_file, filename):
    try:
        storage = S3Boto3Storage()
        path = storage.save(filename, uploaded_file)
        url = storage.url(path)
        
        return url
    except Exception as e:
        print(f"ERRO CRÍTICO NO UPLOAD PARA SUPABASE: {e}")
        raise e
    


def delete_item_photo(image_url):
    try:
        storage = S3Boto3Storage()

        base_url = storage.url("")
        path = image_url.replace(base_url, "")
        storage.delete(path)
  
                

    except Exception as e:
        print(f"ERRO AO DELETAR FOTO DO STORAGE: {e}")
        raise e


