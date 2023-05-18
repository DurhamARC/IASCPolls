/* dropdown.js */

function populateSurveyDropdown(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));

    xhr.onload = function () {
        const results = JSON.parse(this.responseText).results;

        for (let i = 0; i < results.length; i++) {
            console.log(results[i]);

            let opt = results[i];
            var el = document.createElement("option");
            el.textContent = `${opt.id}: ${opt.question}`;
            el.value = opt.id;
            SELECT_DROPDOWN.appendChild(el);
        }
    };

    xhr.send();
}

window.addEventListener('load', (event) => {
    populateSurveyDropdown("/api/survey/?active=true");
});
