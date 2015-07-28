
// FIXME: during experimentation only...?
declare var Matter: any;

// virtual keys that we need for this game
const enum VK {
    W = 87, // 'w'
    A = 65, // 'a'
    S = 83, // 's'
    D = 68, // 'd'
    P = 80, // 'p'
    Q = 81, // 'd'
    E = 69, // 'p'
    LEFT = 37, // left arrow
    RIGHT = 39, // right arrow
    UP = 38, // up arrow
    DOWN = 40, // down arrow
    SPACE = 32 // space bar
};
    
// entry function
function main() {

    const W = Math.max(800,window.innerWidth);
    const H = Math.max(600, window.innerHeight);

    const out = document.getElementById('out');

    // Matter.js module aliases
    const Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Vector = Matter.Vector,
        Events = Matter.Events,
        Body = Matter.Body;

    // create a Matter.js engine and render
    const engine = Engine.create({
        render: {
            element: document.body,
            controller: Matter.Render,
            options: { width: W, height: H }
        }
    });

    engine.world.gravity.y = 0; // was .2
    engine.world.gravity.x = 0;


    //    engine.world.bounds.min.x = 40;
    //    engine.world.bounds.min.y = 0;
    //
    //    engine.world.bounds.max.x = 200-40;
    //    engine.world.bounds.max.y = 200-40;


    engine.timing.timeScale *= 0.7;

    let renderOptions = engine.render.options;
    renderOptions.wireframes = true;
    // renderOptions.hasBounds = false;
    // renderOptions.showDebug = false;
    // renderOptions.showBroadphase = false;
    // renderOptions.showBounds = false;
    renderOptions.showVelocity = true;
    //renderOptions.showCollisions = false;
    //renderOptions.showAxes = true;
    renderOptions.showPositions = true;
    //renderOptions.showAngleIndicator = true;
    //renderOptions.showIds = true;
    //renderOptions.showShadows = false;

    //var vertices = [{x: 0, y: 150}, {x: 100, y:150}, {x: 50, y: 0}];
    //var vertices = [{x: 0, y: 0}, {x: 100, y:0}, {x: 50, y: -150}];

    let vertices = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: -20 }];

    let ship = Bodies.fromVertices(100, 500,
        Matter.Vertices.create(vertices), { restitution: 0.5 }); // , friction: 0.01

    const bodies = [
        ship,
        // world bounds:
        Bodies.rectangle(W / 2, H, W, 20, { isStatic: true }),
        Bodies.rectangle(0, H / 2, 20, H, { isStatic: true }),
        Bodies.rectangle(W, H / 2, 20, H, { isStatic: true }),
        Bodies.rectangle(W / 2, 0, W, 20, { isStatic: true })
    ];

    const ground: { x: number, y: number }[] = [];

    /*ground.push( {x:0, y: 0} );
    const MAX = 50;
    for (let i = 1; i < (W/MAX)-1; ++i) {
      ground.push( {x:i*MAX, y: -(Math.random()*100+50)} );
    }
    ground.push( {x:W, y: 0} );

    bodies.push( Bodies.fromVertices(W/2, H-20,
      Matter.Vertices.create(ground), { isStatic : true } )
      );*/

    //bodies.push(Bodies.trapezoid(W/2, H/2, 200, 100, 0.5));
    
    let i = 15;
    while( i-- > 0 ){
        const trap = Bodies.trapezoid( 20*(i+1), H / 2, Math.random()*30+10, Math.random()*30+10, Math.random() );
        Body.setAngularVelocity(trap, (Math.random()-0.5)*0.01);
        bodies.push(trap);
    }
    
    /*
    for (let i = 0; i < 30; ++i) {
        bodies.push(Bodies.rectangle(
            Math.random() * (W - 20) + 10,
            Math.random() * (H - 20) + 10,
            Math.random() * 50 + 10,
            Math.random() * 50 + 10
        ));
    } */

    // add all of the bodies to the world (default 800x600)
    World.add(engine.world, bodies);

    // run the engine
    Engine.run(engine);

    let keys = {};
    window.onkeydown = e  => keys[e.keyCode] = true;
    window.onkeyup = e => keys[e.keyCode] = false;

    const forceMagnitude = 0.0005 * ship.mass;
    var defaultAirFriction = ship.airFriction;

    Events.on(engine, 'beforeUpdate', function() {
        
        const bs = Matter.Composite.allBodies(engine.world);
        // x must be between 0 and H
        const modifier = (x : number) => [-1,0,1][Math.floor(x/(H/3))];
        
        for(let i = 0; i<bs.length;++i){
            const g = modifier(bs[i].position.y) * .2;
            bs[i].force.y += bs[i].mass * g * 0.001;            
        }

        if (keys[VK.W] || keys[VK.UP]) {
            var vector = Vector.rotate({ x: 0, y: -forceMagnitude }, ship.angle);
            Body.applyForce(ship, ship.position, vector);
        }

        function aux(isLeft: boolean) {
            const m = isLeft ? 1 : -1;
            //var forceMagnitude = 25 * body.mass;
            const forceMagnitude = 0.001 * ship.mass;
            const mx = 5; // was 50, 200
            const my = 20;

            Body.applyForce(ship, Matter.Vector.rotate({ x: m * (-mx), y: m * my }, ship.angle),
                Matter.Vector.rotate({ x: 0, y: forceMagnitude }, ship.angle)
                );

            Body.applyForce(ship, Matter.Vector.rotate({ x: m * mx, y: m * (-my) }, ship.angle),
                Matter.Vector.rotate({ x: 0, y: -forceMagnitude }, ship.angle)
                );
        };

        if (keys[VK.E]) {
            aux(false);
        }
        if (keys[VK.Q]) {
            aux(true);
        }

        if (keys[VK.S] || keys[VK.DOWN]) {
            const factor = 0.99;
            Body.setVelocity(ship, { x: ship.velocity.x * factor, y: ship.velocity.y * factor });
            Body.setAngularVelocity(ship, ship.angularVelocity * factor);
        }

        if (keys[VK.LEFT] || keys[VK.A]) {
            Matter.Body.rotate(ship, -Math.PI / 32);
            Body.setAngularVelocity(ship, 0);
        }
        if (keys[VK.RIGHT] || keys[VK.D]) {
            Matter.Body.rotate(ship, Math.PI / 32);
            Body.setAngularVelocity(ship, 0);
        }

        out.innerHTML = '[ '+ship.position.x.toFixed(1) + ', ' + ship.position.y.toFixed(1) + ' ]<br/>'+
            '[ ' + ship.velocity.x.toFixed(1) + ', ' + ship.velocity.y.toFixed(1) + ' ] ' + ship.angularVelocity;
    });

}
