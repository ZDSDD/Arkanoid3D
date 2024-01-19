import {checkCollision, gameBoundaries} from "./gameObjects";
import {randFloat} from "three/src/math/MathUtils";

export function CheckCollisionWithBricks(ball, bricks) {
    for (let i = 0; i < bricks.length; i++) {
        if (checkCollision(ball, bricks[i])) {
            return i;
        }
    }
    return -1;
}

export function CheckCollisionWithPaddle(paddle, ball){
    if (checkCollision(paddle, ball.mesh)) {
        ball.velocity.y = -ball.velocity.y;
        ball.mesh.position.y = paddle.position.y + 2;
        ball.velocity.x = ball.velocity.x + randFloat(-1,1);
        ball.velocity.z = ball.velocity.z + randFloat(-1,1);
        return 1;
    }
    return 0;
}


export function CheckCollisionWithBoundaries(object, radius) {
    if (object.position.x + radius > gameBoundaries.rightWall) {
        object.position.x = gameBoundaries.rightWall - radius - 0.1;
        return "right";
    }
    if (object.position.x - radius < gameBoundaries.leftWall) {
        object.position.x = gameBoundaries.leftWall + radius + 0.1;
        return "left";
    }
    if (object.position.z + radius > gameBoundaries.frontWall) {
        object.position.z = gameBoundaries.frontWall - radius - 0.1
        return "front";
    }
    if (object.position.z - radius < gameBoundaries.backWall) {
        object.position.z = gameBoundaries.backWall + radius+ 0.1
        return "back";
    }
    if (object.position.y + radius > gameBoundaries.ceiling) {
        //assert the object isn't stuck
        object.position.y = gameBoundaries.ceiling - radius - 0.1;
        return "up";
    }
    if (object.position.y - radius < gameBoundaries.floor) {
        object.position.y = gameBoundaries.floor + radius + 0.1;
        return "down"
    }
    return "";
}