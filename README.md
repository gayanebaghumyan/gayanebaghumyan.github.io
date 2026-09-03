# Gayane Baghumyan — academic website

This project contains Gayane Baghumyan's personal academic website, prepared for publication at https://gayanebaghumyan.github.io.

## Replacing the files

To update the public documents or portrait, replace the files at these exact paths and keep the filenames unchanged:

- Put the CV at `cv.pdf`.
- Put the portrait at `assets/headshot.png` (a PNG image).
- Put *Ambiguity and Racial Discrimination* at `assets/papers/ambiguity_and_racial_discrimination.pdf`.

No HTML changes are needed when those names stay the same. The second paper remains linked to SSRN and does not need a local PDF. The third paper currently displays “Draft available on request” and has no public PDF.

To replace a file on your computer, copy the real file into the location above and approve replacing the existing empty file. To replace one through GitHub's website, open the destination folder in the repository, choose **Add file → Upload files**, and upload the correctly named replacement.

The GitHub web interface accepts uploads up to 25 MB per file. Committed PDFs remain in git history after they are deleted from the latest version of the repository, so avoid committing files that should not remain recoverable from that history.

## Editing the copy

Open `index.html` and search for these HTML comment markers:

- `site name` marks the name in the header and profile; update both occurrences together.
- `biography` surrounds the introductory paragraphs.
- `job market line` surrounds the paragraph to remove after the market.
- `profile details` surrounds the sidebar affiliation, email, and LinkedIn links.
- `paper 1`, `paper 2`, and `paper 3` surround each paper's title, links, abstract, and any paper-specific details.
- `footer` surrounds the affiliation line.

The comment above the first PDF link contains the exact replacement markup for showing “Draft available on request.”

The light/dark switch is CSS-only. Dark mode is the default because the `theme-toggle` checkbox in `index.html` and `cv.html` carries the `checked` attribute. The local `script.js` file is used only to copy the email address when the sidebar Email control is selected. The header's CV link opens `cv.html`, which displays `cv.pdf` inside the site using the browser's PDF viewer.

## After the defense

- Change “PhD candidate at CERGE-EI” to the post-defense title.
- Delete the job-market paragraph between the matching `job market line` comments.
- Remove the `Job Market Paper` badge from the first paper title.

## Deployment

Name the public repository exactly `gayanebaghumyan.github.io`. In **Settings → Pages**, set **Source** to **Deploy from a branch**, choose the `main` branch, and select `/ (root)` as the folder. The first deployment takes a few minutes.
