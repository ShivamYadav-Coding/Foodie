// Global variables

var state = {
  lat : null,
  long: null,
  city_name: null,
  entity_type: null,
  entity_id: null,
  query: null,
  city_searched: null,
  cuisines: [],
  likes: []
};


var select = {
  category: null,
  sort: null,
};

var pagination = {
  start: 1,
  count: 8,
  totalPages: null
};

var likesArr = [];

// Function to set all the values of an object to null
function setAll(obj, val) {
  Object.keys(obj).forEach(function(index) {
    if(index != "cuisines" && index != "likes")
      obj[index] = val;
  });
}
function setNull(obj) {
  setAll(obj, null);
}

// SideBar
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

// Get location after clicking on marker
document.querySelector('.fa-map-marker-alt').addEventListener("click", function() {
  navigator.geolocation.getCurrentPosition(function(position) {
   state.lat = position.coords.latitude;
   state.long = position.coords.longitude;

    state.lat.toFixed(2);
    state.long.toFixed(2);
    locationDetails();
  });
});

// Get list of restaurants in the location.
async function locationDetails(){
try{
const result = await fetch("https://developers.zomato.com/api/v2.1/geocode?lat="+state.lat+"&lon="+state.long, {
  method: "GET",
  withCredentials: true,
  headers: {
    "user-key": "b7d71a4616d6948817000b7b1cf38bb9",
    "Content-Type": "application/json"
  }
});

const entity = await result.json();
          setter(entity);
 } catch(error) {
  console.error();
 }
}

//This function will generates an URL
function getUrl(start,count){
  
  var cuisinePresent = false;

  while(state.query != null){
    for(var i=0;i<state.cuisines.length;i++)
       if(state.cuisines[i] == state.query)
             cuisinePresent = true;     
     
    if(cuisinePresent){
      if(select.sort == "cost"){
        return `https://developers.zomato.com/api/v2.1/search?entity_id=${state.entity_id}&entity_type=${state.entity_type}&q=${state.query}&start=${start}&count=${count}&lat=${state.lat}&lon=${state.long}&cuisines=${state.query}&category=${select.category}&sort=${select.sort}&order=asc`;
      }
      else
      {
        return `https://developers.zomato.com/api/v2.1/search?entity_id=${state.entity_id}&entity_type=${state.entity_type}&q=${state.query}&start=${start}&count=${count}&lat=${state.lat}&lon=${state.long}&cuisines=${state.query}&category=${select.category}&sort=${select.sort}`;
    
      }
  } else{
    if(select.sort == "cost"){
      return `https://developers.zomato.com/api/v2.1/search?entity_id=${state.entity_id}&entity_type=${state.entity_type}&q=${state.query}&start=${start}&count=${count}&lat=${state.lat}&lon=${state.long}&category=${select.category}&sort=${select.sort}&order=asc`;
    } else{
      return `https://developers.zomato.com/api/v2.1/search?entity_id=${state.entity_id}&entity_type=${state.entity_type}&q=${state.query}&start=${start}&count=${count}&lat=${state.lat}&lon=${state.long}&category=${select.category}&sort=${select.sort}`;
    
    }
  }
 }
    // while loop end  
    if(select.sort === "cost"){
      return `https://developers.zomato.com/api/v2.1/search?entity_id=${state.entity_id}&entity_type=${state.entity_type}&start=${start}&count=${count}&lat=${state.lat}&lon=${state.long}&category=${select.category}&sort=${select.sort}&order=asc`;
    }
    else
    {
      return `https://developers.zomato.com/api/v2.1/search?entity_id=${state.entity_id}&entity_type=${state.entity_type}&start=${start}&count=${count}&lat=${state.lat}&lon=${state.long}&category=${select.category}&sort=${select.sort}`;

    }
}

// Search for restaurants
async function searchRestaurants(start=1,count=8){
  try{
    clearView();
    document.getElementById("pagination").style.display = "none";
    document.querySelector(".loader").style.display = "block";
    var url = getUrl(start,count);
      const result = await fetch(url, {
        method: "GET",
        withCredentials: true,
        headers: {
          "user-key": "b7d71a4616d6948817000b7b1cf38bb9",
          "Content-Type": "application/json"
        }
      });

      const restaurants = await result.json();
      document.getElementById("pagination").style.display = "flex";
      document.querySelector(".loader").style.display = "none";
      pagination.totalPages = restaurants.results_found;
      pagination.start = restaurants.results_start;
      renderRestaurants(restaurants.restaurants);
      addAfterEvents();

  } catch(error){
    console.error();
  }
}

// Reset the values inside search bar to null
document.getElementById("reset-1").addEventListener('click', function(){
  document.getElementById("searchCity").value = "";
  state.city_name = null;
});

document.getElementById("reset-2").addEventListener('click', function(){
  document.getElementById("searchForm").value = "";
  state.query = null;
});

// Function to clear all restaurants from view
function clearView(){
  document.getElementById("main").innerHTML = "";
}

// ----------------------------------
function renderRestaurants(restaurants){
  if(restaurants.length == 0)
  {
    var newChild = `<div class="notFound">Sorry no results Found</div>`;
    var container = document.querySelector('.container');
    container.insertAdjacentHTML('beforeend', newChild);
    document.getElementById("pagination").style.display = "none";

  } else{
   for(var i=0;i<restaurants.length;i++){
   var image_src = restaurants[i].restaurant.featured_image;
   var name = restaurants[i].restaurant.name;
   var rating = restaurants[i].restaurant.user_rating.aggregate_rating;
   var rating_color = "#"+restaurants[i].restaurant.user_rating.rating_color;
   var cuisines = restaurants[i].restaurant.cuisines;
   var id = restaurants[i].restaurant.R.res_id;
   var currency = restaurants[i].restaurant.currency;
   var location = restaurants[i].restaurant.location.locality_verbose;
   var costForTwo = currency+restaurants[i].restaurant.average_cost_for_two;
   var icon;
   if(image_src == "") image_src = "./images/img.jpg";

   if(isLiked(id)){
     icon = `<i class="fas fa-heart" id="heart"></i>`;
   }
   else{
     icon = `<i class="far fa-heart" id="heart"></i>`;
   }
   
   var percentage = Math.floor((rating/5)*100);

   var newChild = `<div class="card" id="${id}">
   <img src="${image_src}" alt="Image">
   
   <div class="content">
     
     <div class="heading">
       <h3 style="font-size: 1.2rem">${name}</h3>
       ${icon}
     </div>
   
   <div class="item" style="font-size: 1.3rem;">
     <h3 style="font-size: .9rem">Rating: ${rating}</h3>
     <div class="stars-outer">
       <div class="stars-inner" style="width: ${percentage}%; color: ${rating_color}"></div>
     </div>
   </div>
 
   <div class="item">
     <h3>Cuisines: </h3>
     <span class="tag">${cuisines}</span>
   </div>
 
   <div class="item">
     <h3>COST FOR TWO: </h3>
     <span class="tag">${costForTwo}</span>
   </div>

   <div class="item">
     <h3>Location: </h3>
     <span class="tag">${location}</span>
   </div>
 
   <div class="more">
     <span class="goTo">Know more >></span>
   </div>
   </div>
 </div>
 `;
var container = document.querySelector('.container');
container.insertAdjacentHTML('beforeend', newChild);
  }
} 
}

function setter(entity){
  state.main_location = entity.location.title;
  state.city_name = entity.location.city_name;
  state.city_id = entity.location.city_id;
  state.entity_type = entity.location.entity_type;
  state.entity_id = entity.location.entity_id;
  state.cuisines = [...entity.popularity.top_cuisines];
  // console.log(state.cuisines);
  
  document.getElementById("categories").style.display = "inline";
  document.getElementById("sort").style.display = "inline";
  document.getElementById("searchCity").value = state.main_location+', '+state.city_name;
}

//When you change the value inside category
function categoryChanged(){
  select.category  = document.getElementById("categories").value;
  pagination.start = 1;
  searchRestaurants();
}

//When you change the value inside category
function sortChanged(){
  select.sort  = document.getElementById("sort").value;
  pagination.start = 1;
  searchRestaurants();
}

function setCity(){

  state.cuisines.splice(0, state.cuisines.length);
  state.city_name = document.getElementById("searchCity").value;
  searchCity();
  async function searchCity(){
    try{
      const result = await fetch(`https://developers.zomato.com/api/v2.1/cities?q=${state.city_name}`, {
        method: "GET",
        withCredentials: true,
        headers: {
          "user-key": "b7d71a4616d6948817000b7b1cf38bb9",
          "Content-Type": "application/json"
        }
      });

      const cities = await result.json();
      setNull(state);
      state.city_name = cities.location_suggestions[0].name;
      state.entity_id = cities.location_suggestions[0].id; 
      state.entity_type = "city";
      document.getElementById("categories").style.display = "inline";
      document.getElementById("sort").style.display = "inline";
    }catch{
      console.error();
    }
  }
}

//Render Cards when first search Button is clicked or enter is pressed in side search bar for cities
document.getElementById("searchBtn-1").addEventListener('click', setCity);
document.getElementById("searchCity").addEventListener("keypress", (e) => {
  if(e.keyCode == 13){
   setCity();
  }
});


// Search when search button or enter is pressed inside search bar
document.getElementById("searchBtn-2").addEventListener('click', function(){
     state.query = document.getElementById("searchForm").value;
     searchRestaurants();     
});
document.getElementById("searchForm").addEventListener("keypress", (e) => {
       if(e.keyCode == 13){
        state.query = document.getElementById("searchForm").value;
        searchRestaurants(); 
       }
});

// Pagination

document.getElementById("prev").addEventListener('click', ()=>{
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and opera
    if(pagination.start>1){
      pagination.start -= 8;
      searchRestaurants(pagination.start,pagination.count);
    }
    else{
      alert('It is the first page');
    }
     
});
document.getElementById("next").addEventListener('click', ()=>{
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and opera
  if((pagination.start + 8)<pagination.totalPages)
  {
    pagination.start += 8;
    searchRestaurants(pagination.start,pagination.count);
  }
  else{
    alert("Sorry it is the last page");
  }
});


// Implementing likes

//API call to get restaurant details
async function getRestaurant(id){
  try{
    const result = await fetch(`https://developers.zomato.com/api/v2.1/restaurant?res_id=${id}`, {
      method: "GET",
      withCredentials: true,
      headers: {
        "user-key": "b7d71a4616d6948817000b7b1cf38bb9",
        "Content-Type": "application/json"
      }
    });

    const restaurant = await result.json();
    clickedLikes(restaurant,id);
  }catch{
    console.error();
  }
}

function isLiked(id){
     for(var i=0;i<state.likes.length;i++){
       if(state.likes[i].id == id)
         return true;
     }
     return false;
}

function indexOf(id){
  for(var i=0;i<state.likes.length;i++){
    if(state.likes[i].id == id)
    return i;
  }
}

function Delete(id){
  var index = indexOf(id);
   state.likes.splice(index,1);
}

function clickedLikes(restaurant, id){
   
  if(isLiked(id))
  {
    Delete(id);
    localStorage.setItem('likes', JSON.stringify(state.likes));
  }
  else{
    const newLike = {
      id: id,
      name: restaurant.name,
      location: restaurant.location.locality_verbose,
      image_src: restaurant.featured_image,
      rating: restaurant.user_rating.aggregate_rating,
      cuisines: restaurant.cuisines,
      costForTwo: restaurant.average_cost_for_two,
      rating_color: restaurant.user_rating.rating_color,
      currency: restaurant.currency
   };
    state.likes.push(newLike);
    localStorage.setItem('likes', JSON.stringify(state.likes));
  }
    
}    

function getId(evt){
  if(evt.target.id == "heart"){
  var restaurantId = evt.target.parentElement.parentElement.parentElement.id;
  getRestaurant(restaurantId);
  if(event.target.classList.contains("fa-heart")&&event.target.classList.contains("far")){
      event.target.classList.remove("far");
      event.target.classList.add("fas");
  }
  else if(event.target.classList.contains("fa-heart")&&event.target.classList.contains("fas")){
  event.target.classList.remove("fas");
  event.target.classList.add("far");
}
}

else if(evt.target.classList.contains("goTo")){
    var restId = evt.target.parentElement.parentElement.parentElement.id;
    var modal = document.getElementById("myModal");
    var modalContent = document.getElementById("mainContent");
    modal.removeChild(modalContent);
    // document.getElementById("myModal").innerHTML = "";
    disLight(restId);

}
}
function addAfterEvents(){
  var x = document.querySelectorAll('.card');
  x.forEach(el =>{
    el.addEventListener('click', getId);
  })
}

// read arrays from local storage
function readStorage(){
  const storage = JSON.parse(localStorage.getItem('likes'));
  if(storage) state.likes = storage;
}

// OnLoad function
function myFunction(){
    readStorage();
}

// implementing likes view
// Make array and send request

function likesView(restaurants){
  if(restaurants.length == 0){
    var newChild = `<div class="notFound">Sorry no likes yet..</div>`;
    var container = document.querySelector('.container');
    container.insertAdjacentHTML('beforeend', newChild);
  }else{
  for(var i=0;i<restaurants.length;i++){
    var image_src = restaurants[i].image_src;
    var name = restaurants[i].name;
    var rating = restaurants[i].rating;
    var rating_color = "#"+restaurants[i].rating_color;
    var cuisines = restaurants[i].cuisines;
    var id = restaurants[i].id;
    var currency = restaurants[i].currency;
    var location = restaurants[i].location;
    var costForTwo = currency+restaurants[i].costForTwo;
    var icon;
    if(image_src == "") image_src = "./images/img.jpg";
 
    if(isLiked(id)){
      icon = `<i class="fas fa-heart" id="heart"></i>`;
    }
    else{
      icon = `<i class="far fa-heart" id="heart"></i>`;
    }
    
    var percentage = Math.floor((rating/5)*100);
 
    var newChild = `<div class="card" id="${id}">
    <img src="${image_src}" alt="Image">
    
    <div class="content">
      
      <div class="heading">
        <h3 style="font-size: 1.2rem">${name}</h3>
        ${icon}
      </div>
    
    <div class="item" style="font-size: 1.3rem;">
      <h3 style="font-size: .9rem">Rating: ${rating}</h3>
      <div class="stars-outer">
        <div class="stars-inner" style="width: ${percentage}%; color: ${rating_color}"></div>
      </div>
    </div>
  
    <div class="item">
      <h3>Cuisines: </h3>
      <span class="tag">${cuisines}</span>
    </div>
  
    <div class="item">
      <h3>COST FOR TWO: </h3>
      <span class="tag">${costForTwo}</span>
    </div>
 
    <div class="item">
      <h3>Location: </h3>
      <span class="tag">${location}</span>
    </div>
  
    <div class="more">
      <span class="goTo">Know more >></span>
    </div>
    </div>
  </div>
  `;
 
 var container = document.querySelector('.container');
 container.insertAdjacentHTML('beforeend', newChild);
   }
  }
}

function likesLoader(){
  clearView();
  likesView(state.likes);
  addAfterEvents();
  document.getElementById("pagination").style.display = "none";
}
document.querySelector('.likes').addEventListener('click', likesLoader);

//=========================================================================
// Implementing LightBox
// ========================================================================

function renderLightHouse(restaurant){
    var image_src = restaurant.featured_image;
    var name = restaurant.name;
    var rating = restaurant.user_rating.aggregate_rating;
    var rating_color = "#"+restaurant.user_rating.rating_color;
    var cuisines = restaurant.cuisines;
    var id = restaurant.R.res_id;
    var currency = restaurant.currency;
    var location = restaurant.location.locality_verbose;
    var address = restaurant.location.address;
    var costForTwo = currency+restaurant.average_cost_for_two;
    var timing = restaurant.timings;
    var zomato_url = restaurant.order_url;
    var phoneNumbers = restaurant.phone_numbers;
    if(image_src == "") image_src = "./images/img.jpg";
    
    var percentage = Math.floor((rating/5)*100);

  var newChild = `<div id="mainContent" class="modal-content" id="${id}">
    <h1>${name}</h1>
  
    <div class="flex" style="justify-items: center;">
      <img src="${image_src}" alt="restaurant Image">
    </div>
    
          <div class="item" style="font-size: 1.3rem;">
            <h3 style="font-size: .9rem">Rating: ${rating}</h3>
            <div class="stars-outer">
              <div class="stars-inner" style="width: ${percentage}%; color: ${rating_color};"></div>
            </div>
          </div>
        
          <div class="item">
            <h3>Cuisines: </h3>
            <span class="tag">${cuisines}</span>
          </div>
        
          <div class="item">
            <h3>COST FOR TWO: </h3>
            <span class="tag">${costForTwo}</span>
          </div>
       
          <div class="item">
            <h3>Location: </h3>
            <span class="tag">${location}</span>
          </div>

          <div class="item">
            <h3>Address: </h3>
            <span class="tag">${address}</span>
          </div>

          <div class="item">
            <h3>Timing: </h3>
            <span class="tag">${timing}</span>
          </div>

          <div class="item">
            <h3>Phone no.: </h3>
            <span class="tag">${phoneNumbers}</span>
          </div>

          <div class="item">
             <h3>Order from this Hotel on Zomato : </h3>
             <span class="tag"><a href="${zomato_url}" target="_blank">click here</a></span>
          </div>

          <h2>Reviews</h2>
          
  
  </div>`;

  var modal = document.getElementById("myModal");
modal.insertAdjacentHTML('beforeend', newChild);
}

//API call to get restaurant details
async function getLightHouse(id){
  try{
    const result = await fetch(`https://developers.zomato.com/api/v2.1/restaurant?res_id=${id}`, {
      method: "GET",
      withCredentials: true,
      headers: {
        "user-key": "b7d71a4616d6948817000b7b1cf38bb9",
        "Content-Type": "application/json"
      }
    });

    const restaurant = await result.json();
    renderLightHouse(restaurant);
    getReviews(id);
  }catch{
    console.error();
  }
}

function renderReviews(reviews){
  for(var i=0;i<reviews.length;i++){
  
     var name = reviews[i].review.user.name;
     var image_src = reviews[i].review.user.profile_image;
     var rating = reviews[i].review.rating;
     var rating_color = "#"+reviews[i].review.rating_color;
     var percentage = Math.floor((rating/5)*100);
     if(image_src == "") image_src = "./images/img.jpg";
     var review_text = reviews[i].review.review_text;

    var newReview = `<div class="review">
    <div class"user">
       <img src="${image_src}" alt="user image">
       <h3>${name}</h3>
    </div>

    <div class="item" style="font-size: 1.3rem;">
  <h3 style="font-size: .9rem">Rating: ${rating}</h3>
  <div class="stars-outer">
    <div class="stars-inner" style="width: ${percentage}%; color: ${rating_color};"></div>
  </div>
</div>

<div class="revieText">
<p>${review_text}</p>
</div>

</div>`;
  
  var modalContent = document.getElementById("mainContent");
  modalContent.insertAdjacentHTML('beforeend', newReview);
  }
}

async function getReviews(id){
  try{
    const result = await fetch(`https://developers.zomato.com/api/v2.1/reviews?res_id=${id}`, {
      method: "GET",
      withCredentials: true,
      headers: {
        "user-key": "b7d71a4616d6948817000b7b1cf38bb9",
        "Content-Type": "application/json"
      }
    });

    const reviews = await result.json();
    renderReviews(reviews.user_reviews);
  }catch{
    console.error();
  }
}

function disLight(id){
  // Get the modal
  var modal = document.getElementById("myModal");
  modal.style.display = "block";

  // Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
getLightHouse(id);
}
