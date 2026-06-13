# Backrooms: Taped Door

A lightweight browser-based maze exploration game built with static HTML, CSS,
and JavaScript. It now uses Three.js for a real 3D office environment with
dim fluorescent lights, textured walls, carpeted rooms, labeled office areas,
3D furniture landmarks, a third-person over-the-shoulder player view,
synthesized ambience, footsteps, and a simple stalking presence.

## Play

Open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Controls

- `W` / `Arrow Up`: move forward
- `S` / `Arrow Down`: move backward
- `A` / `Arrow Left`: turn left
- `D` / `Arrow Right`: turn right
- `Q` / `E`: strafe left/right
- `P` / `Esc`: pause or resume
- Mobile: use the on-screen movement pad and `Q` / `E` strafe buttons
- Menu screens: `Enter` selects the highlighted button, and arrow keys change
  the highlighted choice

The HUD also includes buttons for pause, returning to the home screen, and
toggling the fluorescent ambient sound. On phones and tablets, touch controls
appear near the bottom of the screen after the game starts.

## Objective

Find the blue painter's-tape door outline before the presence catches you. The
presence first appears in distant sightlines, then starts following after a
short delay.
Furniture blocks movement, so use old desks, chairs, file cabinets, break-room
tables, utility shelves, vending machines, and stacked furniture as landmarks
while you learn the building.

The current version uses a redesigned office floor plan instead of a generic
maze. It includes a green-carpet reception area, blue-gray records office,
gray utility room, teal break room, brown conference room, cubicle office pool,
furniture storage, a taped-outline exit wing, and an open interior court with
suggested upper levels. Each room has a different palette and landmark props so
the path is easier to memorize.

## Project Structure

```text
.
├── index.html   # Game markup and screens
├── styles.css   # Responsive layout and overlay styling
├── script.js    # Three.js scene, input, collision, enemy, audio, and rendering
└── README.md    # Setup and publishing notes
```

## Publish with GitHub Pages

1. Commit and push these files to GitHub.
2. Open the repository on GitHub.
3. Go to **Settings** → **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Save. GitHub will publish the game at the Pages URL shown on that screen.

Because this is a static site with no build step, GitHub Pages can host it
directly from the repository root. The current version imports Three.js from a
CDN, so the published page needs internet access to load that library.

## Ideas for Later

- Add more maze layouts or a seeded maze generator.
- Add collectible notes or keys.
- Add mobile touch controls.
- Add more presence behaviors, like listening for sprinting or blocking halls.
- Replace procedural audio with custom sound files.
