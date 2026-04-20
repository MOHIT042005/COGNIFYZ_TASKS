document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("myform");

    // SUBMIT
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        let name = document.getElementById("username").value.trim();
        let email = document.getElementById("useremail").value.trim();
        let phone = document.getElementById("phonenumber").value.trim();
        let password = document.getElementById("password").value;
        let confirmPassword = document.getElementById("confirmPassword").value;
        let dob = document.getElementById("dob").value;
        let genderElement = document.querySelector('input[name="gender"]:checked');
        let address = document.getElementById("address").value.trim();

        let valid = true;

        
        document.querySelectorAll("small").forEach(e => e.innerText = "");

        // VALIDATION 

        if (name === "") {
            document.getElementById("nameError").innerText = "Name is required";
            valid = false;
        }

        if (!email.includes("@")) {
            document.getElementById("emailError").innerText = "Invalid email";
            valid = false;
        }

        if (phone.length !== 10 || isNaN(phone)) {
            document.getElementById("phoneError").innerText = "Phone must be 10 digits";
            valid = false;
        }

        if (
            password.length < 6 ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[!@#$%^&*]/.test(password)
        ) {
            document.getElementById("passwordError").innerText =
                "Password must include uppercase, number & symbol";
            valid = false;
        }

        if (password !== confirmPassword) {
            document.getElementById("confirmError").innerText = "Passwords do not match";
            valid = false;
        }

        if (!dob) {
            document.getElementById("dobError").innerText = "Select DOB";
            valid = false;
        }

        if (!genderElement) {
            document.getElementById("genderError").innerText = "Select gender";
            valid = false;
        }

        if (address === "") {
            document.getElementById("addressError").innerText = "Address required";
            valid = false;
        }

        // SenD to BACKEND
        if (valid) {

            const userData = {
                name,
                email,
                phone,
                password,
                dob,
                gender: genderElement.value,
                address
            };


            try {
                const response = await fetch('/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                document.getElementById("result").innerText =
                    "User registered successfully 🎉";

                console.log(data);
                   loadUsers();


            } catch (err) {
                console.log("Error:", err);
            }


        }
        form.reset();


    });

    const emailInput = document.getElementById("useremail");

    emailInput.addEventListener("input", function () {
        const email = this.value;

        const emailPattern = 
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if(email === "") {
                    document.getElementById("emailValidation").innerText =
                    "";
                } else if (!emailPattern.test(email)) {
                    document.getElementById("emailValidation").innerText = 
                     "Invalid email format";
                } else {
                    document.getElementById("emailValidation").innerText = 
                    "Valid email";
                }
                }); 

    // LIVE VALIDATION 

    document.getElementById("username").addEventListener("input", function () {
        document.getElementById("nameError").innerText =
            this.value.trim() === "" ? "Name is required" : "";
    });

    document.getElementById("useremail").addEventListener("input", function () {
        document.getElementById("emailError").innerText =
            this.value.includes("@") ? "" : "Invalid email";
    });

    document.getElementById("phonenumber").addEventListener("input", function () {
        document.getElementById("phoneError").innerText =
            this.value.length === 10 && !isNaN(this.value) ? "" : "Enter 10 digits";
    });

    document.getElementById("password").addEventListener("input", function () {
        let password = this.value;
        let error = "";

        if (password.length < 6) error = "Min 6 characters";
        else if (!/[A-Z]/.test(password)) error = "Need uppercase";
        else if (!/[0-9]/.test(password)) error = "Need number";
        else if (!/[!@#$%^&*]/.test(password)) error = "Need special char";

        document.getElementById("passwordError").innerText = error;
    });

    document.getElementById("confirmPassword").addEventListener("input", function () {
        let password = document.getElementById("password").value;

        document.getElementById("confirmError").innerText =
            this.value === password ? "" : "Passwords do not match";
    });

    loadUsers();

    const token = localStorage.getItem("token");

    if(token) {
        document.getElementById("logoutBtn").style.display = "block";
    }


    
});

async function loadUsers() {
    try {
        const token = localStorage.getItem("token");

        if(!token) {
            console.log("User not logged in - skipping loadUsers()");
            return;
        }
        const response = await fetch('/users', {
            headers: {
                'Authorization': token
            }
        });
        const users = await response.json();

        if(!Array.isArray(users)) {
            console.log("Not authorized or error:", users);
            return;
        }
        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(user => {
            const div = document.createElement("div");

            div.className = "card p-3 mb-2";

            div.innerHTML = `
                <strong>${user.name}</strong> - ${user.email} - ${user.phone}
                <button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm float-end">
                    Delete
                </button>
            `;

            userList.appendChild(div);
        });

    } catch (err) {
        console.log(err);
    }

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        console.log("Session expired. Please login again.");
        return;
    }
}
async function deleteUser(id) {
    const token = localStorage.getItem("token");

    await fetch(`/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': token
        }
    })
    try {
        await fetch(`/users/${id}`, {
            method: 'DELETE'
        });

        loadUsers(); // refresh list

    } catch (err) {
        console.log(err);
    }
}

async function loginUser() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        console.log("login response:", data); 

        if(data.token) {
            localStorage.setItem("token", data.token);
            console.log("Token saved");
            document.getElementById("logoutBtn").style.display = "block";
            loadUsers();
        }

        document.getElementById("result").innerText = data.message;

    } catch (err) {
        console.log(err);
    }
}

function logoutUser(){
    localStorage.removeItem("token");
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("result").innerText = "logged out";
    document.getElementById("userList").innerHTML = "";
}

function getLocation() {

    if(!navigator.geolocation) {
        document.getElementById("locationStatus").innerText = 
        "Geolocation is not supported by your browser";
        return;
    }

    document.getElementById("locationStatus").innerText = 
    "Getting your location...";

    navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback
    );
}

function successCallback(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
    .then(response => response.json())
    .then(data => {
        console.log("Full location data:", data);

        const address = data.address;

        document.getElementById("city").value =
            address.city || address.town || address.village || "";

        document.getElementById("state").value = 
            address.state || "";

        document.getElementById("address").value = 
            data.display_name || "";

            const countryMap = {
                "India": "+91",
                "United States": "+1",
                "United Kingdom": "+44",
                "Canada": "+1",
                "Australia": "+61",
                "Germany": "+49",
                "France": "+33"
            };

            const country = address.country;

            document.getElementById("countryCode").value = 
                countryMap[country] || "+00";
    })
    .catch(err => {
        console.log("Error fetching location:", err);
    });

    document.getElementById("locationStatus").innerText = 
    "Location fetched successfully";

    window.userLocation = { latitude, longitude};

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(address.city || address.town || address.village)}&appid=029bc3fe033042977d7c6dbdf894ecf2&units=metric`)
    .then(response => response.json())
    .then(weatherData => {

        console.log("Weather Data:", weatherData);

        if(!weatherData.main) {
            document.getElementById("weatherBox").innerText = 
             "Weather data not available";
             return;
        }

        const temp = weatherData.main.temp;
        const condition = weatherData.weather[0].main;

        document.getElementById("weatherBox").innerHTML = 
            `Weather in ${weatherData.name}: <br>
            <strong>${temp}*C</strong>, ${condition}`;
    })

    .catch(err=> {
        console.log("Weather error:", err);
        document.getElementById("weatherBox").innerText =
         "Unable to fetch weather";
    });
}

function errorCallback(error) {
    let message = "";
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "Permission denied";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location unavailable";
            break;
        case error.TIMEOUT:
            message = "Request timed out";
            break;
        default:
            message = "Unkown error";
    }

    document.getElementById("locationStatus").innerText = message;
}