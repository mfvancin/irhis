import time
from sqlalchemy import create_engine
from core.config import settings
from database import Base
import os

# It can take a few seconds for the database service to be ready.
# We will retry a few times to give it a chance to start.
retries = 5
delay = 5
for i in range(retries):
    try:
        print("Attempting to connect to the database...")
        # Use the DATABASE_URL from your settings
        # Ensure your .env file is correctly set up for this to work locally.
        engine = create_engine(str(settings.DATABASE_URL))
        
        # This command connects to the database and creates the tables.
        Base.metadata.create_all(bind=engine)
        
        print("Database tables created successfully!")
        break # Exit the loop if successful
    except Exception as e:
        print(f"Error connecting to database: {e}")
        if i < retries - 1:
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)
        else:
            print("Could not connect to the database after several retries. Aborting.")
            exit(1) 