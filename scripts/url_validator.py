import os
import re
import requests
from concurrent.futures import ThreadPoolExecutor

# Regex to find URLs
URL_PATTERN = r'https?://[^\s<>"\'\]\)]+'

def extract_urls(file_path):
    urls = set()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            found = re.findall(URL_PATTERN, content)
            urls.update(found)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return urls

def check_url(url):
    try:
        # Use a common User-Agent to avoid being blocked by simple bots filters
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
        # If HEAD fails, try GET (some servers block HEAD)
        if response.status_code >= 400:
            response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        return url, response.status_code, "OK" if response.status_code < 400 else "FAILED"
    except Exception as e:
        return url, None, f"ERROR: {str(e)}"

def validate_project_urls(directory='.'):
    target_extensions = ('.html', '.md')
    all_urls = set()
    
    print(f"--- Scanning directory: {os.path.abspath(directory)} ---")
    for root, _, files in os.walk(directory):
        if '.git' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith(target_extensions):
                file_path = os.path.join(root, file)
                urls = extract_urls(file_path)
                if urls:
                    print(f"Found {len(urls)} URLs in {file_path}")
                    all_urls.update(urls)

    if not all_urls:
        print("No URLs found.")
        return

    print(f"\n--- Validating {len(all_urls)} unique URLs ---\n")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(check_url, all_urls))

    failed_count = 0
    for url, code, status in results:
        if status != "OK":
            print(f"[ {status} ] {code if code else '---'} -> {url}")
            failed_count += 1
        else:
            print(f"[  {status}  ] {code} -> {url}")

    print(f"\n--- Validation Complete: {len(all_urls)} checked, {failed_count} failed. ---")

if __name__ == "__main__":
    validate_project_urls()
