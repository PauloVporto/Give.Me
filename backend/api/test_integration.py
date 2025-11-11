from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


class AuthEndToEndFlowTest(APITestCase):
    """
    Fluxo ponta-a-ponta:
    1) Registrar
    2) Obter token
    3) Acessar /me com access token
    4) Gerar novo access via refresh e acessar novamente
    """

    def setUp(self):
        self.register_url = reverse("register")
        self.token_url = reverse("get_token")
        self.refresh_url = reverse("refresh")
        self.me_url = reverse("me")

        self.payload = {
            "email": "flow@example.com",
            "password": "supersecret123",
            "first_name": "Flow",
            "last_name": "User",
        }

    def test_full_auth_flow(self):
        # 1) Registrar
        r1 = self.client.post(self.register_url, self.payload, format="json")
        self.assertIn(r1.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))
        self.assertTrue(User.objects.filter(email=self.payload["email"]).exists())

        # 2) Obter token (email como username)
        login = {
            "username": self.payload["email"],
            "password": self.payload["password"],
        }
        r2 = self.client.post(self.token_url, login, format="json")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertIn("access", r2.data)
        self.assertIn("refresh", r2.data)

        access = r2.data["access"]
        refresh = r2.data["refresh"]

        # 3) Acessar /me com access token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        r3 = self.client.get(self.me_url)
        self.assertEqual(r3.status_code, status.HTTP_200_OK)
        self.assertEqual(r3.data["email"], self.payload["email"])

        # 4) Gerar novo access via refresh e acessar novamente
        r4 = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(r4.status_code, status.HTTP_200_OK)
        self.assertIn("access", r4.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r4.data['access']}")
        r5 = self.client.get(self.me_url)
        self.assertEqual(r5.status_code, status.HTTP_200_OK)
        self.assertEqual(r5.data["username"], self.payload["email"])


class AuthorizationBehaviorTest(APITestCase):
    """
    Comportamento de autorização no endpoint /me:
    - Sem token → 401
    - Com token inválido → 401
    - Com header malformado → 401
    - Com 'Bearer' correto → 200
    """

    def setUp(self):
        self.me_url = reverse("me")
        self.user = User.objects.create_user(
            username="auth@example.com",
            email="auth@example.com",
            password="strongpass123",
        )
        refresh = RefreshToken.for_user(self.user)
        self.access = str(refresh.access_token)

    def test_me_without_token_returns_401(self):
        r = self.client.get(self.me_url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_malformed_header_returns_401(self):
        self.client.credentials(HTTP_AUTHORIZATION=self.access)  # faltou "Bearer "
        r = self.client.get(self.me_url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_invalid_token_returns_401(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid.token.value")
        r = self.client.get(self.me_url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_valid_token_returns_200(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        r = self.client.get(self.me_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["email"], "auth@example.com")


class CORSPreflightTest(APITestCase):
    """
    Verifica preflight CORS (OPTIONS) em /me.
    Como você usa corsheaders e CORS_ALLOW_ALL_ORIGINS=True, esperamos 200
    e cabeçalhos de CORS presentes.
    """

    def setUp(self):
        self.me_url = reverse("me")

    def test_cors_preflight_options(self):
        # Simula preflight
        headers = {
            "HTTP_ORIGIN": "http://example.com",
            "HTTP_ACCESS_CONTROL_REQUEST_METHOD": "GET",
            "HTTP_ACCESS_CONTROL_REQUEST_HEADERS": "Authorization, Content-Type",
        }
        r = self.client.options(self.me_url, **headers)

        # Algumas instalações retornam 200, outras 204 — aceitamos ambos
        self.assertIn(r.status_code, (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT))

        # Deve liberar a origem (você está com CORS_ALLOW_ALL_ORIGINS=True)
        allow_origin = r.headers.get("Access-Control-Allow-Origin", "")
        self.assertTrue(allow_origin in ("*", "http://example.com"))

        # Deve permitir Authorization, Content-Type, etc.
        allow_headers = r.headers.get("Access-Control-Allow-Headers", "")
        self.assertTrue(
            "authorization" in allow_headers.lower()
            or "content-type" in allow_headers.lower()
        )


class ContentTypeHandlingTest(APITestCase):
    """
    Verifica que o backend aceita application/json no login
    e retorna erro adequado quando Content-Type é incoerente.
    """

    def setUp(self):
        self.token_url = reverse("get_token")
        self.user = User.objects.create_user(
            username="ctype@example.com",
            email="ctype@example.com",
            password="validpass123",
        )

    def test_login_with_json_content_type(self):
        payload = {"username": "ctype@example.com", "password": "validpass123"}
        r = self.client.post(self.token_url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("access", r.data)

    def test_login_with_wrong_payload_shape_returns_401_or_400(self):
        # Campos errados: depende da view; aceitamos 400 (bad request) ou 401 (credenciais inválidas)
        payload = {"user": "ctype@example.com", "pwd": "x"}  # chaves incorretas
        r = self.client.post(self.token_url, payload, format="json")
        self.assertIn(r.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED))
