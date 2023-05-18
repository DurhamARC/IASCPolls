/* ajax.js */

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    /* Handle form */
    const elem = document.getElementById(FORM_ELEMENT)
    const data = new FormData(elem);
    const json = Object.fromEntries(data.entries());
    /* console.log(elem, data, json) */

    /* Set headers for JSON POST */
    let xhr = new XMLHttpRequest();
    xhr.open('POST', API_ROUTE_URI, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));

    xhr.onload = function() {
        console.log(this.responseText);
        document.getElementById("result").innerText +=
            `[${(new Date()).toLocaleTimeString()}]  ${this.responseText} \n`
    };


    try {
        if (typeof LOAD_FUNCTION !== undefined) {
            xhr.addEventListener('load', LOAD_FUNCTION);
        }
    }
    catch(e) {
        console.log('LOAD_FUNCTION is not defined');
    }

    xhr.send(JSON.stringify(json));

    // Return false to prevent default form behavior
    return false;
}

window.addEventListener('load', (event) => {
    const form = document.getElementById(FORM_ELEMENT);
    if (form.attachEvent) {
        form.attachEvent("submit", processForm);
    } else {
        form.addEventListener("submit", processForm);
    }
});
