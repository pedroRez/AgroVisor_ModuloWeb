from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from geoalchemy2 import Geometry
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json

# Carrega variáveis do arquivo .env
load_dotenv()

# Acessa a variável DATABASE_URL do .env ou usa um valor padrão
DATABASE_URL = os.getenv("DATABASE_URL")

# Configuração do banco de dados
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Modelo de Pasto
class PastoModel(Base):
    __tablename__ = "pastos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)

# Criação das tabelas no banco de dados (caso necessário)
Base.metadata.create_all(bind=engine)

# Instância do FastAPI
app = FastAPI()

# Middleware para CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para validação
class GeoJSON(BaseModel):
    type: str
    coordinates: list

class PastoSchema(BaseModel):
    nome: str
    geojson: GeoJSON

# Função para gerenciar a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Rota para criar um pasto
@app.post("/pastos")
def criar_pasto(pasto: PastoSchema, db: Session = Depends(get_db)):
    wkt = f"SRID=4326;POLYGON(({','.join([f'{c[0]} {c[1]}' for c in pasto.geojson.coordinates[0]])}))"
    novo = PastoModel(nome=pasto.nome, geometry=wkt)
    db.add(novo)
    db.commit()
    return {"status": "ok"}

# Rota para listar pastos
@app.get("/pastos")
def listar_pastos(db: Session = Depends(get_db)):
    query = db.query(PastoModel).all()
    return [
        {
            "nome": item.nome,
            "geojson": json.loads(db.scalar(item.geometry.ST_AsGeoJSON()))
        }
        for item in query
    ]
