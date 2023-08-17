const canvas = document.querySelector('canvas');
// selecting the canvas context to be able to add stuff to the canvas(2d game)
const context = canvas.getContext('2d');
console.log(context);

// window.innerWidth gets the width of the page
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let scoreEl = document.querySelector("#scoreEl");
let startGameBtn = document.querySelector("#startGameBtn");
let modalEl = document.querySelector("#modalEl");
let bigScoreEl = document.querySelector("#bigScoreEl");

// properties of the player
class Player {
    // creating a new instants of a player
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    // drawing the player (naming doesnt matter)
    draw() {
        context.beginPath() // to begin to draw on the screen 
        // x, y, radius, startAngle, endingAngle, drawCounterclockwise or clockwise
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill() // draw this circle
    }
}


// properties of the projectile
class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill()
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}

// properties of the Enemy
class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill()
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}


const friction = 0.99;
// properties of the Particle
class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1  // to fade out particle
    }

    draw() {
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill()
        context.restore()
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }
}



const x = canvas.width / 2; // making player in the center
const y = canvas.height / 2; // making player in the center

// creating the player   (x, y, radius, color)
let player = new Player(x, y, 20, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(x, y, 20, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;

    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}


function spawnEnemies(){
    // method will continue calling the function until clearInterval()
    setInterval(()=>{
        const radius = Math.random() * (40 - 10) + 10; // any size from 5 to 30

        let x;
        let y;


        // spawn enemy randomly in the corners
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        const color = `hsl(${Math.random()*360}, 50%, 50%)`;

        // not x-canvas because we want to go  the other way towards the player
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
        
    }, 1000);
};




let animationId;
let score = 0;
// animation loop
function animate(){
    // loops the animation (is a windows function)
    animationId = window.requestAnimationFrame(animate)

    // this makes bg black and makes the particles and enemy with a fade effect
    context.fillStyle = 'rgba(0, 0, 0, 0.1)'; 

    // takes an x, y cordinate and clear canvas so only one projectile is shot
    context.fillRect(0, 0, canvas.width, canvas.height); 

    player.draw();

    // looping through particles array
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index);
        }else{
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        // removing projectile if goes out of screen
        if(projectile.x + projectile.radius < 0 || 
           projectile.x - projectile.radius > canvas.width ||
           projectile.y + projectile.radius < 0 ||
           projectile.y - projectile.radius > canvas.height ){
            setTimeout(()=>{
                // removing projectile
                projectiles.splice(index, 1);
            }, 0)
        }
    });


    enemies.forEach((enemy, index) => {
        enemy.update();

        // distance between player and enemy
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        // ending game if enemy toches player
        if(dist - enemy.radius - player.radius < 1){
            // is a windows function
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            // hypot() the distance between two points x and y hyptnuse
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            
            // if distance between projectile and enemy is < 1 then remove enemy (if they touch)
            if(dist - enemy.radius - projectile.radius < 1){
                

                //rendering particles on hit
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        { 
                            x: (Math.random() - 0.5) * (Math.random() * 6), 
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }
                    ))
                }



                if (enemy.radius - 10 > 20) {

                    // increase score when enemy shrinks
                    score += 10;
                    console.log(score)
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, {radius: enemy.radius - 10})

                    setTimeout(()=>{
                        // removing projectile
                        projectiles.splice(projectileIndex, 1);
                    }, 0)

                }else {

                    // remove enemy from scene
                    // increase score
                    score += 20;
                    console.log(score)
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        // removing enemy
                        enemies.splice(index, 1);
                        // removing projectile
                        projectiles.splice(projectileIndex, 1);
                    }, 0)

                }
            }
        
        })
        
    })

}



window.addEventListener('click', (event)=>{
    console.log(projectiles)
    // atan2() is a math function to get an anlge
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            10,
            'white',
            velocity
        )
    )
})

startGameBtn.addEventListener('click',() => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
})