<template>
  <div id="canvas1-container">
    <canvas
      id="canvas1"
      ref="canvas"
    />
  </div>
</template>

<script setup>
import { ref, toRefs, onMounted } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})
const { text } = toRefs(props)
const currentlyReinitializing = ref(false)

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d', { willReadFrequently: true });
  let textCoordinates
  const setCanvasUp = () => {
    ctx.fillStyle = 'beige';
    ctx.font = '10px Verdana';
    ctx.fillText(text.value, 0, 13);
    textCoordinates = ctx.getImageData(0, 0, 200, 100);
    canvas.value.width = window.innerWidth-150;
    canvas.value.height = window.innerHeight / 5;
  }
  setCanvasUp()
  let particleArray = [];

  // handle mouse
  const mouse = {
    x: null,
    y: null,
    radius: 40
  }
  window.addEventListener('mousemove', (event) => {
    if (!canvas.value) return
    const offset = canvas.value.getBoundingClientRect();
    mouse.x = event.x - offset.left;
    mouse.y = event.y - offset.top;
  })

  class Particle {
    constructor(x, y){
      this.x = x;
      this.y = y;
      this.originalSize = 2;
      this.size = this.originalSize;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 40) + 1;
    }
    draw(){
      ctx.fillStyle = 'purple';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, Math.PI * 2, 0);
      ctx.closePath();
      ctx.fill();
    }
    update(){
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = mouse.radius;
      let force = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < maxDistance) {
        if (distance < maxDistance/4) {
          this.size = this.originalSize*1.75;
        } else if (distance < maxDistance/3) {
          this.size = this.originalSize*1.5;
        } else if (distance < maxDistance/2) {
          this.size = this.originalSize*1.25;
        } else {
          this.size = this.originalSize*1.1;
        }
        const futureXPosition = this.x - directionX;
        const futureYPosition = this.y - directionY;
        if (futureXPosition > 0 && futureXPosition < canvas.value.width) {
          this.x = futureXPosition;
        }
        if (futureYPosition > 0 && futureYPosition < canvas.value.height) {
          this.y = futureYPosition;
        }
      } else {
        this.size = this.originalSize;
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          if (Math.abs(dx/20) > 0.5) {
            dx = dx*0.75
          }
          this.x -= dx/20;
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          if (Math.abs(dy/20) > 0.5) {
            dy = dy*0.75
          }
          this.y -= dy/20;
        }
      }
    }
  }

  function init() {
    if (canvas.value) {
      setCanvasUp()
    }
    particleArray = []
    for (let y = 0; y < textCoordinates.height; y++) {
      for (let x = 0; x < textCoordinates.width; x++) {
        if (textCoordinates.data[y * 4 * textCoordinates.width + (x * 4) + 3] > 128){
          particleArray.push(new Particle(x * window.innerWidth/150, y * window.innerHeight/75));
        }
      }
    }
  }
  window.addEventListener('resize', () => {
    currentlyReinitializing.value = true
    init()
    currentlyReinitializing.value = false
  })
  init();

  function animate() {
    if (!canvas.value || currentlyReinitializing.value) {
      requestAnimationFrame(animate);
      return
    }
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    for (let i = 0; i < particleArray.length; i++){
      particleArray[i].draw();
      particleArray[i].update();
    }
    connect();
    requestAnimationFrame(animate);
  }
  animate();

  function connect(){
    let opacityValue;
    for (let a = 0; a < particleArray.length; a++){
      for (let b = a+1; b < particleArray.length; b++){
        let dx = particleArray[a].x - particleArray[b].x;
        let dy = particleArray[a].y - particleArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 20){
          opacityValue = 1 - (distance/30);
          ctx.strokeStyle = `rgb(245,245,220, ${opacityValue})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(particleArray[a].x, particleArray[a].y);
          ctx.lineTo(particleArray[b].x, particleArray[b].y);
          ctx.stroke();
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
#canvas1-container {
  display: flex;
  justify-content: center;
}

#canvas1 {
  border: 1px solid rgba(0, 0, 0, 0.5);
  filter: contrast(5);
  cursor: help;
}
</style>
