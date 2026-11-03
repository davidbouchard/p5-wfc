
// --- WAVE FUNCTION COLLAPSE CLASS ---
//
// Note: not optimized for performance but for simplicity/readability!
// for other implementations see:
//
// nextStep() runs simple weighted random selection 
// nextStepShannon() uses Shannon entropy but is slower 
//
// getImage() returns a p5.Image object of the current output grid
// getPatternAsImages() returns an array of p5.Image objects for each unique pattern

class WaveFunctionCollapse {
  constructor(sourceImg, n, outputW, outputH, {allowRotations = false, allowReflections = false, periodic = true}) {
    this.N = n;
    this.OUTPUT_W = outputW;
    this.OUTPUT_H = outputH;
    this.ALLOW_ROTATIONS = allowRotations;
    this.ALLOW_REFLECTIONS = allowReflections;
    this.outputImage = createImage(this.OUTPUT_W, this.OUTPUT_H);
    this.patterns = [];
    this.weights = [];
    this.adjacencies = {};
    this.grid = [];
    this.DIRS = [
      [0, -1],  // 0: Up
      [1, 0],   // 1: Right
      [0, 1],   // 2: Down
      [-1, 0]   // 3: Left
    ];
    this.sourceImg = sourceImg;
    console.log('[wfc] Source image dimensions: ' + sourceImg.width + 'x' + sourceImg.height);  
    if (periodic) this.extractPatternsWithSymmetriesPeriodic(this.sourceImg);
    else this.extractPatternsWithSymmetries(this.sourceImg);
    this.precomputeAdjacencies();
    this.resetGrid();
  }

  extractPatternsWithSymmetriesPeriodic(img) {
    img.loadPixels();
    let imgW = img.width;
    let imgH = img.height;
    for (let y = 0; y < imgH; y++) {
      for (let x = 0; x < imgW; x++) {
        let basePattern = [];
        for (let py = 0; py < this.N; py++) {
          for (let px = 0; px < this.N; px++) {
            let sx = (x + px) % imgW;
            let sy = (y + py) % imgH;
            let index = (sx + sy * imgW) * 4;

            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            basePattern.push(`rgb(${r},${g},${b})`);
          }
        }

        let variations = this.getSymmetries(basePattern);

        for (let patternVariant of variations) {
          let patternString = patternVariant.join(',');
          let matchIndex = this.patterns.findIndex(p => p.join(',') === patternString);

          if (matchIndex === -1) {
            this.patterns.push(patternVariant);
            this.weights.push(1);
          } else {
            this.weights[matchIndex]++;
          }
        }
      }
    }
    console.log(`[wfc] Successfully compiled ${this.patterns.length} unique pattern structures.`);
  }

  extractPatternsWithSymmetries(img) {
    img.loadPixels();
    let imgW = img.width;
    let imgH = img.height;
    
    // 1. Stop looping before the NxN pattern exceeds the image boundaries
    for (let y = 0; y <= imgH - this.N; y++) {
      for (let x = 0; x <= imgW - this.N; x++) {
        let basePattern = [];
        
        for (let py = 0; py < this.N; py++) {
          for (let px = 0; px < this.N; px++) {
            // 2. Remove the modulo (%) operator
            let sx = x + px;
            let sy = y + py;
            let index = (sx + sy * imgW) * 4;

            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            basePattern.push(`rgb(${r},${g},${b})`);
          }
        }

        let variations = this.getSymmetries(basePattern);

        for (let patternVariant of variations) {
          let patternString = patternVariant.join(',');
          let matchIndex = this.patterns.findIndex(p => p.join(',') === patternString);

          if (matchIndex === -1) {
            this.patterns.push(patternVariant);
            this.weights.push(1);
          } else {
            this.weights[matchIndex]++;
          }
        }
      }
    }
    console.log(`[wfc] Successfully compiled ${this.patterns.length} unique pattern structures.`);
  }

  getPatternsAsImages() {
    let patternImages = [];
    for (let pattern of this.patterns) {
      let img = createImage(this.N, this.N);
      img.loadPixels();
      
        // Draw each individual pixel inside the current NxN pattern matrix
        for (let py = 0; py < N; py++) {
          for (let px = 0; px < N; px++) {
            let pixelColorStr = pattern[px + py * N];
            img.set(px, py, color(pixelColorStr));
          }
        
      }
      img.updatePixels();
      patternImages.push(img);
    }
    return patternImages;
  }

  getSymmetries(pattern) {
    let symmetries = [];
    let current = [...pattern];
    let rotationLoops = this.ALLOW_ROTATIONS ? 4 : 1;

    for (let r = 0; r < rotationLoops; r++) {
      symmetries.push(current);
      if (this.ALLOW_REFLECTIONS) {
        symmetries.push(this.flipHorizontal(current));
      }
      if (this.ALLOW_ROTATIONS) {
        current = this.rotate90(current);
      }
    }
    return symmetries;
  }

  rotate90(p) {
    let rotated = new Array(this.N * this.N);
    for (let y = 0; y < this.N; y++) {
      for (let x = 0; x < this.N; x++) {
        rotated[x * this.N + (this.N - 1 - y)] = p[x + y * this.N];
      }
    }
    return rotated;
  }

  flipHorizontal(pattern) {
    let flipped = new Array(this.N * this.N);
    for (let y = 0; y < this.N; y++) {
      for (let x = 0; x < this.N; x++) {
        flipped[(this.N - 1 - x) + y * this.N] = pattern[x + y * this.N];
      }
    }
    return flipped;
  }

  checkOverlap(pA, pB, dx, dy) {
    // pA, pB are both 1D arrays representing NxN patterns
    // dx, dy are the offsets for the overlap check

    // Invert dy for screen space coordinate consistency
    let sy = -dy;

    let startX = dx < 0 ? -dx : 0;
    let endX = dx < 0 ? this.N : this.N - dx;
    let startY = sy < 0 ? -sy : 0;
    let endY = sy < 0 ? this.N : this.N - sy;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        let cA = pA[x + y * this.N];
        let cB = pB[(x + dx) + (y + sy) * this.N];
        if (cA !== cB) return false;
      }
    }
    return true;
  }

  precomputeAdjacencies() {
    for (let d = 0; d < 4; d++) {
      this.adjacencies[d] = {};
      let [dx, dy] = this.DIRS[d];

      for (let i = 0; i < this.patterns.length; i++) {
        this.adjacencies[d][i] = [];
        for (let j = 0; j < this.patterns.length; j++) {
          if (this.checkOverlap(this.patterns[i], this.patterns[j], dx, dy)) {
            this.adjacencies[d][i].push(j);
          }
        }
      }
    }
  }

  resetGrid() {
    this.grid = [];
    let allOptions = Array.from({ length: this.patterns.length }, (_, i) => i);
    for (let i = 0; i < this.OUTPUT_W * this.OUTPUT_H; i++) {
      this.grid.push({
        collapsed: false,
        options: [...allOptions]
      });
    }
  }

  nextStep() {
    let minOptions = Infinity;
    let candidates = [];

    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].collapsed) continue;
      let numOptions = this.grid[i].options.length;

      if (numOptions === 0) {
        console.log("[wfc] Contradiction hit! Resetting canvas...");
        this.resetGrid();
        return true;
      }

      if (numOptions < minOptions) {
        minOptions = numOptions;
        candidates = [i];
      } else if (numOptions === minOptions) {
        candidates.push(i);
      }
    }

    if (candidates.length === 0) {
      console.log("[wfc] All cells collapsed!");
      return false;
    }

    let pickIndex = random(candidates);
    let cell = this.grid[pickIndex];
    let choice = this.weightedRandom(cell.options);

    cell.options = [choice];
    cell.collapsed = true;

    this.propagate(pickIndex);
    return true;
  }

nextStepShannon() {
    let minEntropy = Infinity;
    let bestCellIndex = -1;

    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].collapsed) continue;
      
      let options = this.grid[i].options;
      let numOptions = options.length;

      if (numOptions === 0) {
        console.log("[wfc] Contradiction hit! Resetting canvas...");
        this.resetGrid();
        return true;
      }

      // Calculate Shannon Entropy for the remaining options
      let sumOfWeights = 0;
      let sumOfWeightLogWeight = 0;

      for (let opt of options) {
        let weight = this.weights[opt];
        sumOfWeights += weight;
        sumOfWeightLogWeight += weight * Math.log(weight);
      }

      let entropy = Math.log(sumOfWeights) - (sumOfWeightLogWeight / sumOfWeights);
      
      // Add a tiny amount of noise to break ties naturally
      let entropyWithNoise = entropy + (Math.random() * 1e-6);

      if (entropyWithNoise < minEntropy) {
        minEntropy = entropyWithNoise;
        bestCellIndex = i;
      }
    }

    if (bestCellIndex === -1) return false;

    let cell = this.grid[bestCellIndex];
    let choice = this.weightedRandom(cell.options);

    cell.options = [choice];
    cell.collapsed = true;

    this.propagate(bestCellIndex);
    return true;
  }



  weightedRandom(options) {
    let totalWeight = options.reduce((sum, opt) => sum + this.weights[opt], 0);
    let r = random(totalWeight);
    let runningSum = 0;
    for (let opt of options) {
      runningSum += this.weights[opt];
      if (r <= runningSum) return opt;
    }
    return options[0];
  }

  propagate(startIndex) {
    let queue = [startIndex];
    let inQueue = new Set(queue);

    while (queue.length > 0) {
      let currentIndex = queue.shift();
      inQueue.delete(currentIndex);

      let cx = currentIndex % this.OUTPUT_W;
      let cy = Math.floor(currentIndex / this.OUTPUT_W);

      for (let d = 0; d < 4; d++) {
        let [dx, dy] = this.DIRS[d];
        let nx = cx + dx;
        let ny = cy + dy;

        if (nx >= 0 && nx < this.OUTPUT_W && ny >= 0 && ny < this.OUTPUT_H) {
          let neighborIndex = nx + ny * this.OUTPUT_W;
          let neighbor = this.grid[neighborIndex];

          if (neighbor.collapsed) continue;

          let validPatternsForNeighbor = new Set();
          for (let possiblePattern of this.grid[currentIndex].options) {
            let allowed = this.adjacencies[d][possiblePattern];
            for (let p of allowed) validPatternsForNeighbor.add(p);
          }

          let originalLength = neighbor.options.length;
          neighbor.options = neighbor.options.filter(opt => validPatternsForNeighbor.has(opt));

          if (neighbor.options.length < originalLength) {
            if (!inQueue.has(neighborIndex)) {
              queue.push(neighborIndex);
              inQueue.add(neighborIndex);
            }
          }
        }
      }
    }
  }

  getImage() {
    for (let y = 0; y < this.OUTPUT_H; y++) {
      for (let x = 0; x < this.OUTPUT_W; x++) {
        let cell = this.grid[x + y * this.OUTPUT_W];
        if (cell.collapsed) {
          let patternIndex = cell.options[0];
          let cellColor = color(this.patterns[patternIndex][0]);
          this.outputImage.set(x, y, cellColor);
        } else {
          let c = map(cell.options.length, 0, this.patterns.length, 20, 180);
          let cellColor = color(c);
          this.outputImage.set(x, y, cellColor);
        }
      }
    }
    this.outputImage.updatePixels();
    return this.outputImage;
  }
}