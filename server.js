const express = require('express');
const bodyParser = require('body-parser');
const { generatePieChartVideo } = require('./src/controller');

const app = express();
app.use(bodyParser.json());

app.post('/generate-pie-chart', generatePieChartVideo);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});