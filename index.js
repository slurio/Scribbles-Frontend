document.addEventListener('DOMContentLoaded', () => {
    
    let scribble_shapes = []
    let editXPos 
    let editYPos 
    let currentUserId;
    let animating = false;
    let shapeInfo;
    let backgroundColor

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
        clearCanvases();
        renderBackgroundCanvas(scribble);
        renderCanvases(scribble);
    }

    const renderBackgroundCanvas = (scribble) => {
        let canvas_container = document.querySelector(".canvases");
        canvas_container.dataset.scribble_id = scribble.id
        let bg_canvas = document.createElement("canvas");
        bg_canvas.id = "background-canvas"
        bg_canvas.dataset.bg_id =scribble.background_canvas.id
        bg_canvas.style.zIndex = scribble.background_canvas.z_index;
        bg_canvas.style.background = scribble.background_canvas.background_style
        bg_canvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"
        canvas_container.append(bg_canvas);
        backgroundColor = scribble.background_canvas.background_style
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
        canvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"

        // sets appropriate layering
        canvas.style.zIndex = cirCan.z_index

        // new Circle instance, push to global array
        let circle = new Circle(cirCan.posX, cirCan.posY, cirCan.dx, cirCan.dy, cirCan.radius, cirCan.color, cirCan.octave, cirCan.note, context, cirCan.id)
        scribble_shapes.push(circle)
        circle.draw()

        //appends to DOM
        canvas_container.append(canvas)
    }

    const clickHandler = () => {
        
        document.addEventListener('click', e => {
            console.log(e.target)
            if(e.target.matches('#unclicked-circle')) {
                e.target.classList.add('bg-blue-500')
                e.target.id = 'clicked-circle'
                renderForm(e.target)
            } else if(e.target.matches('#clicked-circle')) {
                e.target.id = 'unclicked-circle'
                e.target.classList.remove('bg-blue-500')
            } else if(e.target.matches('#play-button') || e.target.matches('.play-graphic')) {
                playAnimation()
            } else if(e.target.matches('#pause-button') || e.target.matches('.pause-graphic')) {
                pauseAnimation()
            } else if(e.target.matches('#new-scribble')) {
                toggleNewScribbleModal()
                // newScribble()
            } else if(e.target.matches('#log-out')) {
                clearCanvases()
                clearWelcomeMessage()
                toggleLogInModal()
            } else if (e.target.matches('#delete-scribble')) {
                deleteScribbleFromDB();
            }else if(e.target.matches('.close-edit-button')) {
                const form = document.querySelector('.edit-element-form')
                form.reset()
                toggleEditModal()
            }else if(e.target.matches('.close-bg-edit-button')) {
                toggleEditBgModal()
            }else if(e.target.matches('.delete-shape')){
                deleteShape(e.target)
            }else if(e.target.matches('.svg-sound-on') || e.target.matches('.st0')){
                if(tones.context.state === 'running') {
                    tones.context.suspend().then(function() {
                        document.querySelector('#sound-button').style.display = "none"
                        document.querySelector('#sound-button-off').style.display = "inline"
                    });
                }    
            }else if(e.target.matches('.svg-button-off') || e.target.matches('.st0') || e.target.matches('.st2')) {
                    tones.context.resume().then(function() {
                        document.querySelector('#sound-button').style.display = null
                        document.querySelector('#sound-button-off').style.display = "none"
                })
            }else if(e.target.matches('.close-new-scribble-button')) {
                toggleNewScribbleModal()
            }else if(e.target.matches('.close-create-button')) {
                let newShapeModal = document.querySelector('.create-element-modal')
                newShapeModal.classList.toggle('show-create-element-modal')
                let circleButton = document.querySelector('#clicked-circle')
                circleButton.id = 'unclicked-circle'
                circleButton.classList.remove('bg-blue-500')
            }
        })
    }

    const toggleNewScribbleModal = () => {
        let newScribModal = document.querySelector('.new-scribble-modal')
        newScribModal.classList.toggle('show-new-scribble-modal')
    }
    

    const deleteShape = target => {

        let circleId = document.querySelector('.edit-element-form').dataset.circle_id
        toggleEditModal()
        let options = {
            method: "DELETE"
        }

        fetch(CIRCLES_URL + circleId, options)
        .then(response => response.json())
        .then(deletedCircle => updateCanvas(deletedCircle))
    }

    const updateCanvas = deletedCircle => {
        console.log(deletedCircle)

        ///edit scribble shape array and DOM
        let updateScribbleShapes = []   

        for(shape of scribble_shapes) {
            if(shape.id !== deletedCircle.id) {
                updateScribbleShapes.push(shape)
            }
        }

        scribble_shapes = updateScribbleShapes
        
        //appends to DOM
        let oldCircle = document.querySelector(`[data-id='${deletedCircle.id}']`)
        oldCircle.remove()

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


    const scribbleHandler = () => {
        
        document.addEventListener('click', e => {
            //check to see if circle was clicked
            const circleElement = document.querySelector('#clicked-circle')
            //to get the last canvas in div canvases
            const lastCanvas = document.querySelector('.canvases').lastElementChild
            
            //click listner for scribble canvas to get mouse x/y position
            if(e.target === lastCanvas && circleElement && shapeInfo) {
                circleElement.id = 'unclicked-circle'
                circleElement.classList.remove('bg-blue-500')

                let z_index = parseInt(lastCanvas.style.zIndex) + 1

                  //get x/y of mouse click
                let rect = lastCanvas.getBoundingClientRect()
                let scaleX = lastCanvas.width / rect.width
                let scaleY = lastCanvas.height / rect.height

                xPosition = (e.clientX - rect.left) * scaleX
                yPosition = (e.clientY - rect.top) * scaleY
                
                let canvas_container = document.querySelector(".canvases");

                
                let circleObj = {
                    posX: xPosition,
                    posY: yPosition,
                    dx: shapeInfo['dx'],
                    dy: shapeInfo['dy'],
                    color: shapeInfo['color'],
                    radius: shapeInfo['radius'],
                    octave: shapeInfo['octave'],
                    note: shapeInfo['note'],
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
            
                shapeInfo = {}
            //To edit element shape    
            }else if(e.target === lastCanvas && !circleElement) {
                //get x/y of mouse click
                let rect = lastCanvas.getBoundingClientRect()
                let scaleX = lastCanvas.width / rect.width
                let scaleY = lastCanvas.height / rect.height

                xPosition = (e.clientX - rect.left) * scaleX
                yPosition = (e.clientY - rect.top) * scaleY

                checkElementPresent(xPosition, yPosition)
            }
        })
    }

    //check to see against stored shape array if shape is present on mouse click
    //if shape present render form
    const checkElementPresent = (xPos, yPos) => {
        let checkShapClicked = []

        for(shape of scribble_shapes) {
            let context = shape.context

            if(context.isPointInPath(xPos, yPos)) {
                renderEditElementForm(shape)
                //update global var
                editXPos = xPos
                editYPos = yPos

                checkShapClicked.push(shape)
            } 
        }

        if(checkShapClicked.length === 0) {
            let bgEditForm = document.querySelector('.edit-bg-form')

            // let currentBgColor =  document.querySelector('#background-canvas').style.background
            
            bgEditForm.color.value = backgroundColor
            toggleEditBgModal()
        }

    }

    const toggleEditBgModal = () => {
        let bgModal = document.querySelector('.edit-bg-modal')
       
        bgModal.classList.toggle('show-edit-bg-modal')
    }

    const renderEditElementForm = shape => {
       
        let editElementForm = document.querySelector('.edit-element-form')
        editElementForm.dataset.circle_id = shape.id
        
        //populate current shape attributes in edit form
        editElementForm.color.value = shape.color
        editElementForm.octave.value = shape.octave
        editElementForm.note.value = shape.note
        editElementForm.radius.value = shape.radius
        editElementForm.dx.value = shape.dX
        editElementForm.dy.value = shape.dY

        toggleEditModal()

    }

    const toggleEditModal = () => {
        let editModal = document.querySelector('.edit-element-modal')
        editModal.classList.toggle('show-edit-modal')
    }

    const renderForm = target => {
        let newShapeModal = document.querySelector('.create-element-modal')
        newShapeModal.classList.toggle('show-create-element-modal')
        // const form = document.querySelector('#element-form')
        // if(!form){
        //     //render a pop up menu with options for velocity/color/sound/etc after cicle is clicked in element menu

        //     const body = document.querySelector('body')
        //     elementForm = document.createElement('form')
        //     elementForm.id = 'element-form'
        //     elementForm.className = 'bg-gray-400 p-4 m-2' 
        //     elementForm.dataset.shape = 'circle'
            
        //     elementForm.innerHTML = `
        //         <label class="">Color</label><br>
        //         <input type="color" name="color" value="color">
        //         <br>
        //         <br>
        //         <label> Sound </label>
        //         <br>
        //         <select name="octave" id="octaves-list">
        //           <option value="1">Octave 1</option>
        //           <option value="2">Octave 2</option>
        //           <option value="3">Octave 3</option>
        //           <option value="4">Octave 4</option>
        //           <option value="5">Octave 5</option>
        //           <option value="6">Octave 6</option>
        //           <option value="7">Octave 7</option>
        //         </select>    
        //         <select name="note" id="notes-list">
        //           <option value="c">c</option>
        //           <option value="c#">c#</option>
        //           <option value="db">db</option>
        //           <option value="d">d</option>
        //           <option value="eb">eb</option>
        //           <option value="e">e</option>
        //           <option value="f">f</option>
        //           <option value="f#">f#</option>
        //           <option value="g">g</option>
        //           <option value="g#">g#</option>
        //           <option value="ab">ab</option>
        //           <option value="a">a</option>
        //           <option value="a#">a#</option>
        //           <option value="bb">bb</option>
        //           <option value="b">b</option>
        //         </select>
        //         <br>
        //         <br>
        //         <label>radius</label><br>
        //         <input type="number" name="radius" value="10">
        //         <br>
        //         <br>
        //         <label >Speed</label><br>
        //         <input type="number" name="dx" value="10">
        //         <label>dx</label>
        //         <input type="number" name="dy" value="6">
        //         <label>dy</label>
        //         <br>
        //         <br>
        //         <input type="submit" value="Click + press on scribble to place!" >
        //     `
        //     body.insertAdjacentElement('beforeend', elementForm)
        // }        
               
    }

    const submitHandler = () => {
        document.addEventListener('submit', e => {
            e.preventDefault()
            if(e.target.matches('#element-form')) {
                getElementFormInfo(e.target)
            } else if(e.target.matches('.edit-element-form')) {
                toggleEditModal()
                updateElementShape(e.target)
            } else if(e.target.matches('.edit-bg-form')) {
                toggleEditBgModal()
                saveBackground(e.target)
            }else if(e.target.matches('.new-scribble-form')) {
                toggleNewScribbleModal()
                let title = e.target.title.value
                e.target.reset()
                newScribble(title)
            }
        })
    }

    

    const saveBackground = target => {
        const originalBg = document.querySelector('#background-canvas')
        const newBackground_style = target.color.value
        const background_id = originalBg.dataset.bg_id
        
        let fetchOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify({
                background_style: newBackground_style
            })
        }

        fetch(BG_URL + background_id, fetchOptions)
        .then(response => response.json())
        .then(updatedBg => renderNewBg(updatedBg))
    }

    const renderNewBg = updatedBg => {
        document.querySelector('#background-canvas').remove()

        let canvas_container = document.querySelector(".canvases");
        let bg_canvas = document.createElement("canvas");
        bg_canvas.id = "background-canvas"
        bg_canvas.dataset.bg_id =updatedBg.id
        bg_canvas.style.zIndex = updatedBg.z_index;
        bg_canvas.style.background = updatedBg.background_style
        bg_canvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"
        canvas_container.prepend(bg_canvas);
    }

    const updateElementShape = target => {
        const color = target.color.value
        const dx = target.dx.value
        const dy = target.dy.value
        const radius = target.radius.value
        const octave = target.octave.value
        const note = target.note.value

        const circleId = target.dataset.circle_id
        target.reset()

        shapeInfo = {
            posX: editXPos,
            posY: editYPos,
            color: color,
            dx: dx,
            dy: dy,
            radius: radius,
            octave: octave,
            note: note
        }

        //Patch request to update circleCanvas
        let fetchOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(shapeInfo)
        }

        fetch(CIRCLES_URL + circleId, fetchOptions)
        .then(response => response.json())
        .then(updatedCircleCanvas => {
            renderCircleCanvasUpdate(updatedCircleCanvas)
        })
        
    }

    const renderCircleCanvasUpdate = updatedCircle => {
        ///edit scribble shape array and DOM
        let updateScribbleShapes = []   
  
        for(shape of scribble_shapes) {
            if(shape.id !== updatedCircle.id) {
                updateScribbleShapes.push(shape)
            }
        }

        scribble_shapes = updateScribbleShapes

        let canvas_container = document.querySelector(".canvases");
        let canvas = document.createElement("canvas")
        let context = canvas.getContext('2d')
        
        //sets canvas attributes
        canvas.dataset.id = updatedCircle.id
        canvas.width = canvas_container.offsetWidth
        canvas.height = canvas_container.offsetHeight
        canvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"

        // sets appropriate layering
        canvas.style.zIndex = updatedCircle.z_index

        // new Circle instance, push to global array
        let circle = new Circle(updatedCircle.posX, updatedCircle.posY, updatedCircle.dx, updatedCircle.dy, updatedCircle.radius, updatedCircle.color, updatedCircle.octave, updatedCircle.note, context, updatedCircle.id)
        console.log("new circle: ", circle)
        scribble_shapes.push(circle)
        circle.draw()
        
        //appends to DOM
        let oldCircle = document.querySelector(`[data-id='${updatedCircle.id}']`)
        oldCircle.insertAdjacentElement('afterend', canvas)
        oldCircle.remove()

    }

    //gets form values for circle
    const getElementFormInfo = target => {

        target.dataset.shape = 'circle'
        const shape = target.dataset.shape
        const color = target.color.value
        const dx = target.dx.value
        const dy = target.dy.value
        const radius = target.radius.value
        const octave = target.octave.value
        const note = target.note.value
     
        shapeInfo = {
            shape: shape,
            color: color,
            dx: dx,
            dy: dy,
            radius: radius,
            octave: octave,
            note: note
        }

        target.reset()

        let newShapeModal = document.querySelector('.create-element-modal')
        newShapeModal.classList.toggle('show-create-element-modal')
    }

    const newScribble = (title) => {
        //render modal and ask for title name
        //get title name from form and pass to postScribble function
       
        clearCanvases()
        postScribble(title)
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

    const postScribble = (title) => {
  
        if(title === ""){
            let randId = Math.floor(Math.random() * Math.floor(1000))
            title = "New Scribble" + randId
        }else {
            title = title
        }
        
        let scribbleObj = {
            title: title,
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
            addToScribbleList(scribble)
            newDefaultBackground(scribble)
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
            setWelcomeMessage(username)
            e.target.reset()
            getUser(username)
        })
    }

    const   clearWelcomeMessage = () => {
        let welcomeMsg = document.querySelector(".welcome-user")
        welcomeMsg.textContent = ""
    }


    const setWelcomeMessage = (username) => {
        let welcomeMsg = document.querySelector(".welcome-user")
        welcomeMsg.textContent = `Welcome ${username}!`
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

            renderScribbleList(user.scribbles)

            if(user.scribbles.length === 0){
                newScribble()
                toggleLogInModal();
            } else {
                getScribble(user.scribbles[0].id)
                toggleLogInModal();
            }
        })
    }

    const renderScribbleList = (scribbles) => {
        let dropDown = document.getElementById("scribble-select-menu")
        removeAllChildNodes(dropDown)
        for (let scribble of scribbles) {
            addToScribbleList(scribble)
        }
    }

    const addToScribbleList = (scribble) => {
        let dropDown = document.getElementById("scribble-select-menu")
        let option = document.createElement("option")
        option.textContent = scribble.title
        option.value = scribble.id
        dropDown.append(option)
    }

    const toggleLogInModal = () => {
        let modal = document.querySelector(".modal");
        if (!!currentUserId) {
            modal.classList.toggle("show-modal");
        } else if (currentUserId) {
            currentUserId = null
            modal.classList.toggle("show-modal");
        }
    }

    const addDropDownListener = () => {
        let dropDown = document.getElementById("scribble-select-menu")
        dropDown.addEventListener("change", (e) => {
            let scribbleId = e.target.value
            getScribble(scribbleId)
        })
    }

    const deleteScribbleFromDB = () => {
        let dropDown = document.getElementById("scribble-select-menu")
        let optionToDelete = dropDown.options[dropDown.options.selectedIndex]
        let scribId = optionToDelete.value
        fetch(SCRIBBLES_URL+scribId, {method: "DELETE"})
        .then(response => response.json())
        .then(scribble => {
            console.log(scribble);
            deleteScribbleFromDOM();
            renderAvailableScribble();
        })
    }

    const deleteScribbleFromDOM = () => {
        let dropDown = document.getElementById("scribble-select-menu")
        let optionToDelete = dropDown.options[dropDown.options.selectedIndex]
        dropDown.removeChild(optionToDelete)
    }

    const renderAvailableScribble = () => {
        let firstRemainingOption = document.getElementById("scribble-select-menu").options[0]
        if (firstRemainingOption) {
            getScribble(firstRemainingOption.value)
        } else {
            newScribble()
        }
    }

    addDropDownListener();
    addLogInListener();
    toggleLogInModal();
    clickHandler()
    scribbleHandler()
    submitHandler()

})
