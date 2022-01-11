let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    roverInfo: {},
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { apod, roverInfo } = state;

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
                ${displayRoverInfo(roverInfo)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
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
    // If not, get it and update the store

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
}

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

