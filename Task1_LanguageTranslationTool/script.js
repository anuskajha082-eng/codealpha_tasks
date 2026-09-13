async function translateText() {

    const inputText = document.getElementById("inputText").value.trim();

    const fromLanguage =
        document.getElementById("fromLanguage").value;

    const toLanguage =
        document.getElementById("toLanguage").value;

    const outputText =
        document.getElementById("outputText");

    const button =
        document.getElementById("translateButton");

    const status =
        document.getElementById("status");


    // Check empty input

    if (!inputText) {

        outputText.innerText =
            "Please enter some text first.";

        return;
    }


    // Same language

    if (fromLanguage === toLanguage) {

        outputText.innerText = inputText;

        return;
    }


    button.disabled = true;

    button.innerText = "TRANSLATING...";

    status.innerText = "Please wait...";


    try {

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" + encodeURIComponent(inputText) +
            "&langpair=" + fromLanguage + "|" + toLanguage;


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error("Translation failed");
        }


        const data = await response.json();


        if (
            data.responseData &&
            data.responseData.translatedText
        ) {

            outputText.innerText =
                data.responseData.translatedText;

            status.innerText =
                "Translation completed ✓";

        } else {

            throw new Error("No translation found");
        }


    } catch (error) {

        outputText.innerText =
            "Unable to translate. Please check your internet connection.";

        status.innerText =
            "Translation failed.";

        console.error(error);

    } finally {

        button.disabled = false;

        button.innerText = "✦ TRANSLATE";
    }
}