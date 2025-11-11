from django.db import models

class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user_a_id = models.UUIDField()
    user_b_id = models.UUIDField()
    created_at = models.DateTimeField()
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "conversations"

class Message(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    conversation_id = models.UUIDField()
    sender_id = models.UUIDField()
    body = models.TextField()
    sent_at = models.DateTimeField()
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "messages"
