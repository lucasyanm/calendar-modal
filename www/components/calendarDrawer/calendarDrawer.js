//verify if the app starts in web or smartphone
var clickOrTouchStart = ( !!window.cordova  ? "touchstart" : "click");
var mouseDownOrTouchStart = ( !!window.cordova ? "touchstart" : "mousedown");
var mouseMoveOrTouchMove = ( !!window.cordova  ? "touchmove" : "mousemove");
var mouseUpOrTouchEnd = ( !!window.cordova ? "touchend" : "mouseup");

//enable or disable scrolling functions
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';


function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

//calendar functions
function insertCalendarHTMLStructure() {
    let calendarDrawerDiv = document.getElementById('calendarDrawer')
    let span = document.createElement('span')

    span.innerHTML = ''
    span.id = 'darkerBackground'

    calendarDrawerDiv.parentNode.insertBefore(span, calendarDrawerDiv)

    return(
        `
        <div>
            <header id="calendarDrawerHeader">
                <input type="image" src="components/calendarDrawer/assets/close.svg" name="closeCalendarOnClick" id="closeCalendarOnClick"/>
                <h3 id="calendarTitle">Calendar</h3>
            </header>
            
            <div class="calendarDateControl">
                <input type="image" src="components/calendarDrawer/assets/arrow-back.svg" name="previousMonth" id="previous"/>
                <h3 id="monthAndYear"></h3>
                <input type="image" src="components/calendarDrawer/assets/arrow-next.svg" name="nextMonth" id="next"/>
            </div>
            <div class="divider"></div>

            <table id="calendar">            
                <thead>
                <tr>
                    <th>S</th>
                    <th>M</th>
                    <th>T</th>
                    <th>W</th>
                    <th>T</th>
                    <th>F</th>
                    <th>S</th>
                </tr>
                </thead>

                <tbody id="calendar-body">

                </tbody>
            </table>
            <div class="calendarApplyButtonDiv">
                <button id="calendarApplyButton">Apply</button>
            </div>
        </div>
        `
    )
}

var selectedFirstDate = 0

function selectDate(e) {
    let buttonDateReceived = parseInt(e.target.id.match(/\d+/))
    
    //select the first date
    if(!selectedFirstDate) {        
        e.path[1].classList.add("selectedUniqueDateBackground")
        e.target.classList.add("selectedDate")
        e.target.classList.add("selectedFirstDate")
        selectedFirstDate = buttonDateReceived
    } 
    //erase all selected dates if clicks on the first selected date
    else if(e.target.classList.contains("selectedFirstDate")) {        
        e.path[1].classList.remove("selectedUniqueDateBackground")
        e.path[1].classList.remove("selectedFirstDateBackground")
        e.target.classList.remove("selectedDate")
        e.target.classList.remove("selectedFirstDate")
        selectedFirstDate = false

        for (let index = selectedFirstDate + 1; index <= 31; index++) {
            let indexDateButton = document.getElementById('date' + index)  
             
            indexDateButton.classList.remove("selectedDate")        
            indexDateButton.classList.remove("selectedDatesinRange")
            indexDateButton.parentElement.classList.remove("selectedDateLastOne")
        } 
    } 
    //select dates in a range
    else if( selectedFirstDate < buttonDateReceived ) {
        let firstDate = document.getElementsByClassName("selectedUniqueDateBackground")[0]
        if(firstDate) {
            firstDate.classList.add("selectedFirstDateBackground")
            firstDate.classList.remove("selectedUniqueDateBackground")
        }
        //adding new dates to the range
        if(!e.target.classList.contains("selectedDatesinRange")){
            for (let index = buttonDateReceived; index > selectedFirstDate; index--) {
                let indexDateButton = document.getElementById('date' + index)

                if(index === buttonDateReceived){
                    e.path[1].classList.add("selectedDateLastOne")
                } else if (indexDateButton.parentElement.classList.contains("selectedDateLastOne"))
                    indexDateButton.parentElement.classList.remove("selectedDateLastOne")
                
                indexDateButton.classList.add("selectedDate")         
                indexDateButton.classList.add("selectedDatesinRange")
            }
        }
        //excluding dates to the range
        else {
            e.path[1].classList.add("selectedDateLastOne")

            for (let index = buttonDateReceived + 1; document.getElementById('date' + index).classList.contains("selectedDatesinRange"); index++) {
                let indexDateButton = document.getElementById('date' + index)
                
                indexDateButton.classList.remove("selectedDate")        
                indexDateButton.classList.remove("selectedDatesinRange")
            }
        }
    }
}

function drawCalendarDays() {        
    document.getElementById('previous').addEventListener(clickOrTouchStart, previous)
    document.getElementById('next').addEventListener(clickOrTouchStart, next)

    let today = new Date()
    let currentMonth = today.getMonth()
    let currentYear = today.getFullYear()

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    let monthAndYear = document.getElementById("monthAndYear")
    showCalendar(currentMonth, currentYear)


    function next() {
        selectedFirstDate = false

        currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear
        currentMonth = (currentMonth + 1) % 12
        showCalendar(currentMonth, currentYear)
    }

    function previous() {
        selectedFirstDate = false

        currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear
        currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1
        showCalendar(currentMonth, currentYear)
    }

    function showCalendar(month, year) {
        let firstDay = (new Date(year, month)).getDay()
        let daysInMonth = 32 - new Date(year, month, 32).getDate()
        let dayWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        let tbl = document.getElementById("calendar-body"); // body of the calendar
        // clearing all previous cells
        tbl.innerHTML = ""

        // filing data about day, month and year
        if(month === today.getMonth())
            monthAndYear.innerHTML = dayWeek[today.getDay()] + " - " + months[month].substring(0,3) + " " + today.getDate() + " (" + year + ")"
        else 
            monthAndYear.innerHTML = months[month].substring(0,3) + " (" + year + ")"

        // creating all cells
        let date = 1
        for (let i = 0; i < 6; i++) {
            // creates a table row
            let row = document.createElement("tr")

            row.setAttribute('class', 'selectedDatesinRangeBackground')

            //creating individual cells, filing them up with data.
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    let cell = document.createElement("td")
                    cell.style.backgroundColor = "#fff"

                    let cellText = document.createTextNode("")

                    let button = document.createElement("button")

                    button.appendChild(cellText)
                    cell.appendChild(button)
                    row.appendChild(cell)
                }
                else if (date > daysInMonth) {
                    break;
                }

                else {
                    let cell = document.createElement("td");
                    let cellText = document.createTextNode(date)
                    
                    let button = document.createElement("button")
                    button.addEventListener(clickOrTouchStart, selectDate)
                    button.setAttribute('id', 'date' + date)

                    if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        cell.classList.add("todaysDate")
                    } // color today's date

                    button.appendChild(cellText)
                    cell.appendChild(button)                    
                    row.appendChild(cell)
                    date++
                }


            }

            tbl.appendChild(row); // appending each row into calendar body.
        }
    }
}

function closeCalendarOnClick() {
    document.getElementById('darkerBackground').style.display = ''

    selectedFirstDate = false
    var calendarDrawerDiv = document.getElementById('calendarDrawer')
    var styleAttributeValueBottom = calendarDrawerDiv.style.bottom.substring(0,0)

    calendarDrawerDiv.style.top = ''

    var loop = setInterval(animationShowingCalendar, 8)
    function animationShowingCalendar() {
        if(styleAttributeValueBottom === -350) {
            calendarDrawerDiv.style.display = ''
            calendarDrawerDiv.style.bottom = ''
            clearInterval(loop)
        } else {
            styleAttributeValueBottom -= 10
            calendarDrawerDiv.style.bottom = styleAttributeValueBottom + 'px'
        }
    }
    
    enableScroll()
}

function closeCalendarOnDrag() {
    let calendarDrawerDiv = document.getElementById("calendarDrawer")
    let styleAttributeValueTop = parseInt(calendarDrawerDiv.style.top.match(/\d+/))    
    
    let loop = setInterval(animationClosingCalendar, 8)   
    function animationClosingCalendar() {
        if(styleAttributeValueTop >= document.getElementsByTagName('body')[0].offsetHeight) {
            calendarDrawerDiv.style.bottom = ''
            calendarDrawerDiv.style.top = ''
            calendarDrawerDiv.style.display = ''
            clearInterval(loop)
        } else {
            styleAttributeValueTop += 10
            calendarDrawerDiv.style.top = styleAttributeValueTop + 'px'
        }
    }

    document.getElementById("darkerBackground").style.display = ''
}

function sendDefinedDateRange() {
    let selectedDateTags = document.getElementsByClassName('selectedDate')
    var selectedDates = []

    for (var index = 0; index < selectedDateTags.length; index++) 
        selectedDates.push(parseInt(selectedDateTags[index].id.match(/\d+/)))

    closeCalendarOnClick()
    return selectedDates
}

function pushCalendarUp() {
    let calendarDrawerDiv = document.getElementById("calendarDrawer")
    let maxHeight = 380
    let styleAttributeValueTop = parseInt(calendarDrawerDiv.style.top.match(/\d+/))    
    let loop = setInterval(animationPushingUpCalendar, 8)
    
    function animationPushingUpCalendar() {
        if(calendarDrawerDiv.offsetHeight === maxHeight) {
            clearInterval(loop)
        } else if(calendarDrawerDiv.offsetHeight >= maxHeight) {
            calendarDrawerDiv.style.top =  (document.getElementsByTagName('body')[0].offsetHeight - maxHeight) + 'px';
            clearInterval(loop)
        } else {
            styleAttributeValueTop -= 10
            calendarDrawerDiv.style.top = styleAttributeValueTop + 'px'
        }
    }
}

function makeDragElement(element) {
    let maxHeight = 380
    let pos2 = 0, pos4 = 0;
    document.getElementById('calendarTitle').addEventListener(mouseDownOrTouchStart, dragMouseDown)

    function dragMouseDown(e) {
        e.preventDefault();
        // get the mouse cursor position at startup:
        if(mouseDownOrTouchStart === 'touchstart')
            pos4 = e.touches[0].clientY
        else 
            pos4 = e.clientY;
        // document.onmouseup = closeDragElement;
        document.addEventListener(mouseUpOrTouchEnd, closeDragElement)
        // call a function whenever the cursor moves:
        // document.onmousemove = elementDrag;
        document.addEventListener(mouseMoveOrTouchMove, elementDrag)
    }

    function elementDrag(e) {
        e.preventDefault();
        // calculate the new cursor position:
        if(mouseDownOrTouchStart === 'touchstart'){
            pos2 = pos4 - e.touches[0].clientY
            pos4 = e.touches[0].clientY
        } else {
            pos2 = pos4 - e.clientY;
            pos4 = e.clientY;
        }

        if((document.getElementsByTagName('body')[0].offsetHeight - element.offsetTop) <= maxHeight)
            element.style.top = (element.offsetTop - pos2) + "px";
        else
            element.style.top =  (document.getElementsByTagName('body')[0].offsetHeight - maxHeight) + 'px';
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.removeEventListener(mouseUpOrTouchEnd, closeDragElement)
        document.removeEventListener(mouseMoveOrTouchMove, elementDrag)
        if((document.getElementsByTagName('body')[0].offsetHeight - element.offsetTop) <= (maxHeight / 2))
            closeCalendarOnDrag()
        //push calendar up if the user does not drag it less than half of it height                
        else
            pushCalendarUp()
        
    }
}

function drawCalendarUp() {
    disableScroll()
    
    if(!document.getElementById('darkerBackground')){
        //create html structure inside the html page
        document.getElementById('calendarDrawer').innerHTML = insertCalendarHTMLStructure()

        
        document.getElementById('closeCalendarOnClick').addEventListener(clickOrTouchStart, closeCalendarOnClick)

        document.getElementById('calendarApplyButton').addEventListener(clickOrTouchStart, sendDefinedDateRange)

        document.getElementById('darkerBackground').addEventListener(clickOrTouchStart, closeCalendarOnClick)

        drawCalendarDays()
        
        //adding drag down and close event
        makeDragElement(document.getElementById("calendarDrawer"))
    }
    document.getElementById('darkerBackground').style.display = 'block'

    var calendarDrawerDiv = document.getElementById('calendarDrawer')

    calendarDrawerDiv.style.display = 'flex'
    var styleAttributeValueBottom = -350
    
    var loop = setInterval(animationShowingCalendar, 8)
    function animationShowingCalendar() {
        if(styleAttributeValueBottom === 0) {
            clearInterval(loop)
        } else {
            styleAttributeValueBottom += 10
            calendarDrawerDiv.style.bottom = styleAttributeValueBottom + 'px'
        }
    }
}

window.onload = function () {   
    document.getElementById('calendarDrawerButton').addEventListener(clickOrTouchStart, drawCalendarUp)   
}

