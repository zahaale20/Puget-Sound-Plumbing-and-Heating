import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import images
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PSPAH Backend API")

# Setup CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://pugetsoundplumbing.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# "Plug in" the routers
app.include_router(images.router)
# app.include_router(leads.router) # Uncomment once leads.py is built

@app.get("/")
async def root():
    return {"status": "PSPAH API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)