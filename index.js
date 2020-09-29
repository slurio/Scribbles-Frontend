let scribble_shapes = []

document.addEventListener('DOMContentLoaded', () => {
    

    let currentUserId;
    let animating = false;
    //for passing information to create a new shape
    let shapeInfo
    const SCRIBBLES_URL = "http://localhost:3000/scribbles/"
    const CIRCLES_URL = "http://localhost:3000/circle_canvases/"
    const BG_URL = "http://localhost:3000/background_canvases/"
    const USERS_URL = "http://localhost:3000/users/"

    const getScribble = (scribble_id) => {  
        fetch(SCRIBBLES_URL+scribble_id)
        .then(response => response.json())
        .then(scribble => {
            renderScribble(scribble)
        })
    }

    const renderScribble = (scribble) => {
        renderBackgroundCanvas(scribble);
        renderCanvases(scribble);
    }

    const renderBackgroundCanvas = (scribble) => {
        let canvas_container = document.querySelector(".canvases");
        canvas_container.dataset.scribble_id = scribble.id
        let bg_canvas = document.createElement("canvas");
        bg_canvas.id = "background-canvas"
        console.log("in renderBackgroundCanvas(), scribble.background = ", scribble.background_canvas)
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
            } else if(e.target.matches('#new-scribble')) {
                newScribble()
            } else if(e.target.matches('#log-out')) {
                clearCanvases()
                toggleLogInModal()
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

                let z_index = parseInt(lastCanvas.style.zIndex) + 1

                
                let canvas_container = document.querySelector(".canvases");

                let circleObj = {
                    posX: xPosition,
                    posY: yPosition,
                    dx: shapeInfo['dx'],
                    dy: shapeInfo['dy'],
                    color: shapeInfo['color'],
                    radius: shapeInfo['radius'],
                    sound: shapeInfo['sound'],
                    z_index: z_index,
                    scribble_id: canvas_container.dataset.scribble_id
                }

                let fetchOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accepts": "application/json"
                    },
                    body: JSON.stringify(circleObj)
                }

                fetch(CIRCLES_URL, fetchOptions)
                .then(response => response.json())
                .then(circleCanvas => renderCircle(circleCanvas))
               
            }
        })
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
                <input type="radio" name="sound" value="c">
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
    }

    const newScribble = () => {
        clearCanvases()
        postScribble()
    }

    const clearCanvases = () => {
        scribble_shapes = []
        let canvas_container = document.querySelector(".canvases");
        removeAllChildNodes(canvas_container)
    }

    const removeAllChildNodes = (parent) => {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    const postScribble = () => {
        let randId = Math.floor(Math.random() * Math.floor(1000))
        let scribbleObj = {
            title: "New Scribble" + randId,
            user_id: currentUserId
        }
        let fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(scribbleObj)
        }
        fetch(SCRIBBLES_URL, fetchOptions)
        .then(response => response.json())
        .then(scribble => {
            newDefaultBackground(scribble)
            console.log("after new scribble is created", scribble)
        })
    }

    const newDefaultBackground = (scribble) => {
        let bgObj = {
            background_style: "white",
            z_index: 1,
            scribble_id: scribble.id
        }

        let fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(bgObj)
        }

        fetch(BG_URL, fetchOptions)
        .then(response => response.json())
        .then(bgCanvas => getScribble(bgCanvas.scribble.id))
    }

    const addLogInListener = () => {
        let userForm = document.querySelector(".login-form")
        userForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let username = userForm.username.value
            e.target.reset()
            getUser(username)
            //get the username from form
            //fetch request with that username to create or find user
        })
    }
    
    const getUser = (username) => {
        userObj = {
            username: username
        }

        fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(userObj)
        }

        fetch(USERS_URL, fetchOptions)
        .then(response => response.json())
        .then(user => {
           
            currentUserId = user.id

            if(user.scribbles.length === 0){
                newScribble()
                toggleLogInModal();
            } else {
                getScribble(user.scribbles[0].id)
                toggleLogInModal();
            }
        })
    }

    const toggleLogInModal = () => {
        let modal = document.querySelector(".modal");
        if (!!currentUserId) {
            modal.classList.toggle("show-modal");
            // form to get new/exiting user id with fetch
        } else if (currentUserId) {
            currentUserId = null
            modal.classList.toggle("show-modal");
        }
    }

    addLogInListener();
    toggleLogInModal();
    clickHandler()
    scribbleHandler()
    submitHandler()

})


// const addDropDownListener = () => {
//     let dropDown = document.getElementById("breed-dropdown");
//     dropDown.addEventListener("change", (e) => {
//         let option = e.target.value;
//         let sortedBreeds = sortBreeds(option);
//         let breedUl = document.getElementById("dog-breeds");
//         breedUl.innerHTML = "";
//         sortedBreeds.forEach(breed => renderBreed(breed));
//     });
// };

{/* <select id="breed-dropdown" name="select-breed">
<option value="a">a</option>
<option value="b">b</option>
<option value="c">c</option>
<option value="d">d</option> */}
