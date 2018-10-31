# RoadLinkViewer

## Requirement

- node: v8.11.1
- npm: 5.6.0

## Setup

```
# Clone this project your local environment.
$ git clone https://github.com/y-kisse/RoadLinkViewer.git

# Install npm modules via package.json.
$ npm install
```

Create utils/config.json to access database.

## Usage

To start app, run `npm start`.  
Then access localhost:3000/ or localhost:3000/edge/ with Google Chrome.  

When map moved, reload edges and vertices.  
Default map zoom level is 15.  
When zoom level below 15, edges and vertices will not be reloaded.  

Click edges, highlight the edge and display edge info.