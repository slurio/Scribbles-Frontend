document.addEventListener('DOMContentLoaded', () => {  
    let scribble_shapes = []
    let editXPos 
    let editYPos 
    let currentUserId
    let animating = false
    let shapeInfo
    let backgroundColor
    let resizeTimer

    const SCRIBBLES_URL = "http://localhost:3000/scribbles/"
    const CIRCLES_URL = "http://localhost:3000/circle_canvases/"
    const BG_URL = "http://localhost:3000/background_canvases/"
    const USERS_URL = "http://localhost:3000/users/"

    const addLogInListener = () => {
        let userForm = document.querySelector(".login-form")
        userForm.addEventListener("submit", (e) => {
            e.preventDefault()
            let username = userForm.username.value
            setWelcomeMessage(username)
            e.target.reset()
            getUser(username)
        })
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
        .then(user => renderUser(user))
    }

    const renderUser = userData => {
        currentUserId = userData.id
        renderScribbleList(userData.scribbles)

        if(userData.scribbles.length === 0){
            newScribble()
        } else {
            getScribble(userData.scribbles[0].id)
        }
        toggleLogInModal()
    }

    const renderScribbleList = (scribbles) => {
        let dropDown = document.getElementById("scribble-select-menu")
        removeAllChildNodes(dropDown)
        for (let scribble of scribbles) {
            addToScribbleList(scribble)
        }
    }

    const newScribble = (title) => {
        clearCanvases()
        postScribble(title)
    }

    const clearCanvases = () => {
        scribble_shapes = []
        let canvas_container = document.querySelector(".canvases")
        removeAllChildNodes(canvas_container)
    }

    const removeAllChildNodes = (parent) => {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild)
        }
    }

    const postScribble = (title) => {
        if(!title){
            let randId = Math.floor(Math.random() * Math.floor(1000))
            name = "Scribble" + randId
        }else {
            name = title
        }
        
        let scribbleObj = {
            title: name,
            user_id: currentUserId
        }

        createNewScribble(scribbleObj)
    }

    const createNewScribble = scribbleObj => {
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

    const addToScribbleList = (scribble) => {
        let dropDown = document.getElementById("scribble-select-menu")
        let option = document.createElement("option")

        option.textContent = scribble.title
        option.value = scribble.id
        dropDown.append(option)
        dropDown.value = scribble.id
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

    const getScribble = (scribble_id) => {  
        fetch(SCRIBBLES_URL + scribble_id)
        .then(response => response.json())
        .then(scribble => renderScribble(scribble))
    }

    const renderScribble = (scribble) => {
        clearCanvases()
        renderBackgroundCanvas(scribble)
        renderCanvases(scribble)
    }

    const renderBackgroundCanvas = (scribble) => {
        let canvasContainer = document.querySelector(".canvases")
        canvasContainer.dataset.scribble_id = scribble.id

        let bgCanvas = setBgFeatures(scribble.background_canvas, canvasContainer)
        canvasContainer.append(bgCanvas)

        backgroundColor = scribble.background_canvas.background_style
    }

    const renderCanvases = (scribble) => {
        if (scribble.circle_canvases.length > 0) {
            renderCircleCanvases(scribble)
        }
    }
    
    const renderCircleCanvases = (scribble) => scribble.circle_canvases.map(renderCircle)

    const renderCircle = (cirCan) => {
        let canvas_container = document.querySelector(".canvases")
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        
        canvas.dataset.id = cirCan.id
        canvas.width = canvas_container.offsetWidth
        canvas.height = canvas_container.offsetHeight
        canvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"
        canvas.style.zIndex = cirCan.z_index
        canvas_container.append(canvas)

        drawCircle(context, cirCan)
    }

    const drawCircle = (context, cirCan) => {
        let circle = new Circle(cirCan.posX, cirCan.posY, cirCan.dx, cirCan.dy, cirCan.radius, cirCan.color, cirCan.octave, cirCan.note, context, cirCan.id)
        scribble_shapes.push(circle)
        circle.draw() 
    }

    const navBarHandler = () => {
        const navBar = document.querySelector(".nav-bar")

        navBar.addEventListener('click', e => {
            if(e.target.matches('#new-scribble')) {
                toggleNewScribbleModal()
            } else if (e.target.matches('#delete-scribble')) {
                deleteScribbleFromDB()
            } else if (e.target.matches('#fullscreen')) {
                let board = document.querySelector(".canvases")
                board.requestFullscreen()
            }else if(e.target.matches('#log-out')) {
                clearCanvases()
                clearWelcomeMessage()
                toggleLogInModal()
            } 
        })
    }

    const toggleNewScribbleModal = () => {
        let newScribModal = document.querySelector('.new-scribble-modal')
        newScribModal.classList.toggle('show-new-scribble-modal')
    }

    const deleteScribbleFromDB = () => {
        let dropDown = document.getElementById("scribble-select-menu")
        let optionToDelete = dropDown.options[dropDown.options.selectedIndex]
        let scribId = optionToDelete.value
        
        fetch(SCRIBBLES_URL+scribId, {method: "DELETE"})
        .then(response => response.json())
        .then(() => {
            deleteScribbleFromDOM()
            renderAvailableScribble()
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

    const clearWelcomeMessage = () => {
        let welcomeMsg = document.querySelector(".welcome-user")
        welcomeMsg.textContent = ""
    }

    const toggleLogInModal = () => {
        let modal = document.querySelector(".modal")
        if (!!currentUserId) {
            modal.classList.toggle("show-modal")
        } else if (currentUserId) {
            currentUserId = null
            modal.classList.toggle("show-modal")
        }
    }

    const editorMenuHandler = () => {
        const editorMenu = document.querySelector(".element-editor-menu")

        editorMenu.addEventListener('click', e => {
            if(e.target.matches('#unclicked-circle')) {
                handleUnclickedCircle(e.target)
            } else if(e.target.matches('#clicked-circle')) {
                handleClickedCircle(e.target)
            } else if(e.target.matches('#play-button') || e.target.matches('.play-graphic')) {
                playAnimation()
            } else if(e.target.matches('#pause-button') || e.target.matches('.pause-graphic')) {
                pauseAnimation()
            }
        })
    }

    const handleUnclickedCircle = circleTarget => {
        circleTarget.classList.add('bg-blue-500')
        circleTarget.id = 'clicked-circle'
        renderForm(circleTarget)
    }

    const renderForm = () => {
        let newShapeModal = document.querySelector('.create-element-modal')
        newShapeModal.classList.toggle('show-create-element-modal')
    }

    const handleClickedCircle = circleTarget => {
        circleTarget.id = 'unclicked-circle'
        circleTarget.classList.remove('bg-blue-500')
        document.querySelector('#element-form').remove()
    }

    const playAnimation = () => {
        if (!animating) {
            animating = true
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
    
    const pauseAnimation = () => {
        if (animating) {
            animating = false
        }
    }

    const formHandler = () => {
        document.addEventListener('click', e => {
           if (e.target.matches('.delete-shape')){
                deleteShape(e.target)
            }  else if(e.target.matches('.close-edit-button')) {
                document.querySelector('.edit-element-form').reset()
                toggleEditModal()
            } else if(e.target.matches('.close-bg-edit-button')) {
                toggleEditBgModal()
            } else if(e.target.matches('.close-create-button')) {
                toggleCreateShapeModal()
            } else if(e.target.matches('.create-random-shape')) {
                createRandomShape()
            } else if(e.target.matches('.close-new-scribble-button')) {
                toggleNewScribbleModal()
            }
        })
    }

    const deleteShape = () => {
        let circleId = document.querySelector('.edit-element-form').dataset.circle_id
        toggleEditModal()

        fetch(CIRCLES_URL + circleId, {method: "DELETE"})
        .then(response => response.json())
        .then(deletedCircle => updateCanvas(deletedCircle))
    }

    const toggleEditModal = () => {
        let editModal = document.querySelector('.edit-element-modal')
        editModal.classList.toggle('show-edit-modal')
    }

    const toggleEditBgModal = () => {
        let bgModal = document.querySelector('.edit-bg-modal')
        bgModal.classList.toggle('show-edit-bg-modal')
    }

    const toggleCreateShapeModal = () => {
        let newShapeModal = document.querySelector('.create-element-modal')
        newShapeModal.classList.toggle('show-create-element-modal')
        let circleButton = document.querySelector('#clicked-circle')
        circleButton.id = 'unclicked-circle'
        circleButton.classList.remove('bg-blue-500')
    }

    const updateCanvas = deletedCircle => {
        let updateScribbleShapes = []   

        for(shape of scribble_shapes) {
            if(shape.id !== deletedCircle.id) {
                updateScribbleShapes.push(shape)
            }
        }

        scribble_shapes = updateScribbleShapes
        let oldCircle = document.querySelector(`[data-id='${deletedCircle.id}']`)
        oldCircle.remove()
    }

    const createRandomShape = () => {
        let newShapeModal = document.querySelector('.create-element-modal')
        newShapeModal.classList.toggle('show-create-element-modal')
        const lastCanvas = document.querySelector('.canvases').lastElementChild
        const canvas_container = document.querySelector(".canvases")

        shapeInfo = {
            z_index: parseInt(lastCanvas.style.zIndex) + 1,
            color: getRandomColor(),
            octave: randomOctave(),
            note: randomNote(),
            radius: Math.ceil(Math.random() * 100),
            dx: Math.ceil(Math.random() * 25),
            dy: Math.ceil(Math.random() * 25),
            scribble_id: canvas_container.dataset.scribble_id
        }       
    }

    function randomNote() {
        const notes = ["c", "c#", "db", "d", "eb", "e", "f", "f#", "g", "g#", "a", "ab", "a#", "b", "bb"]
        return notes[Math.floor(Math.random() * notes.length)]
    }

    function randomOctave() {
        const octaves = ["1", "2", "3", "4", "5", "6", "7"]
        return octaves[Math.floor(Math.random() * octaves.length)]
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'
        var color = '#'
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)]
        }
        return color
    }

    const scribbleHandler = () => {
        document.addEventListener('click', e => {
            const circleElement = document.querySelector('#clicked-circle')
            const lastCanvas = document.querySelector('.canvases').lastElementChild
        
            if(e.target === lastCanvas && circleElement && shapeInfo) {
                createCircle(circleElement, lastCanvas, e)
            }else if(e.target === lastCanvas && !circleElement) {
                checkElementPresent(lastCanvas, e)
            }
        })
    }

    const createCircle = (circle, lastCanvas, e) => {
        circle.id = 'unclicked-circle'
        circle.classList.remove('bg-blue-500')

        let rect = lastCanvas.getBoundingClientRect()
        let scaleX = lastCanvas.width / rect.width
        let scaleY = lastCanvas.height / rect.height
        
        let circleObj = {
            posX: (e.clientX - rect.left) * scaleX,
            posY: (e.clientY - rect.top) * scaleY,
            dx: shapeInfo['dx'],
            dy: shapeInfo['dy'],
            color: shapeInfo['color'],
            radius: shapeInfo['radius'],
            octave: shapeInfo['octave'],
            note: shapeInfo['note'],
            z_index: parseInt(lastCanvas.style.zIndex) + 1,
            scribble_id: document.querySelector(".canvases").dataset.scribble_id
        }

        saveCircle(circleObj)
    }

    const saveCircle = circle => {
        let fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(circle)
        }

        fetch(CIRCLES_URL, fetchOptions)
        .then(response => response.json())
        .then(circleCanvas => {
            renderCircle(circleCanvas,
            shapeInfo = {}
        )})
    }


    const checkElementPresent = (lastCanvas, e) => {
        let checkShapeClicked
        let rect = lastCanvas.getBoundingClientRect()
        let scaleX = lastCanvas.width / rect.width
        let scaleY = lastCanvas.height / rect.height

        xPos = (e.clientX - rect.left) * scaleX
        yPos = (e.clientY - rect.top) * scaleY

        for(shape of scribble_shapes) {
            let context = shape.context

            if(context.isPointInPath(xPos, yPos)) {
                renderEditElementForm(shape)
                editXPos = xPos
                editYPos = yPos
                checkShapeClicked = shape
            } 
        }

        if(!checkShapeClicked) {
            let bgEditForm = document.querySelector('.edit-bg-form')
            bgEditForm.color.value = backgroundColor
            toggleEditBgModal()
        }
    }

    const renderEditElementForm = shape => {
        let editElementForm = document.querySelector('.edit-element-form')
        editElementForm.dataset.circle_id = shape.id
        editElementForm.color.value = shape.color
        editElementForm.octave.value = shape.octave
        editElementForm.note.value = shape.note
        editElementForm.radius.value = shape.radius
        editElementForm.dx.value = shape.dX
        editElementForm.dy.value = shape.dY

        toggleEditModal()
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
                newScribble(e.target.title.value)
                e.target.reset()
            }
        })
    }

    const getElementFormInfo = target => {     
        shapeInfo = {
            color: target.color.value,
            dx: target.dx.value,
            dy: target.dy.value,
            radius: target.radius.value,
            octave: target.octave.value,
            note: target.note.value
        }

        target.reset()

        let newShapeModal = document.querySelector('.create-element-modal')
        newShapeModal.classList.toggle('show-create-element-modal')
    }

    const saveBackground = target => {
        const newBgStyle = target.color.value
        const backgroundId = document.querySelector('#background-canvas').dataset.bg_id
        
        let fetchOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify({background_style: newBgStyle})
        }

        fetch(BG_URL + backgroundId, fetchOptions)
        .then(response => response.json())
        .then(updatedBg => renderNewBg(updatedBg))
    }

    const renderNewBg = updatedBg => {
        document.querySelector('#background-canvas').remove()
        let canvasContainer = document.querySelector(".canvases")
        let bgCanvas = setBgFeatures(updatedBg, canvasContainer)
        canvasContainer.prepend(bgCanvas)
        backgroundColor = updatedBg.background_style
    }

    const setBgFeatures = (bg, canvasContainer) => {
        let bgCanvas = document.createElement("canvas")
        bgCanvas.id = "background-canvas"
        bgCanvas.width = canvasContainer.offsetWidth
        bgCanvas.height = canvasContainer.offsetHeight
        bgCanvas.dataset.bg_id =bg.id
        bgCanvas.style.zIndex = bg.z_index
        bgCanvas.style.background = bg.background_style
        bgCanvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"
        return bgCanvas
    }

    const updateElementShape = target => {
        const circleId = target.dataset.circle_id

        shapeInfo = {
            posX: editXPos,
            posY: editYPos,
            color: target.color.value,
            dx: target.dx.value,
            dy: target.dy.value,
            radius: target.radius.value,
            octave: target.octave.value,
            note: target.note.value
        }

        target.reset()
        updateShape(shapeInfo, circleId)
    }

    const updateShape = (shapeData, shapeId) => {
        let fetchOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accepts": "application/json"
            },
            body: JSON.stringify(shapeData)
        }

        fetch(CIRCLES_URL + shapeId, fetchOptions)
        .then(response => response.json())
        .then(updatedCircle => renderCircleUpdate(updatedCircle))
    }

    const renderCircleUpdate = updatedCircle => {
        updateShapes(updatedCircle)
        createUpdatedCircleCanvas(updatedCircle)
    }

    const updateShapes = updatedCircle => {
        let updateScribbleShapes = []   
  
        for(shape of scribble_shapes) {
            if(shape.id !== updatedCircle.id) {
                updateScribbleShapes.push(shape)
            }
        }

        scribble_shapes = updateScribbleShapes
    }

    const createUpdatedCircleCanvas = (updatedCircle) => {
        let canvas_container = document.querySelector(".canvases")
        let canvas = document.createElement("canvas")
        let context = canvas.getContext('2d')
        
        canvas.dataset.id = updatedCircle.id
        canvas.width = canvas_container.offsetWidth
        canvas.height = canvas_container.offsetHeight
        canvas.className = "scribble-canvas m-2 border-2 border-gray-700 rounded-lg shadow-lg"
        canvas.style.zIndex = updatedCircle.z_index

        drawCircle(context, updatedCircle)
        
        replaceOldCircle(canvas, updatedCircle.id)
    }

    const replaceOldCircle = (newCanvas, updateCircleId) => {
        let oldCircle = document.querySelector(`[data-id='${updateCircleId}']`)
        oldCircle.insertAdjacentElement('afterend', newCanvas)
        oldCircle.remove()
    }

    const addDropDownListener = () => {
        let dropDown = document.getElementById("scribble-select-menu")
        dropDown.addEventListener("change", (e) => {
            let scribbleId = e.target.value
            getScribble(scribbleId)
        })
    }

    const resizeHandler = () => {
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer)
            document.body.classList.add("resize-animation-stopper")
            resizeTimer = setTimeout(() => {
                console.log('line 2')
                for(let shape of scribble_shapes) {
                    let canvas_container = document.querySelector(".canvases")
                    let canvas = document.querySelector(`[data-id='${shape.id}']`)
                    shape.clear(canvas)
                    canvas.width = canvas_container.offsetWidth
                    canvas.height = canvas_container.offsetHeight
                    shape.draw()
                }
                document.body.classList.remove("resize-animation-stopper")
            }, 200)
        })
    }

    editorMenuHandler()
    navBarHandler()
    resizeHandler()
    addDropDownListener()
    addLogInListener()
    toggleLogInModal()
    formHandler()
    scribbleHandler()
    submitHandler() 
})