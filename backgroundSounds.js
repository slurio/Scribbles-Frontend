document.addEventListener('DOMContentLoaded', () => {  

    const soundHandler = () => {
        const editorMenu = document.querySelector(".element-editor-menu")

        editorMenu.addEventListener('click', e => {
            if(e.target.matches('.sound-graphic-on')){
                soundOn() 
            } else if(e.target.matches('.sound-graphic-off')) {
                soundOff()
            } 
        })
    }

    const soundOn = () => {
        if(tones.context.state === 'running') {
            tones.context.suspend().then(function() {
                document.querySelector('#sound-button').style.display = "none"
                document.querySelector('#sound-button-off').style.display = "inline"
            })
        }   
    }

    const soundOff = () => {
        tones.context.resume().then(function() {
            document.querySelector('#sound-button').style.display = null
            document.querySelector('#sound-button-off').style.display = "none"
        })
    }

    const backgroundSoundsHandler = () => {
        let sound = new Audio()
        sound.volume = .1
        const natureSelect = document.createElement("select")

        renderNatureSounds(natureSelect)
        
        natureSelect.addEventListener("change", (e) => {
            if (e.target.value != "pause") {
                sound.src = e.target.value
                sound.play()
            } else {
                sound.pause()
            }
        })
    }

    const renderNatureSounds = natureSelect => {
        let natureSounds = {
            none: "pause",
            ocean: "assets/natureSounds/ocean.mp3",
            rain: "assets/natureSounds/rain.mp3",
            rainforest: "assets/natureSounds/rainforest.mp3",
            creek: "assets/natureSounds/creek.mp3"
        }

        for (let nSound in natureSounds) {
            let option = document.createElement("option")
            nSound === 'none' ? option.text = 'no sound' : option.text = nSound
            option.value = natureSounds[nSound]
            natureSelect.add(option)
        }

        renderSoundToDom(natureSelect)
    }

    const renderSoundToDom = natureSelect => {
        let natureDiv = document.querySelector('#nature-music')
        natureDiv.append(natureSelect)
        let dropdown = document.querySelector('#sound-dropdown')
        natureSelect.className = 'cursor-pointer w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline'
        dropdown.insertAdjacentElement('afterend', natureDiv)
    }

    soundHandler()
    backgroundSoundsHandler()
})
