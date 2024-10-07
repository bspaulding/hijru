import kaboom from "kaplay";

const k = kaboom();

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
  hijru.move(-HIJRU_SPEED, 0);
});

onKeyDown("right", () => {
  hijru.move(HIJRU_SPEED, 0);
});

onKeyPress("space", () => {
  hijru.doubleJump();
});

hijru.onCollide("bean", (bean) => {
  destroy(bean);
  numBeans -= 1;
});

const explodeH = 192 / 2;
const explodeW = explodeH;
onDestroy("bean", (bean) => {
  const beanCenter = {
    x: bean.pos.x + bean.width / 2,
    y: bean.pos.y + bean.height / 2,
  };
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
