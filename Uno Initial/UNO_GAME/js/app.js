console.log('uno!')

//#region  // DOM AND GLOBAL VARIABLES
const cpuHandDom = document.querySelector('.cpu-hand')
const cpu2HandDom = document.querySelector('.cpu2-hand')
const playerHandDom = document.querySelector('.player-hand')

const cpuScoreDom = document.querySelector('#cpu-score')
const cpu2ScoreDom = document.querySelector('#cpu2-score')
const playerScoreDom = document.querySelector('#player-score')

const playPileDom = document.querySelector('.play-pile')
const drawPileDom = document.querySelector('.draw-pile')

const playerUno = document.querySelector('.player-animation')
const cpuUno = document.querySelector('.cpu-animation')
const cpu2Uno = document.querySelector('.cpu-animation')

// hand arrays
const cpuHand = []
const cpu2Hand = []
const playerHand = []

const deck = []
let playPile
let cpuScore = 0
let cpu2Score = 0
let playerScore = 0

// variables to control gameplay
let playerTurn = true
let gameOn = true
let colorPickerIsOpen = false
let cpuDelay = Math.floor((Math.random() * cpuHand.length * 200) + 1500)
let cpu2Delay = Math.floor((Math.random() * cpu2Hand.length * 200) + 1500)
let gameOver = 50
//#endregion

//#region preload imgs for faster loading
const imgPreLoad = []
let preLoaded = false

const preLoadImgs = () => {
    for (let i = 0; i <= 3; i++) {
        let color
        if (i === 0) color = 'red'
        if (i === 1) color = 'green'
        if (i === 2) color = 'blue'
        if (i === 3) color = 'yellow'
        for (let n = 0; n <= 14; n++) {
            let img = new Image()
            img.src = 'images/' + color + i + '.png'
            imgPreLoad.push(img)
        }
    }

    for (let i = 0; i < imgPreLoad.length; i++) {
        playPileDom.appendChild(imgPreLoad[i])
        playPileDom.innerHTML = ''
    }
}
//#endregion

// #region AUDIO
const shuffleFX = new Audio('audio/shuffle.wav')
const playCardFX = new Audio('audio/playCardNew.wav')
const playCardFX2 = new Audio('audio/playCard2.wav')
const drawCardFX = new Audio('audio/drawCard.wav')
const winRoundFX = new Audio('audio/winRound.wav')
const winGameFX = new Audio('audio/winGame.wav')
const loseFX = new Audio('audio/lose.wav')
const plusCardFX = new Audio('audio/plusCard.wav')
const unoFX = new Audio('audio/uno.wav')
const colorButton = new Audio('audio/colorButton.wav')
const playAgain = new Audio('audio/playAgain.wav')

const pickPlayCardSound = () => {
    // const random = Math.random() * 10

    // if (random > 6) playCardFX.play()
    // else playCardFX2.play()

    playCardFX2.play()
}
//#endregion

// #region CARD AND DECK MANAGEMENT
class Card {
    constructor(rgb, value, points, changeTurn, drawValue, imgSrc) {
        this.color = rgb
        this.value = value
        this.points = points
        this.changeTurn = changeTurn
        this.drawValue = drawValue
        this.src = imgSrc
        this.playedByPlayer = false
    }
}

const createCard = (rgb, color) => {
    for (let i = 0; i <= 14; i++) {
        // number cards
        if (i === 0) {
            deck.push(new Card(rgb, i, i, true, 0, 'images/' + color + i + '.png'))
        }
        else if (i > 0 && i <= 9) {
            deck.push(new Card(rgb, i, i, true, 0, 'images/' + color + i + '.png'))
            deck.push(new Card(rgb, i, i, true, 0, 'images/' + color + i + '.png'))
        }
        // reverse/skip
        else if (i === 10 || i === 11) {
            deck.push(new Card(rgb, i, 20, false, 0, 'images/' + color + i + '.png'))
            deck.push(new Card(rgb, i, 20, false, 0, 'images/' + color + i + '.png'))
        }
        // draw 2
        else if (i === 12) {
            deck.push(new Card(rgb, i, 20, false, 2, 'images/' + color + i + '.png'))
            deck.push(new Card(rgb, i, 20, false, 2, 'images/' + color + i + '.png'))
        }
        else if (i === 13) {
            deck.push(new Card('any', i, 50, true, 0, 'images/wild' + i + '.png'))
        }
        else {
            deck.push(new Card('any', i, 50, false, 4, 'images/wild' + i + '.png'))
        }
    }
}

const createDeck = () => {
    // destroy previous deck
    deck.length = 0
    // create new deck
    for (let i = 0; i <= 3; i++){
        if (i === 0) {
            createCard('rgb(255, 6, 0)', 'red')
        }
        else if (i === 1) {
            createCard('rgb(0, 170, 69)', 'green')
        }
        else if (i === 2) {
            createCard('rgb(0, 150, 224)', 'blue')
        }
        else {
            createCard('rgb(255, 222, 0)', 'yellow')
        }
    }

    console.log(deck) // TODO: remove
}

const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        deck[i].playedByPlayer = false
        let j = Math.floor(Math.random() * (i + 1))
        let temp = deck[i]
        deck[i] = deck[j]
        deck[j] = temp
    }
 
    shuffleFX.play()
}
//#endregion

// #region GAME BEHAVIOURS
const dealCards = () => {
    for (let i = 0; i < 7; i++) {
        cpuHand.push(deck.shift());
        cpu2Hand.push(deck.shift());
        playerHand.push(deck.shift());
    

        // put cards on the DOM
        const cpuCard = document.createElement('img')
        const cpu2Card = document.createElement('img')
        cpuCard.setAttribute('src', 'images/back.png')
        cpu2Card.setAttribute('src', 'images/back.png')
        cpuCard.setAttribute('class', 'cpu')
        cpu2Card.setAttribute('class', 'cpu2')
        cpuHandDom.appendChild(cpuCard)
        cpu2HandDom.appendChild(cpu2Card)

        const playerCard = document.createElement('img')
        playerCard.setAttribute('src', playerHand[i].src)
        playerCard.setAttribute('class', 'player')
        
        // assign cards an id = their index in the playerHand array 
        //in order to reference the correct card object
        playerCard.setAttribute('id', i)
        playerHandDom.appendChild(playerCard)
    }
}

const startPlayPile = () => {
    const playCard = document.createElement('img')
    
    // find first card that isn't an action card
    for (let i = 0; i < deck.length; i++) {
        if (deck[i].color !== "any" && deck[i].value <= 9) {
            // begin playPile array with first valid card
            playPile = deck.splice(i, 1)
            break
        }
    }

    // set playCard to correct image
    playCard.setAttribute('src', playPile[0].src)
    // play card to the playPile
    playPileDom.appendChild(playCard)
}

const newHand = () => {
    console.log('new hand')
    gameOn = true
    // clear hands and play pile
    cpuHandDom.innerHTML = ''
    cpuHand.length = 0
    cpu2HandDom.innerHTML = ''
    cpu2Hand.length = 0
    playerHandDom.innerHTML = ''
    playerHand.length = 0
    playPileDom.innerHTML = ''

    // create new deck
    createDeck()
    // shuffle deck
    shuffleDeck(deck)
    // deal cards and first play card
    dealCards()
    // set down first play card that isn't an action card
    startPlayPile()

    if (colorPickerIsOpen) hideColorPicker()
}

const updatePlayPileDom = () => {
    playPileDom.innerHTML = ''

    // add played card to playPile
    const newCardImg = document.createElement('img')
    const imgSrc = playPile[playPile.length - 1].src
    newCardImg.setAttribute('src', imgSrc)
    playPileDom.appendChild(newCardImg)
}

const updateHand = (handToUpdate) => {
    let domToUpdate, cardClass;

    if (handToUpdate === cpuHand) {
        domToUpdate = cpuHandDom
        cardClass = 'cpu'
        if (cpuVisible) cpuVisible = false
    }
    else if (handToUpdate === cpu2Hand) {
        domToUpdate = cpu2HandDom
        cardClass = 'cpu2'
    } 
    else {
        domToUpdate = playerHandDom
        cardClass = 'player'
    }
    
    // clear the selected dom
    domToUpdate.innerHTML = ''

    // update dom
    for (let i = 0; i < handToUpdate.length; i++) {
        let src

        if (domToUpdate === playerHandDom) {
            src = handToUpdate[i].src
        } 
        else {
            src = 'images/back.png'
        } 

        const updatedCard = document.createElement('img')
        updatedCard.setAttribute('src', src)
        updatedCard.setAttribute('class', cardClass)
        // update ID's to match playerHand indexes
        updatedCard.setAttribute('id', i)
        domToUpdate.appendChild(updatedCard)
    }

    // keep dom element from collapsing when hand is empty
    if (handToUpdate.length === 0) {
        const updatedCard = document.createElement('img')
        updatedCard.setAttribute('src', 'images/empty.png')
        updatedCard.setAttribute('class', 'empty')
        // update ID's to match playerHand indexes
        domToUpdate.appendChild(updatedCard)
    }
}

const drawCard = (handGetsCard) => {
    let domToUpdate

    // Determine which DOM to update based on the hand
    if (handGetsCard === cpuHand) {
        domToUpdate = cpuHandDom
    } else if (handGetsCard === cpu2Hand) {
        domToUpdate = cpu2HandDom
    } else {
        domToUpdate = playerHandDom
    }

    animateDrawCard(handGetsCard)
    // check if the deck has card to draw
    if (deck.length > 0) {
        // pull the top card
        const newCard = deck.shift()
        handGetsCard.push(newCard)
        console.log(handGetsCard, 'drew one card') // TODO: remove
        
    }
    else {
        // shuffle playPile
        shuffleDeck(playPile)
        for (let i = 0; i <= playPile.length - 1; i++) {
            // shuffled playPile becomes the new deck
            deck.push(playPile[i])
        }
        // leave the last played card on the playPile
        playPile.length = 1

        // pull the top card from the deck
        const newCard = deck.shift()
        handGetsCard.push(newCard)
        console.log(handGetsCard, 'drew one card') // TODO: remove
        
    }
    drawCardFX.play()
    setTimeout(() => {
        updateHand(handGetsCard)
    }, 500)
}

const animateDrawCard = (player) => {
    let playerClass 
    if (player === cpuHand) {
        playerClass = 'cpu-draw'
    } else if (player === cpu2Hand) {
        playerClass = 'cpu2-draw'
    } else {
        playerClass = 'player-draw'
    }
    
    const drawCardEl = document.querySelector('#draw-card')
    drawCardEl.classList.remove('hidden')
    setTimeout(() => {
        drawCardEl.classList.add(playerClass)
        setTimeout(() => {
            drawCardEl.classList.add('hidden')
            drawCardEl.classList.remove(playerClass)
            clearInterval()
        }, 500)
    }, 30)
}

const showUno = (unoHand) => {
    // remove hidden class from player-uno div
    unoHand.classList.remove('hidden')
    unoFX.play()
    console.log('removed HIDDEN from', unoHand)

    // add shout class
    setTimeout(() => {
        unoHand.classList.add('shout')
        console.log('added SHOUT to', unoHand)
        //setTimeout = after x seconds remove shout
        setTimeout(() => {
            unoHand.classList.remove('shout')
            console.log('removed SHOUT from', unoHand)

            setTimeout(() => {
                unoHand.classList.add('hidden')
                console.log('added HIDDEN to', unoHand)
            }, 1000)
        }, 1000)
    }, 10) 
}

const showColorPicker = () => {
    // show the color picker
    const colorPicker = document.querySelector('.color-picker')
    colorPicker.style.opacity = 1
    colorPickerIsOpen = true

    //assign eventHandler's to buttons
    document.querySelector('.red').addEventListener('click', (e) => {
        // pass thru the class name for color
        chooseColor('rgb(255, 6, 0)')
    })
    document.querySelector('.green').addEventListener('click', (e) => {
        // pass thru the class name for color
        chooseColor('rgb(0, 170, 69)')
    })
    document.querySelector('.blue').addEventListener('click', (e) => {
        // pass thru the class name for color
        chooseColor('rgb(0, 150, 224)')
    })
    document.querySelector('.yellow').addEventListener('click', (e) => {
        // pass thru the class name for color
        chooseColor('rgb(255, 222, 0)')
    })
}

const chooseColor = (rgb) => {
    //assign the color to the wild on top of the play pile
    colorButton.play()
    playPile[playPile.length - 1].color = rgb

    // hide the color picker
    hideColorPicker()
    if (playerTurn) {
        playerTurn = false 
        currentCPU = 0 
        setTimeout(playCPU, cpuDelay)
    } else if (!playerTurn && currentCPU === 0) {
        currentCPU = 1 
        setTimeout(playCPU, cpuDelay)
    } else if (!playerTurn && currentCPU === 1) {
        currentCPU = 0 
        playerTurn = true 
    }

function hideColorPicker() {
    const colorPicker = document.querySelector('.color-picker')
    colorPicker.style.opacity = 0
    colorPickerIsOpen = false
}

const skipOrEndTurn = () => {
    // check if changeTurn or skip
    if (playPile[playPile.length - 1].changeTurn) {
        if (playerTurn) {
            playerTurn = false
            currentCPU = 0
            setTimeout(playCPU, cpuDelay)
        } else if (currentCPU === 0) {
            currentCPU = 1
            setTimeout(playCPU, cpuDelay)
        } else if (currentCPU === 1) {
            playerTurn = true
            currentCPU = 0
        }
    }
}

// update player names with whose turn it is
const showTurnOnDom = () => {
    if (playerTurn) {
        // Highlight the player's name
        document.querySelector('.player-score-title').style.color = 'rgb(255, 255, 255)' // Bright white for active
        document.querySelector('.cpu-score-title').style.color = 'rgb(150, 200, 238)'    // Default for inactive
        document.querySelector('.cpu2-score-title').style.color = 'rgb(150, 200, 238)'   // Default for inactive
    } else if (currentCPU === 0) {
        // Highlight CPU 1's name
        document.querySelector('.player-score-title').style.color = 'rgb(150, 200, 238)' // Default for inactive
        document.querySelector('.cpu-score-title').style.color = 'rgb(255, 255, 255)'    // Bright white for active
        document.querySelector('.cpu2-score-title').style.color = 'rgb(150, 200, 238)'   // Default for inactive
    } else if (currentCPU === 1) {
        // Highlight CPU 2's name
        document.querySelector('.player-score-title').style.color = 'rgb(150, 200, 238)' // Default for inactive
        document.querySelector('.cpu-score-title').style.color = 'rgb(150, 200, 238)'    // Default for inactive
        document.querySelector('.cpu2-score-title').style.color = 'rgb(255, 255, 255)'   // Bright white for active
    }
}
//#endregion

//#region END OF ROUND/GAME FUNCTIONS
const tallyPoints = (loserHand) => {
    let points = 0

    for (const card of loserHand) {
        points += card.points
    }

    if (loserHand === cpuHand) {
        cpuScore += points // CPU 1's score
    } else if (loserHand === cpu2Hand) {
        cpu2Score += points // CPU 2's score
    } else {
        playerScore += points // Player's score
    }
}

const updateScores = () => {
    // update cpuScoreDom
    cpuScoreDom.innerHTML = cpuScore
    if (cpuScore < gameOver / 2) cpuScoreDom.style.color = 'rgb(0, 140, 0)'
    else cpuScoreDom.style.color = 'rgb(121, 2, 2)'

    // Update CPU 2's score
    cpu2ScoreDom.innerHTML = cpu2Score
    if (cpu2Score < gameOver / 2) {
        cpu2ScoreDom.style.color = 'rgb(0, 140, 0)' // Green for below halfway
    } else {
        cpu2ScoreDom.style.color = 'rgb(121, 2, 2)' // Red for above halfway
    }

    // update playerScoreDom
    playerScoreDom.innerHTML = playerScore
    if (playerScore < gameOver / 2) playerScoreDom.style.color = 'rgb(0, 140, 0)'
    else playerScoreDom.style.color = 'rgb(121, 2, 2)'
}

const checkForWinner = () => {
    // check if that no one has lost
    if (playerScore < gameOver && cpuScore < gameOver && cpu2Score < gameOver) {
        // next round
        if (playerHand.length === 0) {
            winRoundFX.play()
            endRound(playerHand)
        }
        if (cpuHand.length === 0) {
            loseFX.play()
            endRound(cpuHand)
        }
        if (cpu2Hand.length === 0) {
            loseFX.play()
            endRound(cpu2Hand) // CPU 2 wins the round
        }
    }
        
    else {
        // game over
        endGame()
    }
}

const showCpuCards = () => {
    if (cpuHand.length >= 1) {
        cpuHandDom.innerHTML = ''
        for (let i = 0; i < cpuHand.length; i++) {
    
            const cpuCard = document.createElement('img')
            cpuCard.setAttribute('src', cpuHand[i].src)
            cpuCard.setAttribute('class', 'cpu')
            cpuHandDom.appendChild(cpuCard)
        }
    } 
    if (cpu2Hand.length >= 1) {
        cpu2HandDom.innerHTML = ''
        for (let i = 0; i < cpu2Hand.length; i++) {

            const cpu2Card = document.createElement('img')
            cpu2Card.setAttribute('src', cpu2Hand[i].src)
            cpu2Card.setAttribute('class', 'cpu2')
            cpu2HandDom.appendChild(cpu2Card)
        }
    }
}

const hideCpuCards = () => {
    if (cpuHand.length >= 1) {
        cpuHandDom.innerHTML = ''
        for (let i = 0; i < cpuHand.length; i++) {
    
            // turn the cards over
            const cpuCard = document.createElement('img')
            cpuCard.setAttribute('src', 'images/back.png')
            cpuCard.setAttribute('class', 'cpu')
            cpuHandDom.appendChild(cpuCard)
        }
    } 
    if (cpu2Hand.length >= 1) {
        cpu2HandDom.innerHTML = ''
        for (let i = 0; i < cpu2Hand.length; i++) {

            // Turn the cards over
            const cpu2Card = document.createElement('img')
            cpu2Card.setAttribute('src', 'images/back.png') // Card back image
            cpu2Card.setAttribute('class', 'cpu2') // Class for styling
            cpu2HandDom.appendChild(cpu2Card)
        }
    
}

const endRound = (winner) => {
    console.log('round over') // TODO: remove
    gameOn = false;
    playerTurn = !playerTurn

    if (cpuHand.length > 0) showCpuCards()
    if (cpu2Hand.length > 0) showCpuCards()

    const endOfroundDom = document.querySelector('.end-of-round')
    const roundDom = document.querySelector('.round')
    
    // show end of round element & format it based on who won
    endOfroundDom.classList.remove('hidden')
    if (winner === playerHand) {
        roundDom.textContent = 'You won the round!'
    } else if (winner === cpuHand) {
        roundDom.textContent = 'CPU 1 won the round...'
    } else if (winner === cpu2Hand) {
        roundDom.textContent = 'CPU 2 won the round...'
    }
    
    // hide end of round element after 2 seconds
    setTimeout(() => {
        endOfroundDom.classList.add('hidden')
        playerTurn = !playerTurn
        newHand()
        if (!playerTurn) 
            if (currentCPU === 0) {
                setTimeout(() => playCPU(), cpuDelay) // CPU 1's turn
            } else if (currentCPU === 1) {
                setTimeout(() => playCPU(), cpuDelay) // CPU 2's turn
            }  
    }, 3000)
}

const endGame = () => {
    console.log('game over') // TODO: remove
    gameOn = false;
    if (cpuHand.length > 0) showCpuCards()
    if (cpu2Hand.length > 0) showCpuCards()

    const endOfGameDom = document.querySelector('.end-of-game')
    const gameDom = document.querySelector('.game')

    // show end of game element & format based on winner
    endOfGameDom.classList.remove('hidden')

    if (playerScore >= gameOver) {
        loseFX.play()
        gameDom.textContent = 'You lost the game... Play again?'
    } else if (cpuScore >= gameOver) {
        loseFX.play()
        gameDom.textContent = 'CPU 1 won the game... Play again?'
    } else if (cpu2Score >= gameOver) {
        loseFX.play()
        gameDom.textContent = 'CPU 2 won the game... Play again?'
    } else {
        winGameFX.play()
        gameDom.textContent = 'You won the game! Play again?'
    }

    // add event listener to 'play again' button
    document.querySelector('.play-again').addEventListener('click', () => {
        playAgain.play()
        // hide end of game element on click
        endOfGameDom.classList.add('hidden')
        playerScore = 0
        cpuScore = 0
        cpu2Score = 0
        updateScores()
        playerTurn = !playerTurn
        newHand()
        if (!playerTurn) {
            if (currentCPU === 0) {
                setTimeout(() => playCPU(), cpuDelay) // CPU 1's turn
            } else if (currentCPU === 1) {
                setTimeout(() => playCPU(), cpuDelay) // CPU 2's turn
            }
        }
    })
}
//#endregion

//#region ////////CPU LOGIC////////
const letCpuDrawCards = () => {
    if (playPile[playPile.length - 1].drawValue > 0) {
        if (currentCPU === 0) {
            for (let i = 0; i < playPile[playPile.length - 1].drawValue; i++) {
                drawCard(cpuHand)
            }
        }
        // If it's CPU 2's turn, add cards to cpu2Hand
        else if (currentCPU === 1) {
            for (let i = 0; i < playPile[playPile.length - 1].drawValue; i++) {
                drawCard(cpu2Hand)
            }
        }
    }
}

const playCPU = () => {   
    if (!playerTurn && gameOn) {
        let currentHand
        let delay

        if (currentCPU === 0) {
            currentHand = cpuHand
            delay = cpuDelay
        }
        if (currentCPU === 1) {
            currentHand = cpu2Hand
            delay = cpu2Delay
        }

       console.log('CPU ' + (currentCPU + 1) + ' beginning turn')       
        
        // create temp array of playable cards based on last card played
        const playable = determinePlayableCards(currentHand)

        // if no playable cards
        if (playable.length === 0) {
            console.log('CPU ' + (currentCPU + 1) + ' has no cards to play') 
            // draw card
            drawCard(currentHand)
            // end turn
            setTimeout(() => {
                if (currentCPU === 0) {
                    currentCPU = 1 // Switch to CPU 2
                    setTimeout(() => playCPU(), cpu2Delay) // CPU 2 starts its turn
                } else if (currentCPU === 1) {
                    currentCPU = 0 // Switch back to the player
                    playerTurn = true // Indicate it's the player's turn
                }
            }, delay)
        }
        //if one playable card
        else if (playable.length === 1) {
            setTimeout(() => {
                playCPUCard(currentHand, playable[0]) // Play the single playable card
                console.log('CPU ' + (currentCPU + 1) + ' played a card') // Identify which CPU played the card
                if (currentCPU === 0) {
                    currentCPU = 1 // Switch to CPU 2
                    setTimeout(() => playCPU(), cpu2Delay) // CPU 2 starts its turn
                } else if (currentCPU === 1) {
                    currentCPU = 0 // Switch back to the player
                    playerTurn = true // Indicate it's the player's turn
                }
            }, delay)        
        // if more than one playable cards
        }
        else if (playable.length > 1) {
            console.log('CPU ' + (currentCPU + 1) + ' has ' + playable.length + ' playable cards')
            
            let chosenCard = runStrategist(playable)
            setTimeout((() => {
                playCPUCard(currentHand, chosenCard) // Play the chosen card
                console.log('CPU ' + (currentCPU + 1) + ' played a chosen card') // Identify which CPU played the chosen card
                if (currentCPU === 0) {
                    currentCPU = 1 // Switch to CPU 2
                    setTimeout(() => playCPU(), cpu2Delay) // CPU 2 starts its turn
                } else if (currentCPU === 1) {
                    currentCPU = 0 // Switch back to the player
                    playerTurn = true // Indicate it's the player's turn
                }
            }, delay)
        }
    }
//#region CPU SPECIFIC FUNCTIONS
    function determinePlayableCards() {
        const playableCards = []

        console.log('last card played:') // TODO: remove
        console.log(playPile[playPile.length - 1])

        for (let i = 0; i < currentHand.length; i++) {
            const card = currentHand[i] // The current card being checked
            const topCard = playPile[playPile.length - 1] // The top card of the playPile

            if (
                card.color === topCard.color || 
                card.value === topCard.value || 
                card.color === 'any' || 
                topCard.color === 'any'
            ) {
                const validCard = currentHand.splice(i, 1) // Remove the valid card from the hand
                playableCards.push(validCard[0]) // Add the valid card to the playable cards array
                i-- // Adjust the index after removing a card
            }
        }
        console.log('playable cards:')
        console.log(playableCards) // TODO: remove
        
        return playableCards
}
    
    function runStrategist(playable) {
        let cardIndex
        let chosenCard
            
        // run strategist to determine strategy
        let strategist = Math.random()
        console.log('strategist:', strategist) // TODO: remove
        const topCard = playPile[playPile.length - 1]
        const previousCard = playPile.length > 1 ? playPile[playPile.length - 2] : null
        // if strategist > 0.5 || playerHand <= 3
        if (playPile.length > 2 && (strategist > 0.7 || playerHand.length < 3 || currentHand.length > (playerHand.length * 2) || (topCard.playedByPlayer === true && topCard.drawValue > 0) || (previousCard && previousCard.playedByPlayer === true && topCard.drawValue > 0))) {
            // prioritize action/high point cards

            console.log('CPU ' + (currentCPU + 1) + ' chose high card')

            let highestValue = 0
            for (let i = 0; i < playable.length; i++){
                if (playable[i].value > highestValue) {
                    highestValue = playable[i].value
                    cardIndex = i
                }
            }

            // play card determined by strategist
            // remove card from playable
            chosenCard = playable.splice(cardIndex, 1)

            // return playable to cpuHand
            returnPlayablesToHand(playable, currentHand)
    }
        else {
            // else prioritize color || number cards
            console.log('CPU ' + (currentCPU + 1) + ' chose low card')
            let lowestValue = 14

            for (let i = 0; i < playable.length; i++){
                if (playable[i].value < lowestValue) {
                    lowestValue = playable[i].value
                    cardIndex = i
                }
            }

            // play card determined by strategist
            // remove card from playable
            chosenCard = playable.splice(cardIndex, 1)

            returnPlayablesToHand()           
        }

        console.log(chosenCard[0])  // TODO: remove
        return chosenCard[0]

        function returnPlayablesToHand() {
            if (playable.length > 0) {
                for (const card of playable) {
                    currentHand.push(card)
                }
            }
        }
    }

    function playCPUCard(chosenCard, currentHand, currentDom) {
        console.log('CPU ' + (currentCPU + 1) + ' playing card:')
        console.log(chosenCard)
        
        //animate random card from cpuHandDom
        const cpuDomCards = currentDom.childNodes
        cpuDomCards[Math.floor(Math.random() * cpuDomCards.length)].classList.add('cpu-play-card')
        console.log('Animating CPU ' + (currentCPU + 1) + ' card')
        pickPlayCardSound()
        // debugger
        
        setTimeout(() => {
            playPile.push(chosenCard)
            // update playPileDom
            updatePlayPileDom()

            // check if cpu played wild
            const topCard = playPile[playPile.length - 1]
            if (topCard.color === 'any' && topCard.drawValue === 0 && !topCard.playedByPlayer) {
                console.log('CPU ' + (currentCPU + 1) + ' played a wild card') // Log the wild card
                chooseColorAfterWild() // CPU chooses a color
            }

            // check cpuHand length and update cpuHandDom
            if (currentHand.length >= 1) {
                updateHand(currentHand) // Update the CPU's hand
                if (currentHand.length === 1) {
                    if (currentCPU === 0) {
                        showUno(cpuUno) // Show UNO for CPU 1
                    } else {
                        showUno(cpu2Uno) // Show UNO for CPU 2
                    }
                }
            // if end of round
            } else {
                updateHand(currentHand) // Update the hand to reflect the empty state
                setTimeout(() => {
                    tallyPoints(playerHand) // Tally points for the player
                    updateScores() // Update the scores
                    checkForWinner() // Check if the game is over
                }, 1200)
            }

            // if cpu played a draw card
            if (chosenCard.drawValue > 0) {
                // alert('cpu played a +' + chosenCard.drawValue + ' card!')
                console.log('CPU ' + (currentCPU + 1) + ' played a +' + chosenCard.drawValue + ' card!') // Log draw card
                hitWithDrawCard()
                setTimeout(() => {
                    for (let i = 0; i < chosenCard.drawValue; i++) {
                        drawCard(playerHand)
                    }
                    checkChangeTurn()
                },1000)
            }
            // else checkChangeTurn()
            else setTimeout(checkChangeTurn, 500)
        }, 500)
        

        function checkChangeTurn() {
            if (chosenCard.changeTurn) {
                // if changeTurn, playerTurn = true
                console.log('CPU ' + (currentCPU + 1) + ' has finished its turn')
                if (currentCPU === 0) {
                    currentCPU = 1 // Switch to CPU 2
                    setTimeout(() => playCPU(), cpu2Delay) // Start CPU 2's turn
                } else if (currentCPU === 1) {
                    currentCPU = 0 // Switch back to the player
                    playerTurn = true // Set player's turn to true
                    console.log('Switching to player turn') // Log transition to player
                }
            }
            else {
                // else cpuTurn() again
                console.log('cpu goes again') // TODO: remove
                if (currentCPU === 0) {
                    setTimeout(function () {
                        playCPU() // Continue CPU 1's turn
                    }, cpuDelay)
                } else if (currentCPU === 1) {
                    setTimeout(function () {
                        playCPU() // Continue CPU 2's turn
                    }, cpu2Delay)
                }
            }
        }
    }

    function chooseColorAfterWild() {
        console.log('CPU ' + (currentCPU + 1) + ' is picking a new color')
        const colors = ['rgb(255, 6, 0)', 'rgb(0, 170, 69)', 'rgb(0, 150, 224)', 'rgb(255, 222, 0)']
        const colorsInHand = [0, 0, 0, 0]

        // cpu checks how many of each color it has
        for (const card of currentHand) {
            if (card.color === colors[0]) colorsInHand[0]++
            if (card.color === colors[1]) colorsInHand[1]++
            if (card.color === colors[2]) colorsInHand[2]++
            if (card.color === colors[3]) colorsInHand[3]++
        }

        // find the index of the max value
        let indexOfMax = 0
        let maxCount = 0
        for (let i = 0; i < colorsInHand.length; i++) {
            if (colorsInHand[i] > maxCount) {
                maxCount = colorsInHand[i]
                indexOfMax = i
            }
        }

        // style the wild card and it's color
        const wildCardDom = playPileDom.childNodes[0]
        wildCardDom.style.border = '5px solid ' + colors[indexOfMax]
        wildCardDom.style.width = '105px'
        playPile[playPile.length - 1].color = colors[indexOfMax]
        console.log('CPU ' + (currentCPU + 1) + ' chose color: ' + colors[indexOfMax])
    }
    //#endregion
}

const hitWithDrawCard = () => {
    plusCardFX.play()
    playPileDom.classList.add('shout')
    setTimeout(() => {
        playPileDom.classList.remove('shout')
    }, 1000)
}
//#endregion

const playPlayerCard = (index) => {
    let cardToPlay = playerHand.splice(index, 1)
    cardToPlay[0].playedByPlayer = true
    playPile.push(cardToPlay[0])

    // clear the playPile
    updatePlayPileDom()
}

//#region ///////MAIN GAME FUNCTION////////
const startGame = () => {
    if (!preLoaded) {
        preLoadImgs()
        preLoaded = true
    } 

    playerScore = 0
    cpuScore = 0
    cpu2Score = 0

    listenForDevMode()
    setInterval(showTurnOnDom, 100)
    newHand()
    updateScores()

    if (!playerTurn) {
        if (currentCPU === 0) {
            setTimeout(() => playCPU(cpuHand, cpuHandDom, 0, cpuDelay), cpuDelay) // CPU 1's turn
        } else if (currentCPU === 1) {
            setTimeout(() => playCPU(cpu2Hand, cpu2HandDom, 1, cpu2Delay), cpu2Delay) // CPU 2's turn
        }
    }


    // set event listeners on playerHandDom and drawPileDom
    // playerHandDom
    playerHandDom.addEventListener('click', (event) => {
        if (playerTurn && !colorPickerIsOpen && event.target.getAttribute('id')) {

            const lastCardDom = playPileDom.childNodes[0]
            if (lastCardDom.style !== '100px') {
                lastCardDom.style.width = '100px'
                lastCardDom.style.border = 'none'
            }

            // use target's ID to find card object in array
            let index = parseInt(event.target.getAttribute('id'))
            
            // if value or color matches topOfPlayPile OR color = 'any'
            if (playerHand[index].value === playPile[playPile.length - 1].value || playerHand[index].color === playPile[playPile.length - 1].color || playerHand[index].color === 'any' || playPile[playPile.length - 1].color === 'any') {     
                
                // animate clicked card
                pickPlayCardSound()
                event.target.classList.add('play-card')
                console.log('you played', event.target) // TODO: remove

                setTimeout(() => {
                    // set topOfPlayPile to target.src
                    //topOfPlayPile.length = 0
                    playPlayerCard(index)


                    // invoke cpuTurn to add cards if there are any to add
                    letCpuDrawCards()
                    
                    // check playerHand length and update DOM
                    if (playerHand.length >= 1) {
                        updateHand(playerHand)
                        if (playerHand.length === 1) showUno(playerUno)
                    }
                    else {
                        updateHand(playerHand)
                        setTimeout(() => {
                            tallyPoints(currentCPU === 0 ? cpuHand : cpu2Hand)
                            updateScores()
                            checkForWinner()
                        }, 1200)
                    }

                    //check if wild
                    if (playPile[playPile.length - 1].color === 'any' && playPile[playPile.length - 1].drawValue === 0 && playPile[playPile.length - 1].playedByPlayer) {
                        // set new color
                        showColorPicker()
                        return
                    }

                    skipOrEndTurn();
                }, 1000)
                
            }
        }
    })
    
    let areYouSure = false

    drawPileDom.addEventListener('click', () => {
        if (playerTurn && !colorPickerIsOpen) {
            drawCard(playerHand)
            // playerTurn = false;
            // setTimeout(playCPU, cpuDelay)
            setTimeout(() => {
                playerTurn = false;
                if (currentCPU === 0) {
                    setTimeout(() => playCPU(cpuHand, cpuHandDom, 0, cpuDelay), cpuDelay) // CPU 1's turn
                } else if (currentCPU === 1) {
                    setTimeout(() => playCPU(cpu2Hand, cpu2HandDom, 1, cpu2Delay), cpu2Delay) // CPU 2's turn
                }
            }, 500)
        }
    })
}
//#endregion
let cpu1Visible = false // Visibility toggle for CPU 1
let cpu2Visible = false // Visibility toggle for CPU 2

const listenForDevMode = () => {
    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase()
        console.log(key)
        if (key === 'p') {
            playerTurn = true;
            console.log('forced playerTurn', playerTurn)
        }

        if (key === 'c') {
            // Draw a card for CPU 1
            drawCard(cpuHand)
            updateHand(cpuHand)
            console.log('Card drawn for CPU 1')
        }

        if (key === 'v') {
            // Draw a card for CPU 2
            drawCard(cpu2Hand)
            updateHand(cpu2Hand)
            console.log('Card drawn for CPU 2')
        }

        if (key === 'x') {
            playerHand.pop()
            updateHand(playerHand)
            console.log('Removed a card from playerHand')
        }

        if (key === 'z') {
            cpuHand.pop()
            updateHand(cpuHand)
            console.log('Removed a card from CPU 1')
        }

        if (key === 'b') {
            // Remove a card from CPU 2
            cpu2Hand.pop()
            updateHand(cpu2Hand) // Update CPU 2 DOM
            console.log('Removed a card from CPU 2')
        }

        if (key === 'w') {
            const wild = new Card('any', 13, 50, true, 0, 'images/wild13.png')
            playerHand.push(wild)
            updateHand(playerHand)
            console.log('Added a wild card to playerHand')
        }

        if (key === '4') {
            // Add a +4 wild card to the player's hand
            const wild4 = new Card('any', 14, 50, true, 4, 'images/wild14.png')
            playerHand.push(wild4)
            updateHand(playerHand)
            console.log('Added a +4 wild card to playerHand')
        }

        if (key === '=') {
            playerScore += 10
            updateScores()
            console.log('Added 10 points to playerScore')
        }

        if (key === 's') {
            // Toggle visibility for CPU 1
            cpu1Visible = !cpu1Visible
            if (cpu1Visible) {
                showCpuCards() // Ensure CPU 1's hand is visible
                console.log('CPU 1 cards are now visible')
            } else {
                hideCpuCards() // Hide CPU 1's hand
                console.log('CPU 1 cards are now hidden')
            }
        }

        if (key === 'd') {
            // Toggle visibility for CPU 2
            cpu2Visible = !cpu2Visible
            if (cpu2Visible) {
                showCpuCards() // Ensure CPU 2's hand is visible
                console.log('CPU 2 cards are now visible')
            } else {
                hideCpuCards() // Hide CPU 2's hand
                console.log('CPU 2 cards are now hidden')
            }
        }
    })
}

startGame()
