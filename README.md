# CommandPaletteForBubble

## How to build

1) install dependencies 
```
yarn
```

2) build unminified version (good for error verbosity)
```
yarn build:dev
```

3) build production version, minified
```
yarn build
```


After building just go to dist folder, find your file (development = unminified, min = minified), and copy it's contents into the update function in bubble plugin page. 
Note: already comes wrapped in a function so all you have to do is copy paste as it is.
