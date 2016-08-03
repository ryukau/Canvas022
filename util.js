
// ユーティリティ。
class U {
  // オブジェクトをスワップ。
  static swap(a, b) {
    var temp = a
    a = b
    b = temp
  }

  // 双曲関数。
  static sinh(x) {
    return (Math.exp(x) - Math.exp(-x)) * 0.5
  }

  static cosh(x) {
    return (Math.exp(x) + Math.exp(-x)) * 0.5
  }

  static tanh(x) {
    var a = Math.exp(x),
      b = Math.exp(-x)
    return (a - b) / (a + b)
  }

  static sech(x) {
    return 2 / (Math.exp(x) - Math.exp(-x))
  }

  static csch(x) {
    return 2 / (Math.exp(x) + Math.exp(-x))
  }

  static coth(x) {
    var a = Math.exp(x),
      b = Math.exp(-x)
    return (a + b) / (a - b)
  }

  // value を [min, max] の範囲に収める。
  static clamp(value, min, max) {
    return isNaN(value) ? 0 : Math.max(min, Math.min(value, max));
  }

  static randomPow(n) {
    var r = Math.random()
    return Math.pow(r, n)
  }

  static randomPlusMinus() {
    return 2 * Math.random() - 1
  }

  // [0, m) の範囲の値を返す余り演算。
  static mod(n, m) {
    return ((n % m) + m) % m
  }

  // 線形補間。
  static linterp(a, b, r) {
    return a * r + b * (1 - r)
  }

  // 対数的に線形補間。
  static loginterp(a, b, r) {
    return Math.exp(Math.log(a) * r + Math.log(b) * (1 - r))
  }

  // 極座標。
  static toPolar(v) {
    return {
      x: V2(length),
      y: Math.atan2(v.y, v.x)
    }
  }

  // ベクトルと角度。
  static angle2D(origin, a, b) {
    var ax = a.x - origin.x,
      ay = a.y - origin.y,
      bx = b.x - origin.x,
      by = b.y - origin.y,
      c1 = Math.sqrt(ax * ax + ay * ay),
      c2 = Math.sqrt(bx * bx + by * by),
      c = (ax * bx + ay * by) / (c1 * c2)

    return isNaN(c) ? 0 : Math.acos(Math.min(c, 1))
  }

  static angle2D360(origin, a, b) {
    var ax = a.x - origin.x
    var ay = a.y - origin.y
    var bx = b.x - origin.x
    var by = b.y - origin.y
    var c1 = Math.sqrt(ax * ax + ay * ay)
    var c2 = Math.sqrt(bx * bx + by * by)
    var denom = c1 * c2

    if (denom === 0) {
      return 0
    }

    var c = (ax * bx + ay * by) / (c1 * c2)
    var rad = Math.acos(Math.min(c, 1))
    var sign = Math.sign(ax * by - ay * bx)

    if (sign < 0) {
      return Math.PI + Math.PI - rad
    }
    return rad
  }

  // 当たり判定 (HitTest) 。
  static isPointInPath(point, poly) {
    var i = 0,
      j = poly.length - 1,
      c = false

    for (; i < poly.length; ++i) {
      if (((poly[i].y > point.y) != (poly[j].y > point.y))
        && (point.x < (poly[j].x - poly[i].x) * (point.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
        c = !c
      }
      j = i
    }
    return c
  }

  // ランダムなカラーコードを生成。
  // 少し明るめの色。
  static randomColorCode() {
    return "#" + ("00000" + Math.floor(0x888880 * (1 + Math.random())).toString(16)).slice(-6)
  }

  static hsv2rgb(h, s, v, a) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: a
    };
  }

  // "#123456" といった形式のカラーコードを表す文字列を生成。
  static toColorCode(r, g, b) {
    r = U.clamp(r, 0, 255)
    g = U.clamp(g, 0, 255)
    b = U.clamp(b, 0, 255)

    r = ("0" + Math.floor(r).toString(16)).slice(-2)
    g = ("0" + Math.floor(g).toString(16)).slice(-2)
    b = ("0" + Math.floor(b).toString(16)).slice(-2)
    return "#" + r + g + b
  }
}
