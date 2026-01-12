# Ahmad Al-Hmouz — Portfolio (Project Management IT • Fall 2025)

This is a static (HTML) portfolio website adapted for the course requirements.

## Run locally
Open `index.html` in your browser.

## Where to add / replace files

### 1) Introductory Video (required)
- Put your video here:
  - `video/intro.mp4`
- The Activities page (`activities.html`) will display it automatically.

### 2) Reflections (JSON)
Reflections are loaded from:
- `assets/data/reflections.json`

Structure:
```json
{
  "student": {
    "name": "Ahmad Al-Hmouz",
    "university_id": "0228229",
    "course": "Project Management IT",
    "semester": "Fall 2025"
  },
  "lectures": [
    {
      "date": "2025-09-01",
      "title": "Lecture 1",
      "reflection": "Write 3-4 lines here..."
    }
  ]
}
```

### 3) Assignments
Assignments list is loaded from:
- `assets/data/assignments.json`

Each assignment points to a file path, e.g.
- `assignments/assignment-1.pdf`

To replace an assignment PDF:
1. Put your real file into the `assignments/` folder
2. Update its path in `assets/data/assignments.json`

### 4) CV
Current CV file:
- `assets/Ahmad_Al-Hmouz_CV.pdf`

Replace it with your updated CV using the same filename.

## Pages
- `index.html` — Home
- `assignments.html` — Assignments
- `activities.html` — Activities + Video
- `skills.html` — Skills
- `reflection.html` — Reflection (JSON)
- `favorites.html` — Favorite websites
- `contact.html` — Contact
