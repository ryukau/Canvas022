class Canvas {
  constructor(width, height) {
    this.canvas = document.createElement("canvas")
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext("2d")
    this.imageData = this.context.getImageData(0, 0, width, height)
    this.pixels = this.imageData.data
    document.body.appendChild(this.canvas)
  }

  get CurrentPixels() {
    this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.pixels = this.imageData.data
    return this.pixels
  }

  get Center() {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    }
  }

  set visible(isVisible) {
    if (isVisible) {
      canvas.sytle.display = "inline"
    }
    else {
      canvas.style.display = "none"
    }
  }

  drawPath(poly) {
    if (poly.length < 1) {
      return
    }

    this.context.beginPath()
    this.context.moveTo(poly[0].x, poly[0].y)
    for (let i = 1; i < poly.length; ++i) {
      this.context.lineTo(poly[i].x, poly[i].y)
    }
    this.context.closePath()
    this.context.fill()
    this.context.stroke()
  }

  drawPoints(points, radius) {
    for (let index = 0; index < points.length; ++index) {
      this.drawPoint(points[index], radius)
    }
  }

  drawNumbers(points) {
    for (let index = 0; index < points.length; ++index) {
      this.context.fillText(index, points[index].x, points[index].y)
    }
  }

  drawLine(a, b) {
    this.context.beginPath()
    this.context.moveTo(a.x, a.y)
    this.context.lineTo(b.x, b.y)
    this.context.stroke()
  }

  drawPoint(point, radius) {
    this.context.beginPath()
    this.context.arc(point.x, point.y, radius, 0, Math.PI * 2, false)
    this.context.fill()
  }

  clearWhite() {
    this.context.fillStyle = "#ffffff"
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fill()
  }

  clear(color) {
    this.context.fillStyle = color
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fill()
  }

  resetTransform() {
    this.context.transform(1, 0, 0, 1, 0, 0)
  }

  putPixels() {
    this.context.putImageData(this.imageData, 0, 0)
  }

  setPixel(x, y, color) {
    var index = (y * this.canvas.width + x) * 4
    this.pixels[index + 0] = color.r
    this.pixels[index + 1] = color.g
    this.pixels[index + 2] = color.b
    this.pixels[index + 3] = color.a
  }

  feedback(alpha, white) {
    for (var y = 0; y < this.canvas.height; ++y) {
      for (var x = 0; x < this.canvas.width; ++x) {
        var index = (y * this.canvas.width + x) * 4
        this.pixels[index + 0] = Math.min(this.pixels[index + 0] * white, 255) // R
        this.pixels[index + 1] = Math.min(this.pixels[index + 1] * white, 255) // G
        this.pixels[index + 2] = Math.min(this.pixels[index + 2] * white, 255) // B
        this.pixels[index + 3] *= alpha // A
      }
    }
    this.context.putImageData(this.imageData, 0, 0)
  }
}

class Timer {
  constructor() {
    this.time_now = Date.now()
    this.time_previous = time_now
  }

  get dt() {
    this.time_now = Date.now()
    var delta = this.time_now - this.time_previous
    this.time_previous = this.time_now
    return delta
  }

  get now() {
    return this.time_now
  }
}
