import os
import django
from django.conf import settings
from django.db import connection
from django.test import TestCase
import pytest


class DatabaseDiagnosticTests(TestCase):
    """Testes para diagnosticar problemas com o banco de dados"""

    def test_database_connection(self):
        """Testa se a conexão com o banco está funcionando"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
            self.assertEqual(result[0], 1)
            print("✅ Conexão com o banco está funcionando")
        except Exception as e:
            print(f"❌ Erro na conexão com o banco: {e}")
            raise

    def test_database_name(self):
        """Verifica o nome do banco de dados sendo usado"""
        db_name = settings.DATABASES['default']['NAME']
        db_engine = settings.DATABASES['default']['ENGINE']
        print(f"📊 Banco de dados: {db_name}")
        print(f"🚀 Engine: {db_engine}")
        
        # Verifica se é PostgreSQL
        self.assertIn('postgresql', db_engine)
        print("✅ Usando PostgreSQL")

    def test_database_tables(self):
        """Verifica se as tabelas existem"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                tables = [row[0] for row in cursor.fetchall()]
                
            print(f"📋 Tabelas encontradas: {len(tables)}")
            for table in tables:
                print(f"   - {table}")
                
            # Verifica tabelas essenciais
            essential_tables = ['category', 'city', 'item', 'auth_user']
            for table in essential_tables:
                if table in tables:
                    print(f"✅ Tabela {table} existe")
                else:
                    print(f"❌ Tabela {table} não encontrada")
                    
        except Exception as e:
            print(f"❌ Erro ao verificar tabelas: {e}")
            raise

    def test_test_database_creation(self):
        """Testa a criação do banco de testes"""
        from django.db.utils import OperationalError
        try:
            # Tenta criar um registro de teste
            from django.contrib.auth.models import User
            test_user = User.objects.create_user(
                username='test_user',
                email='test@example.com',
                password='testpass123'
            )
            self.assertIsNotNone(test_user.id)
            print("✅ Banco de testes aceitando escritas")
            
            # Limpa o teste
            test_user.delete()
            
        except OperationalError as e:
            print(f"❌ Erro operacional no banco: {e}")
            raise
        except Exception as e:
            print(f"❌ Erro geral: {e}")
            raise


class DatabaseConfigTests(TestCase):
    """Testa a configuração do banco de dados"""

    def test_database_settings(self):
        """Verifica as configurações do banco"""
        db_config = settings.DATABASES['default']
        
        print("🔧 Configurações do Banco:")
        for key, value in db_config.items():
            if 'PASSWORD' in key.upper():
                print(f"   {key}: [PROTEGIDO]")
            else:
                print(f"   {key}: {value}")
        
        # Verificações básicas
        self.assertIn('NAME', db_config)
        self.assertIn('USER', db_config)
        self.assertIn('PASSWORD', db_config)
        self.assertIn('HOST', db_config)
        self.assertIn('PORT', db_config)
        print("✅ Configurações básicas presentes")

    def test_environment_variables(self):
        """Verifica variáveis de ambiente importantes"""
        env_vars = ['DATABASE_URL', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST']
        
        print("🌍 Variáveis de Ambiente:")
        for var in env_vars:
            value = os.getenv(var)
            if value:
                if 'PASSWORD' in var:
                    print(f"   {var}: [DEFINIDA]")
                else:
                    print(f"   {var}: {value}")
            else:
                print(f"   {var}: [NÃO DEFINIDA]")

    def test_database_migrations(self):
        """Verifica se as migrações foram aplicadas"""
        try:
            from django.core.management import call_command
            from io import StringIO
            
            # Verifica migrações pendentes
            out = StringIO()
            call_command('showmigrations', '--list', stdout=out)
            output = out.getvalue()
            
            print("📦 Status das Migrações:")
            lines = output.strip().split('\n')
            for line in lines:
                if ']' in line:
                    print(f"   {line}")
            
        except Exception as e:
            print(f"❌ Erro ao verificar migrações: {e}")


class PostgreSQLSpecificTests(TestCase):
    """Testes específicos para PostgreSQL"""

    def test_postgresql_version(self):
        """Verifica a versão do PostgreSQL"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version()")
                version = cursor.fetchone()[0]
                print(f"🐘 Versão do PostgreSQL: {version}")
        except Exception as e:
            print(f"❌ Erro ao obter versão: {e}")

    def test_postgresql_connections(self):
        """Verifica conexões ativas"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT count(*) 
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                """)
                active_connections = cursor.fetchone()[0]
                print(f"🔗 Conexões ativas no banco: {active_connections}")
                
                if active_connections > 5:
                    print("⚠️  Muitas conexões ativas - pode ser o problema")
        except Exception as e:
            print(f"❌ Erro ao verificar conexões: {e}")

    def test_database_size(self):
        """Verifica o tamanho do banco"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT pg_size_pretty(pg_database_size(current_database()))
                """)
                size = cursor.fetchone()[0]
                print(f"💾 Tamanho do banco: {size}")
        except Exception as e:
            print(f"❌ Erro ao verificar tamanho: {e}")


# Teste simples sem banco para comparar
class SimpleNoDatabaseTest:
    """Teste que não usa banco de dados - para comparação"""
    
    def test_without_database(self):
        """Teste que funciona sem banco"""
        assert 1 + 1 == 2
        print("✅ Teste sem banco funcionando")
