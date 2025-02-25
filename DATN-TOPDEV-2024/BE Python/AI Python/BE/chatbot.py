from flask import Flask, request, jsonify
from data import get_response  # Import hàm get_response từ data.py

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Thiếu dữ liệu đầu vào"}), 400

    user_message = data["message"]
    bot_reply = get_response(user_message)

    
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
