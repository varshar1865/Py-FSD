
const API = "http://localhost:8080/api";

// Register donor
document.getElementById("donorForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const donor = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        bloodGroup: document.getElementById("donorBlood").value,
        location: document.getElementById("donorLocation").value,
        available: true
    };

    try {
        const response = await fetch(API + "/donors", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(donor)
        });

        if (!response.ok) throw new Error("Registration failed");

        document.getElementById("donorMessage")
            .textContent = "Donor registered successfully!";

        this.reset();

    } catch(error) {
        document.getElementById("donorMessage")
            .textContent = "Unable to register donor. Check server.";
    }
});

// Submit blood request
document.getElementById("requestForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const request = {
        patientName: document.getElementById("patientName").value,
        bloodGroup: document.getElementById("requestBlood").value,
        location: document.getElementById("requestLocation").value,
        units: Number(document.getElementById("units").value)
    };

    try {
        const response = await fetch(API + "/requests", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(request)
        });

        if (!response.ok) throw new Error("Request failed");

        document.getElementById("requestMessage")
            .textContent = "Blood request submitted successfully!";

        this.reset();

    } catch(error) {
        document.getElementById("requestMessage")
            .textContent = "Unable to submit request. Check server.";
    }
});

// Find compatible donors
async function findDonors() {

    const blood = document.getElementById("searchBlood").value;
    const location = document.getElementById("searchLocation").value;

    const results = document.getElementById("results");

    if (!blood || !location.trim()) {
        results.textContent = "Please select blood group and location.";
        return;
    }

    results.textContent = "Searching donors...";

    try {
        const url = `${API}/match?bloodGroup=${encodeURIComponent(blood)}&location=${encodeURIComponent(location)}`;

        const response = await fetch(url);

        if (!response.ok) throw new Error("Search failed");

        const donors = await response.json();

        results.replaceChildren();

        if (donors.length === 0) {
            results.textContent = "No matching registered donors found.";
            return;
        }

        const heading = document.createElement("h3");
        heading.textContent = "Potential matching donors";
        results.appendChild(heading);

        donors.forEach(donor => {

            const card = document.createElement("div");
            card.className = "donor-result";

            const name = document.createElement("h3");
            name.textContent = donor.name;

            const group = document.createElement("p");
            group.textContent = "Blood Group: " + donor.bloodGroup;

            const city = document.createElement("p");
            city.textContent = "Location: " + donor.location;

            const status = document.createElement("p");
            status.textContent = "Availability: Registered as available";

            card.append(name, group, city, status);
            results.appendChild(card);
        });

        const note = document.createElement("p");
        note.textContent =
            "All matches require blood-bank verification and donor consent before any donation.";
        results.appendChild(note);

    } catch(error) {
        results.textContent = "Unable to find donors. Check server connection.";
    }
}
