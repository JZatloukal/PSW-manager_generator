#!/usr/bin/env python3
"""
WSGI entry point for PythonAnywhere deployment
"""
import sys
import os

# Add the project directory to Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_dir)

# Change to project directory
os.chdir(project_dir)

# Import and create the Flask app
from backend import create_app
application = create_app()

if __name__ == "__main__":
    application.run()
