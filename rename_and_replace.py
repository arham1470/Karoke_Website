import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace links
    content = content.replace('index.html', 'home.html')
    content = content.replace('login.html', 'index.html')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

os.rename('index.html', 'home.html')
os.rename('login.html', 'index.html')
