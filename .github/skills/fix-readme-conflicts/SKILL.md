---
name: fix-readme-conflicts
description: 'Resolve Git merge conflict markers in the Persianer README.md. Use when: fixing merge artifacts in README, cleaning up unresolved conflicts, repairing corrupted markdown tables, restoring v2.0 profile system documentation.'
argument-hint: 'Section to fix, or "all" to fix the entire README'
---

# Fix README Merge Conflicts

Resolve unresolved Git merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in `z:\Dev\Persianer\README.md`. The README has 3-way merge artifacts from a v2.0 profile system merge.

## When to Use
- README.md contains `<<<<<<<` / `>>>>>>>` markers
- Tables or sections look broken or duplicated
- Preparing the README for publishing or sharing
- After a merge left behind conflict markers

## Conflict Map

| # | Lines | Content | Resolution |
|---|---|---|---|
| 1 | ~120–132 | "۶ پروفایل پیش‌فرض" heading block | Keep **ours** (profile system heading) |
| 2 | ~132–199 | Profiles table + OR-merge + RTL exclusion sections | Keep **ours** (v2.0 with lock column, "قاعده «خاموش» انحصاری", "رفتار متقابل راست‌چین") |
| 3 | ~200–287 | "رابط کاربری 🖼️" section (Popup + Options) | Keep **ours** (profile-based UI with sidebar, badges, combobox, toast) |
| 4 | ~325–337 | "روش استفاده" intro text | Keep **ours** (profile-based usage flow) |
| 5 | ~339–end | Instructions paragraph | Keep **ours** ("مدیریت پروفایل‌ها" button) |

**Rule**: The **ours** side is always the correct one — it contains the v2.0 profile system documentation. The other sides are stale ancestors or superseded revisions.

## Procedure

### Step 1: Scan for all markers
```powershell
Select-String -Path "z:\Dev\Persianer\README.md" -Pattern "<<<<<<<|=======|>>>>>>>"
```

### Step 2: Fix each conflict block

For each conflict block, the pattern is:
```text
<<<<<<< ours
[KEEP THIS — correct v2.0 content]
||||||| ancestor
[STALE — remove]
=======
<<<<<<< New base: option panel and popup
[STALE — remove]
||||||| Common ancestor
[STALE — remove]
=======
[STALE — remove]
>>>>>>> Current commit: optiosn
>>>>>>> theirs
```

**Resolution**: Delete everything from `<<<<<<< ours` down to the last `>>>>>>> theirs`, keeping only the content that was on the **ours** side (the first block after `<<<<<<< ours`).

#### Conflict 1: Heading block (~line 120–132)
The conflict wraps the "۶ پروفایل پیش‌فرض" heading. The correct result should be just:
```markdown
### ۶ پروفایل پیش‌فرض
```

#### Conflict 2: Profile table + detailed rules (~line 132–199)
This is the large block with the profiles table, OR-merge logic, "خاموش" exclusivity, whitelist/blacklist, and RTL mutual exclusion. The **ours** side is correct. Replace the entire conflict block with just the **ours** content.

#### Conflict 3: UI section (~line 200–287)
A 3-way conflict on the "رابط کاربری 🖼️" section. The **ours** side (with profile-based popup/options) is correct.

#### Conflict 4: Usage intro (~line 325–337)
A 3-way conflict on "روش استفاده" intro. The **ours** side is correct:
```markdown
برای ویرایش پیشرفته (فونت، وایت‌لیست، بلک‌لیست، RTL کل صفحه، رنگ، نام):
```

#### Conflict 5: Instructions paragraph (~line 339–end)
The final conflict in the usage section. The **ours** side is correct:
```markdown
- روی دکمه **«مدیریت پروفایل‌ها»** در popup بزنید تا صفحه تنظیمات باز شود.
- یا روی آیکون چرخ‌دنده ⚙ کنار هر پروفایل در popup بزنید (به‌طور مستقیم همان پروفایل را ویرایش می‌کند).
```

### Step 3: Verify after fixing
```markdown
<!-- README must have zero merge markers -->
```

Run:
```powershell
Select-String -Path "z:\Dev\Persianer\README.md" -Pattern "<<<<<<<|=======|>>>>>>>"
```
Expected output: **no matches**.

### Step 4: Quick visual smoke test
Open `README.md` in VS Code and verify:
- ✅ Tables render correctly (no broken pipes or split rows)
- ✅ No duplicate sections
- ✅ Persian text flows correctly (RTL with proper line breaks)
- ✅ Headings use a consistent hierarchy

## Caveats

- **The README may have other uncommitted changes.** Only touch the merge conflict blocks; leave surrounding content intact.
- **Whoever runs this should have write access** to the repo and authority to resolve the merge in favor of "ours".
- If the README has other pending edits, consider committing or stashing them before fixing conflicts.
- Commit the fix with a message like: `docs: resolve merge conflict markers in README.md — keep v2.0 profile system content`.
