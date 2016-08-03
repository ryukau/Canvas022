class SceneObject {
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
    canvas.context.save()
    canvas.context.translate(this.position.x, this.position.y)
    canvas.context.rotate(this.rotation)

    canvas.context.fillStyle = this.fill
    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = 2
    canvas.drawPath(this.vertices)

    canvas.context.restore()
  }

  move(canvas) {
    this.position.add(this.velocity)
    this.position.x = U.mod(this.position.x, canvas.width)
    this.position.y = U.mod(this.position.y, canvas.height)

    this.rotation += this.angularVelocity
  }
}



var canvas = new Canvas(window.innerWidth, 512)

var asteroids = makeAsteroids()
function makeAsteroids() {
  var asteroids = []
  for (var i = 0; i < 16; ++i) {
    asteroids.push(new SceneObject(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      32 * (Math.random() * 2 + 1),
      32 * (Math.random() + 1)
    ))
  }
  return asteroids
}

animate()

function animate() {
  for (var i = 0; i < asteroids.length; ++i) {
    asteroids[i].move(canvas)
  }

  canvas.clearWhite()
  for (var i = 0; i < asteroids.length; ++i) {
    asteroids[i].draw(canvas)
  }
  requestAnimationFrame(animate)
}
