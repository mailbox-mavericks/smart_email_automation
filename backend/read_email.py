import requests
from msal import ConfidentialClientApplication # type: ignore
import pandas as pd
from extract_content import extract_email_content
from dotenv import load_dotenv
import os, csv
from priority_analysis import analyze_priority
from sentiment_analysis import analyze_sentiment

from database import LoadedMailSessionLocal, loaded_mail_engine
from models import Email_UniqueID
from typing import Annotated
from sqlalchemy.orm import Session
from fastapi import Depends
import models

# Load the .env file
load_dotenv()

# Access the environment variables
OPEN_AI_API_KEY = os.environ.get('OPEN_AI_API_KEY')
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
TENANT_ID = os.environ.get('TENANT_ID')
USER_EMAIL = os.environ.get('USER_EMAIL')


def get_unique_mailid_db():
    db = LoadedMailSessionLocal()()
    try:
        yield db
    finally:
        db.close()
uniquemailid_db_dependancy = Annotated[Session, Depends(get_unique_mailid_db)]
models.Base.metadata.create_all(bind=loaded_mail_engine)


def get_unique_ids(email_db:uniquemailid_db_dependancy):
    # unique_ids = email_db.query(Email_UniqueID).all()
    print("unique_ids----------------------------------------------------------------")
    unique_ids = [email.email_unique_id for email in email_db.query(Email_UniqueID).all()]
    # print(unique_ids)
    return unique_ids

def get_df_from_outlook():

    # unique_mailid_list = []
    subject_list = []
    body_list = []
    sentiment_list = []
    priority_list = []
    message_dict = {}
    unique_mailid_dict = {}

    # Initialize MSAL app
    app = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=CLIENT_SECRET,
    )

    # Acquire token
    token_response = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

    if "access_token" in token_response:
        access_token = token_response["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        user_email = USER_EMAIL  # Replace with the user's email
        messages_url = f"https://graph.microsoft.com/v1.0/users/{user_email}/messages?$top=50"

        all_subjects = []  # List to store all message subjects

        while messages_url:
            messages_response = requests.get(messages_url, headers=headers)
            if messages_response.status_code == 200:
                response_data = messages_response.json()
                new_messages = response_data.get("value", [])
                # print(type(messages))
                print("new_messages--------------------------------------------------------------------")
                # print(new_messages)

                # Extract and store subjects
                for message in new_messages:
                    print("message-------------------------------------------------------------------")
                    # print(message)

                    # db for loading unique ids of each email
                    email_db = LoadedMailSessionLocal()
                    unique_ids = get_unique_ids(email_db)

                    if message.get("id") not in unique_ids:
                        print(message.get("id"))

                        print("New Mail Detected----------------------------------------------------------------")
                        print(message.get("id"))

                        unique_mail_id = message.get("id", "abc123")
                        unique_ids.append(unique_mail_id)

                        subject = message.get("subject", "No Subject")
                        subject_list.append(subject)
                        body = message.get("body", "No Body")
                        body_content = extract_email_content(body['content'])
                        body_list.append(body_content)
                        sentiment_list.append(analyze_sentiment(subject,OPEN_AI_API_KEY))
                        priority_list.append(analyze_priority(subject,OPEN_AI_API_KEY))

                        print("repeated call-------------------------------------------------------------------")

                # Get the nextLink if present
                messages_url = response_data.get("@odata.nextLink", None)
            else:
                print(f"Failed to fetch messages: {messages_response.json()}")
                break

    else:
        print(f"Error acquiring token: {token_response.get('error_description')}")

    # print(message_list)

    # df = pd.DataFrame([subject_list, body_list], columns=['Subject', 'Body'])
    # unique_mailid_dict['email_unique_id'] = unique_ids
    message_dict['subject'] = subject_list
    message_dict['body'] = body_list
    message_dict['Sentiment'] = sentiment_list
    message_dict['Priority'] = priority_list
    df = pd.DataFrame(message_dict)
    print(df)

    unique_mailid_dict['email_unique_id'] = unique_ids
    df_mail_unique_id = pd.DataFrame(unique_mailid_dict)
    print(df_mail_unique_id)
    
    
    return df,df_mail_unique_id

# if __name__ == '__main__':
#     df = get_df_from_outlook()
#     print(df)