"""FastAPI application for the Clarity AI verification backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Clarity AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3104", "http://192.168.1.166:3104", "http://192.168.1.166:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "clarity-ai-backend"}


# Mount CopilotKit AG-UI endpoint
from app.copilotkit_handler import mount_copilotkit  # noqa: E402

mount_copilotkit(app)
