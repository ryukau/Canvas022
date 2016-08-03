class QuickHull {
    constructor(node) {
        this.hull = []
        this.quickhull(node.slice(0))
        this.sortByAngle(this.hull)
    }

    get Hull() {
        return this.hull
    }

    static getHull(node) {
        this.hull = []
        this.quickhull(node.slice(0))
        this.sortByAngle(this.hull)
        return this.hull
    }

    // http://www.cse.yorku.ca/~aaw/Hang/quick_hull/Algorithm.html
    static quickhull(S) {
        var S1 = [],
            S2 = [],
            A, B

        S.sort(function (a, b) { return a.x - b.x })
        A = S.shift()
        B = S.pop()
        this.hull.push(A, B)

        for (let i = 0; i < S.length; ++i) {
            if (this.isRightTurn(A, B, S[i])) {
                S1.push(S[i])
            }
            else {
                S2.push(S[i])
            }
        }

        this.findhull(S1, A, B)
        this.findhull(S2, B, A)
    }

    static findhull(Sk, P, Q) {
        if (Sk.length < 1) {
            return
        }

        var index = 0,
            d = 0,
            d_temp

        for (let i = 0; i < Sk.length; ++i) {
            d_temp = this.distance(P, Q, Sk[i])
            if (d < d_temp) {
                d = d_temp
                index = i
            }
        }

        var C = Sk.splice(index, 1)[0],
            S1 = [],
            S2 = []

        this.hull.push(C)

        for (let i = 0; i < Sk.length; ++i) {
            if (this.isRightTurn(P, C, Sk[i])) {
                S1.push(Sk[i])
            }
            if (this.isRightTurn(C, Q, Sk[i])) {
                S2.push(Sk[i])
            }
        }

        this.findhull(S1, P, C)
        this.findhull(S2, C, Q)
    }

    // 点a,bを通る直線と点cとの距離。
    static distance(a, b, c) {
        var abx = b.x - a.x,
            aby = b.y - a.y,
            acx = c.x - a.x,
            acy = c.y - a.y,
            cross = (abx * acy - aby * acx),
            norm = abx * abx + aby * aby

        return Math.abs(cross / norm)
    }

    // 線分 a -> b に対して点 c が右側にあるか調べる。
    static isRightTurn(a, b, c) {
        var ax = a.x - b.x,
            ay = a.y - b.y,
            bx = b.x - c.x,
            by = b.y - c.y,
            cross = (ax * by - ay * bx)

        return Math.sign(cross) <= 0 ? true : false
    }

    static sortByAngle(node) {
        var p0index = 0,
            i, p0, origin

        for (i = 1; i < node.length; ++i) {
            if (node[p0index].y > node[i].y
                || (node[p0index].y === node[i].y && node[p0index].x > node[i].x)) {
                p0index = i
            }
        }
        p0 = node.splice(p0index, 1)[0]
        origin = { x: p0.x + 1, y: p0.y }
        node.sort(function (a, b) {
            var angle_a = U.angle2D(p0, origin, a),
                angle_b = U.angle2D(p0, origin, b)

            return angle_a - angle_b
        })
        node.unshift(p0)

        return node
    }
}
