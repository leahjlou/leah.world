---
title: Building a typeahead with RxJS Observables and the Fetch API
date: "2016-07-29T22:12:03.284Z"
---

Solving complicated asynchronous problems in JavaScript can get messy fast. The moment you need anything more than the most basic callbacks, it’s easy to fall into tangly, brittle, impossible-to-follow code.

The concept of "deferred values", or Promises, has [grown in popularity](https://medium.com/dailyjs/asynchronous-adventures-in-javascript-promises-1e0da27a3b4) in the past few years. This paradigm is super useful and probably here to stay. But recently I’ve been learning about more ["Reactive"](https://en.wikipedia.org/wiki/Reactive_programming) strategies with [RxJS](https://github.com/Reactive-Extensions/RxJS), specifically its [Observables](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md), and with that mental shift has come a really powerful and expressive tool I’m glad I added to my belt.

### Building a typeahead!

In this post, we'll learn about some RxJS basics by building a common UI component that often involves handling asynchronous network requests: a typeahead.

As the user types, we will retrieve and display relevant search results from an API endpoint. This example could apply to a lot of common UI experiences like autocompletes or any kind of search box.

We'll make our network requests using the Fetch API and handle our events and responses using RxJS Observables.

### The finished product

Let's get an idea of what we're going for by looking at the end goal ([jsfiddle](https://jsfiddle.net/e04LmgLj/)). Go ahead and type your favorite movie title into the search box. You'll see metadata about the movie appear below. Simple stuff.

<iframe width="100%" height="300" src="//jsfiddle.net/e04LmgLj/embedded/result/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

### The plan

1. We'll start by learning a new browser standard called the Fetch API, an alternative to `XMLHttpRequest` for making HTTP requests.
2. Then we'll take a pass at implementing our typeahead in a simple, naive way.
3. Finally, we'll talk about the problems with that implementation, and how we could beef it up using RxJS.

### What is the Fetch API?

The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is a way to make network requests from the browser. It's basically like `XMLHttpRequest`, but its main request method returns a Promise. It’s supported in modern browsers but still in beta, so you’ll want polyfills if you want to use it in production.

Here’s a basic example:

```js
fetch('http://my-api.com').then(response => {
  response.json().then(data => {
    // now we have the response body!
  });
});
```

Notice there are two `then()`s. That's because we're dealing with two "layers" of Promises here. The first one makes the request, and the second one parses the response body (in our case, as JSON).

This is a simplified explanation. For more reading on Fetch, here are some great resources:

* [MDN Web Docs: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
* [Google Developers: Introduction to Fetch](https://developers.google.com/web/updates/2015/03/introduction-to-fetch?hl=en)
* [Sitepoint: Introduction to the Fetch API](https://www.sitepoint.com/introduction-to-the-fetch-api/)

I chose to use Fetch in this example because 1) it's natively supported in most browsers, and 2) I'm new to it and want to practice using it. But if you're more comfortable using `XMLHttpRequest`, `axios`, or any other HTTP request tool, feel free to drop it in.

Okay, now that we have that down, let's build a typeahead!

### HTML

Our UI will be super simple.

```html
<label>
  Type to search
  <input class="my-search-input" type="text" />
</label>

<ul class="my-search-results"></ul>
```

We'll watch `.my-search-input` for the user's typed value, go get the results from our search endpoint, and render them in our `.my-search-results` list.

### A naive approach

Time to make this thing work. A simple (but buggy) approach might look something like this. Every time the user types a character in the search input, we retrieve new search results. On `then()`, we add the results to the DOM for display.

```js
var searchInput = document.querySelector('.my-search-input');
 
searchInput.keyup(e => {
  const term = e.target.value; // Grab the search term
 
  fetch('http://my-api.com/search/' + term).then(response => {
    response.json().then(data => {
      // Add search results to the DOM
    });
  });
 
});
```

Simple enough, right? Can you see the problem with this yet?

### The network is reliable, probably

Network requests are unpredictable; you can’t control how long they take to return. As the user types, the requests (for “f”, “fo”, “foo”, etc.) are made in the correct order, but the order they return is dependent on network timing. Whichever request takes longest to return is the last set of results to get appended to the page.

In fact, depending on the way the server's search/filter logic behaves, we can reasonably expect our earlier requests to come back _after_ our later ones when a user is typing. A longer search term like "foo" may result in a smaller response set and faster response time because it is more specific than a term like "f".

This might be the expected order of events:

1. Request: Search "f"
2. Request: Search "fo"
3. Request: Search "foo"
4. Response: Search results for "foo"
5. Response: Search results for "fo"
6. Response: Search results for "f"

Then the user is left with "foo" typed into the input, and the search results for "f" appearing below. Womp womp.

We could debounce or throttle the search, and that would help, but that solution would still depend on somewhat consistent network request timing. We need to ensure that search results for _only_ the latest keystroke will appear.

😏Conveniently😏, one of the features of Observable streams is that, unlike Promises, they are cancellable in-flight. Let's take a look at how we can use this to our advantage to "throw away" those older requests.

### Observable streams

Observables are streams of data that “emit” items asynchronously, and anyone who cares can “subscribe” to them to hear about these pieces of data and react to them however they want.

RxJS Observables behave a lot like any other iterable; they can be filtered and mapped and composed in all kinds of ways.

This typeahead is a perfect candidate for the Observable pattern. There’s a _stream_ of events (keystrokes) we care about and want to respond to by making a _stream_ of network requests, and we want to cancel the old ones so "stale" results don't show up on the page. Let’s Observable-ify this thing in three steps.

### 1. Create a stream for the keyboard events

We start by creating an Observable from the keyup events on the search input. This is a stream that will emit all of these keyup events to whoever "subscribes" to it.

```js
// Create an observable stream from the search input keyup
const searchInput = document.querySelector('.my-search-input');
const keyupStream = Rx.Observable.fromEvent(searchInput, 'keyup');
```
To do this, we use [fromEvent()](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/fromevent.md), which is just one of many ways RxJS provides to transform an existing stream-like object into an Observable. All sorts of other stuff can be turned into Observables, too, like [arrays/iterables](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/from.md), [promises](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/frompromise.md), and [callbacks](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/fromcallback.md).

### 2. Manipulate the stream from keyboard events --> search results

Then we add some operators to manipulate the stream. Our main goals are to:

1. filter out the emitted items we don’t care about
2. transform them into network requests
3. handle the responses from those network requests

Like I said, it’s conceptually just like manipulating an array: filter it, map it, reduce it. [RxJS provides a lot of useful operators to do this](https://github.com/Reactive-Extensions/RxJS/tree/master/doc/api/core/operators).

Here's our code to get it all done:

```js
const searchStream = keyupStream
  .map(e => e.target.value) // Get search text
  .debounce(250) // Debounce
  .distinctUntilChanged() // Only get changed search terms
  .flatMapLatest(term => fetch('http://my-api.com/' + term)) // Request search results
  .flatMap(response => response.json()); // Parse the json response
```

There's a lot going on here, so let's walk through the operators.

* [map](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/select.md): transforms the keyboard event into the search value in the input.
* [debounce](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/debounce.md): [debounces](https://css-tricks.com/the-difference-between-throttling-and-debouncing/) those values at 250 milliseconds.
* [distinctUntilChanged](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/distinctuntilchanged.md) holds off on passing those values through until they actually change.
* [flatMap](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/selectmany.md) “flattens” or combines items from many streams into one stream. You’ll see in the RxJS docs that a “stream” in this context can be an Observable, Promise, or iterable. After all, a Promise is just a stream with one item (the resolve value).
* [flatMapLatest](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/flatmaplatest.md) does the same thing, but with a twist: it filters out everything but the latest emitted item. So the moment it sees a new item (keyup event), it cancels any previous ones so those Promises won’t even get passed along. Cancellation is a very nice feature of Observables and is exactly what we need to avoid that race condition in the naive solution.

`flatMap` is probably the trickiest concept in this whole post, so let’s review the process of how a search term gets mapped to search results.

1. For each search term, create a Promise that makes a network request for the search results.
2. Combine the responses from each of those Promises into a single stream.
3. For each response in the stream, create another Promise that parses the response body as JSON. (remember how Fetch has two “layers” of Promises?)
4. Combine those responses (the parsed bodies) into a single stream.

So, in just _six lines of code_, we’re fine-tuning our event handling in some really complex ways. "Expressive" might just seem like a buzzword, but when you look at how powerful these operators are, it's easy to drink the kool-aid.

### 3. Subscribe and react to the stream output

Finally, we subscribe to `searchStream`, which will emit the search results we’re interested in displaying.

```js
searchStream.subscribe(data => {
  // Add search results to the DOM
});
```

[`subscribe()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md) takes a function that handles the emitted items. It also takes other functions for error handling and completion, but I’m leaving those out here for simplicity’s sake.

### All together now

```js
// Create an observable stream from the search input keyup
const searchInput = document.querySelector('.my-search-input');
const keyupStream = Rx.Observable.fromEvent(searchInput, 'keyup');
 
// Transform the stream into search results from the API
const searchStream = keyupStream
  .map(e => e.target.value) // Get search text
  .debounce(250) // Debounce
  .distinctUntilChanged() // Only get changed search terms
  .flatMapLatest(term => fetch('http://my-api.com/' + term)) // Request search results
  .flatMap(response => response.json()); // Parse the json response
 
// Subscribe to the stream
searchStream.subscribe(data => {
  // Add search results to the DOM
});
```

See it in action in this [jsfiddle](https://jsfiddle.net/e04LmgLj/) that uses the OMDb API to search for movies.

### That's it!

Putting together this small example has helped me better understand how to use RxJS Observables and how cool they are, and I’ve since found all kinds of ways to use them to my advantage.

If you’re new to RxJS like me and want to learn more, here are some great resources to get started:

* [btroncone: Learn RxJS](https://github.com/btroncone/learn-rxjs)
* [xgrommx: RX Book](https://xgrommx.github.io/rx-book/)

#### P.S.

If you're skeptical about `flatMapLatest` and its ability to cancel those stale keyboard events, check out this [example](https://jsfiddle.net/leahloughran/rc8uba90/) where I artificially slowed down requests for shorter search terms to force the race condition to occur. If you open up the console and watch the logs as you type, you'll see the correct response is displayed even though requests made earlier are returned later. That's `flatMapLatest` in action. Try changing it to a plain `flatMap` and see what happens.
