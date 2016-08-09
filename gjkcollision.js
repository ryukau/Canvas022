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
    var simplex = new Simplex()
    var direction = new Vec2(1, 0)
    simplex.add(this.support(body1, body2, direction))
    direction.neg()

    while (true) {
      simplex.add(this.support(body1, body2, direction))
      if (simplex.getLast().dot(direction) <= 0) {
        return false
      }
      if (this.containOrigin(simplex, direction)) {
        this.getCollisionInfomationEPA(body1, body2, simplex)
        return true
      }
    }
  }

  getCollisionInfomationEPA(body1, body2, simplex) {
    while (true) {
      var edge = this.findClosestEdges(simplex)
      var point = this.support(body1, body2, edge.normal)
      var distance = point.dot(edge.normal)
      if (distance - edge.distance < 1e-5) {
        return {
          normal: edge.normal,
          depth: distance,
        }
      }
      else {
        simplex.vertices.splice(edge.index, 0, point)
      }
    }
  }

  findClosestEdges(simplex) {
    var closest = {}
    var vertices = simplex.vertices
    var distance = Number.MAX_VALUE
    for (var i = 0; i < vertices.length; ++i) {
      var j = (i + 1) % vertices.length
      var e = Vec2.sub(vertices[j], vertices[i])
      var normal = this.tripleProduct(e, vertices[i], e)
      normal.normalize()
      var d = normal.dot(vertices[i])
      if (d < distance) {
        closest.distance = d
        closest.normal = normal
        closest.index = j
      }
    }
    return closest
  }

  containOrigin(simplex, direction) {
    var a = simplex.getLast()
    var ao = a.clone().neg()

    if (simplex.vertices.length == 3) {
      var b = simplex.vertices[1]
      var c = simplex.vertices[0]
      var ab = Vec2.sub(b, a)
      var ac = Vec2.sub(c, a)
      var abPerp = this.tripleProduct(ac, ab, ab)
      var acPerp = this.tripleProduct(ab, ac, ac)

      if (abPerp.dot(ao) > 0) {
        simplex.remove(c)
        direction.copy(abPerp)
        return false
      }

      if (acPerp.dot(ao) > 0) {
        simplex.remove(b)
        direction.copy(acPerp)
        return false
      }
      return true
    }

    if (simplex.vertices.length == 2) {
      var b = simplex.vertices[0]
      var ab = Vec2.sub(b, a)
      var abPerp = this.tripleProduct(ab, ao, ab)
      direction.copy(abPerp)
    }
    return false
  }

  tripleProduct(a, b, c) {
    var x = Vec2.mul(b, c.dot(a))
    var y = Vec2.mul(a, c.dot(b))
    return x.sub(y)
  }

  support(body1, body2, direction) {
    var d = direction.clone()
    var point1 = body1.getFarthestPointInDirection(d)
    var point2 = body2.getFarthestPointInDirection(d.neg())
    return Vec2.sub(point1, point2)
  }
}

class Solver {
  // A x = B を x について解く。
  // A は正方行列。
  //
  // Gauss-Seidel 法を使用。
  // http://www.az.cs.is.nagoya-u.ac.jp/class/comp-sys/na_chap_6.pdf
  //
  // 本来なら for (iteration ...) ではなく while (収束判定) とすべき。
  // ゲームの衝突判定なので速さ優先。
  //
  // 収束しない場合がある。以下の Convergence の項を参照。
  // https://en.wikipedia.org/wiki/Gauss%E2%80%93Seidel_method
  static GaussSeidel(A, B) {
    var x = new Array(B.length).fill(0)
    for (var iteration = 0; iteration < 10; ++iteration) {
      for (var i = 0; i < A.length; ++i) {
        var sum = 0
        for (var j = 0; j < A[0].length; ++j) {
          if (i !== j) {
            sum += A[i][j] * x[j]
          }
        }
        x[i] = (B[i] - sum) / A[i][i]

        // 収束しないときは終了。
        if (!Number.isFinite(x[i])) {
          return x.fill(0)
        }
      }
    }
    return x
  }
}

class Simplex {
  constructor() {
    this.vertices = []
  }

  add(vertex) {
    this.vertices.push(vertex)
    if (this.vertices.length > 3) {
      this.vertices.shift()
    }
  }

  remove(vertex) {
    var index = this.vertices.indexOf(vertex)
    if (index >= 0) {
      this.vertices.splice(index, 1)
    }
  }

  getLast() {
    return this.vertices[this.vertices.length - 1]
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

// Solverのテスト

// Case 1
var A, B, x
A = [[10, -1, 2, 0], [-1, 11, -1, 3], [2, -1, 10, -1], [0, 3, -1, 8]]
B = [6, 25, -11, 15]
x = Solver.GaussSeidel(A, B)
console.log(x) // [1, 2, -1, 1]

// Case 2
// GaussSeidelでは収束しない。
A = [[1, -2, 3], [3, 1, -5], [-2, 6, -9]]
B = [1, -4, -2]
x = Solver.GaussSeidel(A, B)
console.log(x) // [1, 3, 2]


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
  scene.detectCollision()
  scene.draw()
  requestAnimationFrame(animate)
}
