import spacy

# Load the model once at the module level so it doesn't reload on every function call
# If this is too heavy, we can switch to en_core_web_sm for local testing, but _lg is better for accuracy
nlp = spacy.load("en_core_web_lg")

# We only care about geographical/location entities
TARGET_LABELS = {"GPE", "LOC", "FAC"}

def extract_entities(sentence: str) -> list[dict]:
    """
    Extracts geographical entities from a given sentence.
    LOCKED SIGNATURE: Do not change the return format, Backend relies on this.
    """
    doc = nlp(sentence)
    entities = []
    
    for ent in doc.ents:
        if ent.label_ in TARGET_LABELS:
            entities.append({
                "text": ent.text,
                "start": ent.start_char,
                "end": ent.end_char,
                "label": ent.label_
            })
            
    return entities