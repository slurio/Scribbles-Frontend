class Circle {
    constructor(posX, posY, dX, dY, radius, color, sound, context) {
        this.posX = posX,
        this.posY = posY,
        this.dX = dX,
        this.dY = dY,
        this.radius = radius,
        this.color = color,
        this.sound = sound,
        this.context = context
    }

    draw() {
        this.context.beginPath()
        this.context.fillStyle = this.color
        this.context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2)
        this.context.fill()
    }

    nextStep() {
        this.posX += this.dX;
        this.posY += this.dY;
    }
}