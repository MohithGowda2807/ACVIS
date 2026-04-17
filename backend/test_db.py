try:
    from .database import test_connection
except ImportError:
    from database import test_connection

test_connection()
