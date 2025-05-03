from dotenv import load_dotenv
import os

load_dotenv()  # Carrega o arquivo .env na raiz

print(os.getenv("DATABASE_URL"))  # Substitua "SUA_VARIAVEL" por uma variável que você tenha no .env
