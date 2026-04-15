document.addEventListener("DOMContentLoaded", function() {


const form = document.getElementById("myform");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let name= document.getElementById("username").value.trim();
    let email = document.getElementById("useremail").value.trim();
    let phone = document.getElementById("phonenumber").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let dob = document.getElementById("dob").value;
    let gender = document.querySelector('input[name="gender"]:checked').value;
    let address = document.getElementById("address").value;
    
    let valid = true;

    document.querySelectorAll("small").forEach(e => e.innerText = "");

    if(name === "") {
        document.getElementById("nameError").innerText = "Name is required";
        valid = false; 
    }

    if(!email.includes("@")) {
        document.getElementById("emailError").innerText = "Invalid email";
        valid = false;
    }

    if(phone.length !== 10 || isNaN(phone)) {
        document.getElementById("phoneError").innerText = "Phone number must be 10 digits";
        valid = false;
    }

    if(password.length < 6 ) {
        document.getElementById("passwordError").innerText = "Password must be atleast 6 characters"
        valid = false;
    }

    if(password !== confirmPassword) {
        document.getElementById("confirmError").innerText = "Passwords do not match";
        valid = false;
    }

    if(!dob){
        document.getElementById("dobError").innerText = "Select DOB";
        valid = false;
    }

    if(!gender) {
        document.getElementById("genderError").innerText = "Select gender";
        valid = false;
    }

    if(address === "") {
        document.getElementById("addressError").innerText = "Address required";
        valid = false;
    }

    if(valid) {
        document.getElementById("result").innerText = `Welcome ${name}! Registration is sucessful`;
    }

    // Live validation

document.getElementById("username").addEventListener("input", function () {
    let name = this.value.trim();
    document.getElementById("nameError").innerText =
        name === "" ? "Name is required" : "";
});

document.getElementById("useremail").addEventListener("input", function () {
    let email = this.value;
    document.getElementById("emailError").innerText =
        email.includes("@") ? "" : "Invalid email";
});

document.getElementById("phonenumber").addEventListener("input", function () {
    let phone = this.value;
    document.getElementById("phoneError").innerText =
        phone.length === 10 && !isNaN(phone) ? "" : "Enter 10 digit number";
});

document.getElementById("password").addEventListener("input", function () {
    let password = this.value;
    let error = "";

    if (password.length < 6) {
        error = "Minimum 6 characters required";
    } else if (!/[A-Z]/.test(password)) {
        error = "Must include at least 1 uppercase letter";
    } else if (!/[0-9]/.test(password)) {
        error = "Must include at least 1 number";
    } else if (!/[!@#$%^&*]/.test(password)) {
        error = "Must include at least 1 special character";
    }

    document.getElementById("passwordError").innerText = error;
});

document.getElementById("confirmPassword").addEventListener("input", function () {
    let password = document.getElementById("password").value;
    let confirm = this.value;

    document.getElementById("confirmError").innerText =
        password === confirm ? "" : "Passwords do not match";
});

console.log("Form Submitted");

});

});

