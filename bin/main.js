var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Vector = Matter.Vector;
var Vertices = Matter.Vertices;
var Events = Matter.Events;
var Composite = Matter.Composite;
var Constraint = Matter.Constraint;
var Body = Matter.Body;
var VK;
(function (VK) {
    VK[VK["W"] = 87] = "W";
    VK[VK["A"] = 65] = "A";
    VK[VK["S"] = 83] = "S";
    VK[VK["D"] = 68] = "D";
    VK[VK["P"] = 80] = "P";
    VK[VK["Q"] = 81] = "Q";
    VK[VK["E"] = 69] = "E";
    VK[VK["LEFT"] = 37] = "LEFT";
    VK[VK["RIGHT"] = 39] = "RIGHT";
    VK[VK["UP"] = 38] = "UP";
    VK[VK["DOWN"] = 40] = "DOWN";
    VK[VK["SPACE"] = 32] = "SPACE";
})(VK || (VK = {}));
;
var OUT = 'out';
var DIR = 32;
var Ship = (function () {
    function Ship(x, y) {
        this.body = Bodies.fromVertices(x, y, Vertices.create(Ship.vertices), {
            restitution: 0.5,
            render: {
                strokeStyle: 'rgba(29, 127, 225, 0.5)',
                fillStyle: 'rgba(29, 127, 225, 0.8)'
            }
        });
    }
    Ship.prototype.move = function (x, y) {
        this.brake();
        Body.setPosition(this.body, { x: x, y: y });
    };
    Ship.prototype.brake = function () {
        Body.setVelocity(this.body, {
            x: this.body.velocity.x * Ship.factor,
            y: this.body.velocity.y * Ship.factor
        });
        Body.setAngularVelocity(this.body, this.body.angularVelocity * Ship.factor);
    };
    Ship.prototype.thrust = function () {
        var forceMagnitude = 0.0005 * this.body.mass;
        Body.applyForce(this.body, this.body.position, Vector.rotate({ x: 0, y: -forceMagnitude }, this.body.angle));
    };
    Ship.prototype.turnLeft = function () {
        Body.rotate(this.body, -Math.PI / DIR);
        Body.setAngularVelocity(this.body, 0);
    };
    Ship.prototype.turnRight = function () {
        Body.rotate(this.body, Math.PI / DIR);
        Body.setAngularVelocity(this.body, 0);
    };
    Ship.prototype.rotate = function (isLeft) {
        var m = isLeft ? 1 : -1;
        var forceMagnitude = 0.001 * this.body.mass;
        var mx = 5;
        var my = 20;
        Body.applyForce(this.body, Vector.rotate({ x: m * (-mx), y: m * my }, this.body.angle), Vector.rotate({ x: 0, y: forceMagnitude }, this.body.angle));
        Body.applyForce(this.body, Vector.rotate({ x: m * mx, y: m * (-my) }, this.body.angle), Vector.rotate({ x: 0, y: -forceMagnitude }, this.body.angle));
    };
    Ship.vertices = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: -20 }];
    Ship.factor = 0.99;
    return Ship;
}());
;
var Bounds;
(function (Bounds) {
    var Position;
    (function (Position) {
        Position[Position["UP"] = 0] = "UP";
        Position[Position["DOWN"] = 1] = "DOWN";
        Position[Position["LEFT"] = 2] = "LEFT";
        Position[Position["RIGHT"] = 3] = "RIGHT";
    })(Position = Bounds.Position || (Bounds.Position = {}));
    ;
    var PADDING = 10;
    var WIDTH = PADDING * 2;
    function make(w, h, p) {
        switch (p) {
            case Position.UP:
                return Bodies.rectangle(w / 2, 0, w, WIDTH, { isStatic: true });
            case Position.DOWN:
                return Bodies.rectangle(w / 2, h, w, WIDTH, { isStatic: true });
            case Position.LEFT:
                return Bodies.rectangle(0, h / 2, WIDTH, h, { isStatic: true });
            case Position.RIGHT:
                return Bodies.rectangle(w, h / 2, WIDTH, h, { isStatic: true });
        }
    }
    Bounds.make = make;
    ;
    function addGroundRects(W, H, bodies, splits, cellWidth, isDown) {
        for (var i = 0; i < splits; ++i) {
            var x = i * cellWidth;
            var h = PADDING + Math.random() * 40;
            var y = isDown ? H - PADDING - (h / 2) : PADDING + (h / 2);
            var trap = Bodies.rectangle(x + PADDING + (cellWidth / 2), y, cellWidth, h, {
                isStatic: true,
                render: { visible: false }
            });
            bodies.push(trap);
        }
    }
    Bounds.addGroundRects = addGroundRects;
    ;
    function addGroundRandomFixedSplits(W, H, bodies, splits, cellWidth, isDown) {
        var last = Math.random() * 100;
        for (var i = 0; i < splits; ++i) {
            var x = (i * cellWidth) + PADDING + (cellWidth / 2);
            var y = isDown ? H - PADDING - (cellWidth / 2) : PADDING + (cellWidth / 2);
            var dy1 = last;
            var dy2 = Math.random() * 100;
            last = dy2;
            var vs = [
                { x: -(cellWidth / 2), y: +(cellWidth / 2) },
                { x: -(cellWidth / 2), y: -(cellWidth / 2) - dy1 },
                { x: +(cellWidth / 2), y: -(cellWidth / 2) - dy2 },
                { x: +(cellWidth / 2), y: +(cellWidth / 2) }
            ];
            if (!isDown) {
                vs.forEach(function (v, i, a) { return a[i].y *= -1; });
            }
            var c = Vertices.centre(vs);
            var trap = Bodies.fromVertices(x + c.x, y + c.y, Vertices.create(vs), { isStatic: true });
            bodies.push(trap);
        }
    }
    Bounds.addGroundRandomFixedSplits = addGroundRandomFixedSplits;
    ;
    function addGroundRandomSplits(W, H, bodies, isDown) {
        var accum = PADDING;
        var last = Math.random() * 100;
        var cellHeight = 10;
        while (accum < (W - PADDING)) {
            var cellWidth = Math.random() * 100 + 10;
            if ((accum + cellWidth) > (W - PADDING)) {
                cellWidth = W - PADDING - accum;
            }
            var x = accum + (cellWidth / 2);
            var y = isDown ? H - PADDING - (cellHeight / 2) : PADDING + (cellHeight / 2);
            var dy1 = last;
            var dy2 = Math.random() * 100;
            last = dy2;
            accum += cellWidth;
            var vs = [
                { x: -(cellWidth / 2), y: +(cellHeight / 2) },
                { x: -(cellWidth / 2), y: -(cellHeight / 2) - dy1 },
                { x: +(cellWidth / 2), y: -(cellHeight / 2) - dy2 },
                { x: +(cellWidth / 2), y: +(cellHeight / 2) }
            ];
            if (!isDown) {
                vs.forEach(function (v, i, a) { return a[i].y *= -1; });
            }
            var c = Vertices.centre(vs);
            var trap = Bodies.fromVertices(x + c.x, y + c.y, Vertices.create(vs), { isStatic: true });
            bodies.push(trap);
        }
    }
    Bounds.addGroundRandomSplits = addGroundRandomSplits;
    ;
    function addAsteroids(W, H, bodies) {
        var CELL_W = W / 10;
        var CELL_H = (H / 3) / 3;
        for (var j = 0; j < ((H / 3) / CELL_H); ++j) {
            for (var i = 0; i < (W / CELL_W); ++i) {
                var x = i * CELL_W + (CELL_W / 2);
                var y = j * CELL_H + (H / 3) + (CELL_H / 2);
                var trap = Bodies.rectangle(x + (5 - Math.random() * 10), y + (2 - Math.random() * 4), (CELL_W / 3) + (5 - Math.random() * 10), (CELL_H / 3) + (5 - Math.random() * 10), { friction: 0.1, frictionAir: 0.001 });
                Body.setAngularVelocity(trap, (Math.random() - 0.5) * 0.05);
                var forceMagnitude = 0.0005 * trap.mass;
                Body.applyForce(trap, trap.position, Vector.rotate({ x: 0, y: -forceMagnitude }, Math.random() * Math.PI * 2));
                bodies.push(trap);
            }
        }
    }
    Bounds.addAsteroids = addAsteroids;
    ;
    function addAsteroids2(W, H, bodies) {
        var randomH = function () { return (H / 3) + Math.random() * (H / 3); };
        var randomW = function () { return Math.random() * 50 + 30; };
        var minH = (H / 3) + 50;
        var maxH = (2 * H / 3) - 50;
        var x = PADDING + 50;
        while (x < (W - 50)) {
            var w = randomW();
            var y = randomH();
            y = Math.max(minH, y);
            y = Math.min(maxH, y);
            bodies.push(addAsteroid(x, y));
            x += w;
        }
    }
    Bounds.addAsteroids2 = addAsteroids2;
    ;
    function addAsteroid(x, y) {
        var PARTS = Math.floor(4 + Math.random() * 4);
        var compound = [];
        var size = function () { return 15 + Math.random() * 20; };
        var last = { x: size(), y: 0 };
        var first = { x: last.x, y: last.y };
        for (var i = 0; i < PARTS; ++i) {
            var angle = (Math.PI * 2) / PARTS;
            var CENTER = { x: 0, y: 0 };
            var WIDTH_1 = { x: last.x, y: last.y };
            var THIRD = void 0;
            if (i === (PARTS - 1)) {
                THIRD = first;
            }
            else {
                THIRD = { x: size(), y: 0 };
                last.x = THIRD.x;
                last.y = THIRD.y;
            }
            Vertices.rotate([THIRD], angle, CENTER);
            Vertices.rotate([WIDTH_1, THIRD], angle * i, CENTER);
            var vs = [CENTER, WIDTH_1, THIRD];
            var c = Vertices.centre(vs);
            var trap = void 0;
            if (compound.length > 0) {
                trap = Bodies.fromVertices(x + c.x, y + c.y, Vertices.create(vs), { render: compound[0].render });
            }
            else {
                trap = Bodies.fromVertices(x + c.x, y + c.y, Vertices.create(vs), { render: {
                        strokeStyle: 'rgb(153, 102, 51)',
                        fillStyle: 'rgb(153, 102, 51)',
                    } });
            }
            compound.push(trap);
        }
        var ast = Body.create({ parts: compound, friction: 0.1, frictionAir: 0.001 });
        Body.setAngularVelocity(ast, (Math.random() - 0.5) * 0.05);
        var forceMagnitude = 0.0005 * ast.mass;
        Body.applyForce(ast, ast.position, Vector.rotate({ x: 0, y: -forceMagnitude }, Math.random() * Math.PI * 2));
        return ast;
    }
    ;
})(Bounds || (Bounds = {}));
;
function main() {
    var W = Math.max(800, window.innerWidth);
    var H = Math.max(600, window.innerHeight);
    var hud = document.getElementById(OUT);
    var engine = Engine.create({
        timing: {
            timeScale: 0.7
        },
        render: {
            element: document.body,
            controller: Matter.Render,
            options: {
                width: W,
                height: H,
                wireframes: true,
            }
        },
        world: {
            gravity: { x: 0, y: 0 }
        }
    });
    var ship = new Ship(100, 600);
    var bodies = [
        ship.body,
        Bounds.make(W, H, Bounds.Position.UP),
        Bounds.make(W, H, Bounds.Position.DOWN),
        Bounds.make(W, H, Bounds.Position.LEFT),
        Bounds.make(W, H, Bounds.Position.RIGHT)
    ];
    Bounds.addGroundRandomSplits(W, H, bodies, true);
    Bounds.addGroundRandomSplits(W, H, bodies, false);
    Bounds.addAsteroids2(W, H, bodies);
    World.add(engine.world, bodies);
    Engine.run(engine);
    var keys = {};
    window.onkeydown = function (e) { return keys[e.keyCode] = true; };
    window.onkeyup = function (e) { return keys[e.keyCode] = false; };
    window.onclick = function (e) { return ship.move(e.clientX, e.clientY); };
    var modifier3 = function (x) { return [-1, 0, 1][Math.floor(x / (H / 3))]; };
    var collisionCounter = 0;
    Events.on(engine, 'beforeUpdate', function () {
        for (var _i = 0, _a = Composite.allBodies(engine.world); _i < _a.length; _i++) {
            var b_1 = _a[_i];
            var g = modifier3(b_1.position.y) * .2;
            b_1.force.y += b_1.mass * g * 0.001;
        }
        var thrusters = false;
        if (keys[87] || keys[38]) {
            ship.thrust();
            thrusters = true;
        }
        if (keys[69]) {
            ship.rotate(false);
        }
        if (keys[81]) {
            ship.rotate(true);
        }
        if (keys[83] || keys[40]) {
            ship.brake();
        }
        if (keys[37] || keys[65]) {
            ship.turnLeft();
        }
        if (keys[39] || keys[68]) {
            ship.turnRight();
        }
        var b = ship.body;
        hud.innerHTML = '[ ' + b.position.x.toFixed(1) + ', ' + b.position.y.toFixed(1) + ' ]<br/>' +
            '[ ' + b.velocity.x.toFixed(1) + ', ' + b.velocity.y.toFixed(1) + ' ] ' + b.angularVelocity.toFixed(5) + '<br/>' +
            'engines=' + (thrusters ? 'on' : 'off') + ' collisions=' + collisionCounter;
    });
    Events.on(engine, 'collisionStart', function (event) {
        for (var _i = 0, _a = event.pairs; _i < _a.length; _i++) {
            var _b = _a[_i], ba = _b.bodyA, bb = _b.bodyB;
            if (ba.id === ship.body.id || bb.id === ship.body.id) {
                collisionCounter += 1;
            }
        }
    });
}
;
//# sourceMappingURL=main.js.map