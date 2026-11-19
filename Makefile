# Atajos del proyecto. Requisitos: Docker y Node 24.
# Las variables se leen del archivo de entorno de la raíz (copia de .env.example).

.PHONY: setup env install db-up db-down migrate seed fresh start test test-backend test-frontend typecheck lint

## Primera vez: entorno, dependencias, base de datos, migraciones y semilla
setup: env install db-up migrate seed

## Crea los archivos de entorno que falten (nunca sobrescribe uno existente)
env:
	@test -f .env || (cp .env.example .env && echo "Creado .env desde .env.example: completa CANOPY_API_KEY")
	@test -f backend/.env || (cp backend/.env.example backend/.env && cd backend && npm install --silent && node ace generate:key)
	@test -f backend/.env.test || printf 'NODE_ENV=test\nSESSION_DRIVER=memory\n' > backend/.env.test

install:
	cd backend && npm install
	cd frontend && npm install

db-up:
	docker compose up -d --wait

db-down:
	docker compose down

migrate: db-up
	cd backend && node ace migration:run

seed: db-up
	cd backend && node ace db:seed

## Borra y recrea el esquema de desarrollo con la semilla
fresh: db-up
	cd backend && node ace migration:fresh --drop-types --seed

## Backend en :3333, worker del agente y frontend en :3000 (el navegador solo usa :3000)
start: db-up
	@trap 'kill 0' INT TERM EXIT; \
	(cd backend && npm run dev) & \
	(cd backend && node ace agent:work) & \
	(cd frontend && npm run dev) & \
	wait

test: test-backend test-frontend

test-backend: db-up
	cd backend && node ace test

test-frontend:
	cd frontend && npm test

typecheck:
	cd backend && npm run typecheck
	cd frontend && npm run typecheck

lint:
	cd backend && npm run lint
