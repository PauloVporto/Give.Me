from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0009_alter_notification_table"),
    ]

    operations = [
        # CRÍTICO: Ordenação por data
        migrations.AddIndex(
            model_name="item",
            index=models.Index(fields=["-created_at"], name="item_created_idx"),
        ),
        # CRÍTICO: Itens do usuário
        migrations.AddIndex(
            model_name="item",
            index=models.Index(
                fields=["user_id", "-created_at"], name="item_user_created_idx"
            ),
        ),
        # ÚTIL: Filtros
        migrations.AddIndex(
            model_name="item",
            index=models.Index(fields=["type"], name="item_type_idx"),
        ),
        migrations.AddIndex(
            model_name="item",
            index=models.Index(fields=["listing_state"], name="item_state_idx"),
        ),
        # CRÍTICO: Fotos ordenadas
        migrations.AddIndex(
            model_name="itemphoto",
            index=models.Index(
                fields=["item_id", "position"], name="photo_item_pos_idx"
            ),
        ),
        # CRÍTICO: Favoritos
        migrations.AddIndex(
            model_name="favorite",
            index=models.Index(fields=["user_id", "item_id"], name="fav_user_item_idx"),
        ),
        # CRÍTICO: Chat lookup
        migrations.AddIndex(
            model_name="userprofile",
            index=models.Index(fields=["supabase_user_id"], name="profile_supa_id_idx"),
        ),
    ]
