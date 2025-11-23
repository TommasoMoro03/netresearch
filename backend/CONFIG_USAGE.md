# Configuration Architecture Guide

## Overview

This project uses a robust configuration system based on `pydantic-settings` that automatically loads environment variables and provides type-safe access to configuration values. The system is configured to use **Together AI** with hackathon credits.

## Structure

```
app/core/
├── config.py          # Main Settings class with environment variables
└── llm_factory.py     # Helper functions for OpenAI client and pyagentspec
```

## Quick Start

### 1. Set up environment variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Together AI API key
nano .env
```

Add your Together AI API key to `.env`:
```bash
TOGETHER_API_KEY=your-api-key-here
```

### 2. Use settings in your code

```python
from app.core.config import settings

# Access configuration values
print(settings.TOGETHER_API_KEY)     # Your API key
print(settings.MODEL_NAME)           # meta-llama/Llama-3.3-70B-Instruct-Turbo
print(settings.TOGETHER_BASE_URL)    # https://api.together.xyz/v1
print(settings.API_V1_STR)           # /api/v1
```

## Using Together AI with OpenAI SDK

Together AI provides an OpenAI-compatible API, so you can use the standard OpenAI Python SDK:

### Direct Usage

```python
import openai
from app.core.config import settings

# Create client with Together AI configuration
client = openai.OpenAI(
    api_key=settings.TOGETHER_API_KEY,
    base_url=settings.TOGETHER_BASE_URL
)

# Use it like any OpenAI client
response = client.chat.completions.create(
    model=settings.MODEL_NAME,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Using Factory Function

```python
from app.core.llm_factory import get_openai_client
from app.core.config import settings

# Get pre-configured client
client = get_openai_client()

response = client.chat.completions.create(
    model=settings.MODEL_NAME,
    messages=[{"role": "user", "content": "Explain quantum computing"}]
)
```

## Configuration for pyagentspec

The `Settings` class includes `get_agent_spec_llm_config()` that returns a dictionary ready for pyagentspec with Together AI.

### Example Usage

```python
from app.core.llm_factory import get_llm_config
from pyagentspec import OpenAiConfig  # Together AI uses OpenAI-compatible config

# Get the config (already configured for Together AI)
llm_config = get_llm_config()

# Use with pyagentspec
from pyagentspec import Agent
agent = Agent(llm_config=llm_config, ...)
```

## Together AI Configuration

### Environment Variables
```bash
TOGETHER_API_KEY=your-api-key-here
TOGETHER_BASE_URL=https://api.together.xyz/v1
MODEL_NAME=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

### Available Models
Together AI offers many models. Some popular choices:
- `meta-llama/Llama-3.3-70B-Instruct-Turbo` (recommended, default)
- `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
- `mistralai/Mixtral-8x7B-Instruct-v0.1`
- `Qwen/Qwen2.5-72B-Instruct-Turbo`

Check [Together AI's model catalog](https://docs.together.ai/docs/inference-models) for the full list.

## Available Settings

### API Configuration
- `API_V1_STR`: API version prefix (default: `/api/v1`)
- `PROJECT_NAME`: Project name (default: `NetResearch`)

### Together AI Configuration
- `TOGETHER_API_KEY`: Together AI API key (required)
- `TOGETHER_BASE_URL`: Together AI base URL (default: `https://api.together.xyz/v1`)
- `MODEL_NAME`: Model name from Together AI catalog

### Agent Configuration
- `AGENT_MAX_ITERATIONS`: Max agent reasoning iterations (default: 10)
- `AGENT_TIMEOUT`: Agent timeout in seconds (default: 300)

### CORS Configuration
- `CORS_ORIGINS`: List of allowed origins (default: `["http://localhost:3000"]`)

## Helper Methods

### `get_openai_client_config()`
Returns a dictionary for initializing an OpenAI client with Together AI.

**Returns:**
```python
{
    "api_key": "your-together-api-key",
    "base_url": "https://api.together.xyz/v1"
}
```

### `get_agent_spec_llm_config()`
Returns a dictionary ready for pyagentspec OpenAiConfig.

**Returns:**
```python
{
    "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    "api_key": "your-together-api-key",
    "base_url": "https://api.together.xyz/v1",
    "temperature": 0.7,
    "max_tokens": 4096
}
```

## Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use `.env.example`** as a template for new developers
3. **Access settings via the singleton** - Use `settings` instance, not `Settings()`
4. **Validate early** - The API key is required, so startup will fail if missing
5. **Use type hints** - The Settings class provides full type safety
6. **Use factory functions** - `get_openai_client()` and `get_llm_config()` handle initialization

## Quick Test

Test your Together AI configuration:

```python
from app.core.llm_factory import get_openai_client
from app.core.config import settings

client = get_openai_client()
response = client.chat.completions.create(
    model=settings.MODEL_NAME,
    messages=[{"role": "user", "content": "Say hello!"}],
    max_tokens=50
)
print(response.choices[0].message.content)
```

## Troubleshooting

### "Field required" error for TOGETHER_API_KEY
Make sure you've set the API key in `.env`:
```bash
TOGETHER_API_KEY=your-actual-key-here
```

### Settings not loading
1. Check that `.env` file exists in the project root
2. Verify environment variable names match exactly (case-sensitive)
3. Restart your server after changing `.env`

### Module not found errors
```bash
pip install -r requirements.txt
```

Make sure to install `openai` package:
```bash
pip install openai
```
