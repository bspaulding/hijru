import kaboom from "kaplay";

const k = kaboom();

k.loadSound("you-lose", "sounds/you-lose.mp3");

k.setGravity(1600);

const HIJRU_SPEED = 200;
const JUMP_FORCE = 1200;
const NUM_BEANS_PER_WAVE = 5;
let wave = 0;
let numBeans = 0;

k.loadSprite("background", "sprites/bg-lightning-volcano.jpg");
k.loadSprite("hijru", "sprites/hijru-300h.png");
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("explosion", "sprites/explode.png", {
  sliceX: 8,
  sliceY: 1,
  anims: {
    xplode: { from: 0, to: 7, loop: false },
  },
});
k.loadSprite("hijruBreath", "sprites/fire-1.png", {
  sliceX: 1,
  sliceY: 1,
  anims: {
    breath: { from: 0, to: 0, loop: false },
  },
});

const bg = k.add([
  k.sprite("background"),
  k.pos(k.center()),
  k.anchor("center"),
  k.rotate(0),
  k.fixed(),
  k.scale(1),
]);

const hijru = k.add([
  k.pos(k.center()),
  k.anchor("center"),
  k.area(),
  k.body({ jumpForce: JUMP_FORCE }),
  k.doubleJump(),
  k.rotate(0),
  k.sprite("hijru"),
  k.health(500)
]);

loop(0.5, () => {
  if (numBeans == 0) {
    wave += 1;
    for (let i = 0; i < wave * NUM_BEANS_PER_WAVE; i += 1) {
      k.add([
        k.sprite("bean"),
        k.body(),
        k.area(),
        k.pos(k.rand(k.vec2(50), k.vec2(k.width() - 50, k.height() - 50))),
        "bean",
      ]);
      numBeans += 1;
    }
  }
});

let touches = 0;
let touchDirection = 1;
onTouchStart((p, t) => {
  if (touches > 0) {
    return; // ignore more than the first touch for now
  }

  touches += 1;
  touchDirection = p.x < hijru.pos.x ? -1 : 1;
  requestAnimationFrame(touchMove);
});
onTouchEnd(() => {
  touches -= 1;
});
function touchMove() {
  if (touches > 0) {
    hijru.move(touchDirection * HIJRU_SPEED, 0);
    requestAnimationFrame(touchMove);
  }
}

onKeyDown("left", () => {
  hijru.flipX = true;
  hijru.move(-HIJRU_SPEED, 0);
});

onKeyDown("right", () => {
  hijru.flipX = false;
  hijru.move(HIJRU_SPEED, 0);
});

onKeyPress("up", () => {
  hijru.doubleJump();
});

onKeyPress("space", () => {
  hijru.trigger("fireBreath");
});

const hp = k.add([
  text("500/500 HP"),
  pos(0, 0),
]);

const score = k.add([
  text("0 beans"),
  pos(0, 50),
  { value: 0 }
]);

hijru.onCollide("bean", (bean) => {
  hijru.hurt(10);
  hp.text = `${hijru.hp()}/500 HP`;
  destroy(bean);
  numBeans -= 1;
});

hijru.on("death", () => {
  destroy(hijru);
  go("lose", score.value);
});

function centerOf(obj) {
  return {
    x: obj.pos.x + obj.width / 2,
    y: obj.pos.y + obj.height / 2,
  };
}

hijru.on("fireBreath", () => {
  const direction = hijru.flipX ? -1 : 1;
  const offset = direction == 1 ? { x: 275 * direction, y: -140 } : { x: -275, y: 40};
  const fire = k.add([
    k.sprite("hijruBreath"),
    k.pos(hijru.pos.x + offset.x, hijru.pos.y + offset.y),
    k.rotate(45 * direction),
    k.area(),
    k.body({ isStatic: true }),
    timer(),
    "hijruBreath"
  ]);
  fire.flipX = hijru.flipX;
  fire.onCollide("bean", (bean) => {
    score.value += 1;
    score.text = `${score.value} beans`;
    destroy(bean);
    numBeans -= 1;
  });

  fire.wait(1, () => {
    destroy(fire);
  });
  // TODO: need to animate this
  fire.play("breath");
});

const explodeH = 192 / 2;
const explodeW = explodeH;
onDestroy("bean", (bean) => {
  const beanCenter = centerOf(bean);
  const explosion = k.add([
    k.sprite("explosion"),
    k.pos(beanCenter.x - explodeW, beanCenter.y - explodeH),
    timer(),
    "explosion",
  ]);
  explosion.wait(2, () => {
    destroy(explosion);
  });
  explosion.play("xplode");
});

add([
  rect(width(), 48),
  outline(4),
  area(),
  pos(0, height()),
  // Give objects a body() component if you don't want other solid objects pass through
  body({ isStatic: true }),
]);

scene("lose", (score) => {
  console.debug({ score });
  const center = k.center();
  add([
    text("You Lose!"),
    k.pos(center),
  ])
  add([
    text(`You ate ${score} beans.`),
    k.pos(center.x, center.y + 50),
  ])
  play("you-lose")
  // TODO: losing music
});
