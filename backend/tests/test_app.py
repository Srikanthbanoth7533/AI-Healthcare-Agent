from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_home(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Siri Healthcare Agent Running Successfully"
    }


def test_chat_success(client):
    mock_response = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Stay hydrated and eat balanced meals."
    mock_response.choices = [mock_choice]

    with patch("app.client.chat.completions.create", return_value=mock_response):
        response = client.post(
            "/chat",
            json={"message": "How to stay healthy?"},
        )
        assert response.status_code == 200
        assert response.json() == {
            "reply": "Stay hydrated and eat balanced meals."
        }


def test_ai_test_success(client):
    mock_response = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "1. Drink water 2. Sleep 8 hours"
    mock_response.choices = [mock_choice]

    with patch("app.client.chat.completions.create", return_value=mock_response):
        response = client.get("/ai-test")
        assert response.status_code == 200
        assert response.json() == {
            "response": "1. Drink water 2. Sleep 8 hours"
        }


def test_predict_disease(client):
    mock_response = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Common Cold - Rest and stay warm."
    mock_response.choices = [mock_choice]

    with patch("app.client.chat.completions.create", return_value=mock_response):
        response = client.post(
            "/predict-disease",
            json={"symptoms": "cough, fever, sore throat"},
        )
        assert response.status_code == 200
        assert response.json() == {
            "prediction": "Common Cold - Rest and stay warm."
        }


def test_analyze_report_invalid_file(client):
    response = client.post(
        "/analyze-report/",
        files={"file": ("report.txt", b"some text", "text/plain")},
    )
    assert response.status_code == 200
    assert response.json() == {
        "medical_analysis": "Please upload only PDF files."
    }


def test_predict_image_invalid_file(client):
    response = client.post(
        "/predict-image",
        files={"file": ("document.pdf", b"pdf bytes", "application/pdf")},
    )
    assert response.status_code == 200
    assert response.json() == {
        "analysis": "Please upload only image files (JPG, JPEG, PNG, WEBP)."
    }


def test_generate_pdf(client):
    response = client.post("/generate-pdf/")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
