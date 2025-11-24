from django.urls import path
from .views import CreateConversationView, SendMessageView, ListMessagesView, ListConversationsView

urlpatterns = [
    path("conversations/", ListConversationsView.as_view()),
    path("conversations/create/", CreateConversationView.as_view()),
    path("conversations/<uuid:conversation_id>/messages/send/", SendMessageView.as_view()),
    path("conversations/<uuid:conversation_id>/messages/", ListMessagesView.as_view()),
]
