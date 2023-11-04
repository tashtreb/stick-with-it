// Giphy API 

let giphyResults;
let gifSearch = '';
let gifImgs = [];
let gifImg;
let gifReady = false;

let strings = [];
let dict = [];

function preload() {
  strings = loadStrings("cactuss.txt");
}


function setup() {
  createCanvas(600, 1500);
  background(0, 0, 100, 0);
  text(strings, 20, 20);

  // put strings back together as one string
  let allStrings = join(strings, " ");

  // separate speeches
  let speeches = split(allStrings, "***");

  // choose just the first speech 
  let speechOne = speeches[0];

  // divide the speech into sentences
  let sentences = RiTa.splitSentences(speechOne);

  // divide the sentences into words
  // use just half a speech (sentences.length/2) to help with framerate
  for (let i = 0; i < sentences.length/2; i++) {
    createWords(sentences[i], i);
  }
}

class Word {
  constructor(x, y, w, h, value) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = value;
  }

  checkBounds(mX, mY) {

    if (mX < this.x) return false;
    if (mX > this.x + this.w) return false;
    if (mY < this.y) return false;
    if (mY > this.y + this.h) return false;

    return true;
  }

  getValue() {
    return this.value;
  }

  drawRect() {
    stroke(0);
    fill(0, 0, 100, 0);
    rect(this.x, this.y, this.w, this.h);
  }
}

function createWords(sentence, yPos) {
  let words = RiTa.tokenize(sentence); // get each word 
  let lineHeight = 5; // choose a line height
  let xPos = 0; // start x position on left of canvas

  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    let x = xPos; // try with and without i +
    let y = yPos * lineHeight; // the yPos comes from the sentence
    let w = word.length; // draw one pixel per character
    let h = lineHeight;

    // create word 
    let newWord = new Word(x, y, w, h, words[i]);
    
    // add the word to the dictionary
    dict.push(newWord);

    // keep track of the x position by 
    // adding the width of each successive word 
    xPos += w;
  }
}



function searchGiphy(query) {
  // Use JS template literal to include query term in the API request to giphy
  // Note the use of backticks `` instead of quotes "" 
  // The syntax ${ } is used to include the search variable within the string 
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
  
  // Call the function gotGifs when the response is received from the API
  loadJSON(`https://api.giphy.com/v1/stickers/search?api_key=XT5C8F4mREQ9B2nfhvJzK0iAsO0GjgF6&q=plants@<larapaulussen>&limit=5&offset=0&rating=G&lang=en`, gotGifs);

} 


function gotGifs(gifResults) {
  // console.log('got results', gifResults);
  
  // debugger;
  // We used debugger with Chrome dev tools to explore gifResults and find the url of the image to display
  // We chose to use the downsized_medium image, but there are multiple image options 
  let newGifUrl = gifResults.data[0].images.downsized_medium.url;
  
  // In order for the animated gif to work in p5 we need to use createImg() rather than createImage() 
  // createImg() creates a dom element for img rather than a p5 Image element
  // Call the funtion gifLoaded once hte image is loaded
  let newGifImg = createImg(newGifUrl, gifLoaded)
  
  // Add the new img containing the gif to the array gifImgs
  gifImgs.push(newGifImg);

}


function gifLoaded() {
  console.log('gif loaded ', gifImgs.length); 
  
  if (!gifReady) {
  // this will only run the first time an image is loaded
  // it keeps us from trying to draw gifs below in the draw loop before we have any gifs back from giphy
    gifReady = true;
  } else {
  // remove old gifs from the sketch and from the gifs array  
    gifImgs[0].remove();
    gifImgs.splice(0,1);
  } 

}


function draw() {
  background(0, 0, 100, 0);
  
  // by default don't display a word
  let displayWord = false;
  let wordToDisplay = '';

  for (let i = 0; i < dict.length; i++) {
    let word = dict[i];
    
    // draw each rect on every frame
    word.drawRect();

    // check if the mouse intersects with the bounds 
    // of the word
    let checkBounds = word.checkBounds(mouseX, mouseY);

    // if it intersects get the word and set displayWord to true
    if (checkBounds === true) {
      wordToDisplay = word.getValue();
      displayWord = true;
    }
  }

  // if the mouse intersects with a word
  if (displayWord) {
    
    // if the word to display is a new word 
    if (wordToDisplay !== gifSearch) {
      
      // search giphy for the word to display
      gifSearch = wordToDisplay;
      searchGiphy(gifSearch);
    
    }
    
    // if we have a gif ready to display, display it!
    if (gifReady) {
      
      // display the last gif (the most recent gif) in the array at the current mouse position
      gifImgs[gifImgs.length-1].position(mouseX, mouseY+15);
    }
}
    
}
