# generate-pie-chart-animation

- Entry Point server.js

- post /generate-pie-chart

- runs on port 3000 by default can be changed later

```jsx
//  routes
app.post('/generate-pie-chart', generatePieChartVideo);
```

`Base URL: (http://localhost:3000/generate-pie-chart)`

### `Post` locally for now

- accepts json of Array of optionsData as shown below
- generates canvas frames for animation 
- compiles using ffmpeg
- response is videoBuffer of pie chart animation

`req:`

```json
[
    {
        "option": "Colgate",
        "count": 50
    },
    {
        "option": "Sensodyne",
        "count": 45
    },
    {
        "option": "Pepsodent",
        "count": 40
    }
]

```

`res`(not actual)

[![Watch the video]](https://raw.githubusercontent.com/mb-great/pieChartAnimationGenerator/main/pie_chart_animation.mp4)

