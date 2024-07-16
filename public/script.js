async function sendPrompt() {
    const prompt = document.getElementById('prompt').value;

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    document.getElementById('response').innerText = data.response;

    // Xử lý và phát âm thanh từ dữ liệu base64
    const audioContent = data.audioContent;
    const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();
}

document.getElementById('sendButton').addEventListener('click', sendPrompt);

// Web Speech API
const recordButton = document.getElementById('recordButton');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.interimResults = false;
recognition.lang = 'en-US';
recognition.continuous = true; // Đặt chế độ liên tục

let lastResultTime = Date.now();
let silenceTimeout;

// Xử lý sự kiện kết quả
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log(transcript)
    document.getElementById('prompt').value = transcript;

    lastResultTime = Date.now();
    clearTimeout(silenceTimeout);
    silenceTimeout = setTimeout(() => {
        recognition.stop();
        console.log('Stopped due to silence.');
    }, 2000); // 2 giây
};

// Xử lý lỗi
recognition.onerror = (event) => {
    console.error('Speech recognition error detected: ' + event.error);
};

// Bắt đầu ghi âm
recordButton.addEventListener('click', () => {
    recognition.start();
    lastResultTime = Date.now();
    silenceTimeout = setTimeout(() => {
        recognition.stop();
        console.log('Stopped due to silence.');
    }, 2000); // 2 giây
});