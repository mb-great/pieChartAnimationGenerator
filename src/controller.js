const { createPieChartAnimation } = require('./service');

async function generatePieChartVideo(req, res) {
  try {
    const optionsData = req.body;
    if (!Array.isArray(optionsData) || optionsData.length === 0) {
      return res.status(400).json({ error: 'Invalid poll data' });
    }

    await createPieChartAnimation(optionsData);
    
    // Read the generated video file
    const fs = require('fs');
    const videoBuffer = fs.readFileSync('pie_chart_animation.mp4');
    
    res.setHeader('Content-Type', 'video/mp4');
    res.send(videoBuffer);
  } catch (error) {
    console.error('Error generating pie chart video:', error);
    res.status(500).json({ error: 'Failed to generate pie chart video' });
  }
}

module.exports = { generatePieChartVideo };