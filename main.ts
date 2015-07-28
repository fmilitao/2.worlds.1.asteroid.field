
// FIXME: during experimentation only...?
declare var Matter: any;

// Matter.js module aliases
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Vector = Matter.Vector;
const Vertices = Matter.Vertices;
const Events = Matter.Events;
const Composite = Matter.Composite;
const Body = Matter.Body;
        
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

const OUT = 'out';
const DIR = 32; // number of directions for ship

class Ship {

    public body: any;

    constructor(x: number, y: number) {
        this.body = Bodies.fromVertices(
            x, y, // initial position
            Vertices.create(Ship.vertices),
            {
                // friction: 0.01
                restitution: 0.5
            });
    }

    brake(){
        Body.setVelocity(this.body, {
            x: this.body.velocity.x * Ship.factor,
            y: this.body.velocity.y * Ship.factor
        });
        Body.setAngularVelocity(this.body, this.body.angularVelocity * Ship.factor);
    }

    thrust(){
        const forceMagnitude = 0.0005 * this.body.mass;
        Body.applyForce(this.body, this.body.position,
            Vector.rotate({ x: 0, y: -forceMagnitude }, this.body.angle)
            );
    }

    turnLeft(){
        Body.rotate(this.body, -Math.PI / DIR);
        Body.setAngularVelocity(this.body, 0);
    }

    turnRight(){
        Body.rotate(this.body, Math.PI / DIR);
        Body.setAngularVelocity(this.body, 0);
    }

    rotate(isLeft : boolean){
        const m = isLeft ? 1 : -1;
        //var forceMagnitude = 25 * body.mass;
        const forceMagnitude = 0.001 * this.body.mass;
        const mx = 5; // was 50, 200
        const my = 20;

        Body.applyForce(this.body, Vector.rotate({ x: m * (-mx), y: m * my }, this.body.angle),
            Vector.rotate({ x: 0, y: forceMagnitude }, this.body.angle)
        );

        Body.applyForce(this.body, Vector.rotate({ x: m * mx, y: m * (-my) }, this.body.angle),
            Vector.rotate({ x: 0, y: -forceMagnitude }, this.body.angle)
        );
    }

    // these vertices build the ship's shape.
    static vertices = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: -20 }];
    static factor = 0.99;
};

module Bounds {

    export enum Position {
        UP, DOWN, LEFT, RIGHT
    };

    const PADDING = 10;
    const WIDTH = PADDING * 2; // 'position' is center

    export function make(w: number, h : number, p : Position){
        switch(p){
            case Position.UP:
                return Bodies.rectangle(w / 2, 0, w, WIDTH, { isStatic: true })
            case Position.DOWN:
                return Bodies.rectangle(w / 2, h, w, WIDTH, { isStatic: true });
            case Position.LEFT:
                return Bodies.rectangle(0, h / 2, WIDTH, h, { isStatic: true });
            case Position.RIGHT:
                return Bodies.rectangle(w, h / 2, WIDTH, h, { isStatic: true });
        }
    };

    //
    // Grounds
    //
      
    export function addGroundRects(
        W : number,
        H : number,
        bodies : any[],
        splits : number,
        cellWidth: number,
        isDown : boolean
        ){
        for( let i=0; i<splits; ++i ){
            const x = i*cellWidth;
            const h = PADDING+Math.random()*40;
            const y = isDown ? H-PADDING-(h/2) : PADDING+(h/2);
            const trap = Bodies.rectangle(
                x+PADDING+(cellWidth/2), y,
                cellWidth, h,
                { isStatic : true }
                );
            bodies.push(trap);   
        }
    };
    
    export function addGroundRandomFixedSplits(
        W : number,
        H : number,
        bodies : any[],
        splits : number,
        cellWidth: number,
        isDown : boolean
        ){
        // last split used
        let last = Math.random()*100;
        for(let i=0;i<splits;++i){
            const x = (i*cellWidth) + PADDING +(cellWidth/2);
            const y = isDown ? H-PADDING-(cellWidth/2) : PADDING+(cellWidth/2);
            const dy1 = last;
            const dy2 = Math.random()*100;
            last = dy2;
    
            const vs = [
                { x:-(cellWidth/2), y:+(cellWidth/2) }, // bottom left
                { x:-(cellWidth/2), y:-(cellWidth/2)-dy1 }, // top left
                { x:+(cellWidth/2), y:-(cellWidth/2)-dy2 }, // top right
                { x:+(cellWidth/2), y:+(cellWidth/2) } // bottom right
            ];
            
            if( !isDown ){
                vs.forEach( (v,i,a) => a[i].y *= -1 );
            }
            
            const c = Vertices.centre(vs);
            const trap = Bodies.fromVertices(
                x+c.x, // adds the x_offset
                y+c.y, // adds the y_offset
                Vertices.create(vs),
                { isStatic : true }
                );
                
            bodies.push(trap);   
        }
    };
    
    export function addGroundRandomSplits(
        W : number,
        H : number,
        bodies : any[],
        isDown : boolean
        ){
            
        // last split used
        let accum = PADDING;
        let last = Math.random()*100;
        const cellHeight = 10;
        
        while( accum < (W-PADDING) ) {
            let cellWidth = Math.random()*100+10;
            if( (accum+cellWidth) > (W-PADDING)){
                cellWidth = W-PADDING-accum;
            }
            
            const x = accum +(cellWidth/2);
            const y = isDown ? H-PADDING-(cellHeight/2) : PADDING+(cellHeight/2);
            const dy1 = last;
            const dy2 = Math.random()*100;
            
            last = dy2;
            accum += cellWidth;
    
            const vs = [
                { x:-(cellWidth/2), y:+(cellHeight/2) }, // bottom left
                { x:-(cellWidth/2), y:-(cellHeight/2)-dy1 }, // top left
                { x:+(cellWidth/2), y:-(cellHeight/2)-dy2 }, // top right
                { x:+(cellWidth/2), y:+(cellHeight/2) } // bottom right
            ];
            
            if( !isDown ){
                vs.forEach( (v,i,a) => a[i].y *= -1 );
            }
            
            const c = Vertices.centre(vs);
            const trap = Bodies.fromVertices(
                x+c.x, // adds the x_offset
                y+c.y, // adds the y_offset
                Vertices.create(vs),
                { isStatic : true }
                );
                
            bodies.push(trap);   
        }
    };
    
};

// entry function
function main() {

    // requires at least 800*600 window
    const W = Math.max(800,window.innerWidth);
    const H = Math.max(600, window.innerHeight);
    const hud = document.getElementById(OUT);

    // create a Matter.js engine and render
    const engine = Engine.create({
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
                showVelocity: true,
                showPosition: true
            }
        },
        world: {
            gravity: { x : 0, y : 0 }
        }
    });

    //
    // Bodies
    //

    const ship = new Ship(100,600);

    const bodies = [
        ship.body,
        // world bounds:
        Bounds.make(W, H, Bounds.Position.UP),
        Bounds.make(W, H, Bounds.Position.DOWN),
        Bounds.make(W, H, Bounds.Position.LEFT),
        Bounds.make(W, H, Bounds.Position.RIGHT)
    ];
    
    //
    // Grounds
    //
    
    // const SPLITS = 26;
    // const WG = (W-20)/SPLITS;
    
    // Bounds.addGroundRects(W,H,bodies,SPLITS, WG, true);
    // Bounds.addGroundRects(W,H,bodies,SPLITS, WG, false);
    
    // random fixed split
    //Bounds.addGroundRandomFixedSplits(W,H,bodies,SPLITS, WG, true);
    //Bounds.addGroundRandomFixedSplits(W,H,bodies,SPLITS, WG, false);
    
    // random grounds
    Bounds.addGroundRandomSplits(W,H,bodies,true);
    Bounds.addGroundRandomSplits(W,H,bodies,false);
    
    //
    // Asteroid Field
    //

    // we want 3 lines of asteroids, middle line shifted
    const CELL_W = W / 10;
    const CELL_H = (H / 3) / 3; // 3 gravity zone, 3 lines of asteroids

    for (let j = 0; j < ((H/3) / CELL_H); ++j) {
        for (let i = 0; i < (W / CELL_W); ++i) {
            const x = i*CELL_W + (CELL_W / 2);
            const y = j*CELL_H + (H / 3) + (CELL_H / 2);
            const trap = Bodies.rectangle(
                x+(5-Math.random()*10),
                y+(2-Math.random()*4),
                (CELL_W / 3)+(5-Math.random()*10),
                (CELL_H / 3)+(5-Math.random()*10),
                { friction : 0.1, frictionAir: 0.001 }
                )
            Body.setAngularVelocity(trap, (Math.random() - 0.5) * 0.05);
            const forceMagnitude = 0.0005 * trap.mass;
            Body.applyForce(trap, trap.position,
                Vector.rotate({ x: 0, y: -forceMagnitude }, Math.random()*Math.PI*2)
            );
            bodies.push(trap);
        }
    }
        
    // add all bodies
    World.add(engine.world, bodies);
    Engine.run(engine);

    //
    // Control stuff
    //

    const keys = {};
    window.onkeydown = e  => keys[e.keyCode] = true;
    window.onkeyup = e => keys[e.keyCode] = false;

    // assumes 'x' between [0..H] and converts to [0..2]
    const modifier3 = (x: number) => [-1, 0, 1][Math.floor(x / (H / 3))];

    Events.on(engine, 'beforeUpdate', function() {

        //
        // Gravities
        //
        
        for( let b of Composite.allBodies(engine.world) ){
            const g = modifier3(b.position.y) * .2;
            b.force.y += b.mass * g * 0.001;            
        }

        //
        // Ship controls
        //

        if (keys[VK.W] || keys[VK.UP]) {
            ship.thrust();
        }

        // these controls are way too hard...
        if (keys[VK.E]) {
            // aux(false);
            ship.rotate(false);
        }
        if (keys[VK.Q]) {
            // aux(true);
            ship.rotate(true);
        }

        // break / slow down
        if (keys[VK.S] || keys[VK.DOWN]) {
            ship.brake();

            // removes ship!
            //Matter.Composite.removeBody(engine.world,ship.body);
        }

        // standard rotate right/left
        if (keys[VK.LEFT] || keys[VK.A]) {
            ship.turnLeft();
        }
        if (keys[VK.RIGHT] || keys[VK.D]) {
            ship.turnRight();
        }

        //
        // HUD
        //

        const b = ship.body;
        hud.innerHTML = '[ '+b.position.x.toFixed(1) + ', ' + b.position.y.toFixed(1) + ' ]<br/>'+
            '[ ' + b.velocity.x.toFixed(1) + ', ' + b.velocity.y.toFixed(1) + ' ] ' + b.angularVelocity;
    });

};
