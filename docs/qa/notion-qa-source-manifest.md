# Notion QA Source Manifest

- run_id: `20260529-1419-KST`
- source_kind: `copied-text`
- source_locator: `user chat paste in Codex session on 2026-05-29`
- snapshot_path: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\notion-source\notion-qa-copied-text.md`
- snapshot_captured_at: `2026-05-29 14:19 KST`
- captured_by: `Codex`
- access_limitations: `Original Notion URL was not reachable through the connected Notion workspace. Image attachments referenced in the pasted source were not available as local files; only text and attachment intent were captured.`
- item_count: `20`
- qa_id_range: `QA-001..QA-020`
- source_hash_or_revision: `sha256:6E8B53B451057D885FAB76235310ADD379B2230A10001F98DCB8201E88658393`

## Locator Rules

- `source_locator` for each QA ID uses `notion-qa-copied-text.md` plus the section and numbered item from the copied source.
- The `0. QA 리뷰` numbered list is the stable QA ID source of truth.
- The `1. QA 리팩토링` section is treated as owner-provided remediation guidance and is linked back to the matching QA IDs where applicable.
- Struck-through items in the pasted source are still assigned QA IDs, but can be classified as `범위밖` or `완료` only after evidence review. User-provided "의도한 플로우" and "반영완료" claims are recorded as source claims, not implementation evidence.
