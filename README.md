# React-Profiler

## How to use?

### Add it to your project

1. In the file that has the Component you want to profile, import the following

```javascript
import { Profiler } from "@hrisy/tools";
```

2. Use the imported *Profiler* Component and wrap it around the Component you want to profile.

Example:

```javascript
<Profiler title="NewCounterImplementation">
  <Button onClick={() => dispatch(increment())}>Increment</Button>
  <span>{count}</span>
  <Button onClick={() => dispatch(decrement())}>Decrement</Button>
</Profiler>
```

3. Tada! You now have everything set up. Let's take a look at how to record data and save it.

### Using the profiler

1. Open the developer tools in your browser while having a tab open with your project and the profiled component
2. In the developer tools, select the console.
3. In your console, you should now be able to use a funtion/command called *globalProfilerState*.


It'll print an object with a bunch of data in it. Using the object like `globalProfilerState.` and you should also be able to access functions on it

Here's a list of these functions:

#### globalProfilerState.namespace(title)

This function allows you to set a "category" for current Profiler recordings. E.g. if you currently testing a lot of redux, you can make sure all recording related to redux ends up in a category named "redux"

```javascript
globalProfilerState.namespace("redux");
```

#### globalProfilerState.record(title)

This function allows you to start a new Profiler recording. It requires you to give it a title, e.g. "atttempt 11" or "attempt with optimization". You can call it like this

```javascript
globalProfilerState.record("counter using redux with optimized use of state");
```

#### globalProfilerState.stop()

This function allows you to stop the current Profiler recording. When stopping a recording, it'll save everything to the object. You can access this data using the next function that is documented below.

```javascript
globalProfilerState.stop();
```

#### globalProfilerState.listRecordings()

This function will list all finished recordings, sorted by namespace/recording name/component title

With all the examples given so far, that will currently look like:

`redux/counter using redux with optimized use of state/NewCounterImplementation`

```javascript
globalProfilerState.listRecordings();
```

As you can see, it takes care of counting the amount of renders that happen in total for a recording and the average of all those renders combined. It'll also calculate the total renders and average for each component that is profilled in a recording. This should save a lot of time from having to try and do it via the React dev tools extension.

#### globalProfilerState.downloadRecordings()

This function will get all saved Profiler recordings and download them to your computer in a zip file.

```javascript
globalProfilerState.downloadRecordings();
```

#### globalProfilerState.reset()

This function will clear all saved recordings and namespaces, giving you a clean slate.

```javascript
globalProfilerState.reset();
```


### Alias

If you feel like typing `globalProfilerState` before every command is a bit much, there is an alias you can use. Instead of using `globalProfilerState` just use `gps`.

Examples:

```javascript
gps.namespace("xstate");
gps.record("counter 1st implementation");
gps.stop();
gps.listRecordings();
gps.downloadRecordings();
gps.reset();
```

