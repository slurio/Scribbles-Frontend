let scribble_shapes = []

document.addEventListener('DOMContentLoaded', () => {
    
    const scribble_id = 1
    let animating = false;
    const SCRIBBLES_URL = "http://localhost:3000/scribbles/"

    const getScribble = (scribb_id) => {
        
        fetch(SCRIBBLES_URL+scribble_id)
        .then(response => response.json())
        .then(scribble => renderScribble(scribble))
    }

    const renderScribble = (scribble) => {
        renderBackgroundCanvas(scribble);
        renderCanvases(scribble);
    }

    const renderBackgroundCanvas = (scribble) => {
        let canvas_container = document.querySelector(".canvases");
        let bg_canvas = document.createElement("canvas");
        bg_canvas.id = "background-canvas"
        bg_canvas.style.zIndex = scribble.background_canvas.z_index;
        bg_canvas.className = "scribble-canvas p-2 m-2 border-2 border-gray-700 rounded-lg shadow-lg"
        canvas_container.append(bg_canvas);
    }

    const renderCanvases = (scribble) => {
        if (scribble.circle_canvases.length > 0) {
            renderCircleCanvases(scribble);
        }
    }
    
    const renderCircleCanvases = (scribble) => {
        scribble.circle_canvases.map(renderCircle)
    }

    const renderCircle = (cirCan) => {
        let canvas_container = document.querySelector(".canvases");
        let canvas = document.createElement("canvas")
        let context = canvas.getContext('2d')
        
        //sets canvas attributes
        canvas.dataset.id = cirCan.id
        canvas.width = canvas_container.offsetWidth
        canvas.height = canvas_container.offsetHeight
        canvas.className = "scribble-canvas p-2 m-2 border-2 border-gray-700 rounded-lg shadow-lg"

        // sets appropriate layering
        canvas.style.zIndex = cirCan.z_index

        // new Circle instance, push to global array
        let circle = new Circle(cirCan.posX, cirCan.posY, cirCan.dx, cirCan.dy, cirCan.radius, cirCan.color, cirCan.sound, context, cirCan.id)
        scribble_shapes.push(circle)
        circle.draw()

        //appends to DOM
        canvas_container.append(canvas)
    }

    const  clickHandler = () => {

        document.addEventListener('click', e => {

            if(e.target.matches('#unclicked-circle')) {
                e.target.classList.add('bg-blue-500')
                e.target.id = 'clicked-circle'
            } else if(e.target.matches('#clicked-circle')) {
                e.target.id = 'unclicked-circle'
                e.target.classList.remove('bg-blue-500')
            } else if(e.target.matches('#play-button')) {
                playAnimation()
                console.log('play button clicked')
            } else if(e.target.matches('#pause-button')) {
                pauseAnimation()
                console.log('pause button clicked')
            } 
        })
    }

    const pauseAnimation = () => {
        if (animating) {
            animating = false
        }
    }

    const playAnimation = () => {
        if (!animating) {
            animating = true;
            window.requestAnimationFrame(animateShapes)
        }
    }

    const animateShapes = () => {
        if(animating) {
            for(let shape of scribble_shapes) {
                let canvas = document.querySelector(`[data-id='${shape.id}']`)
                shape.clear(canvas)
                shape.draw()
                shape.checkBoundaries(canvas)
                shape.nextStep()
            }
            window.requestAnimationFrame(animateShapes)
        }
    }

    //When there is the situation of having the element at a different 
    //size than the bitmap itself, for example, the element is scaled 
    //using CSS or there is pixel-aspect ratio etc. you will have to address this.

    const scribbleHandler = () => {
        
        document.addEventListener('click', e => {
            const clickedCircle = document.querySelector('#clicked-circle')
            const unclickedCircle = document.querySelector('#unclicked-circle')

            if (e.target.matches("#clicked-circle")) {
                console.log("unclicked circle CLICKED")
            }

            //click listner for scribble canvas to get mouse x/y position
            // if(e.target.matches('#scribble-board') && circleElement) {
            // if(e.target.tagName.toLowerCase() === 'canvas') {  
                
            //     let canvas = e.target

            //     let rect = canvas.getBoundingClientRect()

            //     let scaleX = canvas.width / rect.width
            //     let scaleY = canvas.height / rect.height

            //     xPosition = (e.clientX - rect.left) * scaleX
            //     yPosition = (e.clientY - rect.top) * scaleY

            //     //creates circle with mouse x,y position on click                
            //     // createCircle(xPosition, yPosition)
            //     createCanvas(xPosition, yPosition)
            // }
        })
    }

        const createCanvas = (xPosition, yPosition) => {
            let canvasContainer = document.querySelector('.canvases')
            let canvasZIndex = parseInt(canvasContainer.lastElementChild.style.zIndex) + 1
            let canvas = document.createElement('canvas')
            canvas.width = canvasContainer.offsetWidth
            canvas.height = canvasContainer.offsetHeight
            let ctx = canvas.getContext('2d')
            canvas.style.zIndex = canvasZIndex


            ctx.beginPath()
            ctx.fillStyle = '#3182CE'
            ctx.arc(xPosition, yPosition, 15, 0, Math.PI * 2)
            ctx.fill()

            canvasContainer.append(canvas)

        }

    getScribble(scribble_id)
    clickHandler()
    scribbleHandler()

})