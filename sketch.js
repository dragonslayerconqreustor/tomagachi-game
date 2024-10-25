let buttons = [];
let barHeights = [120, 120, 120, 120]; 
let petY = 400;
let time = 0;
let lastHealthDecrease = 0;
let healthDecreaseInterval = 5; 
let eatSound, sleepSound, playSound, cleanSound;
let vineSound;   


let showControls = false;
let showKeyboardControls = false; 
// Add controller variables
let gamepad = null;
let lastButtonState = {};

//pet variables
let pet = {
  hunger: 100,
  energy: 100,
  happiness: 100,
  health: 100
};

// Add keyboard control variables
let keyboard = {
  isBoostKey: false,
  moveSpeed: 10
};

let backgroundImg;

let isSleeping = false;

let lastUpdate = 0;
const updateInterval = 1000;
const MAX_BAR_HEIGHT = 120;
let lastFoodDecrease = 0;
let foodDecreaseInterval = 5;
let lastEnergyDecrease = 0;
let energyDecreaseInterval = 10;
let lastHappinessDecrease = 0;
let happinessDecreaseInterval = 10;
let lastEnergyIncrease = 0;
const energyIncreaseInterval = 2; // Increase energy every 2 seconds while sleeping


const HAPPINESS_THRESHOLD = 30;
const SLEEPNESS_THRESHOLD = 20;
//ps5 cotnroler button variables
const PS5_BUTTONS = {
  CROSS: 0,
  CIRCLE: 1,
  SQUARE: 2,
  TRIANGLE: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  SHARE: 8,
  OPTIONS: 9,
  // Add any other buttons you need
};

  let lastActionTime = { eat: 0, sleep: 0, play: 0, clean: 0 };
  const actionCooldown = 2000; // 2 seconds in milliseconds
  //preloads the background img and sounds
  function preload() {
    backgroundImg = loadImage('swamp.jpg');
    eatSound = loadSound('eating-crunchy-food-asmr.mp3');
    sleepSound = loadSound('snore-mimimimimimi.mp3');

    vineSound = loadSound('vine-sound-1.mp3'); // Correctly load vine sound
  }




//setups everything that needs to be setup
function setup() {
  createCanvas(800, 800);
  userStartAudio();
  loadGame();
  createCustomButtons();  // This now includes the "Pause" button
  setupController();
  buttons
  for (let key in PS5_BUTTONS) {
    lastButtonState[PS5_BUTTONS[key]] = false;
  }

  window.addEventListener("keydown", handleKeyDown);



}
//function that setups the controler and detects if a cotnroler is connected
function setupController() {
  window.addEventListener("gamepadconnected", (event) => {
    console.log("Controller connected:", event.gamepad);
    gamepad = event.gamepad;
  });

  window.addEventListener("gamepaddisconnected", (event) => {
    console.log("Controller disconnected");
    gamepad = null;
  });
}
//the functiont hat handels the keyboard controles
function handleKeyDown(event) {

  if (event.key === 'Escape') {
    togglePause();
    return;
  }


  if (event.key === 'k' || event.key === 'K') {
    toggleControls();
    return;
  }

  
  if (!isPaused) {
    switch (event.key) {
      case 'e':
      case 'E':
        eatAction();
        break;
      case 'f':
      case 'F':
        sleepAction();
        break;
      case 'j':
      case 'J':
        playAction();
        break;
      case 'i':
      case 'I':
        cleanAction();
        break;
      default:
        console.log("Key not mapped:", event.key);
    }
  }
}

//draw function draws everything
function draw() {
  background(backgroundImg);
  

  

  checkControllerInput();
  
  updateBars();
  drawBars();
  drawPet();
  
 
  if (showControls) {
    drawInstructions();
  }


  drawStatusIndicators();
  
  saveGame();
}
//hides and shows cotnrolers whent he corisponded button is clicked
function toggleControls() {
  showControls = !showControls;

  if (!showControls) {
    showKeyboardControls = false;
  }
}



//creats a semi transparent cotnrole list based on the used device wil change to cotnroelr when a controler inpute is detected
function drawInstructions() {
  
  fill(0, 0, 0, 180);
  rect(10, height - 280, width - 20, 260, 10);
  
  fill(255);
  textSize(16);
  textAlign(LEFT);
  let startY = height - 260;
  let centerX = width / 2 - 150;  
  if (gamepad && !showKeyboardControls) {
    // Controller controls
    text("Controller Controls:", centerX, startY);
    text("× (Cross) - Eat", centerX, startY + 20);
    text("○ (Circle) - Sleep", centerX, startY + 40);
    text("□ (Square) - Play", centerX, startY + 60);
    text("△ (Triangle) - Clean", centerX, startY + 80);
    text("Options - Pause/Resume", centerX, startY + 180);
    text("Press 'Controls' button to hide", centerX, startY + 200);
  } else {
    // Keyboard controls
    text("Keyboard Controls:", centerX, startY);
    text("E - Eat", centerX, startY + 20);
    text("F - Sleep", centerX, startY + 40);
    text("J - Play", centerX, startY + 60);
    text("I - Clean", centerX, startY + 80);
    text("Esc - Pause/Resume", centerX, startY + 180);
    text("Press 'Controls' button or K to hide", centerX, startY + 200);
  }
}

//checks the buttons that have been pressed on ps5 controler
function checkButton(buttonIndex, action, buttonName) {
  if (!gamepad || !gamepad.buttons || !gamepad.buttons[buttonIndex]) return;
  
  const button = gamepad.buttons[buttonIndex];
  const isPressed = button.pressed;
  
 
  if (isPressed && !lastButtonState[buttonIndex]) {
    console.log(`${buttonName} button pressed!`);
    action();
  }
  
  // Update last button state
  lastButtonState[buttonIndex] = isPressed;
}
//checks the controler inputed of ps5 controler
function checkControllerInput() {
  const gamepads = navigator.getGamepads();
  if (!gamepads[0]) return;
  
  gamepad = gamepads[0];
  
  
  checkButton(PS5_BUTTONS.OPTIONS, togglePause, "Options");
  checkButton(PS5_BUTTONS.SHARE, toggleControls, "Share");
  
  
  if (!isPaused) {
    checkButton(PS5_BUTTONS.CROSS, eatAction, "Cross/X");
    checkButton(PS5_BUTTONS.CIRCLE, sleepAction, "Circle");
    checkButton(PS5_BUTTONS.SQUARE, playAction, "Square");
    checkButton(PS5_BUTTONS.TRIANGLE, cleanAction, "Triangle");
  }
}
//when pause is pressed this pauses the game
let isPaused = false;

function togglePause() {
  isPaused = !isPaused;

  // When paused, stop all automatic decreases
  if (isPaused) {
    healthDecreaseInterval = Infinity;
    foodDecreaseInterval = Infinity;
    energyDecreaseInterval = Infinity;
    happinessDecreaseInterval = Infinity;
  } else {
    // Restores normal decrease intervals when unpaused
    healthDecreaseInterval = 5;
    foodDecreaseInterval = 5;
    energyDecreaseInterval = 10;
    happinessDecreaseInterval = 10;
  }
  
 
  console.log("Game is now " + (isPaused ? "paused" : "running"));
}
//updates the bars with the stats the actions do
function updateBars() {
  let currentTime = millis();

  if (!isSleeping) {
    if (currentTime - lastHealthDecrease > healthDecreaseInterval * 1000) {
      barHeights[3] = max(barHeights[3] - 4, 0);
      lastHealthDecrease = currentTime;

      // Check if health is zero and play the vine sound
      if (barHeights[3] <= 0 && !vineSound.isPlaying()) {
        vineSound.play();
      }
    }
  }
  if (!isSleeping) {
    // Normal decreases when not sleeping
    if (currentTime - lastHealthDecrease > healthDecreaseInterval * 1000) {
      barHeights[3] = max(barHeights[3] - 4, 0);
      lastHealthDecrease = currentTime;
    }
    if (currentTime - lastFoodDecrease > foodDecreaseInterval * 1000) {
      barHeights[0] = max(barHeights[0] - 4, 0);
      lastFoodDecrease = currentTime;
    }
    if (currentTime - lastEnergyDecrease > energyDecreaseInterval * 1000) {
      barHeights[1] = max(barHeights[1] - 4, 0);
      lastEnergyDecrease = currentTime;
    }
    if (currentTime - lastHappinessDecrease > happinessDecreaseInterval * 1000) {
      barHeights[2] = max(barHeights[2] - 4, 0);
      lastHappinessDecrease = currentTime;
    }
 

  } else {
    // When sleeping, only increase energy
    if (currentTime - lastEnergyIncrease > energyIncreaseInterval * 1000) {
      barHeights[1] = min(barHeights[1] + 5, MAX_BAR_HEIGHT);
      lastEnergyIncrease = currentTime;
    }
  }
}

//creats the buttons
  function createCustomButtons() {
    let buttonNames = ['Eat', 'Sleep', 'Play', 'Clean', 'Controls', 'Pause'];  // Added 'Pause' button
    let buttonActions = [eatAction, sleepAction, playAction, cleanAction, toggleControls, togglePause];  // Added 'togglePause' action for Pause button
    let buttonWidth = 100;
    let buttonHeight = 50;
    let buttonSpacing = 10;
    let startX = 100;
    let startY = 30;
  
    for (let i = 0; i < buttonNames.length; i++) {
      let btn = createButton(buttonNames[i]);
      btn.position(startX + i * (buttonWidth + buttonSpacing), startY);
      btn.size(buttonWidth, buttonHeight);
      btn.style('font-size', '24px');
      btn.style('background-color', 'rgba(255, 255, 255, 0.8)');
      btn.style('border-radius', '20px');
      btn.mousePressed(buttonActions[i]);  // Links each button to its corresponding action
      btn.mouseOver(() => btn.style('background-color', 'rgba(255, 255, 255, 0.4)'));
      btn.mouseOut(() => btn.style('background-color', 'rgba(255, 255, 255, 0.8)'));
      buttons.push(btn);
    }
  }
  //draws the vbars and handels the actions
  function drawBars() {
    textSize(32);
    let colors = ["green", "yellow", "red", "orange"];
    let labels = ["Food", "Energy", "Happiness", "Health"];
    let barWidth = 120;
    let barHeight = 20;
    let startX = 20;
    let startY = 180;
    let spacing = 40;
  
    for (let i = 0; i < 4; i++) {
      fill(200);
      rect(startX, startY + i * spacing, barWidth, barHeight);
  
      fill(colors[i]);
      let currentWidth = map(barHeights[i], 0, MAX_BAR_HEIGHT, 0, barWidth);
      rect(startX, startY + i * spacing, currentWidth, barHeight);
  
      fill(255);
      textAlign(LEFT, CENTER);
      text(labels[i], startX + barWidth + 10, startY + i * spacing + barHeight / 2);
    }
  }
//draws the frames of the pet
function drawPet() {
  strokeWeight(0);
  let pixelColors;
  
  const HUNGER_THRESHOLD = 30;

  if (isSleeping) {
    // Sleeping face with closed eyes and peaceful expression
    pixelColors = [
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2],
      [2,2,2,1,0,0,0,0,0,0,0,1,2,2,2],
      [2,2,1,0,0,0,0,0,0,0,0,0,1,2,2],
      [2,1,0,0,1,1,0,0,1,1,0,0,0,1,2],
      [2,1,0,0,1,1,0,0,1,1,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,0,1,1,1,1,1,0,0,0,1,2],
      [2,1,1,0,0,0,0,0,0,0,0,0,1,1,2],
      [2,2,1,1,0,0,0,0,0,0,0,1,1,2,2],
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2]
    ];

    // Draw Zzz above the pet's head when he is in sleep action
    fill(0);
    textSize(32);
    textStyle(BOLD);
    text("z", 450, 260);
    textSize(24);
    text("z", 430, 240);
    textSize(16);
    text("z", 410, 220);
    textStyle(NORMAL);

  } else if (barHeights[0] <= HUNGER_THRESHOLD) {
    // Hungry face
    pixelColors = [
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2],
      [2,2,2,1,0,0,0,0,0,0,0,1,2,2,2],
      [2,2,1,0,0,0,0,0,0,0,0,0,1,2,2],
      [2,1,0,0,0,1,0,0,0,1,0,0,0,1,2],
      [2,1,0,0,1,1,0,0,1,1,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,1,0,0,0,0,0,1,0,0,1,2],
      [2,1,0,0,0,1,1,4,1,1,0,0,0,1,2],
      [2,1,1,0,0,0,0,0,0,0,0,0,1,1,2],
      [2,2,1,1,0,0,0,0,0,0,0,1,1,2,2],
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2]
    ];
  } else if (barHeights[2] <= HAPPINESS_THRESHOLD) {
    // Sad/angry face
    pixelColors = [
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2],
      [2,2,2,1,3,3,3,3,3,3,3,1,2,2,2],
      [2,2,1,3,1,1,3,3,3,1,1,3,1,2,2],
      [2,1,3,3,3,1,1,3,1,1,3,3,3,1,2],
      [2,1,3,3,3,3,3,3,3,3,3,3,3,1,2],
      [2,1,3,3,3,3,3,3,3,3,3,3,3,1,2],
      [2,1,3,3,3,1,1,1,1,1,3,3,3,1,2],
      [2,1,3,3,1,3,3,3,3,3,1,3,3,1,2],
      [2,1,1,3,3,3,3,3,3,3,3,3,1,1,2],
      [2,2,1,1,3,3,3,3,3,3,3,1,1,2,2],
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2]
    ];
  } else if (barHeights[1] <= SLEEPNESS_THRESHOLD) {
    // Sleepy face (before sleeping)
    pixelColors = [
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2],
      [2,2,2,1,0,0,0,0,0,0,0,1,2,2,2],
      [2,2,1,0,0,0,0,0,0,0,0,0,1,2,2],
      [2,1,0,0,1,1,0,0,1,1,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,0,1,1,1,1,1,0,0,0,1,2],
      [2,1,1,0,0,0,0,0,0,0,0,0,1,1,2],
      [2,2,1,1,0,0,0,0,0,0,0,1,1,2,2],
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2]
    ];
  } else {
    // Normal happy face
    pixelColors = [
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2],
      [2,2,2,1,0,0,0,0,0,0,0,1,2,2,2],
      [2,2,1,0,0,0,0,0,0,0,0,0,1,2,2],
      [2,1,0,0,0,1,0,0,0,1,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,0,0,0,0,0,0,0,0,0,1,2],
      [2,1,0,0,1,0,0,0,0,0,1,0,0,1,2],
      [2,1,0,0,0,1,1,1,1,1,0,0,0,1,2],
      [2,1,1,0,0,0,0,0,0,0,0,0,1,1,2],
      [2,2,1,1,0,0,0,0,0,0,0,1,1,2,2],
      [2,2,2,2,1,1,1,1,1,1,1,2,2,2,2]
    ];
  }
//the colour pallet for the pixel art
  let colorPalette = [
    color(188, 233, 84),  // Green
    color(0, 0, 0),       // Black
    color(0, 0, 255, 0),  // Semi-transparent blue
    color(255, 58, 60),   // Red (for angry face)
    color(255, 165, 0)    // Orange (for hungry mouth)
  ];

  drawImage(pixelColors, colorPalette);

  //for loop for my pixel art
}
function drawImage(image, palette, startX = 350, startY = 300) {
  for (let y = 0; y < image.length; y++) {
    for (let x = 0; x < image[y].length; x++) {
      fill(palette[image[y][x]]);
      rect(startX + (x * 10), startY + (y * 10), 10, 10);
    }
  }
}

//eat action increases food and health
function eatAction() {
  let currentTime = millis();
  if (!isPaused && !isSleeping && currentTime - lastActionTime.eat > actionCooldown) {
    eatSound.play();
    barHeights[0] = min(barHeights[0] + 20, MAX_BAR_HEIGHT); // Food
    barHeights[3] = min(barHeights[3] + 20, MAX_BAR_HEIGHT); // Health gain from eating
    lastActionTime.eat = currentTime;
    saveGame();
  }
}
//sleepaction toggels into sleep wish plays sound affect and then increases energy
function sleepAction() {
  if (!isPaused) {
    isSleeping = !isSleeping; // Toggle sleep mode

    if (isSleeping) {
      sleepSound.loop(); // Start looping the sleep sound
      lastEnergyIncrease = millis(); // Reset the energy increase timer
    } else {
      sleepSound.stop(); // Stop the sleep sound when exiting sleep mode
    }

    saveGame(); // Save the game state
  }
}
//playaction increases happiness
function playAction() {
  if (millis() - lastActionTime.play < actionCooldown) return;
  
  barHeights[2] = min(barHeights[2] + 20, MAX_BAR_HEIGHT);
  if (playSound && playSound.isLoaded()) {
    playSound.play();
  }
  lastActionTime.play = millis();
}

//cleanaction increases happiness and health
function cleanAction() {
  if (millis() - lastActionTime.clean < actionCooldown) return;
  
 
  barHeights[3] = min(barHeights[3] + 15, MAX_BAR_HEIGHT);
  
  
  barHeights[2] = min(barHeights[2] + 10, MAX_BAR_HEIGHT);
  
  
  if (cleanSound && cleanSound.isLoaded()) {
    cleanSound.play();
  } else {
    console.log("Clean action performed!");
  }
  
  lastActionTime.clean = millis();
}

function drawStatusIndicators() {
  if (isPaused) {
    fill(255, 0, 0);
    textSize(52);
    text("PAUSED", width / 2 - 50, height / 2);
  }
  if (isSleeping) {
    fill(0, 0, 255);
    textSize(52);
    text("SLEEPING", width / 2 - 70, height / 1 - 260);
  }
}
//togglesleep when sleep action is triggered
function toggleSleep() {
  isSleeping = !isSleeping;
  
  if (isSleeping) {
    sleepSound.loop();
  } else {
    sleepSound.stop();
  }

  saveGame();
}
//place where game data is saved
function saveGame() {
  localStorage.setItem('barHeights', JSON.stringify(barHeights));
  localStorage.setItem('petData', JSON.stringify(pet));
  localStorage.setItem('isSleeping', JSON.stringify(isSleeping));
}
//loads the game save data
function loadGame() {
  let savedPet = localStorage.getItem('petData');
  let savedSleepState = localStorage.getItem('isSleeping');
  let savedBarHeights = localStorage.getItem('barHeights');
  
  if (savedPet) {
    pet = JSON.parse(savedPet);
  }
  
  if (savedSleepState) {
    isSleeping = JSON.parse(savedSleepState);
  }
  
  if (savedBarHeights) {
    barHeights = JSON.parse(savedBarHeights);
  }
}