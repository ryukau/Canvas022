class Scene {
  constructor() {
    this.canvas = new Canvas(window.innerWidth, 512)
    this.bodies = []
  }

  add(body) {
    if (body instanceof Body) {
      this.bodies.push(body)
    }
  }

  move() {
    for (var i = 0; i < this.bodies.length; ++i) {
      this.bodies[i].move(this.canvas)
    }
  }

  draw() {
    this.canvas.clearWhite()
    for (var i = 0; i < this.bodies.length; ++i) {
      this.bodies[i].draw(this.canvas)
    }
  }
}

class Body {
  constructor(positionX, positionY, maxWidth, maxHeight) {
    this.vertices = this.makeHull(maxWidth, maxHeight)
    this.translateCentroidToOrigin()

    this.position = new Vec2(positionX, positionY)
    this.rotation = 0
    this.velocity = new Vec2(
      U.randomPlusMinus() * 1,
      U.randomPlusMinus() * 1
    )
    this.angularVelocity = U.randomPlusMinus() * 0.1

    this.fill = U.randomColorCode()
    this.stroke = "#444444"
  }

  makeHull(maxWidth, maxHeight) {
    var vertices = []
    for (var i = 0; i < 10; ++i) {
      vertices.push(new Vec2(
        Math.random() * maxWidth,
        Math.random() * maxHeight
      ))
    }
    return QuickHull.getHull(vertices)
  }

  translateCentroidToOrigin() {
    var centroid = new Vec2(0, 0)
    for (var i = 0; i < this.vertices.length; ++i) {
      centroid.add(this.vertices[i])
    }
    centroid.mul(1 / this.vertices.length)

    for (var i = 0; i < this.vertices.length; ++i) {
      this.vertices[i].sub(centroid)
    }
  }

  draw(canvas) {
    var context = canvas.context
    context.save()
    context.translate(this.position.x, this.position.y)
    context.rotate(this.rotation)

    context.fillStyle = this.fill
    context.strokeStyle = this.stroke
    context.lineWidth = 2
    canvas.drawPath(this.vertices)

    context.restore()
  }

  move(canvas) {
    this.position.add(this.velocity)
    this.position.x = U.mod(this.position.x, canvas.width)
    this.position.y = U.mod(this.position.y, canvas.height)

    this.rotation += this.angularVelocity
  }
}


var scene = new Scene()

makeAsteroids()
function makeAsteroids() {
  for (var i = 0; i < 16; ++i) {
    scene.add(new Body(
      Math.random() * scene.canvas.width,
      Math.random() * scene.canvas.height,
      32 * (Math.random() * 2 + 1),
      32 * (Math.random() + 1)
    ))
  }
}

animate()

function animate() {
  scene.move()
  scene.draw()
  requestAnimationFrame(animate)
}
