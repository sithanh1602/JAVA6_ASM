from flask import Flask, request
from flask_cors import CORS
from chatbot_app.chatbot import chatbot_app
from GeminiDashboard.main import gemini_app
from AI_BUILD_PC.app import build_PC  # Import Blueprint

server = Flask(__name__)
CORS(server)

# Đăng ký Blueprint cho gemini_app
server.register_blueprint(gemini_app, url_prefix="/gemini")

server.register_blueprint(chatbot_app, url_prefix="/chatbot")

server.register_blueprint(build_PC, url_prefix="/buildPC")

if __name__ == "__main__":
    server.run(host='0.0.0.0', port=5000, debug=True)
