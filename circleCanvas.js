class Circle {
    constructor(posX, posY, dX, dY, radius, color, octave, note, context, id) {
        this.posX = posX,
        this.posY = posY,
        this.dX = dX,
        this.dY = dY,
        this.radius = radius,
        this.color = color,
        this.octave = octave,
        this.note = note,
        this.context = context,
        this.id = id
    }

    draw() {
        this.context.shadowBlur = 5;
        this.context.shadowColor = "black";
        this.context.beginPath()
        this.context.fillStyle = this.color
        this.context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2)
        this.context.fill()
    }

    nextStep() {
        this.posX += this.dX;
        this.posY += this.dY;
    }

    clear(canvas) {
        this.context.clearRect(0,0, canvas.width, canvas.height)
    }

    checkBoundaries(canvas) {
        if(this.posY + this.dY > canvas.height || this.posY + this.dY < 0) {
            this.dY = -this.dY;
            tones.play(this.note, this.octave);
        } else if (this.posX + this.dX > canvas.width || this.posX + this.dX < 0) {
            this.dX = -this.dX; 
            tones.play(this.note, this.octave);
        }
    }
}