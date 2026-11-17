USERNAME = "admin"
PASSWORD = "admin123"
MAX_ATTEMPTS = 3

for attempt in range(MAX_ATTEMPTS):
    username = input("Username: ")
    password = input("Password: ")

    if username == USERNAME and password == PASSWORD:
        print("Login successful!")
        break

    remaining = MAX_ATTEMPTS - attempt - 1
    if remaining:
        print(f"Incorrect username or password. {remaining} attempt(s) left.")
    else:
        print("Too many failed attempts. Access denied.")
