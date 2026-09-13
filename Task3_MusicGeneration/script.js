let generatedNotes = [];
let audioContext = null;
let currentOscillators = [];
let model = null;
let modelTrained = false;

const noteFrequencies = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25
};

const notesList = Object.keys(noteFrequencies);

const tempo = document.getElementById("tempo");
const tempoValue = document.getElementById("tempoValue");


// TEMPO
tempo.addEventListener("input", function () {
    tempoValue.textContent = tempo.value + " BPM";
});


// TRAIN AI MODEL
async function trainModel() {

    const status = document.getElementById("status");
    const modelStatus = document.getElementById("modelStatus");

    status.textContent = "🧠 Training AI model...";
    modelStatus.textContent = "Training...";

    try {

        model = tf.sequential();

        model.add(
            tf.layers.lstm({
                units: 64,
                inputShape: [8, 1],
                returnSequences: false
            })
        );

        model.add(
            tf.layers.dense({
                units: 8,
                activation: "softmax"
            })
        );

        model.compile({
            optimizer: "adam",
            loss: "categoricalCrossentropy"
        });

        // Simple training data
        const inputData = tf.tensor3d([
            [
                [0], [2], [4], [7],
                [0], [2], [4], [7]
            ],
            [
                [0], [1], [2], [4],
                [2], [4], [7], [0]
            ],
            [
                [2], [4], [7], [0],
                [4], [7], [2], [0]
            ],
            [
                [7], [4], [2], [0],
                [7], [4], [2], [0]
            ]
        ]);

        const outputData = tf.tensor2d([
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0]
        ]);

        await model.fit(
            inputData,
            outputData,
            {
                epochs: 30,
                verbose: 0
            }
        );

        inputData.dispose();
        outputData.dispose();

        modelTrained = true;

        modelStatus.textContent = "AI Model Trained ✓";
        status.textContent =
            "✅ AI model trained successfully!";

    } catch (error) {

        console.error(error);

        modelStatus.textContent = "Training Error";
        status.textContent =
            "❌ AI training failed.";

    }
}


// GENERATE MUSIC
async function generateMusic() {

    if (!modelTrained) {

        document.getElementById("status").textContent =
            "🧠 Please click 'Train AI' first!";

        return;
    }

    document.getElementById("status").textContent =
        "✨ AI is generating music...";

    generatedNotes = [];

    let sequence = [0, 2, 4, 7, 0, 2, 4, 7];

    for (let i = 0; i < 16; i++) {

        const input = tf.tensor3d([
            sequence.map(note => [note])
        ]);

        const prediction =
            model.predict(input);

        const values =
            await prediction.data();

        let highestIndex = 0;

        for (let j = 1; j < values.length; j++) {

            if (values[j] > values[highestIndex]) {
                highestIndex = j;
            }

        }

        const generatedNote =
            notesList[highestIndex];

        generatedNotes.push(generatedNote);

        sequence.shift();
        sequence.push(highestIndex);

        input.dispose();
        prediction.dispose();
    }

    document.getElementById("notes").textContent =
        generatedNotes.join(" • ");

    document.getElementById("status").textContent =
        "🎵 AI music generated successfully!";
}


// PLAY MUSIC
function playMusic() {

    if (generatedNotes.length === 0) {

        document.getElementById("status").textContent =
            "⚠️ Generate music first!";

        return;
    }

    stopMusic();

    audioContext =
        new (window.AudioContext ||
        window.webkitAudioContext)();

    const bpm = Number(tempo.value);

    const noteDuration =
        60000 / bpm;

    generatedNotes.forEach(
        function (note, index) {

            setTimeout(function () {

                if (audioContext) {

                    playNote(
                        noteFrequencies[note],
                        noteDuration
                    );

                }

            }, index * noteDuration);

        }
    );

    document.getElementById("status").textContent =
        "🎶 Playing AI-generated music...";
}


// PLAY NOTE
function playNote(frequency, duration) {

    const oscillator =
        audioContext.createOscillator();

    const gainNode =
        audioContext.createGain();

    oscillator.frequency.value =
        frequency;

    oscillator.type = "sine";

    gainNode.gain.value = 0.15;

    oscillator.connect(gainNode);

    gainNode.connect(
        audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration / 1000
    );

    currentOscillators.push(
        oscillator
    );
}


// STOP MUSIC
function stopMusic() {

    currentOscillators.forEach(
        function (oscillator) {

            try {
                oscillator.stop();
            } catch (error) {}

        }
    );

    currentOscillators = [];

    if (audioContext) {

        audioContext.close();

        audioContext = null;
    }

    document.getElementById("status").textContent =
        "⏹️ Music stopped.";
}


// DOWNLOAD MIDI
function downloadMusic() {

    if (generatedNotes.length === 0) {

        document.getElementById("status").textContent =
            "⚠️ Generate music first!";

        return;
    }

    if (typeof MidiWriter === "undefined") {

        alert(
            "MIDI library load nahi hui. Internet connection check karo."
        );

        return;
    }

    const track =
        new MidiWriter.Track();

    track.addEvent(
        new MidiWriter.ProgramChangeEvent({
            instrument: 1
        })
    );

    generatedNotes.forEach(
        function (note) {

            track.addEvent(
                new MidiWriter.NoteEvent({
                    pitch: [note],
                    duration: "4"
                })
            );

        }
    );

    const writer =
        new MidiWriter.Writer([track]);

    const midiFile =
        writer.buildFile();

    const blob =
        new Blob(
            [midiFile],
            { type: "audio/midi" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "AI_Generated_Music.mid";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    document.getElementById("status").textContent =
        "⬇️ AI-generated MIDI downloaded!";
}