import os
import json
from typing import List

RULES_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'rules')
FMCG_RULES_PATH = os.path.join(RULES_DIR, 'indian_fmcg_rules.json')
STAPLES_PATH = os.path.join(RULES_DIR, 'cold_start_staples.json')

def load_json_file(path: str, default_val=None):
    if default_val is None:
        default_val = [] if 'staples' in path else {}
    if not os.path.exists(path):
        return default_val
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default_val

def get_co_occurrence_candidates(cart_items: List[str]) -> List[str]:
    """
    Returns complimentary items based on Indian FMCG co-occurrence rules.
    If the cart is empty, returns cold-start staples.
    """
    staples = load_json_file(STAPLES_PATH, default_val=[])
    
    if not cart_items:
        return staples
        
    rules = load_json_file(FMCG_RULES_PATH, default_val={})
    candidates_score = {}
    
    for item in cart_items:
        item_lower = item.lower()
        # Find which rules apply to this cart item
        for key, recommendations in rules.items():
            if key in item_lower:
                for rec in recommendations:
                    candidates_score[rec] = candidates_score.get(rec, 0) + 1
                    
    if not candidates_score:
        return staples
        
    # Sort candidates by score descending
    sorted_candidates = sorted(candidates_score.items(), key=lambda x: x[1], reverse=True)
    return [candidate for candidate, score in sorted_candidates]
