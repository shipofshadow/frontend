import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

// 🗂️ Course → Department + Campus mapping
const courseInfo = {
  BSIT: { department: 'IT', campus: 'Main Campus', applicants: 120 },
  BSED: { department: 'Education', campus: 'San Fernando', applicants: 100 },
  BSBA: { department: 'Business', campus: 'La Union', applicants: 95 },
  BSTM: { department: 'Tourism', campus: 'Candon', applicants: 85 },
  BSA:  { department: 'Business', campus: 'La Union', applicants: 70 },
};

// 🎨 Grouped colors by campus
const campusColors = {
  'Main Campus': '#4e73df',
  'San Fernando': '#1cc88a',
  'La Union': '#36b9cc',
  'Candon': '#f6c23e',
};

const CourseChartWithContext = () => {
  const labels = Object.keys(courseInfo);

  const datasets = labels.map(course => {
    const info = courseInfo[course];
    return {
      label: course,
      data: [info.applicants],
      backgroundColor: campusColors[info.campus],
      stack: 'applicants',
    };
  });

  const data = {
    labels: ['Applicants'], // single grouped label
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (ctx) {
            const course = ctx.dataset.label;
            const info = courseInfo[course];
            return `${course}: ${info.applicants} applicants\nDept: ${info.department}\nCampus: ${info.campus}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Applicants per Course (with Campus & Department)',
        font: { size: 18 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">Course Breakdown</div>
      <div className="card-body">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CourseChartWithContext;
