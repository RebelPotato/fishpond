const view = document.getElementById("view");
const ctx = view.getContext("2d");
ctx.willReadFrequently = true;
const bgYellow = new Color(241, 229, 205, 1);
// paper like yellow
const blue = new Color(0, 134, 169, 1);
const gray = new Color(64, 64, 64, 1);
const clear = new Color(255, 255, 255, 0);
const params = {
  sep: 1.4,
  ali: 0.8,
  coh: 0.8,
  att: 0.4,
  inner: 100,
  outer: 200,
  force: 0.25,
  damp: 0.97,
  dampSide: 0.6,
};
function mkBg(width, height) {
  function generatePerlinNoise(width, height) {
    const noise = [];
    for (let y = 0; y < height; y++) {
      noise[y] = [];
      for (let x = 0; x < width; x++) {
        noise[y][x] = Math.random();
      }
    }
    // Simple smoothing
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        noise[y][x] =
          (noise[y][x] +
            noise[y][(x + 1) % width] +
            noise[(y + 1) % height][x] +
            noise[y][(x - 1 + width) % width] +
            noise[(y - 1 + height) % height][x]) /
          5;
      }
    }
    return noise;
  }
  const perlinNoise = generatePerlinNoise(width, height);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bgYellow.toString();
  ctx.fillRect(0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = perlinNoise[y][x] * 30;
      imageData.data[index] += value;
      imageData.data[index + 1] += value;
      imageData.data[index + 2] += value;
    }
  }
  return imageData;
}
let bgImg;
function resize(width, height) {
  view.width = width;
  view.height = height;
  bgImg = mkBg(width, height);
  params.width = width;
  params.height = height;
}
resize(2*(window.innerWidth - 20), 2*(window.innerHeight - 20));
window.addEventListener("resize", () => resize(2*(window.innerWidth - 20), 2*(window.innerHeight - 20)));

const world = mkWorld({
  big: {
    head: [150, 150],
    lens: [15, 40, 40, 40, 40, 40, 40, 40, 40],
    r: [15, 20, 28, 32, 35, 30, 24, 18, 12, 6],
    c: blue,
    every: 1600,
    push: 0.1,
  },
  fishes: Array.from({ length: 12 }, () => ({
    head: [300, 300],
    lens: [6, 12, 12, 12, 12, 14, 16, 16, 16],
    r: [6, 8, 11.2, 12.8, 14, 12, 9.6, 7.2, 4.8, 2.4],
    c: gray.lerp(clear, Math.random() * 0.3),
    every: 200,
    push: 0.15,
  })),
});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fps = 60;
async function loop(i) {
  world.step(params, i);
  ctx.putImageData(bgImg, 0, 0);
  world.draw(ctx);
  await sleep(1000 / fps);
  requestAnimationFrame(() => loop(i + 1));
}
loop(0);
