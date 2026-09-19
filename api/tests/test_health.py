"""Unit tests for DocuMind API health endpoints."""

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "DocuMind API"
    assert data["status"] == "online"
    assert "version" in data


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "DocuMind API"
    assert "version" in data
    assert "timestamp" in data
