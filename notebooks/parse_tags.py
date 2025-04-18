import pandas as pd
import re

# Read the input file
with open('tags_text.txt', 'r', encoding='utf-8') as file:
    content = file.read()

# Parse the tags and participants using regex
pattern = r'([^(]+)\s*\((\d+)\s*participante[s]?\)'
matches = re.findall(pattern, content)

# Create lists for DataFrame
tags = []
participants = []

for tag, count in matches:
    tags.append(tag.strip())
    participants.append(int(count))

# Create DataFrame
df = pd.DataFrame({
    'Tag': tags,
    'participates': participants
})

# Sort by number of participants in descending order
df = df.sort_values('participates', ascending=False)

# Save to Excel
df.to_excel('tags_analysis.xlsx', index=False)
print(f"Successfully processed {len(df)} tags and saved to tags_analysis.xlsx")