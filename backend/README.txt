
# AgroVisor - Backend com PostGIS

## Instalação
1. Crie o banco de dados PostGIS:
   - Execute: psql -U postgres -f db/init.sql

2. Copie o arquivo `.env.example` para `.env` e configure sua string de conexão.

3. Instale os pacotes:
   pip install -r requirements.txt

4. Inicie o servidor:
   uvicorn app.main:app --reload
