from fastapi import FastAPI, Depends, HTTPException, status, Path
from typing import Annotated
import models
from models import Emails_Data, ReadEmail
from database import engine, SessionLocal, read_mail_engine, ReadMailSessionLocal, LoadedMailSessionLocal, loaded_mail_engine
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from read_email import get_df_from_outlook
from response_mail import generate_emailResponse
from utils import insert_dataframe_into_db, insert_uniqueid_dataframe_into_db
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore
from contextlib import asynccontextmanager
from config import PRODUCTION


def fetch_and_insert_data():
    df,df_mail_unique_id = get_df_from_outlook()

    db = SessionLocal()
    insert_dataframe_into_db(df, db)
    db.close()

    db_unique_mailid = LoadedMailSessionLocal()
    insert_uniqueid_dataframe_into_db(df_mail_unique_id,db_unique_mailid)
    db_unique_mailid.close()


# Scheduler setup
# scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Starting application and scheduler...")
    fetch_and_insert_data
    # scheduler.add_job(fetch_and_insert_data )#, "interval", minutes=0.5)
    # scheduler.start()
    yield  # App runs here
    # Shutdown logic
    print("Shutting down application and scheduler...")
    # scheduler.shutdown()

# FastAPI app setup
app = FastAPI(lifespan=lifespan)

if PRODUCTION:
    url = "https://smart-email-automation-frontend.onrender.com"
else:
    url = "http://localhost:3000"

# Interaction with react app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[url],  # Allow React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Scheduler is running!"}

models.Base.metadata.create_all(bind=engine)
models.Base.metadata.create_all(bind=read_mail_engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependancy = Annotated[Session, Depends(get_db)]

# Dependency to get read email DB session
def get_read_mail_db():
    db = ReadMailSessionLocal()
    try:
        yield db
    finally:
        db.close()

read_db_dependancy = Annotated[Session, Depends(get_read_mail_db)]

@app.get("/read_all/")
def get_emails(email_db: db_dependancy, read_mail_db: read_db_dependancy):
    emails = email_db.query(Emails_Data).all()
    read_ids = {email.id for email in read_mail_db.query(ReadEmail).all()}
    # print("email----------------------------------------------------------------------------")
    

    # Add "isRead" field dynamically
    emails_with_status = [
        {
            "id": email.id,
            "subject": email.subject,
            "body": email.body,
            "priority": email.priority,
            "sentiment": email.sentiment,
            "isRead": email.id in read_ids
        }
        for email in emails
    ]
    # print(emails_with_status)
    return emails_with_status

@app.put("/read_all/{email_id}/mark-as-read")
def mark_as_read(email_id: int, read_mail_db: read_db_dependancy):
    # Check if already marked as read
    existing_read_email = read_mail_db.query(ReadEmail).filter(ReadEmail.id == email_id).first()
    if not existing_read_email:
        new_read_email = ReadEmail(id=email_id)
        read_mail_db.add(new_read_email)
        read_mail_db.commit()
        return {"message": f"Email {email_id} marked as read"}
    return {"message": f"Email {email_id} is already marked as read"}



@app.get("/generate_response")
def mark_as_read(text):
    email_response = generate_emailResponse(text)
    return email_response



@app.post('/refereshpage')
def refersh_page():
    try:
        fetch_and_insert_data()
    except Exception as e:
        return e
    


# @app.get("/emails/{email_id}", status_code=status.HTTP_200_OK)
# async def read_emails(db: db_dependancy, email_id: int = Path(gt=0)):
#     email_model = db.query(Emails_Data).filter(Emails_Data.id == email_id).first()
#     if email_model is not None:
#         return email_model
#     raise HTTPException(status_code=404, detail="Email not found")

# @app.post("/add-data/")
# async def add_data(db: db_dependancy):
#     df = get_df_from_outlook()
#     # Insert DataFrame into the database
#     insert_dataframe_into_db(df, db)

#     return {"message": "Data inserted successfully"}



# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Allow React app
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/greet/{name}")
# async def greet(name: str):
#     return {"message": f"Hello, {name}!"}
