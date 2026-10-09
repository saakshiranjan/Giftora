from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

driver = webdriver.Chrome(options=options)
driver.get("http://localhost:3000")

time.sleep(3) # Wait for Clerk to load

try:
    # Click sign up button
    btn = driver.find_element(By.ID, "clerkSignUpBtn")
    driver.execute_script("arguments[0].click();", btn)
    time.sleep(3) # Wait for modal to attempt to open
    
    logs = driver.get_log('browser')
    for entry in logs:
        print(f"[{entry['level']}] {entry['message']}")
except Exception as e:
    print(f"Error: {e}")

driver.quit()
