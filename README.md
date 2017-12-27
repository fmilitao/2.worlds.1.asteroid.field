# 2 Worlds 1 Asteroid Field

Uses [matter.js](http://brm.io/matter-js/) for physics and rendering.

Two grounds and an asteroid field in the middle.
Minimum resolution is 800*600, give it more space and it will expand the game world to fill the available window.

Controls:
* `w`, `up arrow` for engines on.
* `a`, `left arrow` to turn left; `d`, `right arrow` for right.
* `q` and `e` for rotating left or right, respectively.
* `s`, `down arrow` for "brakes".
* `left click` to move (teleport) the ship to the clicked position. Useful if, for any reason, the ship becomes stuck in another object.

[Online demo](https://fmilitao.github.io/2.worlds.1.asteroid.field/test.html).

No real objective, just experimenting the physics engine...

## Building

This is a typescript project, so you need to `tsc` to produce the final javascript files. Use `tsc --watch` if you want to experiment and not have to manually type `tsc` on each iteration. All libraries were copied into the project, so no need to fetch dependencies.
