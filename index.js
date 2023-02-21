import currencyData  from "./data.js"

const thisYear = new Date().getFullYear()
const yearsArr = []
let yearToView = thisYear
let events = []

document.getElementById("years-select-box").addEventListener("change", () => {
    yearToView = document.getElementById("years-select-box").value
    renderBHs()
})

// image and author

fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
    .then(resp => resp.json())
    .then(data => {
        document.body.style.backgroundImage = `url(${data.urls.regular})`
        document.getElementById("photographer").textContent = `${data.user.name}, Unsplash`   
    })
    .catch(() => {
        document.body.style.backgroundImage = `url("https://images.unsplash.com/photo-1518837695005-2083093ee35b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNDI0NzB8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NzY3MDM4Mjk&ixlib=rb-4.0.3&q=80&w=1080")`
        document.getElementById("photographer").textContent = "Matt Hardy, Unsplash"
    })

// bank holidays

fetch("https://www.gov.uk/bank-holidays.json")
    .then(resp => {
        if(!resp.ok){
            throw Error("BH data not found")
        }
        return resp.json()
    })
    .then(data => {
        events = data["england-and-wales"].events   

        events.forEach(event => {
            if(yearsArr.indexOf(event.date.substring(0, 4)) === -1 && parseInt(event.date.substring(0, 4)) >= thisYear){
                yearsArr.push(event.date.substring(0, 4))
            }
        })

        getYearsSelectHtml(yearsArr)
        renderBHs()
    })
    .catch(err => document.getElementById("bh-container").innerText = err.message)

// currencies

fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/gbp.json")
    .then(resp => {
        if(!resp.ok){
            throw Error("Currencies not available")
        }
        return resp.json()
    })
    .then(data => {
        currencyData.forEach(currency => {
            currency.valueToday = data.gbp[currency.code].toFixed(2)
        })

        const currentDate = new Date()
        const weekAgo = new Date(currentDate.setDate(currentDate.getDate() - 7)).toISOString().substring(0, 10)
        
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${weekAgo}/currencies/gbp.json`)
        .then(resp => {
            if(!resp.ok){
                throw Error("Currencies not available")
            }
            return resp.json()
        })
        .then(data => {
            let currencyHtml = ``

            currencyData.forEach(currency => {
                currency.valueLastWeek = data.gbp[currency.code].toFixed(2)
                currencyHtml += `<p class="currency">${currency.symbol}${currency.valueToday} (${currency.name}) <span class="currency-emoji">${getCurrencyTrend(currency.valueToday, currency.valueLastWeek)}</span></p>`
            })

            document.getElementById("currencies").innerHTML = currencyHtml
        })
        .catch(err => document.getElementById("currencies").textContent = err.message)
    })
    .catch(err => document.getElementById("currencies").textContent = err.message)

// joke

fetch("https://v2.jokeapi.dev/joke/Any?safe-mode&type=single")
        .then(resp => {
            if(!resp.ok){
                throw Error("Joke not available")
            }
            return resp.json()
        })
        .then(data => {
            document.getElementById("joke").textContent = data.joke
        })
        .catch(err => document.getElementById("joke").textContent = err.message)

function getYearsSelectHtml(arr){
    let yearsSelectHtml = ``
    arr.forEach(item => {
        if(item === thisYear.toString()){
            yearsSelectHtml += `
            <option value=${item} selected>${item}</option>`
        }
        else{
            yearsSelectHtml += `
            <option value=${item}>${item}</option>`
        }
    })

    document.getElementById("years-select-box").innerHTML += yearsSelectHtml
}

function getTime(){
    const now = new Date()

    const date = now.toLocaleDateString("en-GB", { weekday: 'short', month: 'short', day: 'numeric' }).replaceAll(",", "")

    const time = now.toLocaleTimeString("en-GB", {timeStyle: "short"})

    document.getElementById("date").textContent = date
    document.getElementById("time").textContent = time
}

function renderBHs(){
    const eventsThisYear = events.filter(event => {
        return event.date.includes(yearToView)
    })

    let bhHtml = ``
    eventsThisYear.forEach(event => {
        let bhDate = new Date(event.date)
        bhDate = bhDate.toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'}).replaceAll(",", "")
        bhHtml += `
            <p class="date">${bhDate}</p>`
    })

    document.getElementById("bh-container").innerHTML = bhHtml
}

function getCurrencyTrend(currencyNow, currencyLastWeek){
    let currencyTrend = ""

    if(currencyNow > currencyLastWeek){
        currencyTrend = "⬆️"
    }
    else if(currencyNow < currencyLastWeek){
        currencyTrend = "⬇️"
    }

    else{
        currencyTrend = "➡️"
    }
    return currencyTrend
}

setInterval(getTime, 1000)
