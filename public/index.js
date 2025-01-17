const responseContainer = document.getElementById("response-div");
const scraperButton = document.getElementById("post");
const fileInput = document.getElementById("file-input")
const addLineButton = document.getElementById("add-button");

document.body.addEventListener("click", (event) => {
    if (event.target.id === "post") {
        displayScraped(event)
    }

    if (event.target.id === "add-button"){
    const newLineInput = document.getElementById("add-lines-button");
    const newLineInputValue = newLineInput.value;
    createNewLineHTML(newLineInputValue);
    }
})

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
    fetch("http://localhost:3000/process-text", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(data),
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error,  status: ${response.status}`);
        }
        return response.json();
    })
      .then(result => {
        console.log("Server Response:", result);
        if (result.success) {
            createScrapeHTML(result.scrapedText);
        }
      })
      .catch(error => console.error("Error sending text to server:", error ));
}

function uploadRawPdf(data) {
    const formData = new FormData();
    formData.append("pdf", data);

    fetch("http://localhost:3000/process-pdf", {
        method: "POST",
        body: formData,
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
        }
        return response.json()
    })
      .then(result => {
        console.log("Server Response:", result);
        if (result.success) {
            createScrapeHTML(result.analyzedData);
        }
      })
      .catch(error => console.error("Error uploading PDF to server", error));
}

function createScrapeHTML(textFromFile){
    const h1Element = document.createElement("h1");
    h1Element.id = "response-h1";
    h1Element.textContent = "Scraped Text:";

    responseContainer.appendChild(h1Element);
    const divElement = document.createElement("div");
    const inputElement1 = document.createElement("input");
    const inputElement2 = document.createElement("input");

    try {
    const lines = textFromFile.split("\n").filter(line => line.trim() !== "");

    lines.forEach(line => {
        divElement.className = "scraped-line";

        inputElement1.type = "checkbox";
        inputElement1.className = "line-checkbox";

        inputElement2.type = "text";
        inputElement2.className = "line-text";
        inputElement2.value = line;
        
        divElement.appendChild(inputElement1);
        divElement.appendChild(inputElement2);

        responseContainer.appendChild(divElement);
        
    })
    } catch (error) {
        console.log(error);

        divElement.className = "scraped-line"

        inputElement1.type = "text";
        inputElement1.className = "line-text";
        inputElement1.value = "No valid dates found";
        
        divElement.appendChild(inputElement1);

        responseContainer.appendChild(divElement);
    }

    const newLineDiv = document.createElement("div");
    newLineDiv.id = "new-line-div";

    const addButton = document.createElement("button");
    addButton.id = "add-button";
    addButton.innerHTML = "add-button"
    const addLine = document.createElement("Input");
    addLine.id = "add-lines-button";

    newLineDiv.appendChild(addButton);
    newLineDiv.appendChild(addLine);

    responseContainer.appendChild(newLineDiv);

}

function createNewLineHTML(textFromInput) {
    const addLineDiv = document.getElementById("new-line-div");

    const divElement = document.createElement("div");
    divElement.className = "div-new-line"

    const inputElement1 = document.createElement("input");
    inputElement1.type = "checkbox";
    inputElement1.className = "new-line-checkbox";

    const inputElement2 = document.createElement("input")
    inputElement2.type = "text";
    inputElement2.className = "line-text";
    inputElement2.value = textFromInput;

    divElement.appendChild(inputElement1);
    divElement.appendChild(inputElement2);
    responseContainer.insertBefore(divElement, addLineDiv)
}