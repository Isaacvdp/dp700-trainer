# DP-700 Trainer

A static study tool for Microsoft exam DP-700 (Implementing Data Engineering Solutions Using Microsoft Fabric).

- 158 original exam-style questions mapped to the official skills outline (study guide updated 30 Oct 2026), each with an explanation and Microsoft Learn links.
- Question types used on the real exam: single and multiple choice, ordering, code completion (PySpark, T-SQL, KQL), Yes/No statement tables, Yes/No solution series and case studies.
- Practice mode with spaced repetition (missed questions come back, weak skills are weighted up).
- Mock exam: 50 questions in 100 minutes. It opens with a case study that locks once you finish it and ends with a Yes/No series that can't be reviewed.
- Progress is kept in `localStorage`; you can export or import it from the Progress page.

No questions are taken from exam dumps. Everything is written from the public skills outline and the Fabric documentation.

## Run

Open `index.html` in a browser, or serve the folder with any static server. GitHub Pages serves it as is.

## Adding questions

Questions live in `data/d1.js`, `data/d2.js`, `data/d3.js` (one file per domain), with case studies in `data/cases.js`. Each question has:

| Field | Meaning |
| --- | --- |
| `id` | Unique id |
| `s` | Skill: `ws`, `lcm`, `sec`, `orch`, `load`, `batch`, `stream`, `mon`, `err`, `opt` |
| `type` | `single`, `multi`, `order`, `dropdown` or `statements` |
| `case` | Case study id (optional) |
| `series` | Yes/No series id (optional) |
| `stem`, `explain` | Text. `` `code` ``, `**bold**`, blank lines for paragraphs and `- ` lists are supported |
| `options` + `answer` | For `single` (index), `multi` (indices) and `order` (indices in order) |
| `code` + `blanks` | For `dropdown`: `[[n]]` marks blank n; each blank has `options` and `answer` |
| `statements` | For `statements`: `{ text, answer: true/false }` |
| `refs` | `{ t, u }` documentation links |
