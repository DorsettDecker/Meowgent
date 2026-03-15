# AI Chat Web Interface

A modern, responsive web interface for interacting with a Python backend application. Features a dark theme with an intuitive chat UI.

## Features

- **Chat Interface**: Clean, modern chat interface for sending and receiving messages
- **Sidebar**: Left sidebar with chat history management
- **New Chat**: Easy option to start new conversations
- **Dark Theme**: Professional dark color scheme
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Message History**: Persistent chat history during session
- **Delete Chats**: Option to delete individual chat histories

## Project Structure

```
/workspace
├── app.py                 # Flask backend application
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Dark theme styles
│   └── js/
│       └── app.js        # Frontend JavaScript
└── README.md
```

## Installation

1. Install required dependencies:
```bash
pip install flask
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## Customization

### Modifying the Python Backend Logic

Edit the `process_user_prompt()` function in `app.py` to integrate your own Python application logic:

```python
def process_user_prompt(prompt):
    """
    Process the user's prompt and return output.
    Replace this with your actual Python application logic.
    """
    # Your custom processing code here
    response = your_function(prompt)
    return response
```

### Changing the Color Theme

Modify the CSS variables in `static/css/style.css`:

```css
:root {
    --bg-primary: #1a1a2e;      /* Main background */
    --bg-secondary: #16213e;    /* Sidebar/Header background */
    --accent-color: #e94560;    /* Primary accent color */
    /* ... other colors */
}
```

## API Endpoints

- `GET /` - Main chat interface
- `POST /api/chat` - Send a message
- `GET /api/chats` - Get all chat histories
- `GET /api/chat/<chat_id>` - Get specific chat
- `DELETE /api/chat/<chat_id>` - Delete a chat

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
