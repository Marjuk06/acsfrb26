# FRB 26 Content Files

This folder contains all the content files for ACS Final Revision Batch 26.

## Files:

### 📹 `videos.json`
- Contains all video lecture data AND slides for FRB 26
- Edit this file to add YouTube video URLs and Google Drive slide links
- Structure: cycles → chapters → lectures → videoUrl + slides array

### 📝 `notes.json`
- Contains chapter notes (PDF preview and download links)
- Edit this file to add PDF links
- Structure: cycles → chapters → notes → pdfUrl/downloadUrl
- **Toggle Feature**: Set `"showNotes": true/false` to enable/disable notes section

## How to Edit:

1. **Add Videos & Slides**: Open `videos.json` → Find the lecture → Replace `videoUrl: ""` with YouTube embed URL AND add slide links in the `slides` array
2. **Add Notes**: Open `notes.json` → Find the chapter → Replace `pdfUrl: ""` with Google Drive preview URL
3. **Toggle Notes**: Open `notes.json` → Change `"showNotes": true` to `"showNotes": false` to hide notes section

## Combined Structure Example:

```json
{
    "id": 1,
    "title": "Lecture Title",
    "videoUrl": "https://www.youtube.com/embed/VIDEO_ID",
    "description": "Lecture description",
    "slides": [
        {
            "title": "Slide Title",
            "gdriveLink": "https://drive.google.com/file/d/FILE_ID/preview",
            "description": "Slide description"
        }
    ]
}
```

## Notes Toggle System:

### Enable Notes (Default):
```json
"notesInfo": {
    "showNotes": true
}
```

### Disable Notes:
```json
"notesInfo": {
    "showNotes": false
}
```

**When `showNotes: false`:**
- No "Chapter Notes" section will appear on lecture pages
- PDF viewer will show "Notes are currently disabled" message
- Notes are completely hidden from the website

## Example YouTube URL Format:
```
https://www.youtube.com/embed/VIDEO_ID
```

## Example Google Drive URL Format:
```
https://drive.google.com/file/d/FILE_ID/preview
```

## Notes:
- All files are automatically loaded by the website
- Changes take effect immediately after saving
- Keep backup copies before making major changes
