const responseContainer = document.getElementById("response-div");
const scraperButton = document.getElementById("post");

scraperButton.addEventListener("click", displayScraped)

function displayScraped(e){
    e.preventDefault();
    responseContainer.textContent = "";
    if (responseContainer.classList.contains("hidden")) {
        responseContainer.classList.remove("hidden");
        responseContainer.classList.add("visible");
    }
    createScrapeHTML();
}

function createScrapeHTML(){
    const h1Element = document.createElement("h1");
    h1Element.id = "response-h1";
    h1Element.textContent = "Scraped Text:";

    const responseH2 = document.createElement("h2");
    responseH2.id = "response-h1";
    responseH2.textContent = "Dates Scraped";

    responseContainer.appendChild(h1Element);
    responseContainer.appendChild(responseH2);
}