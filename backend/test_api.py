import requests
import sys

# The company login credentials from the ACVIS project?
# Let's check `test_db.py` or try to register a new user:
def test_api():
    base_url = "http://127.0.0.1:10001/api"
    
    # 1. Register a test company account (or login if exists)
    creds = {"email": "testcompany123@example.com", "password": "password", "role": "company"}
    
    # Try register
    r = requests.post(f"{base_url}/auth/register", json=creds)
    
    # Login
    r_login = requests.post(f"{base_url}/auth/login", json={"email": creds["email"], "password": creds["password"]})
    if r_login.status_code != 200:
        print("Login failed!", r_login.text)
        sys.exit(1)
        
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Let's hit /api/tickets as the company
    r_tickets = requests.get(f"{base_url}/tickets", headers=headers)
    print("Tickets response status:", r_tickets.status_code)
    try:
        print("Data:", r_tickets.json())
    except Exception as e:
        print("Raw text:", r_tickets.text)

if __name__ == "__main__":
    test_api()
