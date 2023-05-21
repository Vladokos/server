

const popup = document.getElementById("popup");
const poup__inner = document.getElementById("poup__inner");
const closeButton = document.getElementById("close_popup");

const buttons = document.getElementsByClassName("red-round-button");

for (let i = 0; i < buttons.length - 1; i++) {
    buttons[i].addEventListener("click", () => {
        popup.classList.toggle("active");

        outsideClick(
            poup__inner,
            () => {
                popup?.classList.remove("active");
            },
            buttons[i]
        );
    });
}

buttons[buttons.length - 1].addEventListener("click", () => {
    popup.classList.remove("active");
});
closeButton.addEventListener("click", () => {
    popup.classList.remove("active");
});


const outsideClick = (
    element,
    switcher,
    ignore ,
) => {
    document.addEventListener("click", function listener(event) {
        if (
            event.target !== element &&
            !element.contains(event.target) &&
            event.target !== ignore &&
            !ignore?.contains(event.target)
        ) {
            switcher();
            document.removeEventListener("click", listener)
        }
    });
};


