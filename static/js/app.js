// Chat Application JavaScript

class ChatApp {
    constructor() {
        this.currentChatId = null;
        this.sidebarOpen = true;
        
        // DOM Elements
        this.sidebar = document.getElementById('sidebar');
        this.chatHistory = document.getElementById('chatHistory');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.menuToggle = document.getElementById('menuToggle');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.chatTitle = document.getElementById('chatTitle');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadChatHistory();
        this.autoResizeTextarea();
    }
    
    bindEvents() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // New chat button
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        
        // Menu toggle for mobile
        this.menuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        
        // Toggle sidebar button
        this.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        const newHeight = Math.min(this.messageInput.scrollHeight, 120);
        this.messageInput.style.height = newHeight + 'px';
    }
    
    toggleMobileSidebar() {
        this.sidebar.classList.toggle('open');
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        this.sidebarOpen = !this.sidebarOpen;
        
        const icon = this.toggleSidebarBtn.querySelector('.icon');
        icon.textContent = this.sidebarOpen ? '◀' : '▶';
    }
    
    async loadChatHistory() {
        try {
            const response = await fetch('/api/chats');
            const chats = await response.json();
            
            this.chatHistory.innerHTML = '';
            
            if (chats.length === 0) {
                this.chatHistory.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No chat history</p>';
                return;
            }
            
            chats.forEach(chat => {
                const chatElement = this.createChatHistoryItem(chat);
                this.chatHistory.appendChild(chatElement);
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    createChatHistoryItem(chat) {
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        if (chat.id === this.currentChatId) {
            item.classList.add('active');
        }
        
        const title = document.createElement('span');
        title.className = 'chat-history-item-title';
        title.textContent = chat.title;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'chat-history-item-delete';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = 'Delete chat';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteChat(chat.id);
        });
        
        item.appendChild(title);
        item.appendChild(deleteBtn);
        
        item.addEventListener('click', () => this.loadChat(chat.id));
        
        return item;
    }
    
    async loadChat(chatId) {
        try {
            const response = await fetch(`/api/chat/${chatId}`);
            const chat = await response.json();
            
            this.currentChatId = chatId;
            this.chatTitle.textContent = chat.title;
            
            // Update active state in sidebar
            document.querySelectorAll('.chat-history-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Render messages
            this.chatMessages.innerHTML = '';
            chat.messages.forEach(message => {
                this.appendMessage(message.content, message.role, message.timestamp);
            });
            
            this.scrollToBottom();
            this.loadChatHistory(); // Refresh to update active state
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }
    
    startNewChat() {
        this.currentChatId = null;
        this.chatTitle.textContent = 'New Conversation';
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to AI Chat</h2>
                <p>Start a conversation by typing your message below.</p>
            </div>
        `;
        this.messageInput.focus();
        this.loadChatHistory();
        
        // Close mobile sidebar if open
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('open');
        }
    }
    
    async deleteChat(chatId) {
        if (!confirm('Are you sure you want to delete this chat?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/chat/${chatId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                if (chatId === this.currentChatId) {
                    this.startNewChat();
                } else {
                    this.loadChatHistory();
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // Remove welcome message if it exists
        const welcomeMsg = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        // Add user message to UI
        this.appendMessage(message, 'user');
        this.scrollToBottom();
        
        // Disable send button during request
        this.sendBtn.disabled = true;
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    chat_id: this.currentChatId
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.currentChatId = data.chat_id;
                
                // Update chat title if it's a new chat
                if (this.chatTitle.textContent === 'New Conversation') {
                    this.chatTitle.textContent = data.title;
                }
                
                // Add assistant response
                this.appendMessage(data.response, 'assistant');
                this.scrollToBottom();
                this.loadChatHistory();
            } else {
                this.appendMessage(`Error: ${data.error}`, 'assistant');
            }
        } catch (error) {
            this.appendMessage(`Error: Failed to send message. ${error.message}`, 'assistant');
        } finally {
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }
    
    appendMessage(content, role, timestamp = null) {
        const container = document.createElement('div');
        container.className = `message-container ${role}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = content;
        
        container.appendChild(bubble);
        
        if (timestamp) {
            const timeEl = document.createElement('div');
            timeEl.className = 'message-timestamp';
            const date = new Date(timestamp);
            timeEl.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            container.appendChild(timeEl);
        }
        
        this.chatMessages.appendChild(container);
    }
    
    showLoadingIndicator() {
        const container = document.createElement('div');
        container.className = 'loading-indicator';
        container.id = 'loadingIndicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            container.appendChild(dot);
        }
        
        this.chatMessages.appendChild(container);
        this.scrollToBottom();
    }
    
    hideLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
