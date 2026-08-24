# Configure Reasoning Effort Selection

Open WebUI can show a reasoning-effort selector next to the model selector in the chat composer. The control is model-specific: it is shown only when the selected model declares the exact effort levels it supports.

No environment variable is required.

## Configure a model in the UI

1. Sign in as an administrator.
2. Go to **Workspace → Models**.
3. Create or edit the model that supports configurable reasoning effort.
4. Open **Capabilities**.
5. Enable **Reasoning Effort**.
6. Enter the model's supported levels as an ordered, comma-separated list, for example:

   ```text
   none, low, medium, high, xhigh
   ```

7. Save the model.
8. Select that model in a chat. The reasoning-effort selector should appear beside the model selector.

Enabling the capability initially supplies `low, medium, high`. Replace those values when the provider documents a different set.

## Metadata format

The model metadata must contain a non-empty ordered array at `meta.capabilities.reasoning_effort`:

```json
{
  "meta": {
    "capabilities": {
      "reasoning_effort": ["none", "low", "medium", "high", "xhigh"]
    }
  }
}
```

The capability uses arrays only:

- Missing property or `[]`: reasoning-effort selection is unsupported and the selector is hidden.
- Non-empty array: the selector shows exactly those values in the configured order.

Do not use `true` or `false`. Only list values accepted by the upstream model and provider.

## Common provider values

Providers and model versions support different values. Depending on the model, documented values may include:

- `none`
- `minimal`
- `low`
- `medium`
- `high`
- `xhigh`
- `max`

These are examples, not a universal list. Consult the provider documentation for the specific model before configuring it. Custom future values are accepted by the configuration field.

## Automatic configuration for official OpenAI models

Open WebUI automatically supplies reasoning-effort metadata when all of the following are true:

- The connection hostname is `api.openai.com`.
- The model ID matches a recognized model family.
- The model has not supplied its own reasoning-effort capability metadata.

The currently recognized families are:

| Model family | Inferred levels |
| --- | --- |
| GPT-5 | `minimal`, `low`, `medium`, `high` |
| GPT-5 Mini / Nano | `minimal`, `low`, `medium`, `high` |
| GPT-5 Pro | `high` |
| GPT-5.1 | `none`, `low`, `medium`, `high` |
| GPT-5.2 | `none`, `low`, `medium`, `high`, `xhigh` |
| GPT-5.2 Pro | `medium`, `high`, `xhigh` |
| o1 | `low`, `medium`, `high` |
| o3 / o3-mini | `low`, `medium`, `high` |
| o3-pro | `high` |
| o4-mini | `low`, `medium`, `high` |

Dated model IDs for these families are also recognized. Unknown or future model families are not guessed and must be configured explicitly.

### Azure OpenAI and compatible providers

Azure deployment names and third-party OpenAI-compatible model IDs cannot be inferred reliably. Configure their supported levels manually through **Workspace → Models**.

## Runtime behavior

### Single model

The selector displays the configured levels. Choosing one writes `reasoning_effort` into the chat's request parameters.

Choosing **Default** removes the chat-specific override and uses the configured user default, if one exists.

### Multiple models

When multiple models are selected, the selector shows only the intersection of their configured levels. The order follows the first selected model.

The selector is hidden when:

- Any selected model has no configured reasoning-effort levels; or
- The selected models have no levels in common.

### Unsupported saved values

A previously saved or global effort value may not be supported after switching models. Open WebUI preserves the preference so it can be restored when switching back, but marks it unavailable and omits it from requests to models whose configured array does not contain it.

### Responses API connections

The chat UI stores the selected value as the Chat Completions-compatible `reasoning_effort` parameter. For connections configured to use `/v1/responses`, Open WebUI converts it to the Responses API shape before forwarding the request:

```json
{
  "reasoning": {
    "effort": "high"
  }
}
```

If a request already contains native `reasoning` configuration, its existing `effort` value takes precedence. Other native fields, such as `reasoning.summary`, are preserved.

## Troubleshooting

### The selector does not appear

Check that:

1. The selected model's `reasoning_effort` capability is a non-empty array.
2. The model configuration was saved.
3. The model list was refreshed after changing its configuration.
4. Every selected model supports reasoning effort and has at least one level in common.
5. For automatic OpenAI detection, the connection uses the official `api.openai.com` hostname and a recognized model ID.

### The provider rejects a request

Verify that every configured value is supported by that exact model and API version. Remove unsupported values from the model capability configuration. For Azure OpenAI, also verify that the deployment's API version accepts the `reasoning_effort` parameter.

### A global default is not sent

The selected model's configured array is authoritative. A global value is omitted when it is not present in that array. Add the value only if the provider supports it, or select a supported value in the chat composer.
