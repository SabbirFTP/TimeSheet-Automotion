import json
import sys
from typing import List
from pydantic import ValidationError
from .models import Entry
from .utils import Logger

def load_entries(source: str = None) -> List[Entry]:
    """Loads JSON data from a file path, piped input, or manual terminal input."""
    raw_data = ""
    
    if source:
        # Load from file
        try:
            with open(source, "r", encoding="utf-8") as f:
                raw_data = f.read()
        except FileNotFoundError:
            Logger.error(f"File not found: {source}")
            sys.exit(1)
    elif not sys.stdin.isatty():
        # Load from piped input
        raw_data = sys.stdin.read()
    else:
        # Load from manual paste
        Logger.info("Paste your JSON array below (Press Ctrl+D on a new line to finish):")
        raw_data = sys.stdin.read()

    try:
        json_data = json.loads(raw_data)
        if not isinstance(json_data, list):
            Logger.error("Input JSON must be an array of objects.")
            sys.exit(1)
            
        entries = []
        for i, item in enumerate(json_data):
            try:
                entries.append(Entry(**item))
            except ValidationError as e:
                Logger.error(f"Validation error in entry {i + 1}:\n{e}")
                sys.exit(1)
                
        Logger.info(f"Parsed {len(entries)} valid entries.")
        return entries
        
    except json.JSONDecodeError as e:
        Logger.error(f"Invalid JSON format:\n{e}")
        sys.exit(1)
