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


    
});

async function loadUsers() {
    try {
        const response = await fetch('/users');
        const users = await response.json();

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
}
async function deleteUser(id) {
    try {
        await fetch(`/users/${id}`, {
            method: 'DELETE'
        });

        loadUsers(); // refresh list

    } catch (err) {
        console.log(err);
    }
}
