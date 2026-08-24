from copy import deepcopy

import pytest

from open_webui.routers.openai import convert_to_responses_payload


@pytest.mark.parametrize('reasoning_effort', [None, '', 1, [], {}])
def test_invalid_reasoning_effort_alias_is_removed(reasoning_effort):
    result = convert_to_responses_payload(
        {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'reasoning_effort': reasoning_effort,
        }
    )

    assert 'reasoning_effort' not in result
    assert 'reasoning' not in result


def test_reasoning_effort_is_converted_for_responses_api():
    result = convert_to_responses_payload(
        {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'reasoning_effort': 'high',
        }
    )

    assert result['reasoning'] == {'effort': 'high'}
    assert 'reasoning_effort' not in result


def test_reasoning_effort_preserves_native_reasoning_fields_without_mutating_them():
    reasoning = {'summary': 'auto'}
    original_reasoning = deepcopy(reasoning)

    result = convert_to_responses_payload(
        {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'reasoning': reasoning,
            'reasoning_effort': 'high',
        }
    )

    assert result['reasoning'] == {'summary': 'auto', 'effort': 'high'}
    assert reasoning == original_reasoning


def test_native_reasoning_effort_wins_over_compatibility_alias():
    result = convert_to_responses_payload(
        {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'reasoning': {'effort': 'low', 'summary': 'auto'},
            'reasoning_effort': 'high',
        }
    )

    assert result['reasoning'] == {'effort': 'low', 'summary': 'auto'}
    assert 'reasoning_effort' not in result
