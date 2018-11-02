//declare all state variables here
const display = document.getElementById(`display`);
let stopwatches = Array();
let id = 0;
let active = false;

// load stopwatches saved in localStorage
load();

//set number of milliseconds between calls to step
start(500);//500);

function step() {
	if (getCurrentStopwatch() !== null && active) {
	  const timeElapsed = toFormattedTime(getCurrentTime() - getCurrentStopwatch().startTime.valueOf()/1000);
	  show(timeElapsed);
	}
	else {
		show(`00:00:00`);
	}
	updateTimerButtonList();
  save();
}

document.getElementById(`stopwatchToggle`).onclick = () => {
  if (!active) {
    stopwatches.push(new Stopwatch(id,new Date()));
    saveCurrentLocation(id);
    id++;
  } else {
    const current = getCurrentStopwatch();
    saveCurrentLocation(current.id);
    current.endTime = new Date();
    current.timeElapsed = current.endTime.valueOf() - current.startTime.valueOf(); // will be in ms
  }
  active = !active;
	document.getElementById('stopwatchToggle').innerHTML = !active ? `Start` : `Stop`;
	step();
};
document.getElementById(`stopwatchReset`).onclick = () => {
  stopwatches = Array();
  id = 0;
  active = false;
  updateTimerButtonList();
  save();
};

// Utils
function start(milliseconds)
{
	step();
	setInterval(step, milliseconds);
}

function show(text) {
	document.title = text;
	display.innerHTML = text;
}

function getCurrentStopwatch() {
  if(stopwatches.length === 0){
    return null;
  }
	return stopwatches[stopwatches.length-1];
}

function updateTimerButtonList() {
	const array = stopwatches;
  const timers = document.getElementById(`timers`);
  let table = document.getElementById(`timerTable`);
  
  // clear current displayed list of stopwatches
	while (timers.lastChild) {timers.removeChild(timers.lastChild);}
  while (table.lastChild) {table.removeChild(table.lastChild);}

	if(array.length !== 0) {
		const title = document.createElement(`h2`);
		title.appendChild(document.createTextNode(`Stopwatch Data`));
    timers.append(title);
    
    const timer = document.createElement(`tr`);
    const timer_timeElapsed = document.createElement('th');
    const timer_startTime = document.createElement('th');
    const timer_endTime = document.createElement('th');
    const timer_startLocation = document.createElement('th');
    const timer_endLocation = document.createElement('th');
    
    timer_timeElapsed.appendChild(document.createTextNode("Time Elapsed"));
    timer_startTime.appendChild(document.createTextNode("Start Time"));
    timer_endTime.appendChild(document.createTextNode("End Time"));
    timer_startLocation.appendChild(document.createTextNode("Start Location"));
    timer_endLocation.appendChild(document.createTextNode("End Location"));
    
    timer.appendChild(timer_timeElapsed);
    timer.appendChild(timer_startTime);
    timer.appendChild(timer_endTime);
    timer.appendChild(timer_startLocation);
    timer.appendChild(timer_endLocation);
    
    table.appendChild(timer);
	}
  for(let i = 0; i < array.length; i++) {
      const watch = stopwatches[i];
      const timeElapsed = watch.timeElapsed === null
        ? toFormattedTime(getCurrentTime() - watch.startTime.valueOf()/1000)
        : toFormattedTime(watch.timeElapsed/1000);
      const timer = document.createElement(`tr`);
      const timer_timeElapsed = document.createElement('td');
      const timer_startTime = document.createElement('td');
      const timer_endTime = document.createElement('td');
      const timer_startLocation = document.createElement('td');
      const timer_endLocation = document.createElement('td');

			timer.className = `timer`;
			timer.value = i;
      timer_timeElapsed.appendChild(document.createTextNode(timeElapsed));
      timer_startTime.appendChild(document.createTextNode(toFormattedDateTime(watch.startTime)));
      timer_endTime.appendChild(document.createTextNode(toFormattedDateTime(watch.endTime)));
      timer_startLocation.appendChild(document.createTextNode(toFormattedPosition(watch.startPosition)));
      timer_endLocation.appendChild(document.createTextNode(toFormattedPosition(watch.endPosition)));

      timer.appendChild(timer_timeElapsed);
      timer.appendChild(timer_startTime);
      timer.appendChild(timer_endTime);
      timer.appendChild(timer_startLocation);
      timer.appendChild(timer_endLocation);

      table.appendChild(timer);
  }

  document.getElementById(`timers`).appendChild(table);
  
  return table;
}

//input is seconds; outputted time in format HH:MM:SS
function toFormattedTime(input) {
  input = parseInt(input, 10);
  let hours = Math.floor(input/3600);
  let minutes = Math.floor((input - (hours*3600)) / 60);
  let seconds = input - (hours*3600)- (minutes*60);
  if (hours < 10) {hours = `0` + hours;}
  if (minutes < 10) {minutes = `0` + minutes;}
  if (seconds < 10) {seconds = `0` + seconds;}
  return hours+`:`+minutes+`:`+seconds;
}

// Converts Date object to string
function toFormattedDateTime(input) {
  if(input === null){
    return '------------';
  }
  return input.toLocaleDateString() + ' ' + input.toLocaleTimeString();
}

//Converts position to lat and lon string
function toFormattedPosition(input){
  if(input === null){
    return "Lat: --, Lon: --";
  }
  const { lat, lon } = input;
  return `Lat: ${lat}, Lon: ${lon}`;
}

//returns timestamp in seconds
function getCurrentTime() {
  return Date.now()/1000;
}

//saves current location to stopwatch with stopwatchId, saves to start postition before end position
function saveCurrentLocation(stopwatchId){
  const success = position => {
    const watch = stopwatches.find(element => element.id === stopwatchId);
    if (watch.startPosition === null) {
      watch.startPosition = new Position(position.coords.latitude,position.coords.longitude);
    } else {
      watch.endPosition = new Position(position.coords.latitude,position.coords.longitude);
    }
  };
  
  const err = error => console.log(error);
  
  navigator.geolocation.getCurrentPosition(success, err);
}

class Stopwatch {
  constructor(id,startTime){
    this.id = id;
    this.startTime = startTime;
    this.startPosition = null;
    this.endPosition = null;
    this.timeElapsed = null;
    this.endTime = null;
  }
  
}

class Position {
  constructor(lat,lon){
    this.lat = lat;
    this.lon = lon;
  }
}

function save() {
  //localStorage.clear();
  localStorage.setItem("stopwatches", JSON.stringify(stopwatches));
  localStorage.setItem("stopwatchId", id);
  localStorage.setItem("stopwatchActive", active);
}

function load() {
  console.log("loading from localStorage");
  const savedWatches = localStorage.getItem("stopwatches");
  const savedId = localStorage.getItem("stopwatchId");
  const savedActive = localStorage.getItem("stopwatchActive");
  if (savedWatches && savedId && savedActive) {
    stopwatches = JSON.parse(savedWatches).map(elm => {
      elm.startTime = new Date(elm.startTime);
      elm.endTime = new Date(elm.endTime);
      return elm;
    }); // need to convert time strings back into Date objects
    id = parseInt(savedId, 10);
    active = JSON.parse(savedActive);
  } else {
    console.log("nothing found in localStorage");
    save();
  }
  console.log("done loading:", savedId, savedWatches);
}