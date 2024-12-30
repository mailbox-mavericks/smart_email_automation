import pandas as pd
from sqlalchemy.orm import Session
from models import Emails_Data, Email_UniqueID


def insert_dataframe_into_db(df: pd.DataFrame, db: Session):
    db.query(Emails_Data).delete()
    for _, row in df.iterrows():
        entry = Emails_Data(
            subject = row['subject'],  # Replace with actual column names
            body=row['body'],
            priority = row['Priority'],
            sentiment = row['Sentiment']
        )
        db.add(entry)
    db.commit()

def insert_uniqueid_dataframe_into_db(df: pd.DataFrame, db: Session):
    db.query(Email_UniqueID).delete()
    for _, row in df.iterrows():
        entry = Email_UniqueID(
            email_unique_id  = row['email_unique_id']
        )
        db.add(entry)
    db.commit()
