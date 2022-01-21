let store = {
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    roverInfo: {},
    selectedRover: 'Curiosity',
}

// add our markup to the page
const root = document.getElementById('root')

function tabSelect (selectedTab) {
    updateStore(store, { selectedRover: selectedTab })
}
window.onSelectTab = tabSelect;

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    let { rovers, apod, roverInfo, selectedRover } = state;

    return `
        <header>
            <h1>Welcome to Mars Rovers!</h1>
            <p>Click on the tabs to view interesting information about the Mars rovers!</p>
        </header>
        ${TabsRow(rovers, selectedRover)}
        <main>
            <section>
                ${Rovers(rovers, roverInfo, selectedRover)}
            </section>
        </main>
        <footer>
            <h6>
                Images and information are collected from the <a href="https://api.nasa.gov/">NASA API</a>.
            </h6>
        </footer>
    `
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
});

const randomlySelectPhotos = (photos) => {
    // Randomly select three photos to display
    // If there are less than three photos, select all
    // Return an array of photos

    let displayText = '';
    switch (photos.length) {
        case 0:
            displayText = 'Sorry, not photos to display';
            break;
        case 1:
            displayText = 'View the most recently taken photo: ';
            break;
        default:
            displayText = 'View some of the most recently taken photos: ';
    }
    let photosToDisplay;
    if (photos.length <= 3) {
        photosToDisplay = Object.assign([], photos)
    } else {
        const randIndexes = [];
        while(randIndexes.length < 3){
            const i = Math.floor(Math.random() * 100) + 1;
            if(randIndexes.indexOf(i) === -1) randIndexes.push(i);
        }
        photosToDisplay = randIndexes.map(i => photos[i]);
    }
    return {
        displayText,
        photosToDisplay,
    };
};

// ------------------------------------------------------  COMPONENTS

const Tab = (roverName, selectedRover) => {
    const className = roverName === selectedRover ? 'active' : 'inactive';
    return `
        <button class="tablinks ${className}">
            <div id="${roverName}" onclick="onSelectTab(id)">${roverName}</div> 
        </button>
    `
}

const TabsRow = (roverNames, selectedRover) => {
    return (
        `<div class="tab">
            ${roverNames.map((roverName) => Tab(roverName, selectedRover)).join(' ')}
        </div>`
    )
}

const RoverPhotos = (photos) => {
    const { displayText, photosToDisplay } = randomlySelectPhotos(photos);
    return (`
        <p>${displayText}</p>
        ${photosToDisplay.map((photo) => `<img src="${photo.img_src}" height="350px" />`)}
    `)
}

const Rovers = (rovers, roverInfo, selectedRover) => {
    // Check if we already have the most updated info
    // If not, get it (and update the store)
    const { lastQueryDay } = roverInfo;
    const today = new Date().toISOString().split('T')[0];
    if (!lastQueryDay || today > lastQueryDay) {
        getUpdatedRoverInfo();
    }
    if (lastQueryDay) {
        const { manifest, photos } = roverInfo[selectedRover.toLowerCase()];
        return (`
        <divclass="tabcontent">
            <h3>${selectedRover}</h3>
            <p>Launch Date: ${manifest.launch_date}</p>
            <p>Landing Date: ${manifest.launch_date}</p>
            <p>Status: ${manifest.launch_date}</p>
            <p>Date the most recent photos were taken: ${manifest.launch_date}</p>
            ${RoverPhotos(photos)}
        </div>
    `)
    } else {
        return `<p>Loading...</p>`;
    }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = () => {

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
        .catch(err => console.log('Error when fetching image of the day ', err))

    // return data
}

const getUpdatedRoverInfo = () => {
    // Get updated rover info
    // Update the roverInfo store object

    fetch(`http://localhost:3000/rover-info?rovers=${store.rovers}`)
        .then(res => res.json())
        .then((roverInfo) => {
            updateStore(store, { roverInfo });
            return roverInfo;
        })
        .catch(err => console.log('Error when fetching rover info ', err))
}

