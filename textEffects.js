const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 702;
let particleArray = [];

// handle mouse
const mouse = {
    x: null,
    y: null,
    radius: 150
}

window.addEventListener('mousemove', function(event){
    const offset = canvas.getBoundingClientRect();
    mouse.x = event.x - offset.left;
    mouse.y = event.y - offset.top;
})
ctx.fillStyle = 'white';
ctx.font = '30px Verdana';
ctx.fillText('Alpha', 0, 30);
const textCoordinates = ctx.getImageData(0, 0, 100, 100);

class Particle {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.size = 3;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() *30) + 1;
    }
    draw(){
        ctx.fillStyle = 'white';
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
            this.size = 4;
            const futureXPosition = this.x - directionX;
            const futureYPosition = this.y - directionY;
            if (futureXPosition > 0 && futureXPosition < canvas.width) {
                this.x = futureXPosition;
            }
            if (futureYPosition > 0 && futureYPosition < canvas.height) {
                this.y = futureYPosition;
            }
        } else {
            this.size = 3;
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/20;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/20;
            }
        }
    }
}


function init() {
    particlesArray = [];
    for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            //Uint8ClampedArray -> only can contain number between
            //0 and 255 -> 100 * 100 has 39 999 elements,
            //because rgba -> 10 000 each
            if (textCoordinates.data[y * 4 * textCoordinates.width + (x * 4) + 3] > 128){
                particleArray.push(new Particle(x * 6, y * 6));
            }
        }
    }
}
init();

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particleArray.length; i++){
        particleArray[i].draw();
        particleArray[i].update();
    }
    requestAnimationFrame(animate);
}
animate();
