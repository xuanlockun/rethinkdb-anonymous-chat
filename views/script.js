document.addEventListener('DOMContentLoaded', (event) => {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const messageList = document.getElementById('messageList');
    const socket = io();

    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const message = chatInput.value;

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                chat: message
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                chatInput.value = '';
            }
        })
        .catch(error => console.error('Error:', error));
    });

    socket.on('new message', function(message) {
        const newMessage = document.createElement('li');
        newMessage.textContent = message;
        messageList.appendChild(newMessage);
    });
});
