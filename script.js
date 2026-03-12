// Simple chat UI behavior for index.html
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const chatBox = document.getElementById('chat-box');

  if (!input || !sendBtn || !chatBox) return;

  function appendMessage(role, text) {
    const item = document.createElement('div');
    item.className = `msg msg-${role}`;
    item.textContent = text;
    chatBox.appendChild(item);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function send() {
    const value = input.value.trim();
    if (!value) return;
    appendMessage('user', value);
    input.value = '';
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  });
});
