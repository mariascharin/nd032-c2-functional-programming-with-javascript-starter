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
                ${ImageOfTheDay(apod)}
                ${displayRoverInfo(roverInfo)}
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

// ------------------------------------------------------  COMPONENTS

const Tab = (roverName, selectedRover) => {
    console.log('Selected rover: ', selectedRover);
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

// Example of a pure function that renders information requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay()
    }

    // check if the photo of the day is actually type video!
    if (apod && apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else if (apod) {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    } else {
        return `<p>Loading...</p>`;
    }
}

const displayRoverInfo = (roverInfo) => {
    // Check if we already have the most updated info
    // If not, get it (and update the store)
    const { lastQueryDay, curiosity, opportunity, spirit } = roverInfo;
    const readyToRender = lastQueryDay &&
        curiosity.photos.length > 0 && opportunity.photos.length > 0 && spirit.photos.length > 0;
    const today = new Date().toISOString().split('T')[0];
    if (!lastQueryDay || today > lastQueryDay) {
        getUpdatedRoverInfo();
    }
    if (readyToRender) {
        return (`
            <img src="${roverInfo.curiosity.photos[0].img_src}" height="350px" />
            <img src="${roverInfo.opportunity.photos[0].img_src}" height="350px" />
            <img src="${roverInfo.spirit.photos[0].img_src}" height="350px" />
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
            console.log('roverInfo ', roverInfo)
            return roverInfo;
        })
        .catch(err => console.log('Error when fetching rover info ', err))
}

