import re
import math
from typing import Optional, Tuple

HOTEL_NOISE_TOKENS = {
    "hotel", "hotels", "resort", "resorts", "spa", "suites", "suite", 
    "inn", "palace", "the", "and", "by", "at", "ltd", "pvt", "group"
}

SIGHTSEEING_NOISE_TOKENS = {
    "tour", "tours", "ticket", "tickets", "admission", "entry", 
    "experience", "pass", "activity", "visit", "trip", "cruise", "guided"
}

def clean_text(text: Optional[str]) -> str:
    """Standardizes string by lowercasing, removing punctuation and trimming."""
    if not text:
        return ""
    text = text.lower()
    # Replace punctuation with single space
    text = re.sub(r"[^\w\s]", " ", text)
    # Collapse multiple whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_entity_name(name: Optional[str], category: str = "HOTEL") -> str:
    """Removes category-specific noise tokens and produces a normalized name string."""
    cleaned = clean_text(name)
    tokens = cleaned.split()
    
    noise_set = HOTEL_NOISE_TOKENS if category.upper() == "HOTEL" else SIGHTSEEING_NOISE_TOKENS
    filtered_tokens = [t for t in tokens if t not in noise_set]
    
    # If all tokens were filtered out, fallback to cleaned original
    if not filtered_tokens:
        return cleaned
    return " ".join(filtered_tokens)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in kilometers."""
    radius_earth_km = 6371.0
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return radius_earth_km * c

def geo_proximity_score(dist_km: float, max_radius_km: float = 1.0) -> float:
    """Scores geographic proximity from 0.0 to 1.0."""
    if dist_km <= 0.05:  # Within 50 meters
        return 1.0
    if dist_km >= max_radius_km:
        return 0.0
    return max(0.0, 1.0 - (dist_km / max_radius_km))
