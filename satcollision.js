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
        var collision = this.isCollideSAT(this.bodies[i], this.bodies[j])
        if (collision !== null) {
          this.bodies[i].fill = "#ffaaaa"
          this.bodies[j].fill = "#ffaaaa"
          this.collide(this.bodies[i], this.bodies[j], collision)
        }
      }
    }
  }

  collide(body1, body2, collisionInfomation) {
    var distance = collisionInfomation.distance
    var index = collisionInfomation.index
    if (index < body1.vertices.length) {
      this.pullAway(body1, body2, index, distance)
    }
    else {
      this.pullAway(body2, body1, index - body1.vertices.length, distance)
    }
  }

  pullAway(body1, body2, index, distance) {
    var direction = Vec2.sub(body2.position, body1.position).normalize()
    var ratio1 = body2.mass / (body1.mass + body2.mass)
    var ratio2 = 1 - ratio1
    body1.position.sub(Vec2.mul(direction, ratio1 * distance))
    body2.position.add(Vec2.mul(direction, ratio2 * distance))

    var contact = this.findContactPoint(body1, body2, index)
    this.calcImpulse(body1, body2, contact.point, contact.normal)
  }

  // インパルスを計算。
  // http://www.myphysicslab.com/collision.html
  calcImpulse(A, B, contact, normal) {
    var rap = Vec2.sub(contact, A.position)
    var rbp = Vec2.sub(contact, B.position)

    var elasticity = 0.6 // 値は適当。

    var omegaa1_rap = Vec2.perpendicular(rap).mul(A.angularVelocity)
    var omegab1_rbp = Vec2.perpendicular(rbp).mul(B.angularVelocity)
    var vap1 = Vec2.add(A.velocity, omegaa1_rap)
    var vbp1 = Vec2.add(B.velocity, omegab1_rbp)
    var vab1 = Vec2.sub(vap1, vbp1)

    if (isNaN(A.velocity.x) || isNaN(A.velocity.x)) {
      console.log(
        "A.velocity", A.velocity,
        "B.velocity", B.velocity,
        "omegaa1_rap", omegaa1_rap,
        "omegab1_rbp", omegab1_rbp,
        "vap1", vap1,
        "vbp1", vbp1,
        "vab1", vab1
      )
      debugger
    }

    // 慣性モーメント。
    var ia = A.mass * rap.lengthSq() / 12
    var ib = B.mass * rap.lengthSq() / 12

    var numer = -(1 + elasticity) * vab1.dot(normal)
    var rapn = rap.cross(normal)
    var rbpn = rbp.cross(normal)
    var denom = 1 / A.mass + 1 / B.mass + rapn * rapn / ia + rbpn * rbpn / ib
    var j = numer / denom

    var jn = Vec2.mul(normal, j)
    A.velocity.add(Vec2.mul(jn, 1 / A.mass))
    B.velocity.sub(Vec2.mul(jn, 1 / B.mass))
    A.angularVelocity += (rap.cross(jn)) / ia
    B.angularVelocity -= (rbp.cross(jn)) / ib
  }

  findContactPoint(body1, body2, index) {
    var next = (index + 1) % body1.vertices.length
    var lineA = body1.vertices[index]
    var lineB = body1.vertices[next]
    var minDistance = this.distancePointLine(body2.vertices[0], lineA, lineB)
    var pointIndex = 0
    for (var i = 1; i < body2.vertices.length; ++i) {
      var distance = this.distancePointLine(body2.vertices[i], lineA, lineB)
      if (minDistance > distance) {
        minDistance = distance
        pointIndex = i
      }
    }

    // debug collision point.
    this.canvas.context.fillStyle = "#ff88ff"
    this.canvas.drawPoint(body2.vertices[pointIndex], 8)
    this.canvas.context.fillStyle = "#88ffff"
    this.canvas.drawPoint(lineA, 4)
    this.canvas.context.fillStyle = "#88ffff"
    this.canvas.drawPoint(lineB, 4)

    return {
      point: body2.vertices[pointIndex].clone(),
      normal: Vec2.sub(lineB, lineA).perpendicular().normalize(),
    }
  }

  isCollideSAT(body1, body2) {
    var axes = body1.getNormals().concat(body2.getNormals())
    var minDistance = Number.MAX_VALUE
    var index = 0
    for (var i = 0; i < axes.length; ++i) {
      var projection1 = body1.projection(axes[i])
      var projection2 = body2.projection(axes[i])
      var overlap = this.isOverlap(projection1, projection2)
      if (overlap === null) {
        return null
      }
      else {
        if (minDistance > overlap) {
          minDistance = overlap
          index = i
        }
      }
    }
    return {
      distance: minDistance,
      index: index,
    }
  }

  // http://stackoverflow.com/questions/15726825/find-overlap-between-collinear-lines
  // a = [min, max], b = [min, max]
  isOverlap(a, b) {
    if ((a[1] - b[0]) >= 0 && (b[1] - a[0]) >= 0) {
      return Math.abs(Math.min(a[1], b[1]) - Math.max(a[0], b[0]))
    }
    return null
  }

  tripleProduct(a, b, c) {
    var x = Vec2.mul(b, c.dot(a))
    var y = Vec2.mul(a, c.dot(b))
    return x.sub(y)
  }

  // http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  // lineA, lineB は、同じ直線上の点。
  distancePointLine(point, lineA, lineB) {
    var pa = Vec2.sub(point, lineA)
    var ab = Vec2.sub(lineB, lineA)
    var dot = ab.dot(pa)
    var lengthsq = ab.lengthSq()
    var param = -1
    if (lengthsq > 1e-5) {
      param = dot / lengthsq
    }

    var nearest
    if (param < 0) {
      nearest = lineA
    }
    else if (param > 1) {
      nearest = lineB
    }
    else {
      nearest = Vec2.add(lineA, ab.mul(param))
    }

    return Vec2.sub(point, nearest).length()
  }
}

class Body {
  constructor(positionX, positionY, maxWidth, maxHeight) {
    this.hull = this.makeHull(maxWidth, maxHeight)
    this.translateCentroidToOrigin(this.hull)
    this.vertices = []
    this.initializeVertices(this.vertices)

    this.mass = 1
    this.position = new Vec2(positionX, positionY)
    this.rotation = 0
    this.velocity = new Vec2(
      U.randomPlusMinus() * 1,
      U.randomPlusMinus() * 1
    )
    this.angularVelocity = U.randomPlusMinus() * 0.1

    this.fill = "#aaaaff"//U.randomColorCode()
    this.stroke = "#444444"
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
    for (var i = 0; i < this.vertices.length; ++i) {
      var j = (i + 1) % this.vertices.length
      var normal = Vec2.sub(this.vertices[j], this.vertices[i])

      var temp = normal.x
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
  for (var i = 0; i < 32; ++i) {
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
  scene.canvas.clearWhite()
  scene.detectCollision()
  scene.draw()
  scene.move()
  requestAnimationFrame(animate)
}
