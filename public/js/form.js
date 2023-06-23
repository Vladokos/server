const reg = document.getElementById("reg");
const log = document.getElementById("log");

log?.addEventListener("click", () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (email.value.trim().length > 0 && password.value.trim().length > 0) {
        axios.post("/enterUser", {
            email: email.value,
            password: password.value
        }).then((res) => {
            if (res.status === 200) {
                alert("Успешно");
                localStorage.setItem("user", email.value)
                window.location.href = "https://server-bp9a.onrender.com/services";
            }
        })
    } else {
        alert("Заполните поля");
    }
})

reg?.addEventListener("click", () => {
    const login = document.getElementById("login");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (login.value.trim().length > 0 && email.value.trim().length > 0 && password.value.trim().length > 0 &&
        email.value.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
        axios.post("/createUser", {
            login: login.value,
            email: email.value,
            password: password.value
        }).then((res) => {
            if (res.status === 200) {
                alert("Успешно");
                localStorage.setItem("user", email.value)
                window.location.href = "https://server-bp9a.onrender.com/services";
            }
        })
    } else {
        alert("Заполните поля");
    }
})