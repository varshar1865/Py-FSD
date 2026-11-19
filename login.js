
const API = "http://localhost:8080/api/auth/login";

// Show / Hide Password
document.getElementById("togglePassword")
.addEventListener("click", function() {

    const password = document.getElementById("password");

    if (password.type === "password") {
        password.type = "text";
        this.textContent = "Hide";
    } else {
        password.type = "password";
        this.textContent = "Show";
    }
});

// Login Function
document.getElementById("loginForm")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const message = document.getElementById("message");

    message.textContent = "Checking login...";

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                role: role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Invalid login");
        }

        // Store authentication token
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("userRole", data.role);

        message.style.color = "green";
        message.textContent = "Login successful!";

        if (data.role === "ADMIN") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "donor.html";
        }

    } catch(error) {
        message.style.color = "red";
        message.textContent = error.message;
    }
});
