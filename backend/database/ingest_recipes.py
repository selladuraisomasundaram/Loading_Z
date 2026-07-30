import os
import csv
import json
import re

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'english_ingredients.csv')
JSON_PATH = os.path.join(os.path.dirname(__file__), 'recipe_ingredients.json')

MEASUREMENTS = [
    r'\bcups?\b', r'\bteaspoons?\b', r'\btablespoons?\b', r'\bgrams?\b',
    r'\bsprigs?\b', r'\bpinch(?:es)?\b', r'\binch(?:es)?\b', r'\bwhole\b',
    r'\bhalf\b', r'\bslices?\b', r'\bml\b', r'\bliter\b', r'\bl\b',
    r'\bkg\b', r'\bcloves?\b', r'\btbsp\b', r'\btsp\b', r'\bpieces?\b',
    r'\boz\b', r'\bounds?\b', r'\bhandful\b', r'\bdrops?\b'
]

def clean_ingredient(raw: str) -> str:
    # Remove text after '-' or ' - ' which usually contains prep instructions
    part = raw.split('-')[0]
    
    # Remove parenthesis content
    part = re.sub(r'\(.*?\)', '', part)
    
    # Remove numbers and fractions (like 1-1/2, 1/2)
    part = re.sub(r'\d+(?:-\d+)?(?:/\d+)?', '', part)
    
    # Remove measurements
    for m in MEASUREMENTS:
        part = re.sub(m, '', part, flags=re.IGNORECASE)
        
    # Clean up whitespace and non-alphabet chars left over
    part = re.sub(r'[^a-zA-Z\s]', '', part)
    
    # Normalize spaces
    part = ' '.join(part.split()).strip().title()
    return part

def main():
    # Make sure backend/database exists
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)

    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {os.path.abspath(CSV_PATH)}")
        return

    recipes = []
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            recipe_id = f"RECIPE_{i+1:04d}"
            raw_ingredients_str = row.get("TranslatedIngredients", "")
            
            # Split by comma
            raw_list = raw_ingredients_str.split(',')
            
            clean_list = []
            for raw in raw_list:
                cleaned = clean_ingredient(raw)
                if cleaned and len(cleaned) > 2:
                    clean_list.append(cleaned)
            
            # Remove duplicates while preserving order
            clean_list = list(dict.fromkeys(clean_list))
            
            recipes.append({
                "recipe_id": recipe_id,
                "clean_ingredients": clean_list
            })
            
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2)
        
    print(f"Successfully ingested {len(recipes)} recipes into {os.path.abspath(JSON_PATH)}")

if __name__ == "__main__":
    main()
