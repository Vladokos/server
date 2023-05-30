const idOrd = document.getElementsByClassName("red-round-button")[0].id;

const leaverOrder = document.getElementById("leaveOrder");


leaverOrder.addEventListener("click", () => {
    const name = document.getElementById("name");
    const email = document.getElementById("email");

    if (name.value.trim().length > 0 && email.value.trim().length > 0 && email.value.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
        axios.post("/createOrder", {
            name: name.value,
            email: email.value,
            idOrder: idOrd
        }).then((res) => {
            if (res.status === 200) {
                alert("Заявка оставленная ожидайте ответа на почту")
            }
        })
    }
})