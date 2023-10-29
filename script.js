let DetectionRules = {}; // Define DetectionRules as a global variable
let cocoSsdModel; // Declare cocoSsdModel as a global variable
let detectedAreas;  // Initialize the variable
let predictions;  // Initialize the predictions variable at a global scope

// Event listener to start the system when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const getStartedButton = document.querySelector('.get-started-button');

    getStartedButton.addEventListener('click', () => {
        console.log('Button clicked. Requesting camera access...');
        requestCameraAccess();  // Add this function to handle camera access
    });
});

/// Define videoElement
const videoElement = document.getElementById('video-feed');
console.log('Video feed is showing');

// Event listener to start detection when video is loaded
videoElement.addEventListener('loadeddata', async () => {
    console.log('Detection begins as soon as video is loaded ');

    // Ensure videoElement is defined and ready
    if (!videoElement) {
        console.error('Video element not defined.');
        return;
    }

    // Play the video and start object detection
    console.log('Video is playing and object detection is taking place ');
    videoElement.play();
    await detectObjects();
});


function displayErrorMessageToUser(message) {
    // You can customize this function to display the error message to the user
    console.error('Error:', message);
}

async function loadCocoSsdModel() {
    let classIndexMap;  // Declare classIndexMap

    try {
        console.log('Loading the model...');
        cocoSsdModel = await cocoSsd.load('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd');

        if (cocoSsdModel) {
            console.log('Coco-SSD model loaded successfully.');

            const classes = ['chair', 'painting', 'banner', 'sofa', 'door', 'stand', 'desk', 'machine', 'cupboard'];

            console.log('Classes:', classes);

            classIndexMap = {};
            classes.forEach((className, index) => {
                classIndexMap[className] = index;
            });

            detectedAreas = await detectObjects();  // Assuming detectObjects() returns a Promise that resolves to the detected areas

           loadModelAndStartSystem(); // Call loadModelAndStartSystem after the model is loaded and detectedAreas is initialized
        } else {
            throw new Error('Error: COCO-SSD model did not provide valid classes.');
        }
    } catch (error) {
        console.error('Error loading the object detection model:', error);
        displayErrorMessageToUser('Failed to load the object detection model. Please try again later.');
    }
}

//loadCocoSsdModel(); // Call the async function to load the Coco-SSD model


// Existing code block
document.getElementById('get-started-button').addEventListener('click', async () => {
    try {
        const container = document.getElementById('camera-feed-container');
        const videoDevices = await navigator.mediaDevices.enumerateDevices();

        if (videoDevices.length > 0) {
            // Choose the back camera if available, or the first camera if not
            let videoDevice = videoDevices.find((device) => device.kind === 'videoinput' && device.label.includes('back')) || videoDevices.find((device) => device.kind === 'videoinput');

            if (!videoDevice) {
                console.error('No video devices found.');
            } else {
                console.log('Accessing the camera...');
                let stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDevice.deviceId } });

                // Create the video element and set its display style to "block"
                let videoElement = document.createElement('video');
                videoElement.id = 'video-feed';
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
                videoElement.style.display = 'block'; // Show the video element
                videoElement.autoplay = true;
                container.appendChild(videoElement);
                videoElement.srcObject = stream;
                videoElement.parentNode.style.display = 'block'; // Show the container
                setupCamera();
                document.getElementById('get-started-button').style.display = 'none'; // Hide the button
            }
        } else {
            console.error('No cameras found.');
        }
    } catch (error) {
        console.error('Error accessing the camera:', error);
        // Handle the error, e.g., display an error message to the user
    }
});


function initializeDetectionRules() {
  // Initialize DetectionRules based on your predictions logic
  DetectionRules = {
 'Entrance Area': [
    { label: 'African Tribal Painting', score: 0.5 },
    { label: 'Metal Wall Decoration', score: 0.5 },
    {label:  'Wooden Reception Desk', score: 0.5 },
  ],

  'Customer Information Service': [
    { label: 'Customer Information Service on an A4 poster Stainless steel stand', score: 0.5},
    { label: 'Black Chair With Wheels', score: 0.5 },
    { label: 'City Scape Painting', score: 0.5 },
  ],

  'Relationship Desk': [
    { label: 'Black Swivel Chair', score: 0.5},
    { label: 'Black Leather Sofas', score: 0.5 },
    { label: 'Tambour Cupboard', score: 0.5 },
  ],

'Lobby Area': [
  { label: 'ATM Machine Mounted On the Wall', score: 0.5},
  { label: 'Proudly African Banner', score: 0.5 },
  { label: 'It\'s Banking, Only Easier Banner', score: 0.5 },
  { label: 'Revolving Doors', score: 0.5},
  { label: 'Kinara Account Banners', score: 0.5 },
],
    
  'Operations Area': [
    { label: 'Please Wait Here Metal Stand', score: 0.5},
    { label: 'Jibakishie Banner', score: 0.5 },
    { label: 'Person Behind Wooden Reception Desk', score: 0.5 },
    { label: 'Orange Wall with Flower Pot', score: 0.5},

  ],

  'hni Area': [
    { label: 'Abstract Painting', score: 0.5},
    { label: 'Seaside Bridge Painting', score: 0.5 },
    { label: 'Metal Decorative Grill', score: 0.5 },
  ],
};
}

function detectAreas(predictionsArray, DetectionRules) {
    const areas = [];

    for (const area in DetectionRules) {
        const rules = DetectionRules[area];

        // Check if all rules for this area are satisfied
        const areaDetected = rules.every(rule => {
            // Check if cocoSsdModel and classIndex are defined
            if (cocoSsdModel && cocoSsdModel.classIndex) {
                const labelIndex = cocoSsdModel.classIndex[rule.label];
                if (predictionsArray[labelIndex]) {
                    const confidence = predictionsArray[labelIndex].score;
                    return confidence >= rule.minConfidence;
                }
            }
            return false;
        });

        if (areaDetected) {
            areas.push({
                area: area,
                description: getDescriptionForArea(area),
                benefits: getBenefitsForArea(area),
            });
        }
    }

    console.log('Detected Areas:', areas); // For testing

    return areas;
}

// Call the function to initialize DetectionRules
initializeDetectionRules();
console.log('Initializing DetectionRules');

// Call the detectAreas function with predictions and DetectionRules as arguments
const areasDetected = detectAreas(predictions, DetectionRules);
console.log('Detected Areas:', areasDetected);

// Event listener to start detection when video is loaded
videoElement.addEventListener("loadeddata", async () => {
  // Play the video and start object detection
  videoElement.play();
  // Call detectObjects and set predictions
  predictions = await detectObjects();
  console.log('Predictions set:', predictions);

  // Now that predictions are set, call detectAreas
  callDetectAreas();
});

// Function to call detectAreas if predictions is defined
async function callDetectAreas() {
  // Usage of detectAreas
  console.log('Starting area detection...');
  try {
    // Call detectAreas if predictions is defined
    if (predictions) {
      const detectedAreasResult = await detectAreas(predictions);
      console.log('Detected Areas:', detectedAreasResult);
    } else {
      console.error('Predictions not available.');
    }
  } catch (error) {
    console.error('Error detecting areas:', error);
  }
}

// Event listener to start detection when video is loaded
videoElement.addEventListener("loadeddata", async () => {
  // Play the video and start object detection
  videoElement.play();
  predictions = await detectObjects();
  console.log('Predictions set:', predictions);

  // Now that predictions are set, call detectAreas
  console.log('Starting area detection...');
  try {
    // Call detectAreas if predictions is defined
    if (predictions) {
      const detectedAreasResult = await detectAreas(predictions);
      console.log('Detected Areas:', detectedAreasResult);
    } else {
      console.error('Predictions not available.');
    }
  } catch (error) {
    console.error('Error detecting areas:', error);
  }
});

// Define the function to update the detected areas display
function updateDetectedAreasDisplay(areas) {
  // Implement the logic to update the detected areas display
  // For example:
  console.log('Updating detected areas display with:', areas);
}

let detectedAreasResult = [];  // Define detectedAreasResult as an empty array

// Now you can use the detectedAreasResult array in your code as needed
if (detectedAreasResult.length > 0) {
  detectedAreasResult.forEach(area => {
    // Process the area information as needed
  });

  // Call the function to update the detected areas display
  updateDetectedAreasDisplay(detectedAreasResult);
} else {
  console.error('No detected areas.');
}

// Call the function to update the detected areas display
updateDetectedAreasDisplay(detectedAreasResult);

// Define a function to get area information (description and benefits)
console.log('Retrieve Description and Benefits for Areas');  
function getDescriptionAndBenefitsForArea(areaName) {
    let areaInfo = {
        description: '',
        benefits: []
    };

    // Retrieve description and benefits based on the area name
    switch (areaName) {
        case 'Lobby Area':
            areaInfo.description = "Welcome to GTBank Tanzania, You are currently at the Bank's Lobby Area which is your first point of contact as you enter the bank.";
            areaInfo.benefits.push("This is where convenience meets knowledge. Here, you'll find ATMs for quick transactions and user-friendly tariff guides to help you navigate our services. It's your gateway to easy and informed banking.");
            break;

        case 'Relationship Desk':
            areaInfo.description = "You are now at the relationship desk, a welcoming space where you can sit down with your dedicated account officer to discuss the well-being of your accounts and explore the intricate details of your financial journey. Here, we cherish the art of personalized banking, tailoring our services to your unique aspirations and needs.";
            areaInfo.benefits.push("It's a welcoming space where you can sit down with your dedicated account officer to discuss the well-being of your accounts and explore the intricate details of your financial journey. Here, we cherish the art of personalized banking, tailoring our services to your unique aspirations and needs.");
            break;

        case 'Operations Area':
            areaInfo.description = "You are now at the Operations area, This is the heart of our banking center, where your financial actions come to life. It's where you interact with your money, whether you're putting it in, taking it out, or making it work for you.";
            areaInfo.benefits.push("It's where you can make deposits, withdrawals, handle foreign operations, and securely send and receive money globally through trusted services like Western Union, MoneyGram, and RIA Money Transfer. Your financial needs, both near and far, are well within reach here.");
            break;

        case 'Customer Information Service':
            areaInfo.description = "You are now at the Customer Information Service; a designated area where you can access information and assistance regarding their accounts as well as general banking queries.";
            areaInfo.benefits.push("The Customer Information Service area is your starting point for effortless banking solutions. It's a welcoming haven where you can seamlessly open accounts, obtain your banking card, reactivate dormant accounts, set up standing orders, and tailor your iBank profile.");
            break;

        case 'Entrance Area':
            areaInfo.description = "You've arrived at GTBank Tanzania, and this is our welcoming entrance area.";
            areaInfo.benefits.push("At the entrance area, a welcoming personnel awaits to receive you, marking the starting point of your journey. Here, your banking experience begins.");
            break;

        case 'Staircase Area':
            areaInfo.description = "You are about to go up the stairs.";
            areaInfo.benefits.push("This staircase is a gateway to personalized banking. To the left, it leads to the Customer Information Service area, a hub of information and assistance. To the right, it opens the door to the Relationship Desk area, where tailored financial guidance awaits. It's a path of options, each step revealing a distinct facet of your banking experience.");
            break;

        case 'hni Area':
            areaInfo.description = "You are now at the HNI Banking area, an exclusive space, meticulously designed to cater to your distinctive financial needs with sophistication and tailored care that stands above the rest.";
            areaInfo.benefits.push("Enjoy a dedicated relationship manager, access to exclusive opportunities, and a seamless banking experience that aligns with your unique goals, all while surrounded by an atmosphere of sophistication and discretion.");
            break;

        default:
            areaInfo.description = 'Default description for the area.';
            areaInfo.benefits.push('Default benefit 1 for the area');
            areaInfo.benefits.push('Default benefit 2 for the area');
    }
      
    console.log('Returning Information for the detected areas');  //
    return areaInfo;
}

// Now, let's add the code for each area using the getDescriptionAndBenefitsForArea function

const areas = ['Lobby Area', 'Relationship Desk', 'Operations Area', 'Customer Information Service', 'Entrance Area', 'Staircase Area', 'hni Area'];
areas.forEach(areaName => {
    console.log(`Processing area: ${areaName}`);
    const area = detectedAreas ? detectedAreas.find(area => area.area === areaName) : undefined;
    if (area) {
        const areaInfoDiv = document.getElementById(`${areaName.replace(' ', '')}Info`);
        console.log(`Updating HTML for area: ${areaName}`);
        areaInfoDiv.querySelector("h1").textContent = area.area;
        const descriptionAndBenefits = getDescriptionAndBenefitsForArea(areaName);
        areaInfoDiv.querySelector("p").textContent = descriptionAndBenefits.description;
        console.log(`Updated HTML for area: ${areaName}`);
        textToSpeech(descriptionAndBenefits.description);
        console.log(`Speech initiated for area: ${areaName}`);
    } else {
        console.log(`Area not found: ${areaName}`);
    }
});


/*document.getElementById('get-started-button').addEventListener('click', () => {
    console.log('Button clicked. System launching...');
    console.log('Starting area detection...');
    detectAreas(predictions); // Call your area detection function here
});*/
 
console.log('Loading the model...');
async function loadModelAndStartSystem() {
  try {
    // Load the COCO-SSD model
    cocoSsdModel = await cocoSsd.load('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd');
    console.log('Model loaded successfully.');

    // Call the function to start the system after the model is loaded
    //loadModelAndStartSystem();
  } catch (error) {
    // Handle the error if model loading fails
    console.error('Error loading the object detection model:', error);
    displayErrorMessageToUser('Failed to load the object detection model. Please try again later.');
  }
}

// Call the async function to load the model and start the system
console.log('Loading the model and starting the system...');
//loadModelAndStartSystem();

console.log('Commence Object Detection.');

async function detectObjectsFromCanvas(canvas, ctx) {
  return new Promise(async (resolve, reject) => {
    if (!cocoSsdModel) {
      reject('Model not loaded yet.');
    }

    try {
      const detectedAreas = await detectObjects();  // Assuming detectObjects() returns the detected areas
      resolve(detectedAreas);  // Resolve the detected areas
    } catch (error) {
      reject(error);
    }
  });
}

const canvas = document.getElementById('CanvasId');

if (!canvas) {
  console.error('Canvas element not found.');
} else {
  // Obtain the 2D drawing context
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to obtain 2D drawing context.');
  } else {
    console.log('Getting data for the image.');

    // Clear the canvas and draw video feed
    console.log('Clearing canvas and drawing video feed...');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0);

    // Capture image data
    console.log('Capturing image data...');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Define tensor here
    const tensor = tf.browser.fromPixels(imgData).expandDims();

    // Define startObjectDetection function
    async function startObjectDetection(tensor, ctx) {
      try {
        // Assuming detectObjects is a function that takes tensor as an argument
        const predictions = await detectObjects(tensor, ctx);
        console.log('Predictions:', predictions);
      } catch (error) {
        console.error('Error in object detection:', error);
      }
    }

    // Call the async function to start object detection
    startObjectDetection(tensor, ctx);

    // Call your updated area detection function here
    console.log('Objects detected. Calling the area detection function.');
    detectAreas(tensor);

    // Call the function to detect objects and pass the canvas and context
    requestAnimationFrame(() => detectObjects(canvas, ctx));
  }
}

console.log('Starting object detection...');


console.log('Commence Image Processing .');
async function processImage() {
  // Assuming canvas and ctx are properly defined
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tensor = tf.browser.fromPixels(imgData).expandDims();

  try {
    const predictions = await detectObjects(tensor); // Call the new detectObjects function
    console.log('Predictions:', predictions);

    // Call your area detection function here
    console.log('Calling function for the detectAreas.');
    detectAreas(predictions);
  } catch (error) {
    console.error('Error detecting objects:', error);
  }

  requestAnimationFrame(() => processImage());
}

console.log('Process predictions obatined frrom COCO- SSD');
// Function to process predictions from COCO-SSD
async function processPredictions(predictions) {
  const predictionsArray = predictions.map(prediction => prediction.score);

console.log('Area detection in progress');
  // Call your area detection function here
  detectAreas(predictions);

  // Handle the detected areas
  handleDetectedAreas(predictionsArray);
console.log('Handling of the areas detected'); 

  // Continue video frame processing or rendering as needed...
}



async function detectObjects() {
const canvas = document.getElementById('CanvasId');
  const ctx = canvas.getContext('2d'); // Define ctx here

  // Ensure ctx is defined
  if (!ctx) {
    console.error('Canvas 2D context not found.');
    return;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the video frame on the canvas
  ctx.drawImage(videoElement, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  console.log('Getting The Image Data');

  const tensor = tf.browser.fromPixels(imgData).expandDims();
console.log('Creating Tensor from the image data obtained');

// Call your area detection function here
detectedAreas = detectAreas(tensor);
}

function clearCanvas() {
  const canvas = document.getElementById('CanvasId'); // Replace with your actual canvas ID
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Call this function whenever you want to clear the canvas
clearCanvas();


// Event listener to start detection when video is loaded
videoElement.addEventListener('loadeddata', async () => {
  // Play the video and start object detection
  videoElement.play();

  // Call detectObjects and set predictions
  await detectObjects();

  // Process the predictions
  console.log('Predictions Processing In Progress');
  processPredictions(predictions);

  if (detectedAreas.length > 0) {
    const detectedArea = detectedAreas[0]; // Assuming you want to use the first detected area
    const areaInfoDiv = document.getElementById("areaInfo");
    areaInfoDiv.querySelector("h1").textContent = detectedArea.area;
    areaInfoDiv.querySelector("p").textContent = detectedArea.description;
    // Call the text-to-speech function here if needed
  }
});


console.log('Fetching JSON data from the given URL');
fetch('https://raw.githubusercontent.com/GTBank2023/navigatorI/main/marker_data%20(1).json')
  .then(response => {
    console.log('Response received.');
    return response.json();
  })
  .then(data => {
    console.log('Processed marker images data:', data);
    // Process the JSON data here (you'll need to define how to use the data)
  })
  .catch(error => {
    console.error('Error:', error);
  });

console.log('Commence the Detection'); 
function startDetection() {
  // Ensure videoElement is defined and ready
  if (!videoElement) {
    console.error('Video element not defined.');
    return;
  }
console.log('Commence the Object detection as video plays'); 
  // Play the video and start object detection
  videoElement.play().then(() => {
    detectObjects();
  }).catch(error => {
    console.error('Error playing video:', error);
  });
}

// Event listener to start detection when video is loaded
console.log('Begin Detection when the video is loaded'); 
videoElement.addEventListener("loadeddata", startDetection);

// Function to perform text-to-speech
console.log('Read Messages Aloud using Text To Speech');
function textToSpeech(message) {
  // Check if the Web Speech API is supported
  console.log('Checking for Web Speech API support');
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);

    // Get the list of available voices
    const voices = speechSynthesis.getVoices();

    // Select a voice (let's use the first available voice)
    console.log('Use the first available voice to read out messages');
    if (voices.length > 0) {
      utterance.voice = voices[0];

    }

     // Speak the message
    window.speechSynthesis.speak(utterance);
  }
}

console.log('Commence Image Loading from URLs Asynchronously');
async function loadImageAreas() {
  try {
    console.log('Load Image URLs For the Staircase');
    const StaircaseImages = [
      'https://drive.google.com/uc?id=1Du6Gs_XaEBdvP7rli4b7CVoY2LMEby-t',
      'https://drive.google.com/uc?id=1ZZDhKY5p23KFPj8JWxOjjfap6qDZy66I',
      'https://drive.google.com/uc?id=1WW34VQT-Ut9D1p167svHueh9cizFtLPU'
    ];

    console.log('Load Image URLs For the Relationship Desk');
    const RelationshipDeskImages = [
    'https://drive.google.com/uc?id=1b6Vqo8EoYP-9LI9jOpTzOXo7CeQ5AWGp',
    'https://drive.google.com/uc?id=1gonsFAcyV4ZkzRIlr0fkJNgIlM8PR6eT',
    'https://drive.google.com/uc?id=18MrypKyw0tfQEn8eqFykKURC-zuBJoix',
    'https://drive.google.com/uc?id=15JvCkO0Epys2_U7x0qKDyUIoGCg7E2qM',
    'https://drive.google.com/uc?id=1KYaDu89UydsuSFYw4gax_ggsKexSVG4M',
    'https://drive.google.com/uc?id=18VT4fMLoBl2pQDc3uzBsOnNWoOTyzHi0',
    'https://drive.google.com/uc?id=1trhvDqt-4JmxRqFCaTGso_gYjIZp4FZZ',
    'https://drive.google.com/uc?id=10573EvXYRv5GLKXBVdp0dZI_7DbMPE5R',
    'https://drive.google.com/uc?id=1UU1U-tDGkQFTVjB7Pj-NwhUIj95BJAWd',
    'https://drive.google.com/uc?id=1rbidElv-IxYOA923pPHBd5vHW7ng_F6q',
    'https://drive.google.com/uc?id=154pmVI-65ORTpB0Xf9qAYYMt2duqVtd7',
    'https://drive.google.com/uc?id=1ySBFjBUjx6MN5N9Q_DR3sACryLtJyJpc',
    'https://drive.google.com/uc?id=1X2g7UmBReLRS7TuY_HpBcp7FL0DCmNfh',
    'https://drive.google.com/uc?id=14AaweTWzvbx8-QeQqBjzowfGBRFruGis',
    'https://drive.google.com/uc?id=1BlZj5a3H1XasgATLKHunHLUIzC9zfdwP',
    'https://drive.google.com/uc?id=1JPmd9wquHo5qt4_iY1H1nEmo3o2NCEkQ',
    ];

    console.log('Load Image URLs For the Operations Area');
    const OperationsAreaImages = [
    'https://drive.google.com/uc?id=1Kw-RTbqRFJlvjwpi8DwBWjIwImbW3P1E',
    'https://drive.google.com/uc?id=1zUhR1xbN29J5ni9W9oVDng52fBAE6akc',
    'https://drive.google.com/uc?id=1GyR98xAhZksa6alQ3GT-HAMCQVxUAwJd',
    'https://drive.google.com/uc?id=1O8H70Hkr3FsKJ12Cfoas1ZnWij-s0qDm',
    'https://drive.google.com/uc?id=1XcnPf94DTCaZfwdDMgpZf6MM9FNY8day',
    'https://drive.google.com/uc?id=1XcnPf94DTCaZfwdDMgpZf6MM9FNY8day',
    'https://drive.google.com/uc?id=1D1BklcrkBBSeeoioCclCbnw_wh_Cdlqg',
    'https://drive.google.com/uc?id=1ICKnK5WLnZI2Lo5Jxcp5RAAm6HshwWC_',
    'https://drive.google.com/uc?id=15Vpfks3fWBKKI4HwC1AMR1QxO1n3U8N3',
    'https://drive.google.com/uc?id=1LZlXSPmYo3cfOdV-s3pCTNSXLLL2pZag',
    'https://drive.google.com/uc?id=11n_KpMsHjOFihSBldCtH_CjVNaSPIkl0',
    'https://drive.google.com/uc?id=1FYoZUY47dozZtlik8rBVFNwPZ5TRbIbw',
    'https://drive.google.com/uc?id=1hPPxMP74RWfg_H71U6Nw8X5TWeli-mUD',
    'https://drive.google.com/uc?id=1NgUyMRo72t10B7rLkLtscDG0rfxWnJ-C',
    
    ];

  console.log('Load Image URLs For the Lobby Area');
  const LobbyAreaImagesURLs = [
    'https://drive.google.com/uc?id=1-FGQUzoNmUy3aNiUBVZDB2rQlETG2Mbe',
    'https://drive.google.com/uc?id=1icGYQJ8d4AAdjV2KrGL9NGN28vNZtKuR',
    'https://drive.google.com/uc?id=1DyPopWgjXxUYDuhYB03ze2KkOeAc6xQu',
    'https://drive.google.com/uc?id=19yxd_IUG7v1a2jNj3_5yD3A9de23J0kv',
    'https://drive.google.com/uc?id=1L1sRQz_fQbuCnGQKe0HXOk_6ah68Zsbl',
    'https://drive.google.com/uc?id=1FL2td2bt_X3CoTBLBFN9COVSJn-WUQp2',
    'https://drive.google.com/uc?id=1nlcDKnJjbKFVFxTLEEdnj_y5BFo__vN8',
    'https://drive.google.com/uc?id=1siPhzdMpwvMAm4fFWVOVUi6g3rpu8SHX',
    'https://drive.google.com/uc?id=1Mr_UO4ZrmI-UiuMFhIY1lg5SK-B38ClO',
    'https://drive.google.com/uc?id=1JTnKcprY23TwFdL-C5_7PDIUPqLqUCmg',
];

 console.log('Load Image URLs For the HNI area');
  const HNIareaImagesURLs = [
    'https://drive.google.com/uc?id=1t7zXWKeufIUa7QxqkTLgyNUoko29L0TV',
    'https://drive.google.com/uc?id=1_U0QODFIlpYabmxuztfHvNq9M8BYxOtb',
    'https://drive.google.com/uc?id=14a3tpeW3UNZRCKB3-nt3Mcg5LVot-aU9',
    'https://drive.google.com/uc?id=1Xvi4ta8SGeKCyDVg-Xr-NE7PGLLdXk9c',
    'https://drive.google.com/uc?id=1K7ej9k28trotwZfsTwMdpUIFHUUJJEAz',
    'https://drive.google.com/uc?id=1xE5US1EuaA0QkreIOyYs9oyU8VbtwiTE',
    'https://drive.google.com/uc?id=1ONqmE-t070wfGZfJsyjF58aEBxbQ_xuO',
    'https://drive.google.com/uc?id=17ef9bRhVSXQZaYIwi4ugxwb-EnhoCIL_',
    'https://drive.google.com/uc?id=1r4w0MM-4cnYW06HUgbcmJKVXiGO9xfPP',
    'https://drive.google.com/uc?id=1-lnKCxNrbFnB0tRoCfgdvE4L0twZuoVf',
];
  
  console.log('Load Image URLs For the Entrance Area');
  const EntranceAreaImagesURLs = [
    'https://drive.google.com/uc?id=1XaWExfQXAj9SuClCXlWre7wgExVmsqNT',
    'https://drive.google.com/uc?id=10kbp2rCQS9fpCtLRtD6-vCHCrIQeRCaJ',
    'https://drive.google.com/uc?id=1ssisPQvN3AOY6Ff7xIa2d9rlUrBXsoii',
    'https://drive.google.com/uc?id=1oJZkkNUCbtTDzpRxdqqhxt5vGQDuMt5c',
    'https://drive.google.com/uc?id=1pSz-c9TsJjY-YA0oHTKKdn8rgF1Cm5Qj',
];
    
  console.log('Load Image URLs For the Customer Information Service');
  const CustomerInformationServiceImagesURLs = [
    'https://drive.google.com/uc?id=1bgiaCRDbiP3ZogDFLqpbw78iS8pXb9rI',
    'https://drive.google.com/uc?id=1vn5Lep2toJO5nOe8Uii66_cA5cEzUGK7',
    'https://drive.google.com/uc?id=1oaIdtbvrRdT4JDHVNPJKAaGEfaRfPWde',
    'https://drive.google.com/uc?id=1RM2e_1MH5oUEq6KuwOvIXwlApDHjChh4',
    'https://drive.google.com/uc?id=10Su9jqmMVF7W2F0JyOjbz5izdwZufNTB',
    'https://drive.google.com/uc?id=1fITPa_YpWJJ3paetk5fcDEz7nmdIXS6c',
    'https://drive.google.com/uc?id=1GcOXu6608mUs1USrfGt6Q6CwWy6jFNNL',
    'https://drive.google.com/uc?id=1h6d7zRNGDdoc4-0_6lPNoQ4LSthgs_E7',
    'https://drive.google.com/uc?id=1atJvi7I6-jIU6uHiZioAVaY0c1UFTL7-',
    'https://drive.google.com/uc?id=1e6nn1j6PV6tQSYrELDUgLNEExQwR9Yx4',
    'https://drive.google.com/uc?id=11ZMVSRBD4RFbMbmET7QTsw8C136pyu0L',
    'https://drive.google.com/uc?id=1TNwaewif8r9ImCbiI-R7tRXW0UiTI9Qr',
    'https://drive.google.com/uc?id=1Et2QFelNahctNme9oI363rYlYEXtpB9S',
    'https://drive.google.com/uc?id=1KOWnc9kEr0LjOycPLVcbJAQryoiI5bW7',
    'https://drive.google.com/uc?id=1Acx3vnTlB1MALcDIfQ937UNYaTZApfqM',
    'https://drive.google.com/uc?id=1RwlE8rrpoJMlPVcwQ1_dPkaRM8Dx_AyO',

];
      
 // Define a function to load images for a given area
async function loadImages(areaImages) {
  // Assume areaImages is an array of image URLs for the specified area
  
  const imagePromises = areaImages.map(async (imageUrl) => {
    const image = new Image();
    return new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });
  });

  // Wait for all images to load
  const loadedImages = await Promise.all(imagePromises);
  return loadedImages;
}

console.log('Calling The Functions To Load Images For Each Area');
await loadImages(StaircaseImages);
await loadImages(RelationshipDeskImages);
await loadImages(OperationsAreaImages);
await loadImages(LobbyAreaImagesURLs);
await loadImages(HNIareaImagesURLs);
await loadImages(EntranceAreaImagesURLs);
await loadImages(CustomerInformationServiceImagesURLs);

 } 
  catch (error) {
    console.error('Error loading images for areas:', error);
    displayErrorMessageToUser('Failed to load area images. Please try again later.');
  }

 try {
    // Handle network errors if any
    // Your code to handle network errors goes here
  } catch (error) {
    console.error('Network error occurred while loading images:', error);
    displayErrorMessageToUser('Failed to load images. Please check your internet connection.');
  }
}

// Call the async function
loadImageAreas();

console.log('Commence Predictions From Video');
// Function to predict from video
async function predictFromVideo() {
  if (!cocoSsdModel) {
    console.error('Model not loaded yet.');
    return;
  }

   console.log('Capturing frame from video');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
 console.log('Obtaining image data');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  console.log('Converting image data to tensor');
const tensor = tf.browser.fromPixels(imgData).expandDims();

  console.log('Predicting...');
const predictions = await cocoSsdModel.detect(tensor);
const predictionsArray = await predictions.data()
    
  console.log('Handling detected areas');
  handleDetectedAreas(predictionsArray);

  console.log('Requesting next frame prediction');
  requestAnimationFrame(predictFromVideo);
}

console.log('Commence Setup of Event Listeners');

// Event listener to start prediction when video is loaded
videoElement.addEventListener('loadeddata', async () => {
  console.log('Video loaded. Starting predictions.');
  videoElement.play();
  await predictFromVideo();
});

// Event listener for DOMContentLoaded to launch the system
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded. Launching the system.');
  //loadModelAndStartSystem();
});
