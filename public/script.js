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
    const audioBlob = new Blob([new Uint8Array(atob(audioContent).split('').map(char => char.charCodeAt(0)))], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();
}

document.getElementById('sendButton').addEventListener('click', sendPrompt);
