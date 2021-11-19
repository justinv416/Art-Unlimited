//Declares variable called app as an empty object. 
const app = {};

//Function that generates and returns a random number.
app.generateRandomNum = function(max) {
    return Math.floor(Math.random() * max)
}

/*Function that will display art with parameters that will be passed in during the ajax call.
Note: might consolidate this with displaySearchArt function in the future, 
next artwork button currently preventing me from doing so.*/ 
app.displayRandomArt = function(imgSrc, title, artist, date, classification, medium, origin) {
    $('.art__image').attr('src', `https://www.artic.edu/iiif/2/${imgSrc}/full/843,/0/default.jpg`);
    $('.art__description--title').text(`${title}`);
    $('.art__description--artist').text(`${artist}`);
    $('.art__description--date').text(`${date}`);
    $('.art__description--classification').text(`${classification}`);
    $('.art__description--medium').text(`${medium}`);
    $('.art__description--origin').text(`${origin}`);
};

//Function that generates HTML to display art based on the search. 
app.displaySearchArt = function(data) {
    const dataHTML = `
        <div id="results-container">
            <div class="image__container--search">
                <img src=https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg class="art__image--search"> 
                <figcaption>Click image to enlarge</figcaption>
            </div>
            <div class="art__description">
                <div class="art__description--details">
                    <h2 class="art__description--title">${data.title}</h2>
                    <h2 class="art__description--artist">${data.artist_title}</h2>
                    <h3 class="art__description--date">${data.date_display}</h3>
                </div>
                <div class="art__description--details">
                    <h3 class="art__description--classification">${data.classification_title}</h3>
                    <h3 class="art__description--medium">${data.medium_display}</h3>
                    <h3 class="art__description--origin">${data.place_of_origin}</h3>
                </div>
            </div>
        </div>
    `;
    $('#results').append(dataHTML);
};

//Function to make the ajax call to API and generate random artwork.
app.getRandomArtworks = function() {
    //For performance reasons this API is limited to 100 pages
    const randomPageNum = app.generateRandomNum(100);
    //Show loading animation while data is being fetched. 
    $('.loading-animation').show();
    $.ajax({
        url: `https://api.artic.edu/api/v1/artworks?`,
        dataType: 'json',
        method: 'GET',
        data: {
            page: `${randomPageNum}`,
            limit: '50'
        }
    //Once promise is fufilled....    
    }).then(function(response) {
        //Hide loading animation.
        $('.loading-animation').hide();
        //Store response data into a variable called data.
        const data = response.data;
        //Store random number generator into a variable and pass the length of data array as a parameter.
        const randomArtNum = app.generateRandomNum(data.length);
        //Call displayRandomArt function and pass data from response as parameters.
        app.displayRandomArt(
            data[randomArtNum].image_id, 
            data[randomArtNum].title,
            data[randomArtNum].artist_title,
            data[randomArtNum].date_display,
            data[randomArtNum].classification_title,
            data[randomArtNum].medium_display,
            data[randomArtNum].place_of_origin
        );
        //Boolean that displays a 'no pictures icon' if no images are available.  
        if(data[randomArtNum].image_id === null) {
            $('.art__image').attr('src', './Icons/no-pictures.png');
        };
       //Method to log error should API call fails. 
    }).fail(function(error){
        console.log(error)
    });
};

//Function to search for and retrun artwork. Very messy? Should refactor at some point. 
app.searchArtworks = function() {
    $('#loading-animation-search').show();
    $.ajax({
        //This call will return an array of ids that will represent the respective artwork.
        url: 'https://api.artic.edu/api/v1/artworks/search?',
        dataType: 'json',
        method: 'GET', 
        data: {
            q: `${$('#search__form--input').val()}`,
            //Limit currently set at 20 for performance reasons, will add pagination in the future
            limit: '20'
        }
    }).then(function(response) {
        const arrayOfIds = response.data;
        /*
            Foreach loop that will make an API call and pass in the id into another API call
            and fetch the JSON needed to display the artwork and its information. Each artwork 
            is then dynamically rendered onto the document with the HTML string bwlow.
        */
        arrayOfIds.forEach(function(item){
            $.ajax({
                url: `https://api.artic.edu/api/v1/artworks/${item.id}`,
                dataType: 'json'
            }).then(function(response){
                $('#loading-animation-search').hide();
                $('#results__link').show();
                const artData = response.data;
                app.displaySearchArt(artData);
            });
        });
    });
};

//Function that will call the searchArtworks function on form submit.
app.submitForm = function() {
    const form = $('form')
    form.on('submit', function(event){
        event.preventDefault();
        $('#results').empty();
        $('#random__art').hide();
        $('#results__link').hide();
        app.searchArtworks();
    }); 
};

//Event listeners for buttons/icons on page.
app.btnControls = function() {
    $('#next-btn').on('click', function(){
        app.getRandomArtworks();
    });

    $('#main__button--generate').on('click', function(){
        app.getRandomArtworks();
        $('#results').empty();
        $('#results__link').hide();
        $('#search__form').hide();
        $('#random__art').show();
    });

    $('#main__button--search').on('click', function() {
        $('#search__form').show();
    });

    $('.close-icon').on('click', function(){
        $('#search__form').hide();
    });
};

//Function to hide header/footer elements.
app.hideNavigation = function() {
    $('#header').hide();
    $('footer').hide();
}

//Function to show header/footer elements.
app.showNavigation = function() {
    $('#header').show();
    $('footer').show();
}

//Function to hide modals.
app.hideModal = function() {
    $('#modal__search').hide();
    $('#modal__random').hide();
}

//Function to control image modal
app.modalControls = function() {
    $('#art__image--random').on('click', function() {
        $('.art__container').hide();
        app.hideNavigation();
        $('#modal__random').show();
        $('#art__image--modal-random').attr('src', $(this).attr('src'));
        $('body').css('overflow', 'hidden');
    });
    
    $('#close__icon--modal').on('click', function() {
        $('#modal__random').hide();
        $('.art__container').show();
        app.showNavigation();
        $('body').css('overflow', 'auto');
    });

    //Event Delegation for dynamically generated html
    $(document).on('click', '.art__image--search', function() {
        console.log('clicked')
        $('#art__image--modal-search').attr('src', $(this).attr('src'));
        $('#modal__search').show();
        $('body').css('overflow', 'hidden');
    });
    
    $(document).on('click', '#close__icon--modal-search', function() {
        app.hideModal();
        $('body').css('overflow', 'auto');
    });
};

//Function to initalize app
app.init = function(){
    $('#search__form').hide();
    $('#random__art').hide();
    $('.loading-animation').hide();
    $('#loading-animation-search').hide();
    $('#results__link').hide();
    app.hideModal()
    app.submitForm();
    app.btnControls();
    app.modalControls();
};

//Initalize the app once the Document object is ready.
$(document).ready(function(){
    app.init();
});







