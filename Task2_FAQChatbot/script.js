const faqs = [
    {
        question: "course fee",
        keywords: ["fee", "fees", "cost", "price", "paisa"],
        answer: "The course fee is ₹50,000."
    },

    {
        question: "course duration",
        keywords: ["duration", "long", "months", "time"],
        answer: "The course duration is 6 months."
    },

    {
        question: "enrollment",
        keywords: ["enroll", "enrollment", "register", "registration", "join"],
        answer: "You can enroll by completing the registration form."
    },

    {
        question: "certificate",
        keywords: ["certificate", "certification", "certificates"],
        answer: "Yes, you will receive a certificate after successfully completing the course."
    },

    {
        question: "online course",
        keywords: ["online", "remote", "internet"],
        answer: "Yes, the course is available online."
    },

    {
        question: "class timing",
        keywords: ["timing", "time", "classes", "schedule"],
        answer: "Classes are held from 10 AM to 12 PM."
    },

    {
        question: "contact support",
        keywords: ["support", "contact", "help", "customer"],
        answer: "You can contact support through email or phone."
    }
];


function findAnswer(userQuestion) {

    userQuestion = userQuestion.toLowerCase();

    let bestMatch = null;
    let highestScore = 0;

    faqs.forEach(faq => {

        let score = 0;

        faq.keywords.forEach(keyword => {

            if (userQuestion.includes(keyword)) {
                score++;
            }

        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = faq;
        }

    });

    if (bestMatch && highestScore > 0) {
        return bestMatch.answer;
    }

    return "Sorry 😔 I don't know the answer to that question.";
}


function sendMessage() {

    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const question = input.value.trim();

    if (question === "") {
        return;
    }

    // Show user question
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = question;

    chatBox.appendChild(userMessage);

    // Get answer
    const answer = findAnswer(question);

    // Show bot answer
    const botMessage = document.createElement("div");
    botMessage.className = "bot-message";
    botMessage.textContent = answer;

    chatBox.appendChild(botMessage);

    // Clear input
    input.value = "";

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Press Enter to send
document.getElementById("userInput").addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});