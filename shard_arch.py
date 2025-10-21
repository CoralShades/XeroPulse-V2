import re
from pathlib import Path

# Read the architecture document
arch_file = Path("docs/architecture.md")
content = arch_file.read_text(encoding="utf-8")

# Find all level 2 sections (## headings) while being careful with code blocks
lines = content.split("\n")
sections = []
current_section = None
in_code_block = False

for i, line in enumerate(lines):
    # Track code blocks
    if line.strip().startswith("```"):
        in_code_block = not in_code_block
        continue
    
    # Only process ## headings outside of code blocks
    if not in_code_block and line.startswith("## ") and not line.startswith("### "):
        # Save previous section if exists
        if current_section:
            current_section["end_line"] = i
            sections.append(current_section)
        
        # Start new section
        heading = line[3:].strip()
        filename = heading.lower()
        filename = re.sub(r"[^\w\s-]", "", filename)
        filename = re.sub(r"[-\s]+", "-", filename).strip("-") + ".md"
        
        current_section = {
            "heading": heading,
            "start_line": i,
            "filename": filename
        }

# Don''t forget the last section
if current_section:
    current_section["end_line"] = len(lines)
    sections.append(current_section)

print(f"Found {len(sections)} level 2 sections:")
for sec in sections:
    print(f"  - {sec[''heading'']} -> {sec[''filename'']}")

# Now create the sharded files
output_dir = Path("docs/architecture")
output_dir.mkdir(exist_ok=True)

# Track section info for index
index_sections = []

for section in sections:
    # Extract section content
    section_lines = lines[section["start_line"]:section["end_line"]]
    
    # Adjust heading level from ## to #
    adjusted_lines = []
    for line in section_lines:
        if line.startswith("### "):
            adjusted_lines.append("## " + line[4:])
        elif line.startswith("#### "):
            adjusted_lines.append("### " + line[5:])
        elif line.startswith("##### "):
            adjusted_lines.append("#### " + line[6:])
        elif line.startswith("## "):
            adjusted_lines.append("# " + line[3:])
        else:
            adjusted_lines.append(line)
    
    # Write to file
    output_file = output_dir / section["filename"]
    output_file.write_text("\n".join(adjusted_lines), encoding="utf-8")
    print(f"Created: {output_file}")
    
    # Track for index
    index_sections.append({
        "title": section["heading"],
        "filename": section["filename"]
    })

# Create index.md
index_content = ["# XeroPulse Fullstack Architecture Document", ""]
index_content.append("This architecture document has been sharded into separate files for easier navigation and maintenance.")
index_content.append("")
index_content.append("## Sections")
index_content.append("")

for sec in index_sections:
    index_content.append(f"- [{sec[''title'']}](./{sec[''filename'']})")

index_file = output_dir / "index.md"
index_file.write_text("\n".join(index_content), encoding="utf-8")
print(f"Created index: {index_file}")

print(f"\nSuccessfully sharded architecture document into {len(sections)} files")
