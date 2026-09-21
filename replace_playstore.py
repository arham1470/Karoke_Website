import os
import glob
import re

directory = 'c:/Users/safra/Downloads/TT Metro Campus/Karoke_Website'
html_files = glob.glob(os.path.join(directory, '*.html'))

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace Playstore link
    # Look for <a href="https://play.google.com" target="_blank">Playstore</a> 
    # Or variations of it in the nav
    new_content = re.sub(
        r'<a\s+href="https://play\.google\.com"[^>]*>Playstore</a>',
        r'<a href="singer.html">Playstore</a>',
        content,
        flags=re.IGNORECASE
    )
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Updated ' + os.path.basename(filepath))
print('Done!')
