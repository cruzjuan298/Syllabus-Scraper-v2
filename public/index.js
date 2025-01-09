const responseContainer = document.getElementById("response-div");
const scraperButton = document.getElementById("post");
const fileInput = document.getElementById("file-input")

let fileData = "";

scraperButton.addEventListener("click", displayScraped)

//reseting input value when page is refreshed
window.addEventListener("load", () => {
    fileInput.value = "";
})

function displayScraped(e){
    e.preventDefault();
    responseContainer.textContent = "";

    if (responseContainer.classList.contains("hidden")) {
        responseContainer.classList.remove("hidden");
        responseContainer.classList.add("visible");
    }
    gettingInputData();
    createScrapeHTML(fileData);
}

function gettingInputData() {
    const file = fileInput.files[0];
    
    if (file) {
        try {
            const reader = new FileReader();

            reader.onload = async (event) => {
                const typedArray = new Uint8Array(event.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;

                let extractedText = "";
                for (let i = 1; i < pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    textContent.items.forEach(item => extractedText += item.str + " ");
                }
                if (extractedText.trim().length > 0) {
                    sendToServer({ text: extractedText });
                    console.log("Sent text to server")
                } else {
                    uploadRawPdf(file);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error extracting text: ". error);
            uploadRawPdf(file);
        }
    }
}

function sendToServer(data) {
    fetch("/process-text", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(data),
    }).then(response => response.json())
      .then(result => console.log("Server response:", result))
      .catch(error => console.error("Error sending text to server:", error ));
}

function uploadRawPdf(data) {
    const formData = new FormData();
    formData.append("file", data);

    fetch("/process-pdf", {
        method: "POST",
        body: formData,
    }).then(response => response.json())
      .then(result => console.log("Server response:", result))
      .catch(error => console.error("Error uploading PDF to server", error));
}

function createScrapeHTML(textFromFile){
    const h1Element = document.createElement("h1");
    h1Element.id = "response-h1";
    h1Element.textContent = "Scraped Text:";

    const responseH2 = document.createElement("h2");
    responseH2.id = "response-h1";
    responseH2.textContent = textFromFile;

    responseContainer.appendChild(h1Element);
    responseContainer.appendChild(responseH2);
}