from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DB_URL = 'sqlite:///./emails.db'
engine = create_engine(DB_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

# Database 2: read_mails.db
READ_MAIL_DB_URL = "sqlite:///./read_mails.db"
read_mail_engine = create_engine(READ_MAIL_DB_URL, connect_args={"check_same_thread": False})
ReadMailSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=read_mail_engine)


# Database 2: read_mails.db
LOADED_MAIL_DB_URL = "sqlite:///./loaded_emails.db"
loaded_mail_engine = create_engine(LOADED_MAIL_DB_URL, connect_args={"check_same_thread": False})
LoadedMailSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=loaded_mail_engine)


Base = declarative_base()