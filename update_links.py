import os
import glob
import re

html_files = glob.glob('*.html')
new_files = ['terms.html', 'privacy.html', 'refund.html', 'copyright.html', 'faq.html', 'download-guide.html', 'subscriptions.html', 'report-issue.html']

for file in html_files:
    if file in new_files:
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace each link
    content = re.sub(r'<li><a\s+href="[^"]*">Terms of Service</a></li>', r'<li><a href="terms.html">Terms of Service</a></li>', content)
    content = re.sub(r'<li><a\s+href="[^"]*">Privacy Policy</a></li>', r'<li><a href="privacy.html">Privacy Policy</a></li>', content)
    content = re.sub(r'<li><a\s+href="[^"]*">Refund Policy</a></li>', r'<li><a href="refund.html">Refund Policy</a></li>', content)
    content = re.sub(r'<li><a\s+href="[^"]*">Copyright Information</a></li>', r'<li><a href="copyright.html">Copyright Information</a></li>', content)
    
    content = re.sub(r'<li><a\s+href="[^"]*">FAQ</a></li>', r'<li><a href="faq.html">FAQ</a></li>', content)
    content = re.sub(r'<li><a\s+href="[^"]*">How to Download</a></li>', r'<li><a href="download-guide.html">How to Download</a></li>', content)
    content = re.sub(r'<li><a\s+href="[^"]*">Subscription Plans</a></li>', r'<li><a href="subscriptions.html">Subscription Plans</a></li>', content)
    content = re.sub(r'<li><a\s+href="[^"]*">Report an Issue</a></li>', r'<li><a href="report-issue.html">Report an Issue</a></li>', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated links in all HTML files.")
