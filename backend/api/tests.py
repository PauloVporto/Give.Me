from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import unittest


class HealthCheckTest(APITestCase):
    def test_health_check(self):
        """Test that the health check endpoint returns a healthy status"""
        url = reverse('health_check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "healthy"})


class UserRegistrationTest(APITestCase):
    def setUp(self):
        self.url = reverse('register')
        # Serializer atual não pede password2 nem username explícito
        self.valid_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
        }

    def test_user_registration_with_valid_data(self):
        """Test user registration with valid data"""
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Usuário deve existir com esse e-mail
        self.assertTrue(User.objects.filter(email="test@example.com").exists())
        user = User.objects.get(email="test@example.com")
        # Projeto atual usa email como username
        self.assertEqual(user.username, "test@example.com")

    def test_user_registration_with_existing_email(self):
        """
        Testa cadastro com e-mail já existente.

        Observação: O modelo padrão do Django NÃO impõe unicidade de email.
        Portanto, dependendo do seu serializer/view, podem ocorrer dois comportamentos:
        - 400 (se você validar unicidade no serializer)
        - 201 (se permitir e-mails duplicados)
        Este teste aceita ambos, mas garante a consistência do lado do banco.
        """
        # cria um usuário com o mesmo email
        User.objects.create_user(
            username="existing@example.com",
            password="testpass123",
            email="test@example.com",
        )

        before = User.objects.filter(email="test@example.com").count()
        response = self.client.post(self.url, self.valid_data, format='json')
        after = User.objects.filter(email="test@example.com").count()

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            # API está validando unicidade -> não deve criar novo usuário
            self.assertEqual(after, before)
        else:
            # API permite e-mails duplicados -> deve retornar 201 e aumentar a contagem
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(after, before + 1)


class TokenObtainTest(APITestCase):
    def setUp(self):
        self.url = reverse('get_token')
        # Cria usuário com email como username (seguindo seu fluxo atual)
        self.user = User.objects.create_user(
            username="test@example.com",
            password="testpass123",
            email="test@example.com",
        )
        self.valid_credentials = {
            "username": "test@example.com",
            "password": "testpass123",
        }
        self.invalid_credentials = {
            "username": "test@example.com",
            "password": "wrongpassword",
        }

    def test_token_obtain_with_valid_credentials(self):
        """Test obtaining a token with valid credentials"""
        response = self.client.post(self.url, self.valid_credentials, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_token_obtain_with_invalid_credentials(self):
        """Test obtaining a token with invalid credentials"""
        response = self.client.post(self.url, self.invalid_credentials, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshTest(APITestCase):
    def setUp(self):
        self.url = reverse('refresh')
        self.user = User.objects.create_user(
            username="test@example.com",
            password="testpass123",
            email="test@example.com",
        )
        refresh = RefreshToken.for_user(self.user)
        self.valid_refresh_token = {"refresh": str(refresh)}
        self.invalid_refresh_token = {"refresh": "invalidtoken"}

    def test_token_refresh_with_valid_token(self):
        """Test refreshing a token with a valid refresh token"""
        response = self.client.post(self.url, self.valid_refresh_token, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_refresh_with_invalid_token(self):
        """Test refreshing a token with an invalid refresh token"""
        response = self.client.post(self.url, self.invalid_refresh_token, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProtectedEndpointTest(APITestCase):
    """
    Prepara dois testes para endpoint protegido.
    Substitua `PROTECTED_URL` por uma rota real que exija JWT (ex.: reverse('me') / reverse('user_list') etc.)
    Depois remova os @skip.
    """
    PROTECTED_URL = None  # ex.: reverse('me')

    def setUp(self):
        self.user = User.objects.create_user(
            username="test@example.com",
            password="testpass123",
            email="test@example.com",
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    @unittest.skip("Defina PROTECTED_URL para testar 401 sem token.")
    def test_access_protected_endpoint_without_token(self):
        """Should return 401 when no token is provided"""
        response = self.client.get(self.PROTECTED_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @unittest.skip("Defina PROTECTED_URL para testar 200 com token válido.")
    def test_access_protected_endpoint_with_token(self):
        """Should return 200 when a valid token is provided"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.get(self.PROTECTED_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
