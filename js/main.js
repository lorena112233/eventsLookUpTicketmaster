//Situación del mapa
let positionActual;
let jsonSaved;
//let listadoResultados;
let latlon;
let radius;
let x;



function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        console.log()
    } else {
        let x = document.getElementById("location");
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}


function showPosition(position) {
    console.log()
    x = document.getElementById("location");
    x.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;
    latlon = position.coords.latitude + "," + position.coords.longitude;
    radius = "&radius=50&unit=km"

    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=h3I9tWkebYWN4j7RUCINFghyZEoQMjMi&latlong="
            + latlon + radius,
        async: true,
        dataType: "json",
        success: function (json) {
            console.log(json);
            let events = json._embedded.events;
            // let e = document.getElementById("events");
            // e.innerHTML = json.page.totalElements + " events found.<br/>";
            showEvents(events);
            positionActual = position;
            jsonSaved = json;
            initMap(position, events);
        },
        error: function (xhr, status, err) {
            console.log(err);
        }
    });
}


/** BUSQUEDA CON PARAMETROS FECHA / DATE
 * Inicializamos la fecha de "hoy" para la busqueda por fechas
 * 
 */
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

document.getElementById('fechaIn').value = new Date().toDateInputValue();
document.getElementById('fechaFin').value = new Date().toDateInputValue();
/*---- otra forma de hacer lo mismo, con jQuery -----
$(document).ready( function() {
    $('#fechaIn').val(new Date().toDateInputValue());
})
*/

let fechaInicio = {};
let fechaFin = {};
let fechFin;
let fechInicial;
/**
 * creamos variables para construir luego la url y hacer el REQUEST a la API:
 */
let hora = "T00:00:00Z";
let StartDateTime = "&startDateTime=";
let EndDateTime = "&endDateTime=";

$('#fechaIn').on('click', function () {
    fechaInicio = document.getElementById("fechaIn"); //cada vez (onclick) en el campo fecha/date 
});

$('#fechaFin').on('click', function () {
    fechaFin = document.getElementById("fechaFin");
});

//footer
var fecha = new Date();
var anio = fecha. getFullYear();
var YYYY = document.getElementById("footerText");
YYYY.innerHTML= "&copy; "+anio;

//request a la API con los parametros que tengo, la localizacion
function searchByDateShowPosition() {
    latlon = positionActual.coords.latitude + "," + positionActual.coords.longitude;
    radius = "&radius=50&unit=km"
    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json?apikey=h3I9tWkebYWN4j7RUCINFghyZEoQMjMi&latlong="
            + latlon + radius + StartDateTime + fechaInicio.value + hora + EndDateTime + fechaFin.value + hora,
        async: true,
        dataType: "json",
        success: function (json) {
            let events = json._embedded.events;
            console.log(events);
            // let e = document.getElementById("events");
            // e.innerHTML = json.page.totalElements + " events found.<br/>";
            showEventsByDate(events);
            jsonSaved = json;
            initMap(positionActual, events);
        },
        error: function (xhr, status, err) {
            console.log(err);
        }
    });
}

function showEventsByKeywordShowPosition() {
    latlon = positionActual.coords.latitude + "," + positionActual.coords.longitude;
    radius = "&radius=50&unit=km"
    let keyword = document.getElementById("keyword").value;
    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events?apikey=h3I9tWkebYWN4j7RUCINFghyZEoQMjMi&keyword="
            + keyword,
        async: true,
        dataType: "json",
        success: function (json) {
            let events = json._embedded.events;
            console.log(events);
            // let e = document.getElementById("events");
            // e.innerHTML = json.page.totalElements + " events found.<br/>";
            showEventsByKeyword(events);
            jsonSaved = json;
            initMap(positionActual, events);
        },
        error: function (xhr, status, err) {
            console.log(err);
        }
    });

}

function showEventsByKeyword(events) {
    for (let i = 0; i < events.length; i++) {

        //console.log(events[i].name);
        //console.log(events[i].type);
        //console.log(events[i].url);
        //console.log(events[i].classifications);
        //console.log(events[i].dates.start.localDate);
        //console.log(events[i].dates.start.localTime);
        //console.log(events[i].images);
        //console.log();
        //...........................................

        //creo elemento URL
        let UrlEvento = events[i].url;
        let textoEnlace = document.createTextNode("Get info / Tickets <br/>");
        let divParaUrl = document.createElement("div");
        let elementoUrl = document.createElement("a");
        //divParaUrl.setAttribute("class", "urlTickets");

        
        elementoUrl.setAttribute("href", UrlEvento);
        //elementoUrl.href = UrlEvento;
        elementoUrl.appendChild(textoEnlace);
        elementoUrl.setAttribute("target", "_blank");
        divParaUrl.appendChild(elementoUrl);


        //creo elemento genero
        let segmento = events[i].classifications[0].segment.name;
        let subGenero = events[i].classifications[0].subGenre.name;

        /*asigno clase para cambiar estilo en funcion del subGenero / a través de la API en ".genero" no se corresponde,
        por eso sacamos la info desde subgenero*/
        //...........................................

        let divParaSegmento = document.createElement("div");
        divParaSegmento.setAttribute("class", "segmento");

        let divParaSubGenero = document.createElement("div");
        divParaSubGenero.setAttribute("class", "subGenero");
        if (subGenero == "Hard Rock") {
            divParaSubGenero.setAttribute("class", "tipoHardRock")
        }
        else if (subGenero == "Alternative Rock") {
            divParaSubGenero.setAttribute("class", "tipoAlternativeRock")
        }
        else if (subGenero == "Pop") {
            divParaSubGenero.setAttribute("class", "tipoPop")
        }
        else if (subGenero == "Hip-Hop/Rap") {
            divParaSubGenero.setAttribute("class", "tipoHipHopRap")
        }
        else {
            divParaSubGenero.setAttribute("class", "tipoOtros")
        }


        let divParaInfoGenero = document.createElement("div");

        let textoSegmento = document.createTextNode(segmento);
        let textoSubGenero = document.createTextNode(subGenero);

        divParaSegmento.appendChild(textoSegmento);
        divParaSubGenero.appendChild(textoSubGenero);

        divParaInfoGenero.appendChild(divParaSegmento)
        divParaInfoGenero.appendChild(divParaSubGenero)

        ////creo elemento foto
        let urlImagen = events[i].images[0].url;
        let divParaFoto = document.createElement("div");
        let elementoFoto = document.createElement("img");
        divParaFoto.setAttribute("class", "fotoEvento");
        divParaFoto.setAttribute("id", "divFoto");
        elementoFoto.setAttribute("src", urlImagen);
        divParaFoto.appendChild(elementoFoto)


        // creo elemento titulo
        let elementoTitulo = document.createElement("h2");
        elementoTitulo.setAttribute("class", "rowspan=3");
        let textoTitulo = document.createTextNode(events[i].name);
        elementoTitulo.appendChild(textoTitulo);

        // creo elemento lugar
        let elementoLugar = document.createElement("h3");
        elementoLugar.setAttribute("class", "lugar");
        let textoLugar = document.createTextNode(events[i]._embedded.venues[0].city.name);
        elementoLugar.appendChild(textoLugar);

        // creo elemento fecha
        let elementoFecha = document.createElement("h3");
        elementoFecha.setAttribute("class", "fecha");
        let textoFecha = document.createTextNode(events[i].dates.start.localDate);
        elementoFecha.appendChild(textoFecha);

        // creo elemento hora
        let elementoHora = document.createElement("h3");
        elementoHora.setAttribute("class", "hora");
        let textoHora = document.createTextNode(events[i].dates.start.localTime);
        elementoHora.appendChild(textoHora);

        let elementoLugarFechaHora = document.createElement("li");
        elementoLugarFechaHora.appendChild(elementoLugar);
        elementoLugarFechaHora.appendChild(elementoFecha);
        elementoLugarFechaHora.appendChild(elementoHora);

        // creo un div, les incluyo el titulo y el parrafo
        let idEvento = events[i].id;
        let celdaEvento = document.createElement("button");

        celdaEvento.setAttribute("onclick", "showDetails('" + idEvento + "')")
        celdaEvento.setAttribute("class", "personal");
        celdaEvento.appendChild(divParaInfoGenero);
        celdaEvento.appendChild(divParaFoto);
        celdaEvento.appendChild(elementoTitulo);

        //creo un boton para que se oculten los detalles
        let divParaBotonVolver = document.createElement("div");
        let elementoBotonVolver = document.createElement("button");
        elementoBotonVolver.setAttribute("onclick", "hideDetails('" + idEvento + "')");
        let textoBotonVolver = document.createTextNode("Volver");
        elementoBotonVolver.appendChild(textoBotonVolver);
        divParaBotonVolver.appendChild(elementoBotonVolver)

        // creo un div, para incluir la info sobre detalles de evento
        let celdaDetalles = document.createElement("div");
        celdaDetalles.setAttribute("id", idEvento);
        celdaDetalles.setAttribute("class", "celdaDetalles")
        celdaDetalles.appendChild(elementoLugarFechaHora);
        celdaDetalles.appendChild(divParaUrl);
        celdaDetalles.appendChild(divParaBotonVolver);
        celdaDetalles.setAttribute("style", "display:none;")


        let parrafo = document.createElement("div");
        parrafo.setAttribute("class", "column");
        parrafo.appendChild(celdaEvento);
        parrafo.appendChild(celdaDetalles);


        if (i % 3 === 0) {
            let elementoFila = document.createElement("div");
            elementoFila.setAttribute("class", "row col-xs-4");
            elementoFila.appendChild(parrafo);

        }
        document.getElementById("events").appendChild(parrafo);
        console.log()
    }
}

//function showEvents(events) {
//    for (let i = 0; i < events.length; i++) {
        
//        //console.log(events[i].name);
//        //console.log(events[i].type);
//        //console.log(events[i].url);
//        //console.log(events[i].classifications);
//        //console.log(events[i].dates.start.localDate);
//        //console.log(events[i].dates.start.localTime);
//        //console.log(events[i].images);
//        //console.log();
//        //...........................................

//        //creo elemento URL
//        let UrlEvento = events[i].url;
//        let textoEnlace = document.createTextNode("Get info / Tickets");
//        let divParaUrl = document.createElement("div");
//        let elementoUrl = document.createElement("a");
//        //divParaUrl.setAttribute("class", "urlTickets");


//        elementoUrl.setAttribute("href", UrlEvento);
//        //elementoUrl.href = UrlEvento;
//        elementoUrl.appendChild(textoEnlace);
//        elementoUrl.setAttribute("target", "_blank");
//        divParaUrl.appendChild(elementoUrl);

//        //creo elemento genero
//        let segmento = events[i].classifications[0].segment.name;
//        let subGenero = events[i].classifications[0].subGenre.name;

//        /*asigno clase para cambiar estilo en funcion del subGenero / a través de la API en ".genero" no se corresponde,
//        por eso sacamos la info desde subgenero*/       
//        //...........................................

//        let divParaSegmento = document.createElement("div");
//        let divParaSubGenero = document.createElement("div");
//        if (subGenero == "Hard Rock") {
//            divParaSubGenero.setAttribute("class", "tipoHardRock")
//        }
//        else if (subGenero == "Alternative Rock") {
//            divParaSubGenero.setAttribute("class", "tipoAlternativeRock")
//        }
//        else if (subGenero == "Pop") {
//            divParaSubGenero.setAttribute("class", "tipoPop")
//        }
//        else if (subGenero == "Hip-Hop/Rap") {
//            divParaSubGenero.setAttribute("class", "tipoHipHopRap")
//        }
//        else {
//            divParaSubGenero.setAttribute("class", "tipoOtros")
//        }


//        let divParaInfoGenero = document.createElement("div");

//        let textoSegmento = document.createTextNode(segmento);
//        let textoSubGenero = document.createTextNode(subGenero);

//        divParaSegmento.appendChild(textoSegmento);
//        divParaSubGenero.appendChild(textoSubGenero);

//        divParaInfoGenero.appendChild(divParaSegmento)
//        divParaInfoGenero.appendChild(divParaSubGenero)

//        ////creo elemento foto
//        let urlImagen = events[i].images[0].url;
//        let divParaFoto = document.createElement("div");
//        let elementoFoto = document.createElement("img");
//        divParaFoto.setAttribute("class", "fotoEvento");
//        elementoFoto.setAttribute("src", urlImagen);
//        divParaFoto.appendChild(elementoFoto)
 

//        // creo elemento titulo
//        let elementoTitulo = document.createElement("h2");
//        elementoTitulo.setAttribute("class", "rowspan=3");
//        let textoTitulo = document.createTextNode(events[i].name);
//        elementoTitulo.appendChild(textoTitulo);

//        // creo elemento lugar
//        let elementoLugar = document.createElement("h3");
//        elementoLugar.setAttribute("class", "lugar");
//        let textoLugar = document.createTextNode(events[i]._embedded.venues[0].city.name);
//        elementoLugar.appendChild(textoLugar);

//        // creo elemento fecha
//        let elementoFecha = document.createElement("h3");
//        elementoFecha.setAttribute("class", "fecha");
//        let textoFecha = document.createTextNode(events[i].dates.start.localDate);
//        elementoFecha.appendChild(textoFecha);

//        // creo elemento hora
//        let elementoHora = document.createElement("h3");
//        elementoHora.setAttribute("class", "hora");
//        let textoHora = document.createTextNode(events[i].dates.start.localTime);
//        elementoHora.appendChild(textoHora);

//        let elementoLugarFechaHora = document.createElement("li");
//        elementoLugarFechaHora.setAttribute = ("list-style", "none")
//        elementoLugarFechaHora.appendChild(elementoLugar);
//        elementoLugarFechaHora.appendChild(elementoFecha);
//        elementoLugarFechaHora.appendChild(elementoHora);

//        // creo un div, les incluyo el titulo y el parrafo
//        let idEvento = events[i].id;
//        let celdaEvento = document.createElement("button");
       
//        celdaEvento.setAttribute("onclick", "showDetails('"+idEvento+"')")
//        celdaEvento.setAttribute("class", "personal");
//        celdaEvento.appendChild(divParaInfoGenero);
//        celdaEvento.appendChild(divParaFoto);
//        celdaEvento.appendChild(elementoTitulo);

//        //creo un boton para que se oculten los detalles
//        let divParaBotonVolver = document.createElement("div");
//        let elementoBotonVolver = document.createElement("button");
//        elementoBotonVolver.setAttribute("onclick", "hideDetails()")
//        let textoBotonVolver = document.createTextNode("Volver");
//        elementoBotonVolver.appendChild(textoBotonVolver);
//        divParaBotonVolver.appendChild(elementoBotonVolver)

//        // creo un div, para incluir la info sobre detalles de evento
//        let celdaDetalles = document.createElement("div");
//        celdaDetalles.setAttribute("id", idEvento);
//        celdaDetalles.setAttribute("class", "celdaDetalles")
//        celdaDetalles.appendChild(elementoLugarFechaHora);
//        celdaDetalles.appendChild(divParaUrl);
//        celdaDetalles.appendChild(divParaBotonVolver);
//        celdaDetalles.setAttribute("style", "display:none;")


//        let parrafo = document.createElement("div");
//        parrafo.setAttribute("class", "column");
//        parrafo.appendChild(celdaEvento);
//        parrafo.appendChild(celdaDetalles);


//        if (i % 3 === 0) {
//            let elementoFila = document.createElement("div");
//            elementoFila.setAttribute("class", "row col-xs-4");
//            elementoFila.appendChild(parrafo);

//        }
//        document.getElementById("filaResults").appendChild(parrafo);
//        console.log()
//    }
//}
function showEvents(events) {
    for (let i = 0; i < events.length; i++) {

        //console.log(events[i].name);
        //console.log(events[i].type);
        //console.log(events[i].url);
        //console.log(events[i].classifications);
        //console.log(events[i].dates.start.localDate);
        //console.log(events[i].dates.start.localTime);
        //console.log(events[i].images);
        //console.log();
        //...........................................

        //creo elemento URL
        let UrlEvento = events[i].url;
        let textoEnlace = document.createTextNode("Get info / Tickets");
        let divParaUrl = document.createElement("div");
        let elementoUrl = document.createElement("a");
        //divParaUrl.setAttribute("class", "urlTickets");


        elementoUrl.setAttribute("href", UrlEvento);
        //elementoUrl.href = UrlEvento;
        elementoUrl.appendChild(textoEnlace);
        elementoUrl.setAttribute("target", "_blank");
        divParaUrl.appendChild(elementoUrl);


        //creo elemento genero
        let segmento = events[i].classifications[0].segment.name;
        let subGenero = events[i].classifications[0].subGenre.name;

        /*asigno clase para cambiar estilo en funcion del subGenero / a través de la API en ".genero" no se corresponde,
        por eso sacamos la info desde subgenero*/
        //...........................................

        let divParaSegmento = document.createElement("div");
        divParaSegmento.setAttribute("class", "segmento");

        let divParaSubGenero = document.createElement("div");
        divParaSubGenero.setAttribute("class", "subGenero");
        if (subGenero == "Hard Rock") {
            divParaSubGenero.setAttribute("class", "tipoHardRock")
        }
        else if (subGenero == "Alternative Rock") {
            divParaSubGenero.setAttribute("class", "tipoAlternativeRock")
        }
        else if (subGenero == "Pop") {
            divParaSubGenero.setAttribute("class", "tipoPop")
        }
        else if (subGenero == "Hip-Hop/Rap") {
            divParaSubGenero.setAttribute("class", "tipoHipHopRap")
        }
        else {
            divParaSubGenero.setAttribute("class", "tipoOtros")
        }


        let divParaInfoGenero = document.createElement("div");

        let textoSegmento = document.createTextNode(segmento);
        let textoSubGenero = document.createTextNode(subGenero);

        divParaSegmento.appendChild(textoSegmento);
        divParaSubGenero.appendChild(textoSubGenero);

        divParaInfoGenero.appendChild(divParaSegmento)
        divParaInfoGenero.appendChild(divParaSubGenero)

        ////creo elemento foto
        let urlImagen = events[i].images[0].url;
        let divParaFoto = document.createElement("div");
        let elementoFoto = document.createElement("img");
        divParaFoto.setAttribute("class", "fotoEvento");
        elementoFoto.setAttribute("src", urlImagen);
        divParaFoto.appendChild(elementoFoto)


        // creo elemento titulo
        let elementoTitulo = document.createElement("h2");
        elementoTitulo.setAttribute("class", "rowspan=3");
        let textoTitulo = document.createTextNode(events[i].name);
        elementoTitulo.appendChild(textoTitulo);

        // creo elemento lugar
        let elementoLugar = document.createElement("h3");
        elementoLugar.setAttribute("class", "lugar");
        let textoLugar = document.createTextNode(events[i]._embedded.venues[0].city.name);
        elementoLugar.appendChild(textoLugar);

        // creo elemento fecha
        let elementoFecha = document.createElement("h3");
        elementoFecha.setAttribute("class", "fecha");
        let textoFecha = document.createTextNode(events[i].dates.start.localDate);
        elementoFecha.appendChild(textoFecha);

        // creo elemento hora
        let elementoHora = document.createElement("h3");
        elementoHora.setAttribute("class", "hora");
        let textoHora = document.createTextNode(events[i].dates.start.localTime);
        elementoHora.appendChild(textoHora);

        let elementoLugarFechaHora = document.createElement("li");
        elementoLugarFechaHora.setAttribute = ("list-style:", "none")
        elementoLugarFechaHora.appendChild(elementoLugar);
        elementoLugarFechaHora.appendChild(elementoFecha);
        elementoLugarFechaHora.appendChild(elementoHora);

        // creo un div, les incluyo el titulo y el parrafo
        let idEvento = events[i].id;
        let celdaEvento = document.createElement("button");

        celdaEvento.setAttribute("onclick", "showDetails('" + idEvento + "')")
        celdaEvento.setAttribute("class", "personal");
        celdaEvento.appendChild(divParaInfoGenero);
        celdaEvento.appendChild(divParaFoto);
        celdaEvento.appendChild(elementoTitulo);

        //creo un boton para que se oculten los detalles
        let divParaBotonVolver = document.createElement("div");
        let elementoBotonVolver = document.createElement("button");
        elementoBotonVolver.setAttribute("onclick", "hideDetails('" + idEvento + "')");
        let textoBotonVolver = document.createTextNode("Volver");
        elementoBotonVolver.appendChild(textoBotonVolver);
        divParaBotonVolver.appendChild(elementoBotonVolver)

        // creo un div, para incluir la info sobre detalles de evento
        let celdaDetalles = document.createElement("div");
        celdaDetalles.setAttribute("id", idEvento);
        celdaDetalles.setAttribute("class", "celdaDetalles")
        celdaDetalles.appendChild(elementoLugarFechaHora);
        celdaDetalles.appendChild(divParaUrl);
        celdaDetalles.appendChild(divParaBotonVolver);
        celdaDetalles.setAttribute("style", "display:none;")


        let parrafo = document.createElement("div");
        parrafo.setAttribute("class", "column");
        parrafo.appendChild(celdaEvento);
        parrafo.appendChild(celdaDetalles);


        if (i % 3 === 0) {
            let elementoFila = document.createElement("div");
            elementoFila.setAttribute("class", "row col-xs-4");
            elementoFila.appendChild(parrafo);

        }
        document.getElementById("events").appendChild(parrafo);
        console.log()
    }
}


function showEventsByDate(events) {
    for (let i = 0; i < events.length; i++) {

        //console.log(events[i].name);
        //console.log(events[i].type);
        //console.log(events[i].url);
        //console.log(events[i].classifications);
        //console.log(events[i].dates.start.localDate);
        //console.log(events[i].dates.start.localTime);
        //console.log(events[i].images);
        console.log();
        //...........................................

        //creo elemento URL
        let UrlEvento = events[i].url;
        let textoEnlace = document.createTextNode("Get info / Tickets");
        let divParaUrl = document.createElement("div");
        let elementoUrl = document.createElement("a");
        //divParaUrl.setAttribute("class", "urlTickets");


        elementoUrl.setAttribute("href", UrlEvento);
        //elementoUrl.href = UrlEvento;
        elementoUrl.appendChild(textoEnlace);
        elementoUrl.setAttribute("target", "_blank");
        divParaUrl.appendChild(elementoUrl);


        //creo elemento genero
        let segmento = events[i].classifications[0].segment.name;
        let subGenero = events[i].classifications[0].subGenre.name;

        /*asigno clase para cambiar estilo en funcion del subGenero / a través de la API en ".genero" no se corresponde,
        por eso sacamos la info desde subgenero*/
        //...........................................

        let divParaSegmento = document.createElement("div");
        divParaSegmento.setAttribute("class", "segmento");

        let divParaSubGenero = document.createElement("div");
        divParaSubGenero.setAttribute("class", "subGenero");
        if (subGenero == "Hard Rock") {
            divParaSubGenero.setAttribute("class", "tipoHardRock")
        }
        else if (subGenero == "Alternative Rock") {
            divParaSubGenero.setAttribute("class", "tipoAlternativeRock")
        }
        else if (subGenero == "Pop") {
            divParaSubGenero.setAttribute("class", "tipoPop")
        }
        else if (subGenero == "Hip-Hop/Rap") {
            divParaSubGenero.setAttribute("class", "tipoHipHopRap")
        }
        else {
            divParaSubGenero.setAttribute("class", "tipoOtros")
        }


        let divParaInfoGenero = document.createElement("div");

        let textoSegmento = document.createTextNode(segmento);
        let textoSubGenero = document.createTextNode(subGenero);

        divParaSegmento.appendChild(textoSegmento);
        divParaSubGenero.appendChild(textoSubGenero);

        divParaInfoGenero.appendChild(divParaSegmento)
        divParaInfoGenero.appendChild(divParaSubGenero)

        ////creo elemento foto
        let urlImagen = events[i].images[0].url;
        let divParaFoto = document.createElement("div");
        let elementoFoto = document.createElement("img");
        divParaFoto.setAttribute("class", "fotoEvento");
        elementoFoto.setAttribute("src", urlImagen);
        divParaFoto.appendChild(elementoFoto)


        // creo elemento titulo
        let elementoTitulo = document.createElement("h2");
        elementoTitulo.setAttribute("class", "rowspan=3");
        let textoTitulo = document.createTextNode(events[i].name);
        elementoTitulo.appendChild(textoTitulo);

        // creo elemento lugar
        let elementoLugar = document.createElement("h3");
        elementoLugar.setAttribute("class", "lugar");
        let textoLugar = document.createTextNode(events[i]._embedded.venues[0].city.name);
        elementoLugar.appendChild(textoLugar);

        // creo elemento fecha
        let elementoFecha = document.createElement("h3");
        elementoFecha.setAttribute("class", "fecha");
        let textoFecha = document.createTextNode(events[i].dates.start.localDate);
        elementoFecha.appendChild(textoFecha);

        // creo elemento hora
        let elementoHora = document.createElement("h3");
        elementoHora.setAttribute("class", "hora");
        let textoHora = document.createTextNode(events[i].dates.start.localTime);
        elementoHora.appendChild(textoHora);

        let elementoLugarFechaHora = document.createElement("li");
        elementoLugarFechaHora.setAttribute = ("list-style:", "none")
        elementoLugarFechaHora.appendChild(elementoLugar);
        elementoLugarFechaHora.appendChild(elementoFecha);
        elementoLugarFechaHora.appendChild(elementoHora);

        // creo un div, les incluyo el titulo y el parrafo
        let idEvento = events[i].id;
        let celdaEvento = document.createElement("button");

        celdaEvento.setAttribute("onclick", "showDetails('" + idEvento + "')");
        celdaEvento.setAttribute("class", "personal");
        celdaEvento.appendChild(divParaInfoGenero);
        celdaEvento.appendChild(divParaFoto);
        celdaEvento.appendChild(elementoTitulo);

        //creo un boton para que se oculten los detalles
        let divParaBotonVolver = document.createElement("div");
        let elementoBotonVolver = document.createElement("button");
        elementoBotonVolver.setAttribute("onclick", "hideDetails('" + idEvento + "')");
        let textoBotonVolver = document.createTextNode("Volver");
        elementoBotonVolver.appendChild(textoBotonVolver);
        divParaBotonVolver.appendChild(elementoBotonVolver)

        // creo un div, para incluir la info sobre detalles de evento
        let celdaDetalles = document.createElement("div");
        celdaDetalles.setAttribute("id", idEvento);
        celdaDetalles.setAttribute("class", "celdaDetalles")
        celdaDetalles.appendChild(elementoLugarFechaHora);
        celdaDetalles.appendChild(divParaUrl);
        celdaDetalles.appendChild(divParaBotonVolver);
        celdaDetalles.setAttribute("style", "display:none;")


        let parrafo = document.createElement("div");
        parrafo.setAttribute("class", "column");
        parrafo.appendChild(celdaEvento);
        parrafo.appendChild(celdaDetalles);


        if (i % 3 === 0) {
            let elementoFila = document.createElement("div");
            elementoFila.setAttribute("class", "row col-xs-4");
            elementoFila.appendChild(parrafo);

        }
        document.getElementById("events").appendChild(parrafo);
        console.log()
    }
}

function initMap(position, events) {
    let mapDiv = document.getElementById('map');
    let map = new google.maps.Map(mapDiv, {
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        zoom: 12

    });
    for (let i = 0; i < events.length; i++) {
        addMarker(map, events[i], events);
    }
}

function addMarker(map, event, events) {
    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude),
        animation: google.maps.Animation.DROP,
        map: map,
        icon: '/images/free-map-marker-icon-green-darkerPEKE.png'

    });
    //marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    let texto = '';
    for (let i = 0; i < events.length; i++) {
        if (event._embedded.venues[0].name === events[i]._embedded.venues[0].name) {
            texto += '<a href="' + events[i].url + '" target="_blank">' + events[i].name + '</a> </br>'
        }
    }
    let infoWindow = new google.maps.InfoWindow({
        content: texto
    });
    marker.addListener('click', function () {
        infoWindow.open(map, marker);
    });
    console.log(marker);
}
getLocation();


/*--------------------------------------------------------------*/
function listadoOn() { /*filtro para mostrar listado de los resultados*/
    $("#listadooEvents").show();
    $("#map").hide();
}

function listadoOff() { /*filtro para mostrar resultados en el mapa*/
    $("#listadooEvents").hide();
    $("#map").show();
}


/*--------------------------------------------------------------*/
function showDetails(id) { /*al hacer click en el boton del evento, se muestren los detalles*/

    $("#"+id).show();

}
function hideDetails(id) { /*al hacer click en el boton del volver, se oculten los detalles*/

    $("#" + id).hide();

}
