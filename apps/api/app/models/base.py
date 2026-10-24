import datetime
from sqlalchemy.orm import declarative_base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
