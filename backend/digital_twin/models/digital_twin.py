from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base
from models import DigitalTwinModel as DigitalTwin, Simulation

# The models are imported from models.py to avoid duplicate definitions 