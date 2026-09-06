import requests
import json
import uuid

BASE_URL = "http://127.0.0.1:8000"
INTERNAL_API_KEY = "dev_internal_key_change_in_prod_32ch"

headers = {
    "X-Internal-API-Key": INTERNAL_API_KEY,
    "Content-Type": "application/json"
}

def check_health():
    print("=== Testing /health ===")
    r = requests.get(f"{BASE_URL}/health", headers=headers)
    print(r.status_code, r.text)
    print()

def test_ingest_and_retrieve():
    print("=== Testing /ingest ===")
    doc_id = str(uuid.uuid4())
    text = """RAG (Retrieval-Augmented Generation) là một kỹ thuật trong AI giúp mô hình ngôn ngữ lớn (LLM) trả lời chính xác hơn bằng cách tìm kiếm thông tin từ cơ sở dữ liệu bên ngoài rồi kết hợp vào prompt.
    NodeJS đóng vai trò là một cổng giao tiếp API cho người dùng, còn Python sẽ chịu trách nhiệm băm nhỏ văn bản (chunking) và kết nối với Qdrant Vector Cloud.
    """
    
    body = {
        "document_id": doc_id,
        "filename": "test.txt",
        "text": text
    }
    
    r = requests.post(f"{BASE_URL}/ingest", headers=headers, json=body)
    print(r.status_code, r.text)
    print()
    
    print("=== Testing /retrieve ===")
    req_retrieve = {
        "document_id": doc_id,
        "question": "Python có vai trò gì trong hệ thống này?",
        "top_k": 3
    }
    r = requests.post(f"{BASE_URL}/retrieve", headers=headers, json=req_retrieve)
    print(r.status_code, json.dumps(r.json(), indent=2, ensure_ascii=False) if r.status_code == 200 else r.text)
    print()

    print("=== Testing /document/{id} (Delete) ===")
    r = requests.delete(f"{BASE_URL}/document/{doc_id}", headers=headers)
    print(r.status_code, r.text)
    print()


if __name__ == "__main__":
    check_health()
    test_ingest_and_retrieve()
