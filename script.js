let page = 1
let news 
let crypto
let country
let currencies
let selected = 'USD'
let rate

window.addEventListener('load', ()=>{
    let promise_1 = new Promise((resolve,reject)=>{
        fetch(`http://api.ipstack.com/check?access_key=ea87005dfdf76ecdf09bf375e35a4361`)
        .then(response => response.json())
        .then(data => {
            console.log("Location:")
            console.log(data)
            document.querySelector("#location").innerHTML = data.country_name
            country = data.country_name.toUpperCase()
            resolve(data)
        })
    })

    let promise_2 = new Promise((resolve,reject)=>{
        fetch(`https://min-api.cryptocompare.com/data/top/totalvolfull?limit=100&page=0&tsym=USD`)
        .then(response => response.json())
        .then(data => {
            console.log("Cryptocurrencies:")
            console.log(data.Data)
            resolve(data.Data)
        })
    })

    let promise_3 = new Promise((resolve,reject)=>{
        fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=cryptocurrency`)
        .then(response => response.json())
        .then(data => {
            console.log("News:")
            console.log(data.Data)
            resolve(data.Data)
        })
    })

    let promise_4 = new Promise((resolve,reject)=>{
        fetch(`https://v6.exchangerate-api.com/v6/fad8af2086624b956f89f6ca/latest/USD`)
        .then(response => response.json())
        .then(data => {
            console.log("Conversion rates:")
            console.log(data.conversion_rates)
            resolve(data.conversion_rates)
        })
    })

    Promise.all([promise_1, promise_2, promise_3, promise_4]).then((results) => {
        console.log('All promises resolved!')
        console.log(results)
        crypto = results[1]
        news = results[2]
        currencies = results[3]

        document.querySelector('#loader').remove()
        document.querySelector('#main').insertAdjacentHTML('beforeend', `
            ${famousCoins(crypto)}
            ${info(crypto.slice(0,20), news)}
        `)
        $('.carousel').carousel({
            interval: 4000
        })
    })
    .catch((error)=>{
        alert('Please try again later!')
        console.log(error)
    })
})

function info(crypt_array,news_array){
    let html = `
    <div id='info'>
        <div id='news'>
            <div id='news-inner'>
                <h1>News Feed</h1>
                <br>
                <div id="carouselExampleSlidesOnly" class="carousel slide">
                    <div class="carousel-inner">`

                        for(let i=0; i<news_array.length; i++){
                            html += `
                            <div class="card carousel-item ${i==0 ? 'active' : ''}">
                                <img class="card-img-top d-block w-100" src="${news_array[i].imageurl}" alt="Card image cap">
                                <div class="card-body">
                                    <p class="card-text">${news_array[i].title}</p>
                                    <a href="${news_array[i].url}" class="btn btn-primary">Details</a>
                                </div>
                            </div>`                   
                        }

    html += `       
                    </div>
                </div>
            </div>
        </div>

        <div class='table-responsive' id='table'>
            <table class="table table-hover">
                <thead>
                    <tr>
                    <th scope="col">No#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Price</th>
                    <th scope="col">Low Today</th>
                    <th scope="col">High Today</th>
                    </tr>
                </thead>
                <tbody>`
    
                    for(let i=0; i<crypt_array.length; i++){
                        html += `
                        <tr>
                            <th scope="row">${Number(i) + 1}</th>
                            <td>${crypt_array[i].CoinInfo.FullName} (${crypt_array[i].CoinInfo.Name})</td>
                            <td class='val'>${(crypt_array[i].RAW ? crypt_array[i].RAW.USD.PRICE.toFixed(3) : '-')}</td>
                            <td class='red val'>${(crypt_array[i].RAW ? crypt_array[i].RAW.USD.LOWDAY.toFixed(3) : '-')}</td>
                            <td class='darkgreen val'>${(crypt_array[i].RAW ? crypt_array[i].RAW.USD.HIGHDAY.toFixed(3) : '-')}</td>
                        </tr>
                        `
                    }

    html += `
                </tbody>
            </table>
        </div>
    </div>
    
    <nav aria-label="..." id='page-selector'>
        <ul class="pagination justify-content-center">
            <li class="page-item active">
                <button class="page-link">1</button>
            </li>
            <li class="page-item">
                <button class="page-link">2</button>
            </li>
            <li class="page-item">
                <button class="page-link">3</button>
            </li>
            <li class="page-item">
                <button class="page-link">4</button>
            </li>
            <li class="page-item">
                <button class="page-link">5</button>
            </li>
        </ul>
    </nav>
    `

    return html
}

document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('page-link') && !e.target.parentElement.classList.contains('active')){
        document.querySelectorAll('.page-link').forEach((elem)=> elem.parentElement.classList.remove('active'))
        e.target.parentElement.classList.add('active')
        page = Number(e.target.innerHTML)
        Array.from(document.querySelector('#table').querySelector('tbody').children).forEach((elem)=>{
            elem.remove()
        })

        let html = ''
        for(let i=(page-1)*20; i<((page-1)*20)+20; i++){
            let price = '-'
            let lowday = '-'
            let highday = '-'
            if(crypto[i].RAW){
                price = selected=='local' ? (crypto[i].RAW.USD.PRICE*rate).toFixed(3) : crypto[i].RAW.USD.PRICE.toFixed(3)
                lowday = selected=='local' ? (crypto[i].RAW.USD.LOWDAY*rate).toFixed(3) : crypto[i].RAW.USD.LOWDAY.toFixed(3)
                highday = selected=='local' ? (crypto[i].RAW.USD.HIGHDAY*rate).toFixed(3) : crypto[i].RAW.USD.HIGHDAY.toFixed(3)
            }
 
            html += `
            <tr>
                <th scope="row">${Number(i) + 1}</th>
                <td>${crypto[i].CoinInfo.FullName} (${crypto[i].CoinInfo.Name})</td>
                <td class='val'>${price}</td>
                <td class='red val'>${lowday}</td>
                <td class='darkgreen val'>${highday}</td>
            </tr>
            `
        }

        document.querySelector('#table').querySelector('tbody').insertAdjacentHTML('beforeend', html)
    }
})

document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('dropdown-item') && e.target.classList.contains('local') && selected!='local'){
        selected = 'local'
        data.forEach((object)=>{
            if(object.Entity==country){
                let currency_code = object.AlphabeticCode
                Object.entries(currencies).forEach(([key, value]) => {
                    if(key==currency_code){
                        rate = currencies[key]
                        document.querySelector('#table').querySelector('tbody').querySelectorAll('.val').forEach((elem)=>{
                            elem.innerHTML = elem.innerHTML=='-' ? '-' : (elem.innerHTML * rate).toFixed(3)
                        })
                    }
                })
            }
        })
    }
})

document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('dropdown-item') && e.target.classList.contains('dollar')){
        selected = 'USD'
        Array.from(document.querySelector('#table').querySelector('tbody').children).forEach((elem)=>{
            elem.remove()
        })

        let html = ''
        for(let i=(page-1)*20; i<((page-1)*20)+20; i++){
            html += `
            <tr>
                <th scope="row">${Number(i) + 1}</th>
                <td>${crypto[i].CoinInfo.FullName} (${crypto[i].CoinInfo.Name})</td>
                <td class='val'>${(crypto[i].RAW ? crypto[i].RAW.USD.PRICE.toFixed(3) : '-')}</td>
                <td class='red val'>${(crypto[i].RAW ? crypto[i].RAW.USD.LOWDAY.toFixed(3) : '-')}</td>
                <td class='darkgreen val'>${(crypto[i].RAW ? crypto[i].RAW.USD.HIGHDAY.toFixed(3) : '-')}</td>
            </tr>
            `
        }

        document.querySelector('#table').querySelector('tbody').insertAdjacentHTML('beforeend', html)
    }
})

function famousCoins(array){
    let coin_names = ['BITCOIN', 'ETHEREUM', 'BINANCE', 'TETHER']
    let coin_abbr = ['BTC', 'ETH', 'BNB', 'USDT']
    let coin_rates = []

    coin_abbr.forEach((x)=>{
        array.forEach((y,index)=>{
            if(array[index].CoinInfo.Name==x){
                coin_rates.push(array[index].RAW.USD.PRICE)
            }
        })
    })

    let coin_links = ['https://bitcoin.org/en/', 'https://ethereum.org/en/', 'https://www.binance.com/en', 'https://en.wikipedia.org/wiki/Tether_(cryptocurrency)']
    let html = "<div id='fam-container'>"
    


    for(let i=0; i<4; i++){
        html += `
        <div class='fam-item pointer' onclick="window.location='${coin_links[i]}'">
            <div class='fam-item-card''>
                <div class='fam-item-card-inner'>
                    <div class='coin-info'>
                        <img src='Images/${coin_abbr[i].toLowerCase()}.png'>
                        &nbsp;
                        <span>${coin_names[i]}</span>
                    </div>
                    <div class='coin-abbr'>
                        <span>${coin_abbr[i]}</span>
                    </div>
                    <div class='coin-rate'>
                        <span>$${coin_rates[i]}</span>
                    </div>
                </div>
            </div>
        </div>
        `
    }

    html += '</div>'
    return html
}