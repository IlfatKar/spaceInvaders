const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const init = () => {
  canvas.width = 900;
  canvas.height = 900;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
init();

class Game {
  constructor(ctx) {
    this.w = ctx.canvas.width;
    this.h = ctx.canvas.height;
    this.ctx = ctx;
    this.player = new Player(this.w / 2, this.h, 100, 50);
    this.player.shot = this.shot.bind(this);
    this.enemies = [];
    this.lastTime = null;
    this.shots = [];
    this.shotTimeout = 0.25;
    this.collistions = [];
  }
  update(dt) {
    const hitted = [];
    this.collistions.forEach((collistion, idx) => {
      collistion.update();
      if (collistion.overlapped()) {
        this.enemies = this.enemies.filter(
          (enemy) => enemy !== collistion.enemy
        );
        this.shots = this.shots.filter((shot) => shot !== collistion.bullet);
        hitted.push(idx);
      }
    });
    this.collistions = this.collistions.filter((_, i) => {
      for (const idx of hitted) {
        if (i === idx) {
          return false;
        }
      }
      return true;
    });

    this.shotTimeout -= dt;
    this.shots = this.shots.filter((shot) => shot.dt < 3);
    this.shots.forEach((shot) => {
      shot.update(dt);
    });
    this.player.update(dt);
    this.enemies.forEach((enemy) => {
      enemy.update(dt);
    });
  }
  render(ctx) {
    this.shots.forEach((shot) => {
      shot.render(ctx);
    });
    this.player.render(ctx);
    this.enemies.forEach((enemy) => {
      enemy.render(ctx);
    });
  }
  loop(timestamp) {
    if (!this.lastTime) {
      this.lastTime = timestamp;
    }
    const dt = (timestamp - this.lastTime) / 1000;
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.update(dt);
    this.render(ctx);
    this.lastTime = timestamp;
    requestAnimationFrame(this.loop.bind(this));
  }
  start() {
    for (let i = 0; i < 8; i++) {
      this.enemies.push(new Enemy(115 * i + 3, 10, 75, 50));
      i < 7 && this.enemies.push(new Enemy(115 * i + 70, 80, 75, 50));
      this.enemies.push(new Enemy(115 * i + 3, 145, 75, 50));
    }
    this.player.setEvents();
    requestAnimationFrame(this.loop.bind(this));
  }
  shot(player) {
    if (this.shotTimeout <= 0) {
      this.shots.push(
        new Bullet(player.x + player.w / 2 - 5, player.y - player.h / 2)
      );
      this.enemies.forEach((enemy) => {
        this.collistions.push(
          new Collistion(this.shots[this.shots.length - 1], enemy)
        );
      });
      this.shotTimeout = 0.25;
    }
  }
}

class Collistion {
  constructor(rect1, rect2) {
    this.bullet = rect1;
    this.enemy = rect2;
    this.overlapped();
  }

  update() {
    this.al = this.bullet.x;
    this.at = this.bullet.y;
    this.ar = this.bullet.x + this.bullet.w;
    this.ab = this.bullet.y + this.bullet.y;

    this.bl = this.enemy.x;
    this.bt = this.enemy.y;
    this.br = this.enemy.x + this.enemy.w;
    this.bb = this.enemy.y + this.enemy.y;
  }

  overlapped() {
    if (this.al > this.br || this.bl > this.ar) return false;
    if (this.at > this.bb || this.bt > this.ab) return false;

    return true;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 10;
    this.h = 30;
    this.speed = 300;
    this.dt = 0;
    this.ded = false;
  }
  update(dt) {
    this.dt += dt;
    this.y -= this.speed * dt;
  }
  render(ctx) {
    if (this.ded) return;
    ctx.filter = "invert(0)";
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Player {
  constructor(x, y, w, h) {
    const img = new Image();
    img.src = "docs/assets/player.png";
    this.sprite = img;
    this.w = w;
    this.h = h;
    this.x = x - w / 2;
    this.y = y - h;
    this.dx = 0;
    this.speed = 300;
  }
  update(dt) {
    if (this.x + this.dx >= 0 && this.x + this.dx + this.w <= 900) {
      this.x += this.dx * this.speed * dt;
    }
  }
  render(ctx) {
    ctx.filter = "invert(1)";
    ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
  }
  setEvents() {
    console.log(canvas);
    addEventListener("keydown", (e) => {
      e.preventDefault();
      switch (e.key) {
        case " ":
          this.shot(this);
          break;
        case "ArrowLeft":
          this.dx = -1;
          break;
        case "ArrowRight":
          this.dx = 1;
          break;
        default:
          break;
      }
    });
    addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight" || this.key === "ArrowLeft") {
        this.dx = 0;
      }
    });
  }
}

class Enemy {
  constructor(x, y, w, h) {
    const img = new Image();
    img.src = "docs/assets/enemy.png";
    this.sprite = img;
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.speedX = 5;
    this.speedY = 3;
    this.dir = 1;
    this.dx = 0;
    this.dt = 0;
    this.step = 0;
  }
  update(dt) {
    this.dt += dt;
    if (this.dt >= 0.5) {
      this.step++;
      this.dt = 0;
      if (this.step === 4) {
        this.y += this.speedY;
        this.step = 0;
      } else {
        this.x += this.speedX * this.dir;
        this.dx += this.speedX;
        if (this.dx >= 15) {
          this.dx = 0;
          this.dir = -this.dir;
        }
      }
    }
  }
  render(ctx) {
    ctx.filter = "invert(1)";
    ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
  }
}

const game = new Game(ctx);
game.start();
