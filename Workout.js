class Workout 
{
    #duration;
    #distance;
    #coords;
    #date = new Date();
    #id = new Date().getTime();

    constructor(duration,distance,coords)
    {

        this.#duration = duration;
        this.#distance = distance;
        this.#coords = coords;
        
    }

    getDistance()
    {
        return this.#distance;
    }

    getDuration()
    {
        return this.#duration;
    }

    getCoords()
    {
        return this.#coords;
    }

    getDate()
    {
        return this.#date;
    }

    getId()
    {
        return this.#id;
    }
    
    getDescription()
    {
        return(months[this.#date.getMonth()] + " " + this.#date.getDate());
    }

    toJSON()
    {
        return ({"id": this.getId(),
        "distance":this.getDistance(),
        "duration":this.getDuration(),
        "coords":this.getCoords(),
        "date":this.getDate(),
        "description":this.getDescription(),});   
    }

   


}

class Running extends Workout
{
    #cadence;
    #pace;
    #type="running";
    constructor(duration,distance,coords,cadence)
    {
        super(duration,distance,coords);
        this.#cadence = cadence;
        this.#pace = this.getDuration()/this.getDistance();

    }

    getCadence()
    {
        return this.#cadence;
    }

    getPace()
    {
        return this.#pace;
    }
    getType()
    {
        return this.#type;
    }

    toJSON()
    {
        const obj = super.toJSON();
        
        obj.cadence = this.getCadence();
        obj.type = this.getType();
        obj.pace = this.getPace();

        return obj;
    }
     
    
}XMLDocument

class Cycling extends Workout
{
    #elevation;
    #speed;
    #type="cycling";

    constructor(duration,distance,coords,elevation)
    {
        super(duration,distance,coords);
        this.#elevation = elevation;
        this.#speed = this.getDistance()/this.getDuration();
    }

    getElevation()
    {
        return this.#elevation;
    }

    getSpeed()
    {
        return this.#speed;
    }
    getType()
    {
        return this.#type;
    }

    toJSON()
    {
        const obj = super.toJSON();

        
        obj.elevation = this.getElevation();
        obj.type = this.getType();
        obj.speed = this.getSpeed();

        return obj;
    }
}
