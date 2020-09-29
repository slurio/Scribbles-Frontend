let scribble_shapes = []

document.addEventListener('DOMContentLoaded', () => {
    
    const scribble_id = 1
    let animating = false;
    //for passing information to create a new shape
    let shapeInfo
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
        bg_canvas.style.background = scribble.background_canvas.background_style
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
                renderForm(e.target)
            } else if(e.target.matches('#clicked-circle')) {
                e.target.id = 'unclicked-circle'
                e.target.classList.remove('bg-blue-500')
            } else if(e.target.matches('#play-button') || e.target.matches('.play-graphic')) {
                playAnimation()
                console.log('play button clicked')
            } else if(e.target.matches('#pause-button') || e.target.matches('.pause-graphic')) {
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
    //for adding a shape to scribble
    const scribbleHandler = () => {
        
        document.addEventListener('click', e => {

            //check to see if circle was clicked
            const circleElement = document.querySelector('#clicked-circle')
       
            //to get the last canvas in div canvases
            const lastCanvas = document.querySelector('.canvases').lastElementChild
          

            //click listner for scribble canvas to get mouse x/y position
            if(e.target === lastCanvas && circleElement) {

                let rect = lastCanvas.getBoundingClientRect()

                let scaleX = lastCanvas.width / rect.width
                let scaleY = lastCanvas.height / rect.height

                xPosition = (e.clientX - rect.left) * scaleX
                yPosition = (e.clientY - rect.top) * scaleY

                //render a circle with x and y position plus shapeinfo variable
                //clear shapeinfo once done
                //save to db or wait?
                // createCanvas(xPosition, yPosition)
                renderNewCircle(xPosition, yPosition)
               
            }
        })
    }

    const renderNewCircle = (xPosition, yPosition) => {
        let canvas_container = document.querySelector(".canvases");
        let canvas = document.createElement("canvas")
        let context = canvas.getContext('2d')

        // sets appropriate layering
        let canvasZIndex = parseInt(canvas_container.lastElementChild.style.zIndex) + 1
        canvas.style.zIndex = canvasZIndex
        
        //sets canvas attributes
        // need to do below once saved? 
        //canvas.dataset.id = cirCan.id

        canvas.width = canvas_container.offsetWidth
        canvas.height = canvas_container.offsetHeight
        canvas.className = "scribble-canvas p-2 m-2 border-2 border-gray-700 rounded-lg shadow-lg"

        // new Circle instance, push to global array
        //no sound or id need to add 
        let color = shapeInfo['color']
        let radius = shapeInfo['radius']
        let dx = shapeInfo['dx']
        let dy = shapeInfo['dy']
        let posX = xPosition
        let posY = yPosition
        let sound = shapeInfo['sound']
        let id = NaN

        let circle = new Circle(posX, posY, dx, dy, radius, color, sound, context, id)
        scribble_shapes.push(circle)

        console.log(scribble_shapes)
        circle.draw()

        //appends to DOM
        canvas_container.append(canvas)
    }

    const renderForm = target => {
          
        //render a pop up menu with options for velocity/color/sound/etc after cicle is clicked in element menu

            const body = document.querySelector('body')
            elementForm = document.createElement('form')
            elementForm.id = 'element-form'
            elementForm.className = 'bg-gray-400'
            elementForm.dataset.shape = 'circle'
            
            elementForm.innerHTML = `
                <label >COLOR</label><br>
                <input type="color" name="color" value="color">
                <br>
                <br>
                <label> Sound </label>
                <input type="radio" name="sound" value="filler">
                <label>test</label>
                <br>
                <br>
                <label>radius</label><br>
                <input type="number" name="radius" value="10">
                <br>
                <br>
                <label >Speed</label><br>
                <input type="number" name="dx" value="10">
                <label>dx</label>
                <input type="number" name="dy" value="6">
                <label>dy</label>
                <br>
                <br>
                <input type="submit" value="Click + press on scribble to place!" >
            `

            body.insertAdjacentElement('beforeend', elementForm)
               
    }

    const submitHandler = () => {

        document.addEventListener('submit', e => {
            e.preventDefault()
            if(e.target.matches('#element-form')) {
                getElementFormInfo(e.target)
                //e.target.reset()
                //need to remove form once submit is clicked
            }
            
        })
    }

    //gets form values for circle
    const getElementFormInfo = target => {
        //sound not created in form yet
        //or id
        const shape = target.dataset.shape
        const color = target.color.value
        const dx = target.dx.value
        const dy = target.dy.value
        const radius = target.radius.value
        const sound = target.sound.value
       
        shapeInfo = {
            shape: shape,
            color: color,
            dx: dx,
            dy: dy,
            radius: radius,
            sound: sound
        }
        console.log(shapeInfo)      
    }


    getScribble(scribble_id)
    clickHandler()
    scribbleHandler()
    submitHandler()

})