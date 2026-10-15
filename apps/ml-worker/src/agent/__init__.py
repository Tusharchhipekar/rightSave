from agent.tools import (
    get_content_details,
    search_memories,
    search_saved_content,
    web_search,
)

_MODULES = [search_saved_content, search_memories, web_search, get_content_details]

SPECS = [m.SPEC for m in _MODULES]
RUNNERS = {m.SPEC["function"]["name"]: m.run for m in _MODULES}