-- ============================================================
-- AI PROVIDER EXPANSION V2
-- Adds DeepSeek, Together.ai, OpenRouter
-- Updates Groq models (decommissioned model removed)
-- ============================================================

-- Fix Groq (decommissioned llama3-8b-8192 replaced)
UPDATE llm_providers
SET default_model = 'llama-3.1-8b-instant',
    available_models = ARRAY[
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ],
    notes = 'PRIORITY 1 — Free tier, 14,400 req/day. Fastest inference. Default for all internal tools.'
WHERE provider_key = 'groq';

-- Google Gemini — PRIORITY 2
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'google', 'Google Gemini', 'https://generativelanguage.googleapis.com',
  'gemini-2.0-flash',
  ARRAY['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  false, false, true, 0.0001, 0.0004,
  'PRIORITY 2 — Very cheap, generous free tier. Chat fallback when Groq is rate-limited.'
) ON CONFLICT (provider_key) DO UPDATE SET
  default_model = EXCLUDED.default_model,
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- DeepSeek — PRIORITY 3 (NEW)
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'deepseek', 'DeepSeek', 'https://api.deepseek.com/v1',
  'deepseek-chat',
  ARRAY['deepseek-chat', 'deepseek-reasoner'],
  false, false, true, 0.00027, 0.0011,
  'PRIORITY 3 — OpenAI-compatible. deepseek-chat (V3) often beats GPT-4o at 10x lower cost. deepseek-reasoner (R1) for chain-of-thought analysis tasks.'
) ON CONFLICT (provider_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  api_base_url = EXCLUDED.api_base_url,
  default_model = EXCLUDED.default_model,
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- Kimi / Moonshot — PRIORITY 4
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'moonshot', 'Kimi / Moonshot AI', 'https://api.moonshot.cn/v1',
  'kimi-k2-instruct',
  ARRAY['kimi-k2-instruct', 'kimi-k2.5', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  false, false, true, 0.0014, 0.0014,
  'PRIORITY 4 — OpenAI-compatible. Kimi K2 excellent at agentic tasks and coding. 256K context window.'
) ON CONFLICT (provider_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  api_base_url = EXCLUDED.api_base_url,
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- Together AI — PRIORITY 5 (full model list)
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'together', 'Together AI', 'https://api.together.xyz/v1',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  ARRAY[
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Llama-3.1-8B-Instruct-Turbo',
    'meta-llama/Llama-3.1-70B-Instruct-Turbo',
    'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'moonshotai/Kimi-K2.5',
    'deepseek-ai/DeepSeek-V3',
    'google/gemma-2-9b-it',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'NovaSky-AI/Sky-T1-32B-Preview'
  ],
  false, false, true, 0.0009, 0.0009,
  'PRIORITY 5 — OpenAI-compatible. 50+ open-source models. Also hosts Kimi K2.5 and DeepSeek-V3 as alternatives to direct APIs.'
) ON CONFLICT (provider_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  api_base_url = EXCLUDED.api_base_url,
  default_model = EXCLUDED.default_model,
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- OpenRouter — PRIORITY 6 (meta-provider, NEW)
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1',
  'meta-llama/llama-3.3-70b-instruct:free',
  ARRAY[
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'moonshotai/kimi-k2.5',
    'deepseek/deepseek-r1',
    'anthropic/claude-haiku-4-5',
    'openai/gpt-4o-mini'
  ],
  false, false, true, 0, 0,
  'PRIORITY 6 — Meta-provider: 200+ models, one key. Has FREE tier models (:free suffix). Use as ultimate fallback. Also supports native multi-model fallback routing.'
) ON CONFLICT (provider_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  api_base_url = EXCLUDED.api_base_url,
  default_model = EXCLUDED.default_model,
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- OpenAI — PRIORITY 7
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'openai', 'OpenAI', 'https://api.openai.com/v1',
  'gpt-4o-mini',
  ARRAY['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
  false, false, true, 0.00015, 0.0006,
  'PRIORITY 7 — More expensive relative to DeepSeek/Gemini. gpt-4o-mini only for cost control.'
) ON CONFLICT (provider_key) DO UPDATE SET
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- Anthropic — PRIORITY 8 (last resort)
INSERT INTO llm_providers (
  provider_key, display_name, api_base_url, default_model,
  available_models, is_enabled, is_free_tier,
  requires_super_admin_approval, cost_per_1k_input_tokens,
  cost_per_1k_output_tokens, notes
) VALUES (
  'anthropic', 'Anthropic Claude', 'https://api.anthropic.com',
  'claude-haiku-4-5-20251001',
  ARRAY['claude-haiku-4-5-20251001', 'claude-sonnet-4-20250514'],
  false, false, true, 0.00025, 0.00125,
  'PRIORITY 8 — Highest cost, different API format (not OpenAI-compatible). Reserve for highest-quality needs only.'
) ON CONFLICT (provider_key) DO UPDATE SET
  available_models = EXCLUDED.available_models,
  notes = EXCLUDED.notes;

-- External API keys table (for OpenClaw and external agents)
CREATE TABLE IF NOT EXISTS external_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,
  key_prefix TEXT NOT NULL DEFAULT 'pdtv_',
  key_hash TEXT NOT NULL UNIQUE,
  key_last4 TEXT NOT NULL,
  allowed_endpoints TEXT[] DEFAULT ARRAY['api/read-only'],
  allowed_actions TEXT[] DEFAULT ARRAY['search', 'list_businesses', 'get_business'],
  rate_limit_per_hour INTEGER DEFAULT 100,
  agent_name TEXT,
  agent_description TEXT,
  owned_by_user_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id),
  revoke_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_keys_hash ON external_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_external_keys_active ON external_api_keys(is_active) WHERE is_active = true;

ALTER TABLE external_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admins manage external keys" ON external_api_keys;
CREATE POLICY "Super admins manage external keys" ON external_api_keys
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'super_admin')
  );
