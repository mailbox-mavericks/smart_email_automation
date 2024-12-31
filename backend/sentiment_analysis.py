import openai
import os
from dotenv import load_dotenv

def analyze_sentiment(text, API_KEY):
    openai.api_key = API_KEY
    messages = [
        {"role": "system", "content": "You are a sentiment analysis assistant."},
        {"role": "user", "content": f"Classify the sentiment of the following text as Positive, Negative, or Neutral:\n\n{text}"}
    ]
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # Replace with "gpt-4" if needed
        messages=messages,
        temperature=0  # Makes the model's responses more deterministic
    )
    
    sentiment = response['choices'][0]['message']['content'].strip()
    if "NEGATIVE" in sentiment.upper():
        sentiment = "Negative"
    if "POSITIVE" in sentiment.upper():
        sentiment = "Positive"
    if "NEUTRAL" in sentiment.upper():
        sentiment = "Neutral"

    return sentiment

# if __name__== '__main__':
#     # Example usage
#     text = """
#             I am writing to express my concern regarding the delays we’ve been facing on the current project. Despite several reminders, there seems to be little progress, and it’s becoming increasingly difficult to meet our original deadline.
    
#             I understand there may be unforeseen challenges, but it is crucial that we address these issues immediately to avoid further setbacks. I expect a detailed update on your progress and how we can get back on track.
    
#             Regards,
#         """
#     load_dotenv()
#     OPEN_AI_API_KEY = os.environ.get('OPEN_AI_API_KEY')
#     sentiment = analyze_sentiment(text, OPEN_AI_API_KEY)
#     print(f"Sentiment: {sentiment}")
