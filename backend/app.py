#!/usr/bin/env python3
import sys
import os

# Přidat parent directory do Python path, aby importy fungovaly
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from backend import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
