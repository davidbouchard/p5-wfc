# p5-wfc
Wave Function Collapse implementation (overlapping model) for p5.js, with a focus on readability and ease of deployment into other projects. The demo sketch uses the sample images from the original implementation by mxgmn. It also uses p5play's Pixelated canvas to render small images at a larger scale without having to draw rectangle grids. 

To use the Wave Function Collapse class in other projects:

`<script src="https://cdn.jsdelivr.net/gh/davidbouchard/p5-wfc/src/wfc.js"></script>`

The class implements two cell selection algorithms: 

`nextStep()` uses simple weighted random selection
`nextStepShannon()` uses Shannon's entropy and is slower. 

The class also provides two utility functions for drawing the grid and the patterns as p5.Image objects: 

`getImage()` returns a p5.Image of the current state of the grid
`getPatternImages()` returns an Array of identified patterns within the source image.

Rotation and mirroring of the identified patterns are available as optional boolean parameters in the class constructor. 

## Controls

- Press any key to reset the grid.

