import random
import time

class Logger:
    @staticmethod
    def info(msg: str):
        print(f"\033[94m[INFO]\033[0m {msg}")

    @staticmethod
    def success(msg: str):
        print(f"\033[92m[SUCCESS]\033[0m {msg}")

    @staticmethod
    def error(msg: str):
        print(f"\033[91m[ERROR]\033[0m {msg}")

    @staticmethod
    def warning(msg: str):
        print(f"\033[93m[WARNING]\033[0m {msg}")

def random_delay(min_delay: float, max_delay: float):
    """Sleeps for a random duration between min_delay and max_delay seconds."""
    delay = random.uniform(min_delay, max_delay)
    Logger.info(f"Waiting for {delay:.2f} seconds...")
    time.sleep(delay)
