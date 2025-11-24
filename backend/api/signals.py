from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import UserProfile
from .services import delete_supabase_user


@receiver(pre_delete, sender=User)
def delete_supabase_user_on_django_user_delete(sender, instance, **kwargs):
    """
    Signal para deletar o usuário do Supabase quando um usuário do Django for deletado.
    """
    try:
        profile = UserProfile.objects.filter(user=instance).first()
        if profile and profile.supabase_user_id:
            delete_supabase_user(profile.supabase_user_id)
    except Exception as e:
        print(f"ERRO NO SIGNAL DE DELEÇÃO DO USUÁRIO: {e}")
