-- Fix decommissioned Groq models
UPDATE llm_providers
SET default_model = 'llama-3.1-8b-instant',
    available_models = ARRAY['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
WHERE provider_key = 'groq';
