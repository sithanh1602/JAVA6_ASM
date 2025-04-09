import json
import random
import re
import unicodedata
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

class VectorizedChatbot:
    def __init__(self, data_path="data.json", model_path="chatbot_model.pkl"):
        """Khởi tạo chatbot với nhúng vector"""
        self.data_path = data_path
        self.model_path = model_path
        self.responses = {}
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.intent_to_responses = {}
        self.intent_labels = []
        
        # Tải dữ liệu
        self.load_data()
        
        # Tải mô hình hoặc tạo mới nếu chưa có
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.train_model()
    
    def load_data(self):
        """Tải dữ liệu từ file JSON"""
        try:
            with open(self.data_path, "r", encoding="utf-8") as file:
                self.responses = json.load(file)
            
            # Tạo danh sách các ý định và câu ví dụ
            self.intent_examples = []
            
            # Thêm các câu đã có trong responses
            for intent, response_list in self.responses.items():
                self.intent_to_responses[intent] = response_list
                self.intent_labels.append(intent)
                self.intent_examples.append(intent)  # Sử dụng từ khóa làm ví dụ
            
            # Thêm các câu ví dụ để làm phong phú tập dữ liệu
            self.add_example_questions()
                
        except Exception as e:
            print(f"Lỗi khi tải dữ liệu: {e}")
            self.responses = {}
    
    def add_example_questions(self):
        """Thêm các câu ví dụ theo từng ý định để huấn luyện tốt hơn"""
        # Ví dụ cho các ý định thường gặp
        examples = {
            "dia chi": [
                "Địa chỉ cửa hàng ở đâu?",
                "Cho hỏi cửa hàng nằm ở đâu vậy?",
                "Cửa hàng các bạn ở đâu?",
                "Tôi muốn biết địa chỉ shop",
                "Vị trí cửa hàng ở đâu vậy?",
                "Cửa hàng nằm trên đường nào?",
                "Làm sao để tới cửa hàng?"
            ],
            "gio lam viec": [
                "Cửa hàng mở cửa lúc mấy giờ?",
                "Mấy giờ đóng cửa?",
                "Thời gian làm việc của cửa hàng?",
                "Shop mở cửa vào ngày cuối tuần không?",
                "Cửa hàng có làm việc vào chủ nhật không?",
                "Thứ 7 cửa hàng có mở cửa không?",
                "Giờ làm việc của cửa hàng thế nào?"
            ],
            "bao hanh": [
                "Chính sách bảo hành là gì?",
                "Sản phẩm được bảo hành bao lâu?",
                "Nếu hàng bị lỗi thì bảo hành như thế nào?",
                "Máy tính bị hỏng thì bảo hành ra sao?",
                "Thời gian bảo hành sản phẩm là bao nhiêu?",
                "Máy bị lỗi trong thời gian bảo hành thì sao?",
                "Điều kiện bảo hành là gì?"
            ],
            "san pham": [
                "Cửa hàng có bán linh kiện gì?",
                "Có những sản phẩm nào?",
                "Tôi muốn mua máy tính, có loại nào tốt?",
                "Có bán RAM không?",
                "Shop có những loại màn hình nào?",
                "Có bán laptop không?",
                "Giá cả các sản phẩm thế nào?"
            ],
            "thai": [
                "thái có phải là người thông minh không?",
                "cho tôi biết về thái",
                "thái là ai vậy?",
                "tôi muốn biết thông tin về thái",
                "thái có khả năng gì?",
                "thái có học giỏi không?",
                "thái làm việc ở đâu?",
                "có ai tên thái không?",
                "thái là người như thế nào?",
                "nói cho tôi biết về thái",
                "thái có phải là nhân viên không?",
                "thái có làm ở đây không?",
                "thái có năng lực không?",
                "thái có tiến bộ không?",
                "thái có biết lập trình không?",
                "thái làm được việc gì?",
                "thái có đang làm việc ở đây không?",
                "thái là người quê ở đâu?",
                "ai là người tên thái?"
            ], 
        }
        
        # Thêm các câu ví dụ vào tập huấn luyện
        for intent, example_list in examples.items():
            if intent in self.intent_labels:
                for example in example_list:
                    self.intent_examples.append(example)
                    self.intent_labels.append(intent)
    
    def normalize_text(self, text):
        """Chuẩn hóa văn bản tiếng Việt"""
        # Chuyển về chữ thường
        text = text.lower()
        
        # Loại bỏ dấu tiếng Việt
        text = unicodedata.normalize('NFD', text)
        text = re.sub(r'[\u0300-\u036f]', '', text)
        
        # Thay thế 'đ' bằng 'd'
        text = text.replace('đ', 'd')
        
        # Loại bỏ khoảng trắng thừa
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def preprocess_examples(self):
        """Chuẩn hóa tất cả các câu ví dụ"""
        return [self.normalize_text(example) for example in self.intent_examples]
    
    def train_model(self):
        """Huấn luyện mô hình nhúng vector với TF-IDF"""
        try:
            # Chuẩn bị dữ liệu
            normalized_examples = self.preprocess_examples()
            
            # Tạo mô hình TF-IDF
            self.tfidf_vectorizer = TfidfVectorizer(
                min_df=1, 
                max_df=0.95, 
                sublinear_tf=True, 
                use_idf=True, 
                ngram_range=(1, 2)  # Sử dụng cả uni-grams và bi-grams
            )
            
            # Huấn luyện và chuyển đổi các câu ví dụ thành vector
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(normalized_examples)
            
            # Lưu mô hình
            self.save_model()
            
            print("Đã huấn luyện và lưu mô hình thành công!")
            
        except Exception as e:
            print(f"Lỗi khi huấn luyện mô hình: {e}")
    
    def save_model(self):
        """Lưu mô hình đã huấn luyện"""
        model_data = {
            'vectorizer': self.tfidf_vectorizer,
            'matrix': self.tfidf_matrix,
            'intent_labels': self.intent_labels,
            'intent_examples': self.intent_examples,
            'intent_to_responses': self.intent_to_responses
        }
        
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self):
        """Tải mô hình đã huấn luyện"""
        try:
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.tfidf_vectorizer = model_data['vectorizer']
            self.tfidf_matrix = model_data['matrix']
            self.intent_labels = model_data['intent_labels']
            self.intent_examples = model_data['intent_examples']
            self.intent_to_responses = model_data['intent_to_responses']
            
            print("Đã tải mô hình thành công!")
            
        except Exception as e:
            print(f"Lỗi khi tải mô hình: {e}")
            # Nếu có lỗi, huấn luyện lại mô hình
            self.train_model()
    
    def predict_intent(self, user_input, threshold=0.6):
        """Dự đoán ý định từ câu nhập của người dùng"""
        # Chuẩn hóa câu nhập
        normalized_input = self.normalize_text(user_input)
        
        # Chuyển đổi câu nhập thành vector TF-IDF
        input_vector = self.tfidf_vectorizer.transform([normalized_input])
        
        # Tính toán độ tương đồng cosine giữa câu nhập và tất cả các câu ví dụ
        cosine_similarities = cosine_similarity(input_vector, self.tfidf_matrix).flatten()
        
        # Tìm chỉ số của câu ví dụ có độ tương đồng cao nhất
        max_similarity_index = cosine_similarities.argmax()
        max_similarity = cosine_similarities[max_similarity_index]
        
        # Nếu độ tương đồng cao hơn ngưỡng, trả về ý định tương ứng
        if max_similarity >= threshold:
            predicted_intent = self.intent_labels[max_similarity_index]
            confidence = max_similarity
            return predicted_intent, confidence
        
        return None, 0.0
    
    def get_response(self, user_input):
        """Trả về câu trả lời dựa trên ý định dự đoán"""
        # Dự đoán ý định
        predicted_intent, confidence = self.predict_intent(user_input)
        
        # Nếu có ý định được dự đoán
        if predicted_intent:
            # Kiểm tra xem ý định có trong danh sách câu trả lời không
            if predicted_intent in self.intent_to_responses:
                response = random.choice(self.intent_to_responses[predicted_intent])
                return response, predicted_intent, confidence
        
        # Trả về câu trả lời mặc định
        default_response = "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về linh kiện máy tính, địa chỉ cửa hàng, giờ làm việc, bảo hành, hỗ trợ kỹ thuật, v.v."
        return default_response, None, 0.0
    
    def update_model(self, new_example, intent):
        """Cập nhật mô hình với câu ví dụ mới"""
        # Thêm câu ví dụ mới vào danh sách
        self.intent_examples.append(new_example)
        self.intent_labels.append(intent)
        
        # Huấn luyện lại mô hình
        self.train_model()

# Tích hợp với Flask
def setup_chatbot():
    """Thiết lập chatbot và trả về hàm get_response để sử dụng với Flask"""
    chatbot = VectorizedChatbot()
    
    def get_response_for_flask(message):
        response, intent, confidence = chatbot.get_response(message)
        # Có thể log thông tin để debug
        print(f"Câu hỏi: {message}")
        print(f"Ý định dự đoán: {intent} (độ tin cậy: {confidence:.2f})")
        return response
    
    return get_response_for_flask

# Hàm get_response để sử dụng trong Flask
get_response = setup_chatbot()

# Ví dụ sử dụng
if __name__ == "__main__":
    chatbot = VectorizedChatbot()
    
    # Các câu hỏi kiểm tra
    test_questions = [
        "Địa chỉ cửa hàng ở đâu?",
        "Shop các bạn nằm ở đâu vậy?",
        "Cửa hàng mở cửa lúc mấy giờ?",
        "BẢO HÀNH sản phẩm thế nào?",
        "Có bán linh kiện không?",
        "Tôi cần mua laptop",
        "Máy tính bị lỗi thì làm sao?",
        "Tôi muốn biết vị trí cửa hàng",
        "Thái là ai vậy?",
        "Thái có thông minh không?",
        "Thằng thái ngu lắm phải không?"
    ]
    
    print("=== KIỂM TRA DỰ ĐOÁN Ý ĐỊNH VỚI NHÚNG VECTOR ===")
    for question in test_questions:
        response, intent, confidence = chatbot.get_response(question)
        print(f"\nCâu hỏi: {question}")
        print(f"Ý định dự đoán: {intent} (độ tin cậy: {confidence:.2f})")
        print(f"Phản hồi: {response}")