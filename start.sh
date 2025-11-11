#!/bin/bash

echo "🐳 Iniciando GIVE.ME com Docker..."

docker-compose down

docker-compose build

docker-compose up