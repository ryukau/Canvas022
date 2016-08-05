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
    this.canvas.context.lineCaps = "round"
    this.canvas.context.lineJoin = "round"
    for (var i = 0; i < this.bodies.length; ++i) {
      this.bodies[i].draw(this.canvas)
    }
  }

  detectCollision() {
    // debug start
    for (var i = 0; i < this.bodies.length; ++i) {
      this.bodies[i].fill = "#aaaaff"
    }
    //debug end

    for (var i = 0; i < this.bodies.length; ++i) {
      for (var j = i + 1; j < this.bodies.length; ++j) {
        if (this.isCollideGJK(this.bodies[i], this.bodies[j])) {
          this.bodies[i].fill = "#ffaaaa"
          this.bodies[j].fill = "#ffaaaa"
        }
      }
    }
  }

  isCollideGJK(body1, body2) {

  }

  support(body1, body2, direction) {
    var point1 = body1.getFarthestPointInDirection(direction)
    var point2 = body2.getFarthestPointInDirection(direction)
    var point3 = point1.sub(point2)
    return point3
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
    this.angularVelocity = U.randomPlusMinus() * 0.01

    this.fill = "#aaaaff"//U.randomColorCode()
    this.stroke = "#444444"
  }

  vertexAt(index) {
    return this.vertices[U.mod(index, this.vertices.length)]
  }

  getFarthestPointInDirection(direction) {
    var candidate = this.vertices[0]
    var distance = direction.dot(candidate)
    for (var i = 1; i < this.vertices.length; ++i) {
      var temp_distance = direction.dot(this.vertices[i])
      if (distance < temp_distance) {
        distance = temp_distance
        candidate = this.vertices[i]
      }
    }
    return candidate
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
    context.lineWidth = 0
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
  scene.detectCollision()
  scene.draw()
  scene.move()
  requestAnimationFrame(animate)
}
