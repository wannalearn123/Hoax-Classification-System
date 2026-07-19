import logging
import csv
import logging
import time
import os
from datetime import datetime

# mematikan log default uvicorn
logging.getLogger("uvicorn.access").disabled = True

log_path = "logs.csv"
if not os.path.exists(log_path):
    with open("log.csv", "w", newline="") as f:
        csv.writer(f).writerow(["timestamp", "method", "path", "status", ""])
