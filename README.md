# mii-studio

Pose and animation authoring for Mii Creator Miis. Reads the rig out of a Mii
glb and lets you move bones, then writes poses.json.

## Setup

```bash
npm install
```

Drop exported model(s) in `assets/mii.glb`, or point `mii-studio.config.json`
somewhere else.

```json
{
  "model": "assets/mii.glb",
  "output": "../somewhere/else/assets/poses.json"
}
```

`output` is where build lands. Pointing it at a checkout of the site means
a build writes straight into `src/assets`.

## Commands

```bash
npm run rig             # write rig.json from configured model
npm run rig -- --table  # print local axis table
npm test                # run test suite
```

## Keybinds

- `r`: resets selected bone
- `shift+R`: resets everything
- `ctrl+z`: steps back one drag at a time
- `m`: toggle on/off lut shader material
- `e`: export pose
- `o`: load a pose
- `y`: previous key
- `x`: record
- `c`: next key
- `,`: step back 50ms
- `.`: step forward 50ms
- `a`: delete key
- `space`: play/pause
- `i`: save as icon without background
- `shift + i`: save as icon with background

## TODO's / Phases

- [x] 0 rig extraction
- [x] 1 world to local space conversion
- [x] 2 viewport, grab a bone and rotate it
- [x] 3 export and validate
- [x] 4 timeline, clips and ambient loops
- [ ] 6 vue shell, commands registry replacing keydown chain
- [ ] 7 rig extraction in the browser
- [ ] 8 theme layer, tokens and so on
- [ ] 9 components: pill, icon button, hover label, tab header, message box, etc.
- [ ] 10 screens: pose / timeline / clips
- [ ] 11 dashboard, multiple models, tiles

## Notes

This was mainly coded to make the progress easier for me to add new annimations
to my website! But maybe I will turn it into something bigger, who knows

No AI was/will be used in the progress of creating this.
Not one single line.

## Credits

- Wii Programming Guidlines v1.01a (2006) and Icon and Banner Specifications (2008),
  for the constraints behind the design language
- [ariankordi/FFL.js](https://github.com/ariankordi/FFL.js) for `LUTShaderMaterial`
- [datkat21/mii-creator](https://github.com/datkat21/mii-creator) for the clips
  in `fixtures/poses.json`. (https://mii.nxw.pw/)
- [jerosajose/onliine](https://github.com/jerosajose/onliine) sampled for interface
  colours and geometry

Mii is a trademark of Nintendo. Not affiliated with Nintendo.
