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
        if (this.isCollideSAT(this.bodies[i], this.bodies[j])) {
          this.bodies[i].fill = "#ffaaaa"
          this.bodies[j].fill = "#ffaaaa"
        }
      }
    }
  }

  isCollideSAT(body1, body2) {
    var axes = body1.getNormals().concat(body2.getNormals())
    var projection1, projection2
    for (var i = 0; i < axes.length; ++i) {
      projection1 = body1.projection(axes[i])
      projection2 = body2.projection(axes[i])
      if (!this.isOverlap(projection1, projection2)) {
        return false
      }
      else {
        // 衝突時のインパルスを計算。
      }
    }
    return true
  }

  isOverlap(a, b) {
    if ((a[1] - b[0]) >= 0 && (b[1] - a[0]) >= 0) {
      return true
    }
    return false
  }
}

class Body {
  constructor(positionX, positionY, maxWidth, maxHeight) {
    this.hull = this.makeHull(maxWidth, maxHeight)
    this.translateCentroidToOrigin(this.hull)
    this.vertices = []
    this.initializeVertices(this.vertices)

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

  projection(axis) {
    var min = axis.dot(this.vertices[0])
    var max = min
    var candidate
    for (var i = 1; i < this.vertices.length; ++i) {
      candidate = axis.dot(this.vertices[i])
      if (candidate < min) {
        min = candidate
      }
      if (candidate > max) {
        max = candidate
      }
    }
    return [min, max]
  }

  getNormals() {
    var normals = []
    var normal, temp
    for (var i = 0; i < this.vertices.length; ++i) {
      normal = Vec2.sub(this.vertexAt(i + 1), this.vertices[i])

      temp = normal.x
      normal.x = -normal.y
      normal.y = temp

      normal.normalize()
      normals.push(normal)
    }
    return normals
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

  translateCentroidToOrigin(vertices) {
    var centroid = new Vec2(0, 0)
    for (var i = 0; i < vertices.length; ++i) {
      centroid.add(vertices[i])
    }
    centroid.mul(1 / vertices.length)

    for (var i = 0; i < vertices.length; ++i) {
      vertices[i].sub(centroid)
    }
  }

  initializeVertices(vertices) {
    vertices.length = 0
    for (var i = 0; i < this.hull.length; ++i) {
      vertices.push(new Vec2(0, 0))
    }
  }

  draw(canvas) {
    canvas.context.fillStyle = this.fill
    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = 0
    canvas.drawPath(this.vertices)
  }

  move(canvas) {
    this.position.add(this.velocity)
    this.position.x = U.mod(this.position.x, canvas.width)
    this.position.y = U.mod(this.position.y, canvas.height)

    this.rotation += this.angularVelocity

    var sin = Math.sin(this.rotation)
    var cos = Math.cos(this.rotation)
    var x, y
    for (var i = 0; i < this.hull.length; ++i) {
      x = this.hull[i].x
      y = this.hull[i].y
      this.vertices[i].set(
        x * cos - y * sin + this.position.x,
        x * sin + y * cos + this.position.y
      )
    }
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
