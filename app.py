"""
Flask web application for chat interface with Python backend.
"""
from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import uuid
import json
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# In-memory storage for chat history (use database in production)
chat_histories = {}

def process_user_prompt(prompt):
    """
    Process the user's prompt and return output.
    Replace this with your actual Python application logic.
    """
    # Example: Simple echo with timestamp
    # Replace this with your actual processing logic
    response = f"Received: {prompt}\n\nThis is a sample response from the Python backend.\nProcessed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    return response

@app.route('/')
def index():
    """Render the main chat interface."""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages."""
    data = request.get_json()
    message = data.get('message', '')
    chat_id = data.get('chat_id')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Create new chat if no chat_id provided
    if not chat_id:
        chat_id = str(uuid.uuid4())
        chat_histories[chat_id] = {
            'id': chat_id,
            'title': message[:50] + '...' if len(message) > 50 else message,
            'created_at': datetime.now().isoformat(),
            'messages': []
        }
    
    # Add user message
    user_message = {
        'role': 'user',
        'content': message,
        'timestamp': datetime.now().isoformat()
    }
    chat_histories[chat_id]['messages'].append(user_message)
    
    # Process the prompt
    response_content = process_user_prompt(message)
    
    # Add assistant response
    assistant_message = {
        'role': 'assistant',
        'content': response_content,
        'timestamp': datetime.now().isoformat()
    }
    chat_histories[chat_id]['messages'].append(assistant_message)
    
    return jsonify({
        'chat_id': chat_id,
        'response': response_content,
        'title': chat_histories[chat_id]['title']
    })

@app.route('/api/chats', methods=['GET'])
def get_chats():
    """Get all chat histories."""
    chats = []
    for chat_id, chat_data in chat_histories.items():
        chats.append({
            'id': chat_data['id'],
            'title': chat_data['title'],
            'created_at': chat_data['created_at'],
            'message_count': len(chat_data['messages'])
        })
    # Sort by created_at descending
    chats.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify(chats)

@app.route('/api/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    """Get a specific chat history."""
    if chat_id not in chat_histories:
        return jsonify({'error': 'Chat not found'}), 404
    
    return jsonify(chat_histories[chat_id])

@app.route('/api/chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    """Delete a specific chat."""
    if chat_id in chat_histories:
        del chat_histories[chat_id]
        return jsonify({'success': True})
    return jsonify({'error': 'Chat not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
