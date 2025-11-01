import uuid
from django.db import connection, transaction
from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from .models import Conversation, Message

def my_supa_uuid(request):
    up = getattr(request.user, "userprofile", None)
    if not up or not up.supabase_user_id:
        raise ValidationError("Vincule seu supabase_user_id no perfil antes de usar o chat.")
    return up.supabase_user_id

def is_participant(conv, me):
    return str(conv.user_a_id) == str(me) or str(conv.user_b_id) == str(me)

class CreateConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        me = my_supa_uuid(request)
        peer = request.data.get("peer_supabase_user_id")
        if not peer:
            raise ValidationError({"peer_supabase_user_id": "Obrigatório"})
        if str(me) == str(peer):
            raise ValidationError("Conversa 1:1 requer usuários distintos.")

        # Tenta achar conversa existente (independe da ordem)
        existing = list(Conversation.objects.raw("""
            select * from conversations
             where (user_a_id = %s and user_b_id = %s)
                or (user_a_id = %s and user_b_id = %s)
             limit 1
        """, [me, peer, peer, me]))

        if existing:
            c = existing[0]
        else:
            conv_id = str(uuid.uuid4())
            a, b = sorted([str(me), str(peer)])
            with connection.cursor() as cur:
                cur.execute("""
                    insert into conversations (id, user_a_id, user_b_id, created_at, last_message_at)
                    values (%s, %s, %s, now(), null)
                """, [conv_id, a, b])
            c = Conversation.objects.get(pk=conv_id)

        return Response({"id": str(c.id), "user_a_id": str(c.user_a_id), "user_b_id": str(c.user_b_id)}, status=201)

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, conversation_id):
        me = my_supa_uuid(request)
        try:
            conv = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            raise NotFound("Conversa não encontrada.")

        if not is_participant(conv, me):
            raise PermissionDenied("Você não participa desta conversa.")

        body = (request.data.get("body") or "").strip()
        if not body:
            raise ValidationError({"body": "Mensagem vazia."})

        msg_id = str(uuid.uuid4())
        now = timezone.now()

        with connection.cursor() as cur:
            cur.execute("""
                insert into messages (id, conversation_id, sender_id, body, sent_at)
                values (%s, %s, %s, %s, %s)
            """, [msg_id, str(conv.id), str(me), body, now])
            cur.execute("update conversations set last_message_at = %s where id = %s",
                        [now, str(conv.id)])

        return Response(
            {"id": msg_id, "conversation_id": str(conv.id), "sender_id": str(me), "body": body, "sent_at": now},
            status=201
        )

class ListMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        me = my_supa_uuid(request)
        try:
            conv = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            raise NotFound("Conversa não encontrada.")

        if not is_participant(conv, me):
            raise PermissionDenied("Você não participa desta conversa.")

        rows = Message.objects.filter(conversation_id=conversation_id).order_by("-sent_at")[:200]
        return Response([{
            "id": str(r.id), "sender_id": str(r.sender_id),
            "body": r.body, "sent_at": r.sent_at, "read_at": r.read_at
        } for r in rows])
