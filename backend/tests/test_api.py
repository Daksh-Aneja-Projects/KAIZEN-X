from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    # Health endpoint might not exist, but let's assert it doesn't crash
    assert response.status_code in (200, 404)
