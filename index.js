document.addEventListener('DOMContentLoaded', () => {
    
    //creates blue circle with given x,y positions
    const createCircle = (xPosition, yPosition) => {

        let scribbleCanvas = document.querySelector('#scribble-board')
        
        let ctx = scribbleCanvas.getContext('2d')
 
        //Blue Circle
        ctx.beginPath()
        ctx.fillStyle = '#3182CE'
        ctx.arc(xPosition, yPosition, 15, 0, Math.PI * 2)
        ctx.fill()

    }

    const  clickHandler = () => {

        document.addEventListener('click', e => {

            if(e.target.matches('#unclicked-circle')) {
                e.target.classList.add('bg-blue-500')
                e.target.id = 'clicked-circle'
            
            } else if(e.target.matches('#clicked-circle')) {
                e.target.id = 'unclicked-circle'
                e.target.classList.remove('bg-blue-500')
            }   
        })
    }   

    //When there is the situation of having the element at a different 
    //size than the bitmap itself, for example, the element is scaled 
    //using CSS or there is pixel-aspect ratio etc. you will have to address this.

    const scribbleHandler = () => {
        
        document.addEventListener('click', e => {
            const circleElement = document.querySelector('#clicked-circle')

            //click listner for scribble canvas to get mouse x/y position
            if(e.target.matches('#scribble-board') && circleElement) {
                
                let canvas = e.target

                let rect = canvas.getBoundingClientRect()

                let scaleX = canvas.width / rect.width
                let scaleY = canvas.height / rect.height

                xPosition = (e.clientX - rect.left) * scaleX
                yPosition = (e.clientY - rect.top) * scaleY

                //creates circle with mouse x,y position on click                
                createCircle(xPosition, yPosition)
            }
        })
    }

    clickHandler()
    scribbleHandler()

})

    

    // Red Square (should be a rect? distorted)
    // ctx.beginPath()
    // ctx.rect(20, 20, 150, 100)
    // ctx.fillStyle = "red"
    // ctx.fill()

    //Green Rectangle
    // ctx.beginPath()
    // ctx.rect(20, 20, 250, 100)
    // ctx.fillStyle = "green"
    // ctx.fill()

 
    //Orange Triangle / looks wonky
    // ctx.moveTo(25, 25);
    // ctx.lineTo(105, 25);
    // ctx.lineTo(25, 105);
    // ctx.fillStyle = "orange"
    // ctx.fill()

