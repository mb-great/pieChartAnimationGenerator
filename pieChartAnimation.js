const { createCanvas } = require("canvas");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// Poll data (unchanged)
const pollData = [
  { option: "Colgate", count: 50 },
  { option: "Sensodyne", count: 45 },
  { option: "Pepsodent", count: 40 },
  { option: "Close-Up", count: 35 },
  { option: "Crest", count: 30 },
  { option: "Oral-B", count: 28 },
  { option: "Aquafresh", count: 26 },
  { option: "Parodontax", count: 22 },
  { option: "Arm & Hammer", count: 20 },
  { option: "Biotene", count: 18 },
  { option: "Tom's of Maine", count: 16 },
  { option: "Dabur Red", count: 14 },
  { option: "Vicco", count: 12 },
  { option: "Neem Active", count: 10 },
  { option: "Patanjali Dant Kanti", count: 8 },
  { option: "Elmex", count: 6 },
  { option: "Splat", count: 5 },
  { option: "Jason", count: 4 },
  { option: "Marvis", count: 3 },
  { option: "Theodent", count: 2 },
];

// Sort poll data to get top 3
const sortedPollData = [...pollData].sort((a, b) => b.count - a.count);
const top3 = sortedPollData.slice(0, 3);

// Extended color palette (unchanged)
const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#F39C12",
  "#16A085",
  "#D35400",
  "#8E44AD",
  "#2ECC71",
  "#E74C3C",
  "#3498DB",
  "#1ABC9C",
  "#9B59B6",
  "#F39C12",
  "#27AE60",
  "#E67E22",
  "#2980B9",
  "#CB4335",
  "#7D3C98",
];

// Constants
const totalFrames = 180;
const width = 1200;
const height = 1200;
const centerX = width / 2;
const centerY = height / 2;
const radius = 400;
const total = pollData.reduce((sum, item) => sum + item.count, 0);

// Assign colors to poll data
pollData.forEach((item, index) => {
  item.color = colors[index % colors.length];
});

// Create canvas
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Helper functions
function drawSlice(
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  color,
  scale = 1
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius * scale, startAngle, endAngle);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius * scale
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, shadeColor(color, -20));

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = shadeColor(color, -40);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function addSmartLabels(pollData, centerX, centerY, radius, progress = 1) {
  let startAngle = 0;
  const labelRadius = radius + 80;
  const labels = [];

  pollData.forEach((item) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI;
    const middleAngle = startAngle + sliceAngle / 2;

    const textX = centerX + labelRadius * 1.05 * Math.cos(middleAngle);
    const textY = centerY + labelRadius * 1.05 * Math.sin(middleAngle);

    labels.push({
      x: textX,
      y: textY,
      text: `${item.option}: ${((item.count / total) * 100).toFixed(1)}%`,
      angle: middleAngle,
      item: item,
    });

    startAngle += sliceAngle;
  });

  // Sort labels by Y position
  labels.sort((a, b) => a.y - b.y);

  // Adjust overlapping labels
  for (let i = 1; i < labels.length; i++) {
    const prevLabel = labels[i - 1];
    const currLabel = labels[i];

    if (Math.abs(currLabel.y - prevLabel.y) < 30) {
      const adjustment = 30 - Math.abs(currLabel.y - prevLabel.y);
      prevLabel.y -= adjustment / 2;
      currLabel.y += adjustment / 2;
    }
  }

  // Draw labels
  ctx.fillStyle = "#333333";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  labels.forEach((label) => {
    const lineEndX = centerX + (radius + 10) * Math.cos(label.angle);
    const lineEndY = centerY + (radius + 10) * Math.sin(label.angle);

    ctx.beginPath();
    ctx.moveTo(lineEndX, lineEndY);
    ctx.lineTo(label.x, label.y);
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Highlight the top 3 labels
    const rank = top3.indexOf(label.item);
    if (rank !== -1) {
      ctx.font = `bold ${18 - rank * 2}px Arial`;
      ctx.fillStyle =
        rank === 0 ? "#A67C2D" : rank === 1 ? "#7D7D7D" : "#9B6D4D";
    } else {
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#333333";
    }

    ctx.fillText(label.text, label.x, label.y);
  });
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);

  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return `#${(
    (1 << 24) |
    ((R < 255 ? (R < 1 ? 0 : R) : 255) << 16) |
    ((G < 255 ? (G < 1 ? 0 : G) : 255) << 8) |
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

// Generate frames for the entire animation
async function generateFrames() {
  console.log("Generating animation frames...");

  for (let frame = 0; frame <= totalFrames; frame++) {
    const progress = frame / totalFrames;

    ctx.clearRect(0, 0, width, height);

    // Background
    const bgGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 1.5
    );
    bgGradient.addColorStop(0, "#f0f0f0");
    bgGradient.addColorStop(1, "#d0d0d0");

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    let startAngle = 0;

    pollData.forEach((item) => {
      const sliceAngle = (item.count / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle * Math.min(1, progress * 2); // Fill in first half

      // New animation logic
      let scale = 1;
      if (progress > 0.5 && progress < 0.60) {
        // Pop out all slices
        scale = 1 + 0.1 * Math.sin((progress - 0.5) * 4 * Math.PI);
      } else if (progress >= 0.60) {
        // Keep top 3 popped out, others return to normal
        const rank = top3.indexOf(item);
        if (rank !== -1) {
          scale = 1.08 - rank * 0.015; // 1.08, 1.065, 1.05 for 1st, 2nd, 3rd
        }
      }

      drawSlice(
        centerX,
        centerY,
        radius,
        startAngle,
        endAngle,
        item.color,
        scale
      );
      startAngle += sliceAngle;
    });

    // Add labels with fade-in effect
    ctx.globalAlpha = Math.min(1, progress * 2); // Fade in first half
    addSmartLabels(pollData, centerX, centerY, radius);
    ctx.globalAlpha = 1;

    const buffer = canvas.toBuffer("image/png");
    const filename = `./frames/frame_${String(frame).padStart(3, "0")}.png`;

    fs.writeFileSync(filename, buffer);
  }

  console.log("All animation frames generated.");
}

// Compile video using FFmpeg (unchanged)
function compileVideo() {
  console.log("Compiling video...");
  exec(
    "ffmpeg -y -framerate 60 -i ./frames/frame_%03d.png -movflags +faststart -pix_fmt yuv420p pie_chart_animation.mp4",
    (error) => {
      if (error) {
        console.error(`Error generating video: ${error}`);
      } else {
        console.log("Video generated successfully.");
      }
    }
  );
}

// Delete previous frames (unchanged)
async function deleteFrames() {
  const directory = "./frames";
  try {
    const files = await fs.promises.readdir(directory);
    const unlinkPromises = files.map((file) =>
      fs.promises.unlink(path.join(directory, file))
    );
    await Promise.all(unlinkPromises);
    console.log("Previous frames deleted.");
  } catch (err) {
    console.error("Error deleting frames:", err);
  }
}

// Main execution function (unchanged)
async function main() {
  try {
    fs.mkdirSync("./frames", { recursive: true });
    await deleteFrames();
    await generateFrames();
    compileVideo();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
