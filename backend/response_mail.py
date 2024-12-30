import openai
import os
from dotenv import load_dotenv

OPEN_AI_API_KEY = os.environ.get('OPEN_AI_API_KEY')

def generate_emailResponse(text):
    openai.api_key = OPEN_AI_API_KEY
    prompt = f"""
    You are highly skilled in crafting professional and polite email responses. Based on the provided email, draft a clear and concise reply.Start the response with a polite salutation such as 'Dear [Name],' or 'Hello,' followed by the main content paragraph. Ensure the response is professional and excludes any signature or closing phrase or additional niceties such as best regeads ETC, as these are typically pre-added in most email systems. .

    Email Body: {text}

    Draft a reply:
    """


    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant skilled in drafting professional email responses."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )

    generated_response = response['choices'][0]['message']['content']
    return generated_response
