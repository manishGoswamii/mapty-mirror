"use strict";

//months name array.
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



const form = document.querySelector("form");
const select = document.querySelector("form select");
const inputDistance = document.querySelector(`input[id="distance"]`);
const inputDuration = document.querySelector(`input[id="duration"]`);
const inputCadence = document.querySelector(`input[id="cadence"]`);
const inputElevation = document.querySelector(`input[id="elevation"]`);

const inputFields = [inputDistance,inputDuration,inputCadence,inputElevation];

const rowRunning = document.querySelector(".row4");
const  rowCycling = document.querySelector(".row5");

const tilesContainer  = document.querySelector(".workout-tiles");

class App
{
    #map;
    #mapEvent;
    #workouts=[];
    constructor()
    {
        this._getPosition();

        //submit event to form.
        form.addEventListener("submit",this._newWorkout.bind(this));
        
        this._validateInputFields(inputFields);

        //select change event for change in value.
        select.addEventListener("change",this._selectValueChange);


    }

    _getPosition()
    {   
        //called when location permission denied.
        function reject()
        {
            alert("Location required.");
        }

        //calls _loadMap method when allowed.
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),reject);

    }

    _loadMap(position)
    {

        //gets coordinates of the click event.
        const {latitude,longitude} = position.coords;
        this.#map = L.map("map-area");

        //tile layer for map.
        const tileLayer = L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        tileLayer.addTo(this.#map);

        //shows map with coordinates and zoom-level.
        this.#map.setView([latitude,longitude],13); 

        this.#map.on("click",this._showForm.bind(this));

        this._renderPreviousWorkouts(this.#workouts);
        

    }

    _showForm(mapE)
    { 
        //if form is hidden.
        if(form.classList.contains("hidden"))
        {   
            //form becomes visible.
            form.style.display="grid";
            setTimeout(()=>
            {
                form.classList.remove("hidden");
            },5);

            inputFields[0].focus();
        }

        //if form is visible.
        else
        {   
            //input field is focused.
            inputFields[0].focus();
        }

        //assignment of newly generated map event to global scoped variable mapEvent.
        this.#mapEvent = mapE;

        
    }

    _newWorkout(submitEvent)
    {   
        //prevent default behavior.
        submitEvent.preventDefault();

        //checks if all the inputs are valid or not.
        if(!this._checkFieldsForValidInput(inputFields))
        {   
            //retuns if method returns false.
            return;
        } 
        const distance = (+inputDistance.value).toFixed(1);
        const duration = (+inputDuration.value).toFixed(1);
        const cadence = (+inputCadence.value).toFixed(1);
        const elevation = (+inputElevation.value).toFixed(1);
        const coords = [this.#mapEvent.latlng.lat,this.#mapEvent.latlng.lng];

        const workout = this._createTypeOfWorkout(duration,distance,cadence,elevation,coords);
        
        this.#workouts.push(workout);       

        this._hideForm();

        this._renderWorkout(workout);
      
        //marker created on map.
        this._renderWorkoutMarker(workout);

        localStorage.setItem("workouts",JSON.stringify(this._getWorkouts()));


    }

    //resets the content of input fields.
    _resetFields()
    {
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";
    }

    //input event attached to textfields to promote valid data input.
    _validateInputFields(fields)
    {
        fields.forEach((field)=>
        {
            field.addEventListener("input",function()
            {   
                //elevation can be position or negative as well.
                if(field.closest(".row5"))
                {
                    if(field.value==="" || !isFinite(Number(field.value)))
                    {
                        field.classList.add("invalid-input");
                    }
                    else
                    {
                        field.classList.remove("invalid-input");
                    }
                    
                    return;
                }

                if(field.value==="" || !isFinite(Number(field.value)) || field.value<=0)
                {
                    field.classList.add("invalid-input");
                }
                else
                {
                    field.classList.remove("invalid-input");
                }
            });
        });
    }

    //select change event handler.
    _selectValueChange()
    {   
        inputCadence.value = inputElevation.value = "";
        if(this.value==="c")
        {
            rowCycling.classList.remove("row-hidden");
            rowRunning.classList.add("row-hidden");
        }

        else if(this.value==="r")
        {
            rowRunning.classList.remove("row-hidden");
            rowCycling.classList.add("row-hidden");
        
        }
    }

    //checks if all the input are not empty and have valid data.
    _checkFieldsForValidInput(fields)
    {   
        for(let field of fields)
        {
            if(field.closest(".row").classList.contains("row-hidden"))
            {
                continue;
            }      
            if(field.classList.contains("invalid-input") || field.value==="")
            {   
                alert("Please enter valid characters.");
                return false;
            }
        }
        return true;

    }

    _createTypeOfWorkout(duration,distance,cadence,elevation,coords)
    {
        if(select.value==="r")
        {
            return new Running(duration,distance,coords,cadence);
        }

        if(select.value==="c")
        {
            return new Cycling(duration,distance,coords,elevation);

        }
    }


    //creates marker on the map.
    _renderWorkoutMarker(workout)
    {       
        const type = workout.type || workout.getType(); 
        let info = (type).charAt(0).toUpperCase() + type.slice(1);
        
        if(type==="running")
        {
            info = "🏃‍♂️ " + info; 
        }
        if(type==="cycling")
        {
            info = "🚲 " + info;
        }

        L.marker(workout.coords || workout.getCoords()).addTo(this.#map).bindPopup(L.popup({maxWidth:300,minWindth:300,autoClose:false,closeOnClick:false,closeOnEscapeKey:false})).setPopupContent(`<div class="popup popup-${type}">
        <p>${info} on ${workout.description || workout.getDescription()}</p>
        </div>`).openPopup();


    }

    _hideForm()
    {   
        //reset input fields.
        this._resetFields();

        form.style.display="none";
        form.classList.add("hidden");


    }

    _renderWorkout(workout)
    {

        const div = document.createElement("div");

        div.classList.add("tile-final");

        div.dataset.id = workout.id || workout.getId();

        const type = workout.type || workout.getType();
        
        div.innerHTML = `<div class="heading">${type==="running" ? "Running " : "Cycling"} on ${ workout.description || workout.getDescription()} </div>
        <div class="info">
        <span class="distance sub-info">${type==="running" ? "🏃‍♂️ " : "🚲 "} ${ workout.distance || workout.getDistance()} <span class="unit">KM</span>
        </span>
        
        <span class="duration sub-info">⏱ ${workout.duration || workout.getDuration()} <span class="unit">MIN</span> 
        </span>
        
        <span class="speed sub-info">⚡ ${type==="running" ? (workout.pace || workout.getPace()).toFixed(1) : (workout.speed || workout.getSpeed()).toFixed(1)}
        <span class="unit">${type==="running"?"MIN/KM" : "KM/H"}</span></span>

        <span class="cadenceOrGain sub-info">  ${ type==="running" ? ("🦶 " + (workout.cadence || workout.getCadence())) : "⛰ " + (workout.elevation || workout.getElevation())} <span class="unit">${type==="running"?"SPM" : "M"}</span>
        
        </span>
        </div>
        <div class="line line-${workout.type || workout.getType()}"></div>`;
        

        div.addEventListener("click",function()
        {
            // this.#map.flyTo(workout.getCoords(),13,{duration:3});
            this.#map.setView(workout.coords || workout.getCoords(),13,{animate:true,
            pan:{duration:1}});

        }.bind(this));
        

        form.insertAdjacentElement("afterend",div);

    }
   
    _getWorkouts()
    {
        return this.#workouts;
    }

    _renderPreviousWorkouts()
    {
        const workouts = JSON.parse(localStorage.getItem("workouts"));

        if(!workouts) return;        

        this.#workouts = workouts;

        this.#workouts.forEach((workout)=>{

            this._renderWorkout(workout);
            this._renderWorkoutMarker(workout);


        });
    }

}

const app = new App();