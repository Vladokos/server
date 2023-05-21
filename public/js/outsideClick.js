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
