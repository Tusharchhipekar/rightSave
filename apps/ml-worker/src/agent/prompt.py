def memory_block(memories: list[str]) -> str:
    if not memories:
        return ""
    return "What you know about this user:\n" + "\n".join(f"- {m}" for m in memories)