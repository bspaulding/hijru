// HIJRU (Hydra) - MakeCode Arcade Port
// This is a port of the Kaplay/Kaboom game to MakeCode Arcade JavaScript APIs

// Game constants
// Note: MakeCode Arcade uses different physics scaling than Kaplay
// Original Kaplay values: HIJRU_SPEED=200, JUMP_FORCE=1200, gravity=1600
// These values are adjusted for MakeCode's smaller screen and different physics engine
const HIJRU_SPEED = 100;
const JUMP_FORCE = 200;
const NUM_BEANS_PER_WAVE = 5;
const MAX_HP = 500;
const GROUND_WIDTH = 20;
const GROUND_Y = 14;
let wave = 0;
let numBeans = 0;
let score = 0;
let gameRunning = true;

// Create the player (Hijru)
let hijru = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . f f f f f f . . . . . .
    . . . f e e e e e e f . . . . .
    . . f e e e e e e e e f . . . .
    . . f e e e e e e e e f . . . .
    . . f e e f e e f e e f . . . .
    . . f e e e e e e e e f . . . .
    . . f e e e f f e e e f . . . .
    . . . f e e e e e e f . . . . .
    . . . . f f f f f f . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`, SpriteKind.Player);

hijru.setPosition(80, 60);
hijru.ay = 400; // gravity
hijru.setFlag(SpriteFlag.StayInScreen, true);

// Health system
let hp = MAX_HP;

// Create UI elements
let hpText = textsprite.create("");
hpText.setPosition(30, 5);
hpText.setFlag(SpriteFlag.RelativeToCamera, true);
updateHPDisplay();

let scoreText = textsprite.create("");
scoreText.setPosition(30, 15);
scoreText.setFlag(SpriteFlag.RelativeToCamera, true);
updateScoreDisplay();

// Update display functions
function updateHPDisplay() {
    hpText.setText(hp + "/" + MAX_HP + " HP");
}

function updateScoreDisplay() {
    scoreText.setText(score + " beans");
}

// Input handling
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    hijru.vx = -HIJRU_SPEED;
});

controller.left.onEvent(ControllerButtonEvent.Released, function () {
    if (hijru.vx < 0) {
        hijru.vx = 0;
    }
});

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    hijru.vx = HIJRU_SPEED;
});

controller.right.onEvent(ControllerButtonEvent.Released, function () {
    if (hijru.vx > 0) {
        hijru.vx = 0;
    }
});

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (hijru.isHittingTile(CollisionDirection.Bottom)) {
        hijru.vy = -JUMP_FORCE;
    }
});

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    fireBreath();
});

// Bean spawning system
game.onUpdateInterval(500, function () {
    if (numBeans === 0 && gameRunning) {
        wave += 1;
        for (let i = 0; i < wave * NUM_BEANS_PER_WAVE; i++) {
            spawnBean();
        }
    }
});

function spawnBean() {
    let bean = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . 5 5 5 5 5 . . . . . .
        . . . . 5 5 5 5 5 5 5 . . . . .
        . . . 5 5 5 5 5 5 5 5 5 . . . .
        . . . 5 5 5 5 5 5 5 5 5 . . . .
        . . . 5 5 5 5 5 5 5 5 5 . . . .
        . . . 5 5 5 5 5 5 5 5 5 . . . .
        . . . 5 5 5 5 5 5 5 5 5 . . . .
        . . . 5 5 5 5 5 5 5 5 5 . . . .
        . . . . 5 5 5 5 5 5 5 . . . . .
        . . . . . 5 5 5 5 5 . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, SpriteKind.Enemy);
    
    bean.setPosition(
        Math.randomRange(10, 150),
        Math.randomRange(10, 100)
    );
    bean.ay = 300;
    numBeans += 1;
}

// Collision handling
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    if (gameRunning) {
        hp -= 10;
        updateHPDisplay();
        
        // Destroy bean and create explosion effect
        otherSprite.destroy(effects.disintegrate, 200);
        numBeans -= 1;
        
        // Check for game over
        if (hp <= 0) {
            gameOver();
        }
    }
});

// Fire breath mechanic
function fireBreath() {
    if (!gameRunning) return;
    
    let fire = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . 4 4 4 4 4 . . . . . .
        . . . . 4 4 5 5 5 4 4 . . . . .
        . . . 4 4 5 5 5 5 5 4 4 . . . .
        . . . 4 5 5 5 5 5 5 5 4 . . . .
        . . . 4 5 5 5 5 5 5 5 4 . . . .
        . . . 4 5 5 5 5 5 5 5 4 . . . .
        . . . 4 4 5 5 5 5 5 4 4 . . . .
        . . . . 4 4 5 5 5 4 4 . . . . .
        . . . . . 4 4 4 4 4 . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, SpriteKind.Projectile);
    
    fire.setPosition(hijru.x + 20, hijru.y);
    fire.vx = 150;
    fire.lifespan = 1000;
    
    // Set flag to destroy when off screen
    fire.setFlag(SpriteFlag.DestroyOnWall, true);
}

// Fire breath hits beans
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    if (gameRunning) {
        score += 1;
        updateScoreDisplay();
        
        // Destroy both fire and bean
        sprite.destroy();
        otherSprite.destroy(effects.fire, 200);
        numBeans -= 1;
    }
});

// Game over function
function gameOver() {
    gameRunning = false;
    
    // Destroy all sprites
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy);
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile);
    
    // Show game over screen
    game.splash("You Lose!", `You ate ${score} beans.`);
    
    // Reset game
    resetGame();
}

function resetGame() {
    hp = MAX_HP;
    score = 0;
    wave = 0;
    numBeans = 0;
    gameRunning = true;
    
    updateHPDisplay();
    updateScoreDisplay();
    
    hijru.setPosition(80, 60);
    hijru.vx = 0;
    hijru.vy = 0;
}

// Create ground
scene.setBackgroundColor(9);

// Simple platform at the bottom
for (let i = 0; i < GROUND_WIDTH; i++) {
    tiles.setTileAt(tiles.getTileLocation(i, GROUND_Y), sprites.dungeon.floorDark0);
    tiles.setWallAt(tiles.getTileLocation(i, GROUND_Y), true);
}
